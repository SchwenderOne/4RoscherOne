import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, AlertTriangle, TrendingDown, Minus } from "lucide-react";
import { USERS } from "@/lib/constants";
import type { InventoryItem } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AddInventoryModal } from "@/components/modals/add-inventory-modal";

interface InventoryProps {
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export default function Inventory({ isAddModalOpen, setIsAddModalOpen }: InventoryProps) {
  const { data: items = [], isLoading } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: lowStockItems = [] } = useQuery<InventoryItem[]>({
    queryKey: ["/api/inventory/low-stock"],
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ id, currentStock }: { id: string; currentStock: number }) => {
      const response = await apiRequest(`/api/inventory/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ 
          currentStock,
          lastRestockedAt: new Date().toISOString(),
          lastRestockedBy: USERS.ALEX.id // TODO: Use current user
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
    },
  });

  const categories = [
    { id: "all", label: "All Items", icon: Package },
    { id: "bathroom", label: "Bathroom", icon: Package },
    { id: "kitchen", label: "Kitchen", icon: Package },
    { id: "cleaning", label: "Cleaning", icon: Package },
    { id: "personal", label: "Personal", icon: Package },
  ];

  const getItemsByCategory = (category: string) => {
    if (category === "all") return items;
    return items.filter(item => item.category === category);
  };

  const getStockStatus = (item: InventoryItem) => {
    const percentage = (item.currentStock / item.minStockLevel) * 100;
    if (item.currentStock === 0) {
      return { status: "Out of Stock", color: "text-red-600", variant: "destructive" as const, percentage: 0 };
    } else if (item.currentStock <= item.minStockLevel) {
      return { status: "Low Stock", color: "text-orange-600", variant: "secondary" as const, percentage };
    } else {
      return { status: "In Stock", color: "text-green-600", variant: "secondary" as const, percentage: Math.min(100, percentage) };
    }
  };

  const formatLastRestocked = (dateString: string | null) => {
    if (!dateString) return "Never restocked";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Restocked today";
    if (diffInDays === 1) return "Restocked yesterday";
    return `Restocked ${diffInDays} days ago`;
  };

  const adjustStock = (item: InventoryItem, change: number) => {
    const newStock = Math.max(0, item.currentStock + change);
    updateStockMutation.mutate({ id: item.id, currentStock: newStock });
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
        <h2 className="text-lg font-medium">Household Inventory</h2>
        <Button 
          className="rounded-xl"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="mr-2" size={16} />
          Add Item
        </Button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <AlertTriangle className="w-5 h-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-orange-700 dark:text-orange-300">
                    {item.currentStock} {item.unit} left
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            {getItemsByCategory(category.id).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No items in this category yet</p>
                </CardContent>
              </Card>
            ) : (
              getItemsByCategory(category.id).map(item => {
                const stockStatus = getStockStatus(item);
                const lastRestockedBy = item.lastRestockedBy === USERS.ALEX.id ? USERS.ALEX : USERS.MAYA;

                return (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">{item.name}</h3>
                            <div className="text-xs text-muted-foreground">
                              {formatLastRestocked(item.lastRestockedAt)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={stockStatus.variant} className={stockStatus.color}>
                            {stockStatus.status}
                          </Badge>
                          <div className="flex items-center space-x-1 mt-1">
                            <div 
                              className="w-4 h-4 rounded-full flex items-center justify-center text-xs text-white font-medium"
                              style={{ backgroundColor: lastRestockedBy.color }}
                            >
                              {lastRestockedBy.avatar}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              last restocked
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span>Current Stock</span>
                          <span className="font-medium">
                            {item.currentStock} / {item.minStockLevel} {item.unit}
                          </span>
                        </div>
                        
                        <Progress 
                          value={stockStatus.percentage} 
                          className="h-2"
                        />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => adjustStock(item, -1)}
                              disabled={item.currentStock === 0 || updateStockMutation.isPending}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => adjustStock(item, 1)}
                              disabled={updateStockMutation.isPending}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {item.currentStock <= item.minStockLevel && item.autoAddToShopping && (
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <TrendingDown className="h-3 w-3" />
                              <span>Auto-add to shopping</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        ))}
      </Tabs>

      <AddInventoryModal 
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </div>
  );
}