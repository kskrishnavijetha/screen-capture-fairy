export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      annotations: {
        Row: {
          author: string
          created_at: string
          id: string
          text: string
          timestamp: number
          video_id: string
        }
        Insert: {
          author: string
          created_at?: string
          id?: string
          text: string
          timestamp: number
          video_id: string
        }
        Update: {
          author?: string
          created_at?: string
          id?: string
          text?: string
          timestamp?: number
          video_id?: string
        }
        Relationships: []
      }
      "file sharing": {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      file_shares: {
        Row: {
          access_type: string | null
          created_at: string
          expires_at: string | null
          file_id: string | null
          id: string
          share_token: string
          shared_by: string | null
          shared_with: string | null
        }
        Insert: {
          access_type?: string | null
          created_at?: string
          expires_at?: string | null
          file_id?: string | null
          id?: string
          share_token: string
          shared_by?: string | null
          shared_with?: string | null
        }
        Update: {
          access_type?: string | null
          created_at?: string
          expires_at?: string | null
          file_id?: string | null
          id?: string
          share_token?: string
          shared_by?: string | null
          shared_with?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "file_shares_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "shared_files"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      Screen: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      shared_files: {
        Row: {
          access_count: number | null
          created_at: string
          encryption_key: string | null
          file_name: string
          file_path: string
          file_size: number
          id: string
          is_encrypted: boolean | null
          mime_type: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          access_count?: number | null
          created_at?: string
          encryption_key?: string | null
          file_name: string
          file_path: string
          file_size: number
          id?: string
          is_encrypted?: boolean | null
          mime_type: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          access_count?: number | null
          created_at?: string
          encryption_key?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          id?: string
          is_encrypted?: boolean | null
          mime_type?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      stream_presence: {
        Row: {
          created_at: string | null
          id: string
          last_seen: string | null
          metadata: Json | null
          status: string
          stream_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_seen?: string | null
          metadata?: Json | null
          status: string
          stream_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_seen?: string | null
          metadata?: Json | null
          status?: string
          stream_id?: string
          user_id?: string
        }
        Relationships: []
      }
      timeline_events: {
        Row: {
          assignee_id: string | null
          content: string | null
          created_at: string
          created_by: string | null
          event_type: string
          id: string
          metadata: Json | null
          status: string | null
          timestamp: number
          video_id: string
        }
        Insert: {
          assignee_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          status?: string | null
          timestamp: number
          video_id: string
        }
        Update: {
          assignee_id?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          status?: string | null
          timestamp?: number
          video_id?: string
        }
        Relationships: []
      }
      timeline_segment_locks: {
        Row: {
          created_at: string
          end_time: number
          id: string
          locked_by: string
          start_time: number
          video_id: string
        }
        Insert: {
          created_at?: string
          end_time: number
          id?: string
          locked_by: string
          start_time: number
          video_id: string
        }
        Update: {
          created_at?: string
          end_time?: number
          id?: string
          locked_by?: string
          start_time?: number
          video_id?: string
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
