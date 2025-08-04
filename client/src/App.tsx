import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { MobileLayout } from "@/components/layout/mobile-layout";
import { NotificationService } from "@/services/notification-service";
import { ROUTES } from "@/lib/constants";
import { useWebSocket } from "@/hooks/use-websocket";

import Dashboard from "@/pages/dashboard";
import TasksToday from "@/pages/tasks-today";
import Shopping from "@/pages/shopping";
import Finances from "@/pages/finances";
import Cleaning from "@/pages/cleaning";
import Plants from "@/pages/plants";
import Inventory from "@/pages/inventory";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  
  // Initialize WebSocket connection for live updates
  const { isConnected } = useWebSocket();

  // Initialize notification service
  useEffect(() => {
    const initNotifications = async () => {
      const notificationService = NotificationService.getInstance();
      await notificationService.initialize();
    };
    initNotifications();
  }, []);
  
  // State to handle modal visibility for each page
  const [modals, setModals] = useState({
    shopping: false,
    finances: false,
    cleaning: false,
    plants: false,
    inventory: false,
    receiptScanner: false,
  });

  const handleFabClick = () => {
    switch (location) {
      case ROUTES.SHOPPING:
        setModals(prev => ({ ...prev, shopping: true }));
        break;
      case ROUTES.FINANCES:
        setModals(prev => ({ ...prev, finances: true }));
        break;
      case ROUTES.CLEANING:
        setModals(prev => ({ ...prev, cleaning: true }));
        break;
      case ROUTES.PLANTS:
        setModals(prev => ({ ...prev, plants: true }));
        break;
      case ROUTES.INVENTORY:
        setModals(prev => ({ ...prev, inventory: true }));
        break;
    }
  };

  const handleScanClick = () => {
    if (location === ROUTES.FINANCES) {
      setModals(prev => ({ ...prev, receiptScanner: true }));
    }
  };

  const shouldShowFab = [ROUTES.SHOPPING, ROUTES.FINANCES, ROUTES.CLEANING, ROUTES.PLANTS, ROUTES.INVENTORY].includes(location as typeof ROUTES[keyof typeof ROUTES]);

  return (
    <MobileLayout 
      onFabClick={shouldShowFab ? handleFabClick : undefined}
      onScanClick={shouldShowFab ? handleScanClick : undefined}
      showScanOption={location === ROUTES.FINANCES}
    >
      <Switch>
        <Route path={ROUTES.DASHBOARD} component={Dashboard} />
        <Route path="/tasks-today" component={TasksToday} />
        <Route path={ROUTES.SHOPPING}>
          {() => <Shopping isAddModalOpen={modals.shopping} setIsAddModalOpen={(open) => setModals(prev => ({ ...prev, shopping: open }))} />}
        </Route>
        <Route path={ROUTES.FINANCES}>
          {() => <Finances 
            isAddModalOpen={modals.finances} 
            setIsAddModalOpen={(open) => setModals(prev => ({ ...prev, finances: open }))}
            isReceiptScannerOpen={modals.receiptScanner}
            setIsReceiptScannerOpen={(open) => setModals(prev => ({ ...prev, receiptScanner: open }))}
          />}
        </Route>
        <Route path={ROUTES.CLEANING}>
          {() => <Cleaning isAddModalOpen={modals.cleaning} setIsAddModalOpen={(open) => setModals(prev => ({ ...prev, cleaning: open }))} />}
        </Route>
        <Route path={ROUTES.PLANTS}>
          {() => <Plants isAddModalOpen={modals.plants} setIsAddModalOpen={(open) => setModals(prev => ({ ...prev, plants: open }))} />}
        </Route>
        <Route path={ROUTES.INVENTORY}>
          {() => <Inventory isAddModalOpen={modals.inventory} setIsAddModalOpen={(open) => setModals(prev => ({ ...prev, inventory: open }))} />}
        </Route>
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </MobileLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
