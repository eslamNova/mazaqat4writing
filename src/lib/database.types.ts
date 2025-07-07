export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          content: string
          title: string
          author_name: string | null
          is_anonymous: boolean
          criticism_level: string
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          title: string
          author_name?: string | null
          is_anonymous?: boolean
          criticism_level?: string
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          title?: string
          author_name?: string | null
          is_anonymous?: boolean
          criticism_level?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          content: string
          author_name: string | null
          is_anonymous: boolean
          parent_comment_id: string | null
          created_at: string
          posts?: {
            id: string
            title: string
          }
        }
        Insert: {
          id?: string
          post_id: string
          content: string
          author_name?: string | null
          is_anonymous?: boolean
          parent_comment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          content?: string
          author_name?: string | null
          is_anonymous?: boolean
          parent_comment_id?: string | null
          created_at?: string
        }
      }
    }
  }
}