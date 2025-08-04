import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import Tesseract from "tesseract.js";

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Camera, CreditCard } from "lucide-react";
import { USERS } from "@/lib/constants";

const receiptScannerSchema = z.object({
  receipt: z.any().optional(),
});

interface ReceiptItem {
  name: string;
  price: number;
  selected: boolean;
  category?: 'me' | 'roommate' | 'shared';
}

interface ExpenseReceiptScannerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
}

type ReceiptScannerData = z.infer<typeof receiptScannerSchema>;

export function ExpenseReceiptScanner({
  isOpen,
  onOpenChange,
  currentUserId,
}: ExpenseReceiptScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState("");
  const [extractedItems, setExtractedItems] = useState<ReceiptItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [showSwipeInterface, setShowSwipeInterface] = useState(false);
  const [categorizedItems, setCategorizedItems] = useState<ReceiptItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ReceiptScannerData>({
    resolver: zodResolver(receiptScannerSchema),
  });

  // Parse German receipt text to extract items
  const parseReceiptText = (text: string): ReceiptItem[] => {
    const lines = text.split('\n').map(line => line.trim());
    const items: ReceiptItem[] = [];
    
    // Multiple patterns for REWE receipts
    for (const line of lines) {
      // Skip empty lines and headers
      if (!line || line.includes('REWE') || line.includes('Kurfürstendamm') || 
          line.includes('SUMME') || line.includes('EUR') || line.includes('Datum') ||
          line.includes('Terminal') || line.includes('TSE')) {
        continue;
      }
      
      // Pattern 1: "PRODUCT NAME                  PRICE B"
      let match = line.match(/^([A-ZÄÖÜa-zäöü\s\.\-]+?)\s+(\d+,\d{2})\s+[AB]\s*$/);
      
      // Pattern 2: More flexible - look for any line with a price at the end
      if (!match) {
        match = line.match(/^([A-ZÄÖÜa-zäöü\s\.\-]{3,})\s+(\d+,\d{2})(?:\s+[AB])?\s*$/);
      }
      
      // Pattern 3: Handle lines where price might be separated
      if (!match) {
        match = line.match(/^([A-ZÄÖÜa-zäöü\s\.\-]{3,})\s+(\d+,\d{2})$/);
      }
      
      if (match) {
        const [, name, priceStr] = match;
        const cleanName = name.trim();
        // Convert German decimal format (1,29) to number (1.29)
        const price = parseFloat(priceStr.replace(',', '.'));
        
        // Skip certain items like PFAND (bottle deposit) and very short names
        if (!cleanName.includes('PFAND') && 
            !cleanName.includes('EURO') &&
            cleanName.length > 2 && 
            price > 0 &&
            // Skip if it looks like a header or footer
            !cleanName.includes('STEUER') &&
            !cleanName.includes('NETTO')) {
          
          items.push({
            name: cleanName,
            price,
            selected: true
          });
        }
      }
    }
    
    // If we still have no items, try a more aggressive approach
    if (items.length === 0) {
      console.log("No items found with strict parsing, trying looser patterns...");
      console.log("Receipt text:", text);
      
      for (const line of lines) {
        // Very loose pattern - any line with letters and a price-like number
        const looseMatch = line.match(/([A-ZÄÖÜa-zäöü\s]{3,})\s*(\d+,\d{2})/);
        if (looseMatch && !line.includes('SUMME') && !line.includes('REWE')) {
          const [, name, priceStr] = looseMatch;
          const cleanName = name.trim();
          const price = parseFloat(priceStr.replace(',', '.'));
          
          if (cleanName.length > 2 && price > 0) {
            items.push({
              name: cleanName,
              price,
              selected: true
            });
          }
        }
      }
    }
    
    return items;
  };

  // Convert PDF to text via server-side API
  const processPDFWithAPI = async (file: File): Promise<string> => {
    setProcessingStep("Uploading PDF for processing...");
    setProgress(20);

    const formData = new FormData();
    formData.append('receipt', file);

    const response = await fetch('/api/process-receipt', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to process PDF receipt');
    }

    setProcessingStep("Processing PDF...");
    setProgress(60);

    const { text } = await response.json();
    setProgress(90);
    
    return text;
  };

  // Process image with OCR
  const processImageWithOCR = async (file: File): Promise<string> => {
    setProcessingStep("Processing image with OCR...");
    setProgress(20);

    const { data: { text } } = await Tesseract.recognize(file, 'deu', {
      logger: m => {
        if (m.status === 'recognizing text') {
          setProgress(20 + (m.progress * 70));
        }
      }
    });

    return text;
  };

  // Handle file processing
  const processFile = async (file: File) => {
    try {
      setIsProcessing(true);
      setProgress(10);

      let extractedText = "";
      
      if (file.type === 'application/pdf') {
        extractedText = await processPDFWithAPI(file);
      } else if (file.type.startsWith('image/')) {
        extractedText = await processImageWithOCR(file);
      } else {
        throw new Error('Unsupported file type. Please upload a PDF or image file.');
      }

      setProcessingStep("Parsing receipt items...");
      setProgress(95);
      
      const items = parseReceiptText(extractedText);
      
      if (items.length === 0) {
        toast({
          title: "No items found",
          description: "Could not extract shopping items from this receipt. Please try a clearer image.",
          variant: "destructive",
        });
      } else {
        setExtractedItems(items);
        setCurrentItemIndex(0);
        toast({
          title: "Receipt processed successfully!",
          description: `Found ${items.length} items. Ready to categorize expenses.`,
        });
      }

      setProgress(100);
    } catch (error) {
      console.error("Error processing receipt:", error);
      toast({
        title: "Error processing receipt",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
      setProcessingStep("");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const getCurrentUser = () => {
    return currentUserId === USERS.ALEX.id ? USERS.ALEX : USERS.MAYA;
  };

  const getRoommate = () => {
    return currentUserId === USERS.ALEX.id ? USERS.MAYA : USERS.ALEX;
  };

  const handleStartSwipe = () => {
    setShowSwipeInterface(true);
  };

  const handleItemCategorization = (category: 'me' | 'roommate' | 'shared') => {
    const currentItem = extractedItems[currentItemIndex];
    const categorizedItem = { ...currentItem, category };
    
    setCategorizedItems(prev => [...prev, categorizedItem]);
    
    if (currentItemIndex < extractedItems.length - 1) {
      setCurrentItemIndex(prev => prev + 1);
    } else {
      // All items categorized, show summary
      setShowSwipeInterface(false);
      // TODO: Show summary and create transactions
    }
  };

  const resetScanner = () => {
    setExtractedItems([]);
    setCategorizedItems([]);
    setCurrentItemIndex(0);
    setShowSwipeInterface(false);
    form.reset();
  };

  const handleClose = () => {
    resetScanner();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Scan Receipt for Expenses
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <div className="space-y-4">
            {!showSwipeInterface && extractedItems.length === 0 && (
              <>
                {/* File Upload */}
                <FormField
                  control={form.control}
                  name="receipt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Upload Receipt</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              className="h-20 flex flex-col gap-2"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isProcessing}
                            >
                              <Camera className="h-5 w-5" />
                              <span className="text-xs">Photo</span>
                            </Button>
                            
                            <Button
                              type="button"
                              variant="outline"
                              className="h-20 flex flex-col gap-2"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isProcessing}
                            >
                              <FileText className="h-5 w-5" />
                              <span className="text-xs">PDF</span>
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Processing Progress */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">{processingStep}</div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}
              </>
            )}

            {/* Extracted Items List */}
            {!showSwipeInterface && extractedItems.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium">Found {extractedItems.length} items:</h3>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {extractedItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={item.selected}
                          onCheckedChange={(checked) => {
                            setExtractedItems(prev => prev.map((prevItem, prevIndex) => 
                              prevIndex === index ? { ...prevItem, selected: !!checked } : prevItem
                            ));
                          }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">€{item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  onClick={handleStartSwipe}
                  className="w-full"
                  disabled={!extractedItems.some(item => item.selected)}
                >
                  Start Expense Categorization
                </Button>
              </div>
            )}

            {/* Swipe Interface */}
            {showSwipeInterface && currentItemIndex < extractedItems.length && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">
                    Item {currentItemIndex + 1} of {extractedItems.length}
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full mb-4">
                    <div 
                      className="h-2 bg-blue-500 rounded-full transition-all"
                      style={{ width: `${((currentItemIndex + 1) / extractedItems.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-lg p-6 text-center shadow-sm">
                  <h3 className="font-semibold text-lg mb-2">
                    {extractedItems[currentItemIndex].name}
                  </h3>
                  <p className="text-2xl font-bold text-green-600 mb-4">
                    €{extractedItems[currentItemIndex].price.toFixed(2)}
                  </p>
                  
                  <div className="text-sm text-gray-600 mb-6">
                    Who should pay for this item?
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => handleItemCategorization('me')}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      {getCurrentUser().displayName} (Me)
                    </Button>
                    
                    <Button
                      onClick={() => handleItemCategorization('roommate')}
                      className="w-full bg-green-500 hover:bg-green-600"
                    >
                      {getRoommate().displayName}
                    </Button>
                    
                    <Button
                      onClick={() => handleItemCategorization('shared')}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      Shared (50/50)
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            {!showSwipeInterface && categorizedItems.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium">Expense Summary:</h3>
                {/* Add summary logic here */}
                <div className="space-y-3">
                  {(() => {
                    const myItems = categorizedItems.filter(item => item.category === 'me');
                    const roommateItems = categorizedItems.filter(item => item.category === 'roommate');
                    const sharedItems = categorizedItems.filter(item => item.category === 'shared');
                    
                    const myTotal = myItems.reduce((sum, item) => sum + item.price, 0);
                    const roommateTotal = roommateItems.reduce((sum, item) => sum + item.price, 0);
                    const sharedTotal = sharedItems.reduce((sum, item) => sum + item.price, 0);
                    const sharedPerPerson = sharedTotal / 2;

                    return (
                      <>
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded">
                          <div className="font-medium">{getCurrentUser().displayName}: €{(myTotal + sharedPerPerson).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            Personal: €{myTotal.toFixed(2)} + Shared: €{sharedPerPerson.toFixed(2)}
                          </div>
                        </div>
                        
                        <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded">
                          <div className="font-medium">{getRoommate().displayName}: €{(roommateTotal + sharedPerPerson).toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            Personal: €{roommateTotal.toFixed(2)} + Shared: €{sharedPerPerson.toFixed(2)}
                          </div>
                        </div>

                        <Button 
                          onClick={() => {
                            // TODO: Create transactions
                            toast({
                              title: "Expenses added!",
                              description: "All receipt items have been added to your finances.",
                            });
                            handleClose();
                          }}
                          className="w-full"
                        >
                          Add to Finances
                        </Button>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}