import { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { MobileLayout } from "@/components/layout/mobile-layout";
import { ROUTES } from "@/lib/constants";

import Dashboard from "@/pages/dashboard";
import TasksToday from "@/pages/tasks-today";
import Shopping from "@/pages/shopping";
import Finances from "@/pages/finances";
import Cleaning from "@/pages/cleaning";
import Plants from "@/pages/plants";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  
  // State to handle modal visibility for each page
  const [modals, setModals] = useState({
    shopping: false,
    finances: false,
    cleaning: false,
    plants: false,
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
    }
  };

  const shouldShowFab = [ROUTES.SHOPPING, ROUTES.FINANCES, ROUTES.CLEANING, ROUTES.PLANTS].includes(location as typeof ROUTES[keyof typeof ROUTES]);

  return (
    <MobileLayout onFabClick={shouldShowFab ? handleFabClick : undefined}>
      <Switch>
        <Route path={ROUTES.DASHBOARD} component={Dashboard} />
        <Route path="/tasks-today" component={TasksToday} />
        <Route path={ROUTES.SHOPPING}>
          {() => <Shopping isAddModalOpen={modals.shopping} setIsAddModalOpen={(open) => setModals(prev => ({ ...prev, shopping: open }))} />}
        </Route>
        <Route path={ROUTES.FINANCES}>
          {() => <Finances isAddModalOpen={modals.finances} setIsAddModalOpen={(open) => setModals(prev => ({ ...prev, finances: open }))} />}
        </Route>
        <Route path={ROUTES.CLEANING}>
          {() => <Cleaning isAddModalOpen={modals.cleaning} setIsAddModalOpen={(open) => setModals(prev => ({ ...prev, cleaning: open }))} />}
        </Route>
        <Route path={ROUTES.PLANTS}>
          {() => <Plants isAddModalOpen={modals.plants} setIsAddModalOpen={(open) => setModals(prev => ({ ...prev, plants: open }))} />}
        </Route>
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
