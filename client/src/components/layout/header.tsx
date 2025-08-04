import { Moon, Sun, Home, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { USERS } from "@/lib/constants";
import { useState } from "react";
import { useLocation } from "wouter";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<'alex' | 'maya'>('alex');
  const [, setLocation] = useLocation();

  const handleUserSwitch = (user: 'alex' | 'maya') => {
    setCurrentUser(user);
    // TODO: Implement user switching logic
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[hsl(207,90%,54%)] to-[hsl(142,71%,45%)] rounded-lg flex items-center justify-center">
            <Home className="text-white text-sm" size={16} />
          </div>
          <h1 className="text-xl font-medium">RoomMate</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* User Switch */}
          <div className="flex items-center space-x-2 bg-muted rounded-full p-1">
            <Button
              variant={currentUser === 'alex' ? 'default' : 'ghost'}
              size="sm"
              className="w-8 h-8 rounded-full p-0 text-xs font-medium"
              style={{ 
                backgroundColor: currentUser === 'alex' ? USERS.ALEX.color : 'transparent',
                color: currentUser === 'alex' ? 'white' : 'inherit'
              }}
              onClick={() => handleUserSwitch('alex')}
            >
              {USERS.ALEX.avatar}
            </Button>
            <Button
              variant={currentUser === 'maya' ? 'default' : 'ghost'}
              size="sm"
              className="w-8 h-8 rounded-full p-0 text-xs font-medium"
              style={{ 
                backgroundColor: currentUser === 'maya' ? USERS.MAYA.color : 'transparent',
                color: currentUser === 'maya' ? 'white' : 'inherit'
              }}
              onClick={() => handleUserSwitch('maya')}
            >
              {USERS.MAYA.avatar}
            </Button>
          </div>
          
          {/* Settings Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/settings")}
            className="rounded-lg"
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-lg"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
