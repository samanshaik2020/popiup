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
      popups: {
        Row: {
          id: string
          user_id: string
          name: string
          content: string
          type: string
          position: string | null
          trigger_type: string
          trigger_value: Json | null
          styles: Json | null
          active: boolean
          frequency_cap: number | null
          targeting_rules: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          content: string
          type: string
          position?: string | null
          trigger_type: string
          trigger_value?: Json | null
          styles?: Json | null
          active?: boolean
          frequency_cap?: number | null
          targeting_rules?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          content?: string
          type?: string
          position?: string | null
          trigger_type?: string
          trigger_value?: Json | null
          styles?: Json | null
          active?: boolean
          frequency_cap?: number | null
          targeting_rules?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "popups_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      short_links: {
        Row: {
          id: string
          user_id: string
          popup_id: string | null
          slug: string
          destination_url: string
          title: string | null
          description: string | null
          active: boolean
          clicks: number
          created_at: string
          updated_at: string
          og_title: string | null
          og_description: string | null
          og_image: string | null
        }
        Insert: {
          id?: string
          user_id: string
          popup_id?: string | null
          slug: string
          destination_url: string
          title?: string | null
          description?: string | null
          active?: boolean
          clicks?: number
          created_at?: string
          updated_at?: string
          og_title?: string | null
          og_description?: string | null
          og_image?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          popup_id?: string | null
          slug?: string
          destination_url?: string
          title?: string | null
          description?: string | null
          active?: boolean
          clicks?: number
          created_at?: string
          updated_at?: string
          og_title?: string | null
          og_description?: string | null
          og_image?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "short_links_popup_id_fkey"
            columns: ["popup_id"]
            referencedRelation: "popups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "short_links_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      analytics: {
        Row: {
          id: string
          short_link_id: string
          popup_id: string | null
          visitor_id: string | null
          referrer: string | null
          browser: string | null
          device: string | null
          os: string | null
          country: string | null
          city: string | null
          ip_address: string | null
          event_type: string
          created_at: string
        }
        Insert: {
          id?: string
          short_link_id: string
          popup_id?: string | null
          visitor_id?: string | null
          referrer?: string | null
          browser?: string | null
          device?: string | null
          os?: string | null
          country?: string | null
          city?: string | null
          ip_address?: string | null
          event_type: string
          created_at?: string
        }
        Update: {
          id?: string
          short_link_id?: string
          popup_id?: string | null
          visitor_id?: string | null
          referrer?: string | null
          browser?: string | null
          device?: string | null
          os?: string | null
          country?: string | null
          city?: string | null
          ip_address?: string | null
          event_type?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_popup_id_fkey"
            columns: ["popup_id"]
            referencedRelation: "popups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_short_link_id_fkey"
            columns: ["short_link_id"]
            referencedRelation: "short_links"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
