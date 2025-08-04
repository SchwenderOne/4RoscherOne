import { Switch, Route } from "wouter";
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
  return (
    <MobileLayout>
      <Switch>
        <Route path={ROUTES.DASHBOARD} component={Dashboard} />
        <Route path="/tasks-today" component={TasksToday} />
        <Route path={ROUTES.SHOPPING} component={Shopping} />
        <Route path={ROUTES.FINANCES} component={Finances} />
        <Route path={ROUTES.CLEANING} component={Cleaning} />
        <Route path={ROUTES.PLANTS} component={Plants} />
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
