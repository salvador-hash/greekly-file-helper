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
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          university: string | null
          fraternity: string | null
          grad_year: number | null
          industry: string | null
          bio: string | null
          avatar_url: string | null
          location: string | null
          major: string | null
          varsity_sport: string | null
          clubs: string[] | null
          created_at: string
          updated_at: string
          email_notifications: boolean
          push_notifications: boolean
          connection_notifications: boolean
          message_notifications: boolean
          profile_visibility: string
          show_email: boolean
          show_location: boolean
        }
        Insert: {
          id: string
          name: string
          email: string
          university?: string | null
          fraternity?: string | null
          grad_year?: number | null
          industry?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          major?: string | null
          varsity_sport?: string | null
          clubs?: string[] | null
          created_at?: string
          updated_at?: string
          email_notifications?: boolean
          push_notifications?: boolean
          connection_notifications?: boolean
          message_notifications?: boolean
          profile_visibility?: string
          show_email?: boolean
          show_location?: boolean
        }
        Update: {
          id?: string
          name?: string
          email?: string
          university?: string | null
          fraternity?: string | null
          grad_year?: number | null
          industry?: string | null
          bio?: string | null
          avatar_url?: string | null
          location?: string | null
          major?: string | null
          varsity_sport?: string | null
          clubs?: string[] | null
          created_at?: string
          updated_at?: string
          email_notifications?: boolean
          push_notifications?: boolean
          connection_notifications?: boolean
          message_notifications?: boolean
          profile_visibility?: string
          show_email?: boolean
          show_location?: boolean
        }
      }
      posts: {
        Row: {
          id: string
          author_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string
        }
      }
      post_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      connections: {
        Row: {
          id: string
          user_id: string
          connected_user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          connected_user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          connected_user_id?: string
          created_at?: string
        }
      }
      connection_requests: {
        Row: {
          id: string
          from_user_id: string
          to_user_id: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          from_user_id: string
          to_user_id: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string
          to_user_id?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Profile = Tables<'profiles'>
export type Post = Tables<'posts'>
export type PostLike = Tables<'post_likes'>
export type PostComment = Tables<'post_comments'>
export type Connection = Tables<'connections'>
export type ConnectionRequest = Tables<'connection_requests'>
export type Message = Tables<'messages'>
export type Notification = Tables<'notifications'>
