export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'user' | 'admin' | 'moderator'

export type PostStatus = 'draft' | 'published' | 'archived'

export type ReactionType = 'like' | 'helpful' | 'insightful'

export interface Profile {
  id: string
  username: string
  email: string
  avatar_url?: string
  bio?: string
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  author_id: string
  title: string
  body: string
  category_id?: string
  yacht_type?: string
  yacht_length?: number
  company_id?: string
  location_id?: string
  status: PostStatus
  view_count: number
  created_at: string
  updated_at: string
  author?: Profile
  category?: Category
  tags?: Tag[]
  reactions_count?: {
    like: number
    helpful: number
    insightful: number
  }
  comments_count?: number
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  parent_id?: string
  body: string
  created_at: string
  updated_at: string
  author?: Profile
  reactions_count?: {
    like: number
    helpful: number
    insightful: number
  }
  replies?: Comment[]
}

export interface Reaction {
  id: string
  user_id: string
  post_id?: string
  comment_id?: string
  type: ReactionType
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  display_order: number
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface Location {
  id: string
  name: string
  country?: string
  region?: string
  created_at: string
}

export interface Company {
  id: string
  name: string
  slug?: string
  description?: string
  website?: string
  verified: boolean
  created_at: string
  updated_at: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category_id?: string
  display_order: number
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      posts: {
        Row: Post
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'view_count'>
        Update: Partial<Omit<Post, 'id' | 'created_at'>>
      }
      comments: {
        Row: Comment
        Insert: Omit<Comment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Comment, 'id' | 'created_at'>>
      }
      reactions: {
        Row: Reaction
        Insert: Omit<Reaction, 'id' | 'created_at'>
        Update: Partial<Omit<Reaction, 'id' | 'created_at'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
      }
      tags: {
        Row: Tag
        Insert: Omit<Tag, 'id' | 'created_at'>
        Update: Partial<Omit<Tag, 'id' | 'created_at'>>
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
          created_at: string
        }
        Insert: Omit<{
          post_id: string
          tag_id: string
          created_at: string
        }, 'created_at'>
        Update: never
      }
      locations: {
        Row: Location
        Insert: Omit<Location, 'id' | 'created_at'>
        Update: Partial<Omit<Location, 'id' | 'created_at'>>
      }
      companies: {
        Row: Company
        Insert: Omit<Company, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Company, 'id' | 'created_at'>>
      }
      faqs: {
        Row: FAQ
        Insert: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<FAQ, 'id' | 'created_at'>>
      }
    }
  }
}
