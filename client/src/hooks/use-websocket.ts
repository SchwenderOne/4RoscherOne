import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface WebSocketMessage {
  type: 'connected' | 'update' | 'refetch';
  eventType?: string;
  data?: any;
  queryKeys?: string[];
  timestamp: string;
  message?: string;
}

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const connect = () => {
    // Determine WebSocket URL based on current location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`; // Use /ws path

    console.log('Connecting to WebSocket:', wsUrl);
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        // Clear any reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'connected':
              console.log('WebSocket:', message.message);
              break;
              
            case 'refetch':
              // Refetch specific queries
              if (message.queryKeys) {
                message.queryKeys.forEach(key => {
                  queryClient.invalidateQueries({ queryKey: [key] });
                });
              }
              break;
              
            case 'update':
              // Handle specific update types
              handleUpdateEvent(message);
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        wsRef.current = null;
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect WebSocket...');
          connect();
        }, 3000);
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setIsConnected(false);
    }
  };

  const handleUpdateEvent = (message: WebSocketMessage) => {
    // Show toast notifications for certain events
    switch (message.eventType) {
      case 'shopping-item-added':
        if (message.data?.item) {
          toast({
            title: "Shopping List Updated",
            description: `${message.data.item.name} was added`,
            duration: 3000,
          });
        }
        break;
        
      case 'shopping-item-updated':
        // Silently refetch, no toast for updates
        queryClient.invalidateQueries({ queryKey: ['/api/shopping-lists'] });
        break;
        
      case 'plant-updated':
        if (message.data?.plant?.lastWateredAt) {
          toast({
            title: "Plant Watered",
            description: `${message.data.plant.name} was watered`,
            duration: 3000,
          });
        }
        break;
        
      case 'room-updated':
        if (message.data?.room?.lastCleanedAt) {
          toast({
            title: "Room Cleaned",
            description: `${message.data.room.name} was cleaned`,
            duration: 3000,
          });
        }
        break;
    }
  };

  useEffect(() => {
    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    sendMessage: (message: any) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
      }
    },
  };
}