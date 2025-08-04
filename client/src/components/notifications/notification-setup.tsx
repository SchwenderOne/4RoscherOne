import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Smartphone } from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { useServiceWorker } from '@/hooks/use-service-worker';
import { useToast } from '@/hooks/use-toast';

export function NotificationSetup() {
  const { permission, isSupported, requestPermission, sendNotification } = useNotifications();
  const { isRegistered, updateAvailable, installUpdate } = useServiceWorker();
  const { toast } = useToast();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const result = await requestPermission();
      if (result === 'granted') {
        toast({
          title: "Notifications enabled!",
          description: "You'll now receive reminders for cleaning, plants, and expenses.",
        });
        // Send a test notification
        setTimeout(() => {
          sendNotification('RoomMate App', {
            body: 'Notifications are now enabled! You\'ll receive reminders for your tasks.',
            tag: 'welcome'
          });
        }, 1000);
      } else if (result === 'denied') {
        toast({
          title: "Notifications blocked",
          description: "You can enable them later in your browser settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleTestNotification = () => {
    sendNotification('Test Notification', {
      body: 'This is a test notification from RoomMate App!',
      tag: 'test'
    });
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge variant="default" className="bg-green-500"><Bell className="w-3 h-3 mr-1" />Enabled</Badge>;
      case 'denied':
        return <Badge variant="destructive"><BellOff className="w-3 h-3 mr-1" />Blocked</Badge>;
      case 'default':
        return <Badge variant="secondary"><Bell className="w-3 h-3 mr-1" />Not Set</Badge>;
      case 'unsupported':
        return <Badge variant="outline"><BellOff className="w-3 h-3 mr-1" />Not Supported</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Push Notifications
          {getPermissionBadge()}
        </CardTitle>
        <CardDescription>
          Get reminders for cleaning schedules, plant watering, and expense notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Service Worker:</span>
            <Badge variant={isRegistered ? "default" : "secondary"}>
              {isRegistered ? "Active" : "Not Registered"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Permission Status:</span>
            {getPermissionBadge()}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {permission === 'default' && (
            <Button 
              onClick={handleRequestPermission}
              disabled={isRequesting}
              className="w-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              {isRequesting ? 'Requesting...' : 'Enable Notifications'}
            </Button>
          )}

          {permission === 'granted' && (
            <Button 
              onClick={handleTestNotification}
              variant="outline"
              className="w-full"
            >
              <Bell className="w-4 h-4 mr-2" />
              Send Test Notification
            </Button>
          )}

          {permission === 'denied' && (
            <div className="text-sm text-muted-foreground p-3 bg-muted rounded">
              Notifications are blocked. To enable them:
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Click the lock icon in your address bar</li>
                <li>Set notifications to "Allow"</li>
                <li>Refresh the page</li>
              </ol>
            </div>
          )}

          {updateAvailable && (
            <Button 
              onClick={installUpdate}
              variant="outline"
              className="w-full"
            >
              Update Available - Click to Install
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}