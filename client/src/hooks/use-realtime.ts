import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { subscribeToTable, unsubscribe, type RealtimeChannel } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface UseRealtimeOptions {
  enabled?: boolean;
  onInsert?: (record: any) => void;
  onUpdate?: (record: any) => void;
  onDelete?: (record: any) => void;
}

export function useRealtime(
  table: string,
  queryKeys: string[],
  options: UseRealtimeOptions = {}
) {
  const { enabled = true, onInsert, onUpdate, onDelete } = options;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Subscribe to real-time changes
    channelRef.current = subscribeToTable(table, (payload) => {
      // Invalidate relevant queries
      queryKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: [key] });
      });

      // Handle specific events
      switch (payload.eventType) {
        case 'INSERT':
          if (onInsert) onInsert(payload.new);
          // Show toast for certain tables
          if (table === 'activities') {
            toast({
              title: "New Activity",
              description: payload.new?.description || "Something happened",
            });
          }
          break;
        case 'UPDATE':
          if (onUpdate) onUpdate(payload.new);
          break;
        case 'DELETE':
          if (onDelete) onDelete(payload.old);
          break;
      }
    });

    // Cleanup
    return () => {
      if (channelRef.current) {
        unsubscribe(channelRef.current);
      }
    };
  }, [enabled, table, queryKeys, onInsert, onUpdate, onDelete, queryClient, toast]);

  return channelRef.current;
}

// Hook for subscribing to multiple tables
export function useMultipleRealtime(
  subscriptions: Array<{
    table: string;
    queryKeys: string[];
    options?: UseRealtimeOptions;
  }>
) {
  const channels = useRef<RealtimeChannel[]>([]);

  useEffect(() => {
    // Subscribe to all tables
    subscriptions.forEach(({ table, queryKeys, options }) => {
      const channel = useRealtime(table, queryKeys, options);
      if (channel) {
        channels.current.push(channel);
      }
    });

    // Cleanup all subscriptions
    return () => {
      channels.current.forEach(channel => {
        unsubscribe(channel);
      });
      channels.current = [];
    };
  }, [subscriptions]);
}