/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RAPID_API_KEY: string;
  readonly VITE_RAPID_API_HOST: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_STRIPE_PUBLIC_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
