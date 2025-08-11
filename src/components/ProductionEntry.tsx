import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Package, Hash, Clock } from "lucide-react";

interface SKU {
  id: string;
  code: string;
  name: string;
  description: string;
  createdAt: Date;
}

interface Batch {
  id: string;
  skuId: string;
  skuCode: string;
  skuName: string;
  batchNumber: string;
  pieces: number;
  createdAt: Date;
}

interface ProductionEntryProps {
  skus: any[];
  onAddBatch: (batch: { sku_id: string; pieces: number }) => Promise<boolean>;
}

export const ProductionEntry = ({ skus, onAddBatch }: ProductionEntryProps) => {
  const [selectedSKU, setSelectedSKU] = useState<SKU | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pieces, setPieces] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSKUSelect = (skuId: string) => {
    const sku = skus.find(s => s.id === skuId);
    if (sku) {
      setSelectedSKU(sku);
      setDialogOpen(true);
      setPieces("");
      setErrors({});
    }
  };

  const validateBatch = () => {
    const newErrors: Record<string, string> = {};
    
    const piecesNum = parseInt(pieces);
    if (!pieces.trim()) {
      newErrors.pieces = "Number of pieces is required";
    } else if (isNaN(piecesNum) || piecesNum <= 0) {
      newErrors.pieces = "Please enter a valid positive number";
    } else if (piecesNum > 10000) {
      newErrors.pieces = "Number of pieces cannot exceed 10,000 per batch";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSKU || !validateBatch()) {
      return;
    }

    const success = await onAddBatch({
      sku_id: selectedSKU.id,
      pieces: parseInt(pieces),
    });

    if (success) {
      // Reset form
      setPieces("");
      setDialogOpen(false);
      setSelectedSKU(null);
      setErrors({});
    }
  };

  const handlePiecesChange = (value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/[^0-9]/g, '');
    setPieces(numericValue);
    if (errors.pieces) {
      setErrors(prev => ({ ...prev, pieces: "" }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Production Entry</h2>
        <p className="text-muted-foreground">Select a SKU to record production batch</p>
      </div>

      {/* SKU Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Select SKU for Production
          </CardTitle>
        </CardHeader>
        <CardContent>
          {skus.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No SKUs available</p>
              <p className="text-sm text-muted-foreground">Add SKUs first to start recording production</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skus.map((sku) => (
                <Card
                  key={sku.id}
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary"
                  onClick={() => handleSKUSelect(sku.id)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="font-mono text-sm font-medium text-primary">
                        {sku.code}
                      </div>
                      <div className="font-medium">{sku.name}</div>
                      {sku.description && (
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {sku.description}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Hash className="w-3 h-3" />
                        Next Batch: Auto-generated
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch Entry Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Record Production Batch
            </DialogTitle>
          </DialogHeader>
          
          {selectedSKU && (
            <form onSubmit={handleSubmitBatch} className="space-y-4">
              {/* SKU Info */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="font-medium">SKU: {selectedSKU.code}</div>
                <div className="text-sm text-muted-foreground">{selectedSKU.name}</div>
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="w-4 h-4" />
                  <span>Batch Number: <span className="font-mono font-medium">Auto-generated</span></span>
                </div>
              </div>

              {/* Pieces Input */}
              <div className="space-y-2">
                <Label htmlFor="pieces">Number of Pieces *</Label>
                <Input
                  id="pieces"
                  value={pieces}
                  onChange={(e) => handlePiecesChange(e.target.value)}
                  placeholder="Enter number of pieces produced"
                  className={errors.pieces ? "border-destructive" : ""}
                  autoFocus
                />
                {errors.pieces && (
                  <p className="text-sm text-destructive">{errors.pieces}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Maximum 10,000 pieces per batch
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Record Batch
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setDialogOpen(false);
                    setSelectedSKU(null);
                    setPieces("");
                    setErrors({});
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};