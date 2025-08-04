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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const addPlantSchema = z.object({
  name: z.string().min(1, "Plant name is required"),
  location: z.string().min(1, "Location is required"),
  wateringFrequencyDays: z.number().min(1).max(30),
  imageUrl: z.string().optional(),
  notes: z.string().optional(),
});

type AddPlantData = z.infer<typeof addPlantSchema>;

interface AddPlantModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const WATERING_FREQUENCIES = [
  { value: 1, label: "Daily" },
  { value: 2, label: "Every 2 days" },
  { value: 3, label: "Every 3 days" },
  { value: 5, label: "Every 5 days" },
  { value: 7, label: "Weekly" },
  { value: 10, label: "Every 10 days" },
  { value: 14, label: "Every 2 weeks" },
  { value: 21, label: "Every 3 weeks" },
  { value: 30, label: "Monthly" },
];

const PLANT_IMAGE_PRESETS = [
  {
    name: "Spider Plant",
    url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
  },
  {
    name: "Monstera",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
  },
  {
    name: "Pothos", 
    url: "https://images.unsplash.com/photo-1509423350716-97f2360af2e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
  },
  {
    name: "Snake Plant",
    url: "https://images.unsplash.com/photo-1632207691143-643e2a9a9361?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
  },
  {
    name: "Fiddle Leaf Fig",
    url: "https://images.unsplash.com/photo-1521334884684-d80222895322?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200"
  }
];

export function AddPlantModal({
  isOpen,
  onOpenChange,
}: AddPlantModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddPlantData>({
    resolver: zodResolver(addPlantSchema),
    defaultValues: {
      name: "",
      location: "",
      wateringFrequencyDays: 7,
      imageUrl: "",
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AddPlantData) => {
      const response = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          lastWateredAt: new Date().toISOString(),
          lastWateredById: "alex-id", // Current user
        }),
      });
      if (!response.ok) throw new Error("Failed to add plant");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Plant added",
        description: "Your new plant has been added successfully.",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add plant. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddPlantData) => {
    mutation.mutate(data);
  };

  const selectedPreset = form.watch("imageUrl");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Plant</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plant Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Spider Plant, Monstera" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Living Room Window, Kitchen Counter" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wateringFrequencyDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Watering Frequency *</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))} 
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select watering frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {WATERING_FREQUENCIES.map((freq) => (
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

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plant Image</FormLabel>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {PLANT_IMAGE_PRESETS.map((preset) => (
                        <div
                          key={preset.url}
                          className={`cursor-pointer border-2 rounded-lg p-1 transition-colors ${
                            field.value === preset.url
                              ? 'border-primary'
                              : 'border-border hover:border-muted-foreground'
                          }`}
                          onClick={() => field.onChange(preset.url)}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-16 object-cover rounded"
                          />
                          <p className="text-xs text-center mt-1 truncate">{preset.name}</p>
                        </div>
                      ))}
                    </div>
                    <FormControl>
                      <Input
                        placeholder="Or enter custom image URL"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Care Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Bright indirect light, well-draining soil"
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
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
                {mutation.isPending ? "Adding..." : "Add Plant"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}