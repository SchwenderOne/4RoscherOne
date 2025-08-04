import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, TriangleAlert, History, ShoppingCart, Fan, ChevronRight, Leaf } from "lucide-react";
import { USERS } from "@/lib/constants";

interface DashboardData {
  balance: {
    alex: number;
    maya: number;
  };
  urgentTasks: Array<{
    id: string;
    title: string;
    type: string;
    daysOverdue: string;
  }>;
  todayTasks: Array<{
    id: string;
    title: string;
    type: string;
    category: string;
  }>;
  taskCount: number;
  recentActivities: Array<{
    id: string;
    userId: string;
    description: string;
    createdAt: string;
  }>;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });


  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-muted rounded-xl animate-pulse" />
          <div className="h-20 bg-muted rounded-xl animate-pulse" />
        </div>
        <div className="h-32 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Failed to load dashboard data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatBalance = (balance: number) => {
    return balance >= 0 ? `€${balance.toFixed(2)}` : `-€${Math.abs(balance).toFixed(2)}`;
  };

  const getBalanceStatus = (alexBalance: number, mayaBalance: number) => {
    if (alexBalance > 0) {
      return "Maya owes Alex";
    } else if (alexBalance < 0) {
      return "Alex owes Maya";
    }
    return "All even";
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    return `${diffInDays} days ago`;
  };

  return (
    <div className="p-4 space-y-6">
      {/* Today's Overview */}
      <section className="animate-in slide-in-from-bottom-4 duration-300">
        <h2 className="text-lg font-medium mb-4 flex items-center">
          <CalendarDays className="text-primary mr-2" size={20} />
          Today's Overview
        </h2>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card 
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setLocation("/tasks-today")}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{dashboardData.taskCount}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                Tasks Today
                <ChevronRight className="h-3 w-3" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-500">
                {formatBalance(Math.abs(dashboardData.balance.alex))}
              </div>
              <div className="text-sm text-muted-foreground">
                {getBalanceStatus(dashboardData.balance.alex, dashboardData.balance.maya)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Urgent Tasks */}
        {dashboardData.urgentTasks.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="font-medium mb-3 text-red-600 flex items-center">
                <TriangleAlert className="mr-2" size={16} />
                Urgent
              </h3>
              <div className="space-y-2">
                {dashboardData.urgentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                      <span className="text-sm">{task.title}</span>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {task.daysOverdue}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Today's Tasks */}
      {dashboardData.todayTasks.length > 0 && (
        <section className="animate-in slide-in-from-bottom-4 duration-500">
          <h3 className="font-medium mb-3 flex items-center text-orange-600">
            <CalendarDays className="mr-2" size={16} />
            Due Today
          </h3>
          
          <div className="space-y-3">
            {dashboardData.todayTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        {task.type === 'plant' ? (
                          <Leaf className="text-green-600" size={16} />
                        ) : (
                          <Fan className="text-blue-600" size={16} />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{task.title}</div>
                        <div className="text-xs text-muted-foreground">{task.category}</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      <section className="animate-in slide-in-from-bottom-4 duration-700">
        <h3 className="font-medium mb-3 flex items-center">
          <History className="text-muted-foreground mr-2" size={16} />
          Recent Activity
        </h3>
        
        <div className="space-y-3">
          {dashboardData.recentActivities.length === 0 ? (
            <Card>
              <CardContent className="p-4 text-center text-muted-foreground">
                No recent activity
              </CardContent>
            </Card>
          ) : (
            dashboardData.recentActivities.map((activity) => {
              const user = activity.userId === USERS.ALEX.id ? USERS.ALEX : USERS.MAYA;
              return (
                <Card key={activity.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-medium mt-1"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">{activity.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(activity.createdAt)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
