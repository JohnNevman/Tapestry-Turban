export interface Profile {
  id: string
  username: string
  bio: string
  avatar_url: string
  created_at: string
}

export interface Post {
  id: number
  user_id: string
  title: string
  content: string
  tags: string[]
  media: MediaItem[]
  files: FileItem[]
  created_at: string
  profiles?: Profile
  likes?: Like[]
  comments?: Comment[]
}

export interface MediaItem {
  type: 'image' | 'video'
  url: string
}

export interface FileItem {
  name: string
  url: string
  size: number
}

export interface Like {
  post_id: number
  user_id: string
}

export interface Comment {
  id: number
  post_id: number
  user_id: string
  text: string
  created_at: string
  profiles?: Profile
}

export interface Diary {
  id: number
  user_id: string
  title: string
  content: string
  privacy: 'private' | 'public'
  created_at: string
  profiles?: Profile
}