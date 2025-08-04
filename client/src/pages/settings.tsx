import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Bell, Moon, Sun, User, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { NotificationSetup } from "@/components/notifications/notification-setup";
import { useTheme } from "@/hooks/use-theme";
import { useDevMode } from "@/hooks/use-dev-mode";
import { USERS } from "@/lib/constants";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const { isDevMode, toggleDevMode } = useDevMode();
  const [currentUserId] = useState(USERS.ALEX.id); // TODO: Get from auth context

  const currentUser = currentUserId === USERS.ALEX.id ? USERS.ALEX : USERS.MAYA;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Settings</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold"
                style={{ backgroundColor: currentUser.color }}
              >
                {currentUser.avatar}
              </div>
              <div>
                <div className="font-medium">{currentUser.displayName}</div>
                <div className="text-sm text-muted-foreground">@{currentUser.username}</div>
              </div>
              <Badge variant="secondary">Current User</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Dark Mode</div>
                <div className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </div>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <NotificationSetup />

        {/* Developer Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              Developer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Dev Mode</div>
                <div className="text-sm text-muted-foreground">
                  Show test notification buttons on each screen
                </div>
              </div>
              <Switch
                checked={isDevMode}
                onCheckedChange={toggleDevMode}
              />
            </div>
            {isDevMode && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">
                  Developer mode is active. Test notification buttons will appear on cleaning and plant pages.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Version</span>
              <span className="text-sm text-muted-foreground">1.0.0</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm">Features</span>
              <span className="text-sm text-muted-foreground">
                Shopping, Finances, Cleaning, Plants
              </span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm">Push Notifications</span>
              <Badge variant="secondary">Beta</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}