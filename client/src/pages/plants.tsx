
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Droplets, Plus, Edit, Bell } from "lucide-react";
import { USERS } from "@/lib/constants";
import { AddPlantModal } from "@/components/forms/add-plant-modal";
import type { Plant } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { NotificationService } from "@/services/notification-service";
import { useDevMode } from "@/hooks/use-dev-mode";

interface PlantsProps {
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export default function Plants({ isAddModalOpen, setIsAddModalOpen }: PlantsProps) {
  const queryClient = useQueryClient();
  const { isDevMode } = useDevMode();

  const { data: plants = [], isLoading } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });

  const waterPlantMutation = useMutation({
    mutationFn: async (plantId: string) => {
      const response = await apiRequest("PATCH", `/api/plants/${plantId}`, {
        lastWateredAt: new Date().toISOString(),
        lastWateredById: USERS.ALEX.id, // TODO: Use current user
      });
      return response.json();
    },
    onSuccess: (data, plantId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      
      // Send notification for plant watering
      const plant = plants.find(p => p.id === plantId);
      if (plant && Notification.permission === 'granted') {
        const notificationService = NotificationService.getInstance();
        notificationService.sendNotification({
          title: "🌱 Plant Watered!",
          body: `${plant.name} has been watered`,
          tag: `plant-watered-${plant.name}`,
          data: { type: 'plant-watered', plantName: plant.name }
        });
      }
    },
  });

  const getPlantStatus = (plant: Plant) => {
    if (!plant.lastWateredAt) {
      return { status: "Needs watering", color: "text-orange-600", variant: "secondary" as const };
    }

    const lastWatered = new Date(plant.lastWateredAt);
    const now = new Date();
    const daysSinceWatered = Math.floor((now.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceWatered >= plant.wateringFrequencyDays) {
      const daysOverdue = daysSinceWatered - plant.wateringFrequencyDays;
      return { 
        status: daysOverdue > 0 ? "Overdue" : "Due today", 
        color: daysOverdue > 0 ? "text-red-600" : "text-orange-600",
        variant: daysOverdue > 0 ? "destructive" as const : "secondary" as const
      };
    } else {
      const daysUntilDue = plant.wateringFrequencyDays - daysSinceWatered;
      return { 
        status: "Good", 
        color: "text-green-600",
        variant: "secondary" as const,
        nextWatering: `in ${daysUntilDue} days`
      };
    }
  };

  const formatLastWatered = (dateString: string | null) => {
    if (!dateString) return "Never watered";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "today";
    if (diffInDays === 1) return "yesterday";
    return `${diffInDays} days ago`;
  };

  const getNextWateringText = (plant: Plant) => {
    if (!plant.lastWateredAt) return "overdue";
    
    const lastWatered = new Date(plant.lastWateredAt);
    const nextWatering = new Date(lastWatered);
    nextWatering.setDate(nextWatering.getDate() + plant.wateringFrequencyDays);
    
    const now = new Date();
    const diffInDays = Math.floor((nextWatering.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 0) {
      return `${Math.abs(diffInDays)} days overdue`;
    } else if (diffInDays === 0) {
      return "due today";
    } else {
      return `in ${diffInDays} days`;
    }
  };

  const sendTestNotification = (type: 'reminder' | 'overdue') => {
    const notificationService = NotificationService.getInstance();
    if (type === 'reminder') {
      notificationService.sendNotification(
        NotificationService.createPlantReminder("Monstera", 0)
      );
    } else {
      notificationService.sendNotification(
        NotificationService.createPlantReminder("Snake Plant", 3)
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Plant Care</h2>
        <Button 
          className="rounded-xl" 
          style={{ backgroundColor: USERS.MAYA.color }}
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="mr-2" size={16} />
          Add Plant
        </Button>
      </div>

      {/* Dev Mode Test Buttons */}
      {isDevMode && (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4" />
              <span className="text-sm font-medium">Test Notifications</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendTestNotification('reminder')}
              >
                Test Watering Reminder
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => sendTestNotification('overdue')}
              >
                Test Overdue Alert
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plant Cards */}
      <div className="space-y-4">
        {plants.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No plants added yet</p>
            </CardContent>
          </Card>
        ) : (
          plants.map((plant) => {
            const plantStatus = getPlantStatus(plant);
            const isOverdue = plantStatus.status === "Overdue";

            return (
              <Card key={plant.id} className="overflow-hidden">
                {plant.imageUrl && (
                  <img 
                    src={plant.imageUrl}
                    alt={plant.name}
                    className="w-full h-32 object-cover"
                  />
                )}
                
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{plant.name}</h3>
                      <div className="text-xs text-muted-foreground">{plant.location}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant={plantStatus.variant} className={plantStatus.color}>
                        {plantStatus.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {getNextWateringText(plant)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1 text-sm mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last watered</span>
                      <span>{formatLastWatered(plant.lastWateredAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Next watering</span>
                      <span className={isOverdue ? "text-red-600" : ""}>
                        {getNextWateringText(plant)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      className="flex-1"
                      style={{ backgroundColor: USERS.MAYA.color }}
                      onClick={() => waterPlantMutation.mutate(plant.id)}
                      disabled={waterPlantMutation.isPending}
                    >
                      <Droplets className="mr-2" size={16} />
                      {isOverdue || plantStatus.status === "Due today" ? "Water Now" : "Water Early"}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Edit size={16} />
                    </Button>
                  </div>
                  
                  {plant.notes && (
                    <div className="mt-3 p-2 bg-muted rounded text-xs text-muted-foreground">
                      {plant.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Plant Modal */}
      <AddPlantModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </div>
  );
}
