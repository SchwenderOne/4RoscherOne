
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart, ScanLine } from "lucide-react";
import { USERS } from "@/lib/constants";
import { AddExpenseModal } from "@/components/forms/add-expense-modal";
import { ExpenseReceiptScanner } from "@/components/forms/expense-receipt-scanner";
import { NotificationService } from "@/services/notification-service";
import type { Transaction } from "@shared/schema";

interface FinancesProps {
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  isReceiptScannerOpen?: boolean;
  setIsReceiptScannerOpen?: (open: boolean) => void;
}

export default function Finances({ 
  isAddModalOpen, 
  setIsAddModalOpen,
  isReceiptScannerOpen: propIsReceiptScannerOpen,
  setIsReceiptScannerOpen: propSetIsReceiptScannerOpen
}: FinancesProps) {
  const [localReceiptScannerOpen, setLocalReceiptScannerOpen] = useState(false);
  const isReceiptScannerOpen = propIsReceiptScannerOpen ?? localReceiptScannerOpen;
  const setIsReceiptScannerOpen = propSetIsReceiptScannerOpen ?? setLocalReceiptScannerOpen;
  const [currentUserId] = useState(USERS.ALEX.id); // TODO: Get from auth context
  
  const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const calculateBalances = () => {
    let alexBalance = 0;
    let mayaBalance = 0;
    
    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      const splitCount = transaction.splitBetween.length;
      const perPersonAmount = amount / splitCount;
      
      if (transaction.paidById === USERS.ALEX.id) {
        alexBalance += amount - perPersonAmount;
      } else if (transaction.paidById === USERS.MAYA.id) {
        mayaBalance += amount - perPersonAmount;
      }
      
      transaction.splitBetween.forEach(userId => {
        if (userId === USERS.ALEX.id && transaction.paidById !== USERS.ALEX.id) {
          alexBalance -= perPersonAmount;
        } else if (userId === USERS.MAYA.id && transaction.paidById !== USERS.MAYA.id) {
          mayaBalance -= perPersonAmount;
        }
      });
    });

    return { alexBalance, mayaBalance };
  };

  const formatBalance = (balance: number) => {
    return balance >= 0 ? `€${balance.toFixed(2)}` : `-€${Math.abs(balance).toFixed(2)}`;
  };

  const getBalanceColor = (balance: number) => {
    return balance >= 0 ? "text-green-600" : "text-red-600";
  };

  const getBalanceStatus = (alexBalance: number) => {
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

  const { alexBalance, mayaBalance } = calculateBalances();

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Finances</h2>
        <Button 
          className="rounded-xl"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="mr-2" size={16} />
          Add Expense
        </Button>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${getBalanceColor(alexBalance)}`}>
              {formatBalance(alexBalance)}
            </div>
            <div className="text-sm text-muted-foreground">Alex's Balance</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${getBalanceColor(mayaBalance)}`}>
              {formatBalance(mayaBalance)}
            </div>
            <div className="text-sm text-muted-foreground">Maya's Balance</div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Summary */}
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-lg font-medium">
            {getBalanceStatus(alexBalance)}
          </div>
          {alexBalance !== 0 && (
            <div className="text-sm text-muted-foreground mt-1">
              Amount: {formatBalance(Math.abs(alexBalance))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No transactions yet
            </p>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => {
                const paidBy = transaction.paidById === USERS.ALEX.id ? USERS.ALEX : USERS.MAYA;
                const splitDetails = transaction.splitBetween.map(userId => 
                  userId === USERS.ALEX.id ? USERS.ALEX.displayName : USERS.MAYA.displayName
                ).join(" & ");

                return (
                  <div key={transaction.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                        <ShoppingCart className="text-green-600" size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{transaction.description}</div>
                        <div className="text-xs text-muted-foreground">
                          Split between {splitDetails}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-sm">
                        €{parseFloat(transaction.amount).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {paidBy.displayName} paid
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimeAgo(new Date(transaction.createdAt).toISOString())}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />

      {/* Receipt Scanner Modal */}
      <ExpenseReceiptScanner
        isOpen={isReceiptScannerOpen}
        onOpenChange={setIsReceiptScannerOpen}
        currentUserId={currentUserId}
      />
    </div>
  );
}
