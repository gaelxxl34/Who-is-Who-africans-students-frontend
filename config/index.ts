export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5500';

export const config = {
  apiUrl: API_BASE_URL,
  frontendUrl: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
};
