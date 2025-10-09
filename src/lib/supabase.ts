import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as { env?: { VITE_SUPABASE_URL?: string } })
  .env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (
  import.meta as { env?: { VITE_SUPABASE_ANON_KEY?: string } }
).env?.VITE_SUPABASE_ANON_KEY;

// Create a mock client for development when env vars are missing
const createMockClient = () => {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signInWithPassword: async () => ({
        data: null,
        error: new Error("Auth not configured"),
      }),
      signUp: async () => ({
        data: null,
        error: new Error("Auth not configured"),
      }),
      signInWithOAuth: async () => ({
        data: null,
        error: new Error("Auth not configured"),
      }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({
        data: null,
        error: new Error("Auth not configured"),
      }),
    },
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({
        data: null,
        error: new Error("Database not configured"),
      }),
      update: () => ({
        data: null,
        error: new Error("Database not configured"),
      }),
      delete: () => ({
        data: null,
        error: new Error("Database not configured"),
      }),
    }),
  };
};

export const supabase =
  !supabaseUrl || !supabaseAnonKey
    ? (createMockClient() as unknown as ReturnType<typeof createClient>)
    : createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      });

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          thumbnail_data: Record<string, unknown>; // JSON data for the project state
          preview_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          thumbnail_data: Record<string, unknown>;
          preview_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          thumbnail_data?: Record<string, unknown>;
          preview_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      media_files: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          filename: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          filename: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          filename?: string;
          file_path?: string;
          file_size?: number;
          mime_type?: string;
          created_at?: string;
        };
      };
    };
  };
}
