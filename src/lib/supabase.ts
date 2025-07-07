import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables before creating the client
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

// Ensure the URL is valid before creating the client
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(
    'Invalid Supabase URL. Please check your VITE_SUPABASE_URL environment variable.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function verifyPassword(password: string, type: 'auth' | 'delete'): Promise<boolean> {
  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/verify-password`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password, type }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to verify password');
    }

    const { isValid } = await response.json();
    return isValid;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}