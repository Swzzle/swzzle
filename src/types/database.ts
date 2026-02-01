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
      recipes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          cuisine: string | null;
          prep_time: number;
          cook_time: number;
          servings: number;
          difficulty: 'Easy' | 'Medium' | 'Hard';
          dietary_tags: string[];
          ingredients: Json;
          instructions: string[];
          tips: string[];
          nutrition: Json | null;
          image_url: string | null;
          source_url: string | null;
          is_favorite: boolean;
          is_ai_generated: boolean;
          notes: string | null;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['recipes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['recipes']['Insert']>;
      };
      meal_plans: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          recipe_id: string | null;
          custom_meal_name: string | null;
          servings: number;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['meal_plans']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['meal_plans']['Insert']>;
      };
      shopping_items: {
        Row: {
          id: string;
          user_id: string;
          item_name: string;
          quantity: string | null;
          unit: string | null;
          category: string;
          is_checked: boolean;
          recipe_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['shopping_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['shopping_items']['Insert']>;
      };
      pantry_items: {
        Row: {
          id: string;
          user_id: string;
          item_name: string;
          quantity: string | null;
          unit: string | null;
          category: string;
          expiration_date: string | null;
          low_stock_alert: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['pantry_items']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['pantry_items']['Insert']>;
      };
      leftovers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          recipe_id: string | null;
          stored_date: string;
          expiration_date: string | null;
          notes: string | null;
          is_used: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['leftovers']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['leftovers']['Insert']>;
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          user_name: string;
          theme: 'dark' | 'light';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_settings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['user_settings']['Insert']>;
      };
    };
  };
}
