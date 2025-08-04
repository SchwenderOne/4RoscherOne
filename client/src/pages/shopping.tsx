import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { USERS } from "@/lib/constants";
import type { ShoppingItem, LongTermPurchase } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function Shopping() {
  const queryClient = useQueryClient();

  const { data: activeList } = useQuery({
    queryKey: ["/api/shopping-lists/active"],
  });

  const { data: shoppingItems = [], isLoading: itemsLoading } = useQuery<ShoppingItem[]>({
    queryKey: ["/api/shopping-lists", activeList?.id, "items"],
    enabled: !!activeList?.id,
  });

  const { data: longTermPurchases = [] } = useQuery<LongTermPurchase[]>({
    queryKey: ["/api/long-term-purchases"],
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ShoppingItem> }) => {
      const response = await apiRequest("PATCH", `/api/shopping-items/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-lists"] });
    },
  });

  const handleItemToggle = (item: ShoppingItem) => {
    updateItemMutation.mutate({
      id: item.id,
      updates: { isCompleted: !item.isCompleted }
    });
  };

  const getUserById = (id: string | null) => {
    if (!id) return null;
    return id === USERS.ALEX.id ? USERS.ALEX : USERS.MAYA;
  };

  const calculateTotal = (items: ShoppingItem[]) => {
    return items.reduce((total, item) => {
      return total + (item.cost ? parseFloat(item.cost) : 0);
    }, 0);
  };

  if (itemsLoading) {
    return (
      <div className="p-4 space-y-6">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-32 bg-muted rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Shopping Lists</h2>
        <Button className="rounded-xl">
          <Plus className="mr-2" size={16} />
          Add Item
        </Button>
      </div>

      {/* Current Shopping List */}
      {activeList && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{activeList.name}</CardTitle>
              <Badge variant="secondary">
                €{calculateTotal(shoppingItems).toFixed(2)} total
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {shoppingItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No items in this list yet
              </p>
            ) : (
              shoppingItems.map((item) => {
                const assignedUser = getUserById(item.assignedToId);
                return (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={item.isCompleted}
                        onCheckedChange={() => handleItemToggle(item)}
                        disabled={updateItemMutation.isPending}
                      />
                      <span 
                        className={`text-sm ${item.isCompleted ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.cost && (
                        <span className="text-xs text-muted-foreground">
                          €{parseFloat(item.cost).toFixed(2)}
                        </span>
                      )}
                      {assignedUser && (
                        <div 
                          className="w-4 h-4 rounded-full flex items-center justify-center text-xs text-white font-medium"
                          style={{ backgroundColor: assignedUser.color }}
                        >
                          {assignedUser.avatar}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}

      {/* Long-term Purchases */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Long-term Purchases</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {longTermPurchases.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No long-term purchases planned
            </p>
          ) : (
            longTermPurchases.map((purchase) => (
              <div key={purchase.id} className="border border-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{purchase.name}</span>
                  <span className="text-sm text-orange-500 font-medium">
                    €{parseFloat(purchase.totalCost).toFixed(2)}
                  </span>
                </div>
                {purchase.neededBy && (
                  <div className="text-xs text-muted-foreground mb-2">
                    Needed by: {new Date(purchase.neededBy).toLocaleDateString()}
                  </div>
                )}
                <div className="flex space-x-2">
                  <Badge 
                    variant="outline"
                    className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200"
                  >
                    Alex: €{parseFloat(purchase.alexShare).toFixed(2)}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
                  >
                    Maya: €{parseFloat(purchase.mayaShare).toFixed(2)}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
