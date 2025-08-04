import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Real-time subscription types
export type RealtimeChannel = ReturnType<typeof supabase.channel>;

// Helper to subscribe to table changes
export function subscribeToTable<T = any>(
  table: string,
  callback: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: T | null;
    old: T | null;
  }) => void
) {
  const channel = supabase
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as T,
          old: payload.old as T,
        });
      }
    )
    .subscribe();

  return channel;
}

// Helper to unsubscribe
export async function unsubscribe(channel: RealtimeChannel) {
  await supabase.removeChannel(channel);
}