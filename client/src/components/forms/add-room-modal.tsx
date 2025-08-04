import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Utensils, Bath, Bed, Sofa, Car, Home, Laptop, Coffee, Briefcase } from "lucide-react";

const addRoomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  icon: z.string().min(1, "Please select an icon"),
  cleaningFrequencyDays: z.number().min(1).max(30),
});

type AddRoomData = z.infer<typeof addRoomSchema>;

interface AddRoomModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROOM_ICONS = [
  { value: "utensils", label: "Kitchen", icon: Utensils },
  { value: "bath", label: "Bathroom", icon: Bath },
  { value: "bed", label: "Bedroom", icon: Bed },
  { value: "sofa", label: "Living Room", icon: Sofa },
  { value: "car", label: "Garage", icon: Car },
  { value: "home", label: "General Room", icon: Home },
  { value: "laptop", label: "Office", icon: Laptop },
  { value: "coffee", label: "Dining Room", icon: Coffee },
  { value: "briefcase", label: "Storage", icon: Briefcase },
];

const CLEANING_FREQUENCIES = [
  { value: 1, label: "Daily" },
  { value: 2, label: "Every 2 days" },
  { value: 3, label: "Every 3 days" },
  { value: 7, label: "Weekly" },
  { value: 10, label: "Every 10 days" },
  { value: 14, label: "Every 2 weeks" },
  { value: 21, label: "Every 3 weeks" },
  { value: 30, label: "Monthly" },
];

export function AddRoomModal({
  isOpen,
  onOpenChange,
}: AddRoomModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddRoomData>({
    resolver: zodResolver(addRoomSchema),
    defaultValues: {
      name: "",
      icon: "",
      cleaningFrequencyDays: 7,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AddRoomData) => {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          lastCleanedAt: new Date().toISOString(),
          lastCleanedById: "alex-id", // Current user
        }),
      });
      if (!response.ok) throw new Error("Failed to add room");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rooms"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Room added",
        description: "New room has been added to the cleaning schedule.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add room. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddRoomData) => {
    mutation.mutate(data);
  };

  const selectedIcon = form.watch("icon");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Kitchen, Bathroom, Bedroom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Type *</FormLabel>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {ROOM_ICONS.map((iconOption) => {
                        const IconComponent = iconOption.icon;
                        const isSelected = field.value === iconOption.value;
                        return (
                          <div
                            key={iconOption.value}
                            className={`cursor-pointer border-2 rounded-lg p-3 flex flex-col items-center gap-1 transition-colors ${
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-muted-foreground'
                            }`}
                            onClick={() => field.onChange(iconOption.value)}
                          >
                            <IconComponent className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className={`text-xs text-center ${isSelected ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                              {iconOption.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cleaningFrequencyDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cleaning Frequency *</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cleaning frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CLEANING_FREQUENCIES.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value.toString()}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Adding..." : "Add Room"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}