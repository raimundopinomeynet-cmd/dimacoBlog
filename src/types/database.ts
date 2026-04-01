export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      api_settings: {
        Row: {
          id: string;
          user_id: string;
          openai_key_encrypted: string | null;
          gemini_key_encrypted: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          openai_key_encrypted?: string | null;
          gemini_key_encrypted?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          openai_key_encrypted?: string | null;
          gemini_key_encrypted?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          brand_name: string;
          industry: string;
          service: string;
          country: string;
          prompts: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          brand_name: string;
          industry: string;
          service: string;
          country: string;
          prompts?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          brand_name?: string;
          industry?: string;
          service?: string;
          country?: string;
          prompts?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      executions: {
        Row: {
          id: string;
          project_id: string;
          executed_at: string;
          status: string;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          executed_at?: string;
          status?: string;
          error_message?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          executed_at?: string;
          status?: string;
          error_message?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      responses: {
        Row: {
          id: string;
          execution_id: string;
          project_id: string;
          prompt_index: number;
          prompt_text: string;
          llm_provider: string;
          llm_model: string;
          response_text: string;
          response_time_ms: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          execution_id: string;
          project_id: string;
          prompt_index: number;
          prompt_text: string;
          llm_provider: string;
          llm_model: string;
          response_text: string;
          response_time_ms: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          execution_id?: string;
          project_id?: string;
          prompt_index?: number;
          prompt_text?: string;
          llm_provider?: string;
          llm_model?: string;
          response_text?: string;
          response_time_ms?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      analysis_results: {
        Row: {
          id: string;
          response_id: string;
          project_id: string;
          execution_id: string;
          brand_mentioned: boolean;
          mention_count: number;
          sentiment_score: number;
          sentiment_label: string;
          prominence_score: number;
          warmth_score: number;
          analysis_details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          response_id: string;
          project_id: string;
          execution_id: string;
          brand_mentioned: boolean;
          mention_count: number;
          sentiment_score: number;
          sentiment_label: string;
          prominence_score: number;
          warmth_score: number;
          analysis_details?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          response_id?: string;
          project_id?: string;
          execution_id?: string;
          brand_mentioned?: boolean;
          mention_count?: number;
          sentiment_score?: number;
          sentiment_label?: string;
          prominence_score?: number;
          warmth_score?: number;
          analysis_details?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Helper types
export type ApiSettings = Database['public']['Tables']['api_settings']['Row'];
export type Project = Database['public']['Tables']['projects']['Row'];
export type Execution = Database['public']['Tables']['executions']['Row'];
export type Response = Database['public']['Tables']['responses']['Row'];
export type AnalysisResult = Database['public']['Tables']['analysis_results']['Row'];

export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];
