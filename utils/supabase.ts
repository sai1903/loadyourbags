import { createClient } from '@supabase/supabase-js';
import config from './config';

if (!config.supabase.url || !config.supabase.anonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'X-Client-Info': `${config.app.name}@${config.app.version}`
      }
    }
  }
); 