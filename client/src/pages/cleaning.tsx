import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, Utensils, Plus } from "lucide-react";
import { USERS } from "@/lib/constants";
import { AddRoomModal } from "@/components/forms/add-room-modal";
import type { Room } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Cleaning() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: rooms = [], isLoading } = useQuery<Room[]>({
    queryKey: ["/api/rooms"],
  });

  const markCleanedMutation = useMutation({
    mutationFn: async (roomId: string) => {
      const response = await apiRequest("PATCH", `/api/rooms/${roomId}`, {
        lastCleanedAt: new Date().toISOString(),
        lastCleanedById: USERS.ALEX.id, // TODO: Use current user
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });

  const getRoomStatus = (room: Room) => {
    if (!room.lastCleanedAt) {
      return { status: "Needs cleaning", color: "text-orange-600", progress: 100 };
    }

    const lastCleaned = new Date(room.lastCleanedAt);
    const now = new Date();
    const daysSinceCleaned = Math.floor((now.getTime() - lastCleaned.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceCleaned >= room.cleaningFrequencyDays) {
      const daysOverdue = daysSinceCleaned - room.cleaningFrequencyDays;
      return { 
        status: daysOverdue > 0 ? `${daysOverdue} days overdue` : "Due today", 
        color: daysOverdue > 0 ? "text-red-600" : "text-orange-600",
        progress: 100
      };
    } else {
      const progress = (daysSinceCleaned / room.cleaningFrequencyDays) * 100;
      const daysUntilDue = room.cleaningFrequencyDays - daysSinceCleaned;
      return { 
        status: daysUntilDue === 1 ? "Due tomorrow" : `${daysUntilDue} days until due`, 
        color: "text-green-600",
        progress
      };
    }
  };

  const getNextAssignee = (room: Room) => {
    if (!room.lastCleanedById) {
      return USERS.ALEX;
    }
    return room.lastCleanedById === USERS.ALEX.id ? USERS.MAYA : USERS.ALEX;
  };

  const formatLastCleaned = (dateString: string | null) => {
    if (!dateString) return "Never cleaned";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Cleaned today";
    if (diffInDays === 1) return "Cleaned yesterday";
    return `Cleaned ${diffInDays} days ago`;
  };

  const getIconForRoom = (roomName: string) => {
    switch (roomName.toLowerCase()) {
      case 'kitchen':
        return <Utensils className="h-5 w-5" />;
      default:
        return <Utensils className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Cleaning Schedule</h2>
        <Button 
          className="rounded-xl"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="mr-2" size={16} />
          Add Room
        </Button>
      </div>

      {/* Room Cards */}
      <div className="space-y-4">
        {rooms.map((room) => {
          const roomStatus = getRoomStatus(room);
          const nextAssignee = getNextAssignee(room);
          const lastCleanedBy = room.lastCleanedById === USERS.ALEX.id ? USERS.ALEX : USERS.MAYA;

          return (
            <Card key={room.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                      {getIconForRoom(room.name)}
                    </div>
                    <div>
                      <h3 className="font-medium">{room.name}</h3>
                      <div className="text-xs text-muted-foreground">
                        {formatLastCleaned(room.lastCleanedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${roomStatus.color}`}>
                      {roomStatus.status}
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <div 
                        className="w-4 h-4 rounded-full flex items-center justify-center text-xs text-white font-medium"
                        style={{ backgroundColor: nextAssignee.color }}
                      >
                        {nextAssignee.avatar}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {nextAssignee.displayName}'s turn
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Progress indicator */}
                <div className="space-y-2">
                  <Progress 
                    value={roomStatus.progress} 
                    className="h-2"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      Clean every {room.cleaningFrequencyDays} days
                    </span>
                    {roomStatus.progress >= 75 && (
                      <Button
                        size="sm"
                        onClick={() => markCleanedMutation.mutate(room.id)}
                        disabled={markCleanedMutation.isPending}
                        className="h-8"
                      >
                        <Check className="mr-1" size={12} />
                        Mark Clean
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Room Modal */}
      <AddRoomModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </div>
  );
}
