-- 用户表（使用 Supabase Auth，额外存 profile）
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  bio TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 帖子表
CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  media JSONB DEFAULT '[]',
  files JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 点赞表
CREATE TABLE likes (
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- 评论表
CREATE TABLE comments (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 日记表
CREATE TABLE diaries (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  privacy TEXT DEFAULT 'private' CHECK (privacy IN ('private', 'public')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 策略
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

-- profiles: 所有人可读，本人可改
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- posts: 所有人可读，作者可增删改
CREATE POLICY "posts_select" ON posts FOR SELECT USING (true);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "posts_update" ON posts FOR UPDATE USING (auth.uid() = user_id);

-- likes: 所有人可读，登录用户可操作自己的
CREATE POLICY "likes_select" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_insert" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete" ON likes FOR DELETE USING (auth.uid() = user_id);

-- comments: 所有人可读，登录用户可发
CREATE POLICY "comments_select" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE USING (auth.uid() = user_id);

-- diaries: 本人可读写，公开的所有人可读
CREATE POLICY "diaries_select_own" ON diaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "diaries_select_public" ON diaries FOR SELECT USING (privacy = 'public');
CREATE POLICY "diaries_insert" ON diaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "diaries_update" ON diaries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "diaries_delete" ON diaries FOR DELETE USING (auth.uid() = user_id);

-- 创建 Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- Storage 策略
CREATE POLICY "media_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
CREATE POLICY "media_read" ON storage.objects FOR SELECT USING (bucket_id = 'media');

-- 注册时自动创建 profile 的触发器
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, bio)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', COALESCE(NEW.raw_user_meta_data->>'bio', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();