export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole =
  | 'guest'
  | 'user'
  | 'verified_user'
  | 'broker_verified'
  | 'insurer_verified'
  | 'moderator'
  | 'admin'

export type PostStatus = 'draft' | 'published' | 'archived' | 'flagged' | 'removed'

export type ReactionType = 'like' | 'dislike' | 'share' | 'bookmark'

export interface Profile {
  id: string
  username: string
  email: string
  avatar_url?: string
  bio?: string
  role: UserRole
  reputation: number
  yachts_owned?: number
  primary_vessel?: string
  created_at: string
  updated_at: string
}

export interface Vessel {
  id: string
  user_id: string
  name: string
  type?: string
  length_ft?: number
  year_built?: number
  flag_state?: string
  home_port?: string
  created_at: string
}

export interface Post {
  id: string
  author_id: string
  title: string
  body: string
  category_id?: string
  yacht_type?: string
  yacht_length?: string
  company_id?: string
  location_id?: string
  status: PostStatus
  views: number
  score: number
  created_at: string
  updated_at: string
  author?: Profile
  category?: Category
  tags?: Tag[]
  reactions_count?: {
    like: number
    dislike: number
    share: number
    bookmark: number
  }
  comments_count?: number
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  parent_id?: string
  body: string
  score: number
  created_at: string
  updated_at: string
  author?: Profile
  reactions_count?: {
    like: number
    dislike: number
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
  icon?: string
  display_order: number
}

export interface Tag {
  id: string
  name: string
  slug: string
  description?: string
}

export interface Location {
  id: string
  name: string
  slug: string
  parent_id?: string
  level: number
}

export interface Company {
  id: string
  name: string
  slug: string
  type: 'insurer' | 'broker' | 'provider'
  description?: string
  website?: string
  logo_url?: string
  verified: boolean
  created_at: string
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

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  post_id?: string
  comment_id?: string
  read: boolean
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      vessels: {
        Row: Vessel
        Insert: Omit<Vessel, 'id' | 'created_at'>
        Update: Partial<Omit<Vessel, 'id' | 'created_at'>>
      }
      posts: {
        Row: Post
        Insert: Omit<Post, 'id' | 'created_at' | 'updated_at' | 'views' | 'score'>
        Update: Partial<Omit<Post, 'id' | 'created_at'>>
      }
      comments: {
        Row: Comment
        Insert: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'score'>
        Update: Partial<Omit<Comment, 'id' | 'created_at'>>
      }
      reactions: {
        Row: Reaction
        Insert: Omit<Reaction, 'id' | 'created_at'>
        Update: Partial<Omit<Reaction, 'id' | 'created_at'>>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id'>
        Update: Partial<Omit<Category, 'id'>>
      }
      tags: {
        Row: Tag
        Insert: Omit<Tag, 'id'>
        Update: Partial<Omit<Tag, 'id'>>
      }
      locations: {
        Row: Location
        Insert: Omit<Location, 'id'>
        Update: Partial<Omit<Location, 'id'>>
      }
      companies: {
        Row: Company
        Insert: Omit<Company, 'id' | 'created_at'>
        Update: Partial<Omit<Company, 'id' | 'created_at'>>
      }
      faqs: {
        Row: FAQ
        Insert: Omit<FAQ, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<FAQ, 'id' | 'created_at'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id' | 'created_at'>
        Update: Partial<Omit<Notification, 'id' | 'created_at'>>
      }
    }
  }
}
