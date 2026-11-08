// PLACEHOLDER — replaced by `pnpm gen:types` (see root package.json).
//
// Run `pnpm gen:types` after linking your Supabase project to overwrite this
// file with the real schema produced by `supabase gen types typescript`.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
