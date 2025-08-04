import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import Tesseract from "tesseract.js";
// PDF processing will be done server-side to avoid bundle size issues

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Loader2, Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ReceiptItem {
  name: string;
  price: number;
  selected: boolean;
}

const receiptScannerSchema = z.object({
  file: z.any().optional(),
});

type ReceiptScannerData = z.infer<typeof receiptScannerSchema>;

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
}

export function ReceiptScannerModal({
  isOpen,
  onOpenChange,
  listId,
}: ReceiptScannerModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scannedItems, setScannedItems] = useState<ReceiptItem[]>([]);
  const [processingStep, setProcessingStep] = useState("");

  const form = useForm<ReceiptScannerData>({
    resolver: zodResolver(receiptScannerSchema),
  });

  // Parse German receipt text to extract items
  const parseReceiptText = (text: string): ReceiptItem[] => {
    const lines = text.split('\n');
    const items: ReceiptItem[] = [];
    
    for (const line of lines) {
      // Look for lines with product names and prices
      // REWE format: "PRODUCT NAME                  PRICE B/A"
      const match = line.match(/^([A-Z\s\.\-]+?)\s+(\d+,\d{2})\s+[AB]\s*$/);
      if (match) {
        const [, name, priceStr] = match;
        const cleanName = name.trim();
        // Convert German decimal format (1,29) to number (1.29)
        const price = parseFloat(priceStr.replace(',', '.'));
        
        // Skip certain items like PFAND (bottle deposit)
        if (!cleanName.includes('PFAND') && cleanName.length > 2 && price > 0) {
          items.push({
            name: cleanName,
            price,
            selected: true
          });
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

  // Process image directly with OCR
  const processImageWithOCR = async (file: File): Promise<string> => {
    setProcessingStep("Reading text from image...");
    setProgress(20);

    const { data: { text } } = await Tesseract.recognize(file, 'deu', {
      logger: m => {
        if (m.status === 'recognizing text') {
          setProgress(20 + m.progress * 70);
        }
      }
    });
    
    return text;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);
    setScannedItems([]);

    try {
      setProcessingStep("Initializing OCR...");
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
      setProgress(90);

      const items = parseReceiptText(extractedText);
      
      if (items.length === 0) {
        toast({
          title: "No items found",
          description: "Could not extract shopping items from this receipt. Please try a clearer image.",
          variant: "destructive",
        });
      } else {
        setScannedItems(items);
        setProgress(100);
        setProcessingStep("Complete!");
        
        toast({
          title: "Receipt scanned successfully",
          description: `Found ${items.length} items. Select which ones to add to your shopping list.`,
        });
      }
    } catch (error) {
      console.error("OCR Error:", error);
      toast({
        title: "Error scanning receipt",
        description: error instanceof Error ? error.message : "Failed to process receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleItemSelection = (index: number) => {
    setScannedItems(prev => prev.map((item, i) => 
      i === index ? { ...item, selected: !item.selected } : item
    ));
  };

  const addSelectedItemsMutation = useMutation({
    mutationFn: async () => {
      const selectedItems = scannedItems.filter(item => item.selected);
      
      const promises = selectedItems.map(item =>
        fetch(`/api/shopping-lists/${listId}/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: item.name,
            cost: item.price.toFixed(2),
            assignedToId: null,
            isCompleted: false,
          }),
        })
      );

      const results = await Promise.all(promises);
      
      for (const result of results) {
        if (!result.ok) {
          throw new Error(`Failed to add item: ${result.statusText}`);
        }
      }
      
      return selectedItems.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["/api/shopping-lists", listId, "items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Items added",
        description: `Successfully added ${count} items to your shopping list.`,
      });
      setScannedItems([]);
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error adding items",
        description: "Failed to add some items. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddSelectedItems = () => {
    const selectedCount = scannedItems.filter(item => item.selected).length;
    if (selectedCount === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item to add to your shopping list.",
        variant: "destructive",
      });
      return;
    }
    
    addSelectedItemsMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scan Receipt</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full h-20 border-dashed"
            >
              <div className="flex flex-col items-center gap-2">
                {isProcessing ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Upload className="h-6 w-6" />
                )}
                <span>
                  {isProcessing ? "Processing..." : "Upload PDF or Image"}
                </span>
              </div>
            </Button>

            {/* Progress Display */}
            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  {processingStep}
                </p>
              </div>
            )}
          </div>

          {/* Scanned Items Section */}
          {scannedItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Scanned Items</h3>
                <Badge variant="outline">
                  {scannedItems.filter(item => item.selected).length} of {scannedItems.length} selected
                </Badge>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {scannedItems.map((item, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          checked={item.selected}
                          onCheckedChange={() => toggleItemSelection(index)}
                        />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            €{item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {item.selected ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setScannedItems(prev => prev.map(item => ({ ...item, selected: true })))}
                  disabled={addSelectedItemsMutation.isPending}
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setScannedItems(prev => prev.map(item => ({ ...item, selected: false })))}
                  disabled={addSelectedItemsMutation.isPending}
                >
                  Deselect All
                </Button>
                <Button
                  onClick={handleAddSelectedItems}
                  disabled={addSelectedItemsMutation.isPending}
                  className="ml-auto"
                >
                  {addSelectedItemsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    `Add Selected Items`
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}