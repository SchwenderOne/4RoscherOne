import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Calendar, CheckCircle2, Droplets, Utensils, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { Room, Plant, User } from "@shared/schema";

interface TaskItem {
  id: string;
  type: 'cleaning' | 'plant';
  title: string;
  subtitle: string;
  status: 'overdue' | 'due_today' | 'due_soon';
  daysOverdue?: number;
  assignedUser?: User;
  icon: React.ReactNode;
  actionLabel: string;
  onAction: () => Promise<void>;
}

export default function TasksToday() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const { data: plants = [] } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const roomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastCleanedAt: new Date().toISOString(),
          lastCleanedById: "alex-id", // Current user
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });

  const plantMutation = useMutation({
    mutationFn: async (plantId: string) => {
      const response = await fetch(`/api/plants/${plantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastWateredAt: new Date().toISOString(),
          lastWateredById: "alex-id", // Current user
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });

  const getUserById = (id: string) => users.find(u => u.id === id);

  const getTaskStatus = (lastDate: Date, frequencyDays: number) => {
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysOverdue = daysSince - frequencyDays;
    
    if (daysOverdue > 0) return { status: 'overdue' as const, daysOverdue };
    if (daysOverdue === 0) return { status: 'due_today' as const, daysOverdue: 0 };
    return { status: 'due_soon' as const, daysOverdue: 0 };
  };

  const getTasks = (): TaskItem[] => {
    const tasks: TaskItem[] = [];

    // Add cleaning tasks
    rooms.forEach(room => {
      const { status, daysOverdue } = getTaskStatus(
        room.lastCleanedAt ? new Date(room.lastCleanedAt) : new Date(),
        room.cleaningFrequencyDays
      );
      
      if (status === 'overdue' || status === 'due_today') {
        const nextUser = getUserById(room.lastCleanedById === "alex-id" ? "maya-id" : "alex-id");
        
        tasks.push({
          id: room.id,
          type: 'cleaning',
          title: `Clean ${room.name}`,
          subtitle: status === 'overdue' 
            ? `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue` 
            : 'Due today',
          status,
          daysOverdue: status === 'overdue' ? daysOverdue : undefined,
          assignedUser: nextUser,
          icon: room.icon === 'utensils' ? <Utensils className="h-4 w-4" /> : 
                room.icon === 'bath' ? <Droplets className="h-4 w-4" /> : 
                <Home className="h-4 w-4" />,
          actionLabel: 'Mark Clean',
          onAction: async () => {
            await roomMutation.mutateAsync(room.id);
          }
        });
      }
    });

    // Add plant tasks
    plants.forEach(plant => {
      const { status, daysOverdue } = getTaskStatus(
        plant.lastWateredAt ? new Date(plant.lastWateredAt) : new Date(),
        plant.wateringFrequencyDays
      );
      
      if (status === 'overdue' || status === 'due_today') {
        tasks.push({
          id: plant.id,
          type: 'plant',
          title: `Water ${plant.name}`,
          subtitle: status === 'overdue' 
            ? `${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue` 
            : 'Due today',
          status,
          daysOverdue: status === 'overdue' ? daysOverdue : undefined,
          assignedUser: undefined, // Plants don't have specific assignees
          icon: <Droplets className="h-4 w-4" />,
          actionLabel: 'Water Now',
          onAction: async () => {
            await plantMutation.mutateAsync(plant.id);
          }
        });
      }
    });

    // Sort by urgency: overdue first, then by days overdue
    return tasks.sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (b.status === 'overdue' && a.status !== 'overdue') return 1;
      if (a.status === 'overdue' && b.status === 'overdue') {
        return (b.daysOverdue || 0) - (a.daysOverdue || 0);
      }
      return 0;
    });
  };

  const tasks = getTasks();
  const overdueTasks = tasks.filter(t => t.status === 'overdue');
  const todayTasks = tasks.filter(t => t.status === 'due_today');

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-card">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Today's Tasks</h1>
        </div>
        <Badge variant="secondary" className="ml-auto">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-2">All caught up!</h3>
              <p className="text-muted-foreground">
                No urgent tasks for today. Great job staying on top of things!
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Overdue Tasks */}
            {overdueTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-base font-medium text-destructive">Overdue</h2>
                  <Badge variant="destructive" className="text-xs">
                    {overdueTasks.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {overdueTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* Today's Tasks */}
            {todayTasks.length > 0 && (
              <div>
                {overdueTasks.length > 0 && <Separator className="mb-6" />}
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-base font-medium text-orange-600 dark:text-orange-400">Due Today</h2>
                  <Badge variant="outline" className="text-xs border-orange-200 text-orange-600 dark:border-orange-800 dark:text-orange-400">
                    {todayTasks.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {todayTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: TaskItem }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    setIsLoading(true);
    try {
      await task.onAction();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`${
      task.status === 'overdue' 
        ? 'border-destructive/20 bg-destructive/5' 
        : 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20'
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-full ${
              task.status === 'overdue' 
                ? 'bg-destructive/10 text-destructive' 
                : 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'
            }`}>
              {task.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium mb-1">{task.title}</h3>
              <p className={`text-sm mb-2 ${
                task.status === 'overdue' ? 'text-destructive' : 'text-orange-600 dark:text-orange-400'
              }`}>
                {task.subtitle}
              </p>
              {task.assignedUser && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Assigned to:</span>
                  <div className="flex items-center gap-1">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback 
                        className="text-xs" 
                        style={{ backgroundColor: task.assignedUser.color }}
                      >
                        {task.assignedUser.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{task.assignedUser.displayName}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={handleAction}
            disabled={isLoading}
            className={
              task.status === 'overdue' 
                ? 'bg-destructive hover:bg-destructive/90' 
                : 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600'
            }
          >
            {isLoading ? '...' : task.actionLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}