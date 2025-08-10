import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, TrendingUp, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SKUManager } from "@/components/SKUManager";
import { ProductionEntry } from "@/components/ProductionEntry";
import { ProductionHistory } from "@/components/ProductionHistory";

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

const Index = () => {
  const [activeTab, setActiveTab] = useState<"production" | "skus" | "history">("production");
  const [skus, setSKUs] = useState<SKU[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const { toast } = useToast();

  const addSKU = (sku: Omit<SKU, 'id' | 'createdAt'>) => {
    // Check for duplicate SKU codes
    if (skus.some(existingSKU => existingSKU.code.toLowerCase() === sku.code.toLowerCase())) {
      toast({
        title: "Error",
        description: "SKU code already exists",
        variant: "destructive",
      });
      return false;
    }

    const newSKU: SKU = {
      ...sku,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setSKUs(prev => [...prev, newSKU]);
    toast({
      title: "Success",
      description: "SKU added successfully",
    });
    return true;
  };

  const addBatch = (batch: Omit<Batch, 'id' | 'createdAt'>) => {
    const newBatch: Batch = {
      ...batch,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setBatches(prev => [...prev, newBatch]);
    toast({
      title: "Success",
      description: `Batch ${batch.batchNumber} added successfully`,
    });
  };

  const getNextBatchNumber = (skuId: string): string => {
    const skuBatches = batches.filter(batch => batch.skuId === skuId);
    if (skuBatches.length === 0) {
      return "001";
    }
    
    const lastBatch = skuBatches[skuBatches.length - 1];
    const lastNumber = parseInt(lastBatch.batchNumber);
    return String(lastNumber + 1).padStart(3, '0');
  };

  const getTotalProduction = () => {
    return batches.reduce((total, batch) => total + batch.pieces, 0);
  };

  const getTodayProduction = () => {
    const today = new Date();
    const todayBatches = batches.filter(batch => {
      const batchDate = new Date(batch.createdAt);
      return batchDate.toDateString() === today.toDateString();
    });
    return todayBatches.reduce((total, batch) => total + batch.pieces, 0);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Factory Production Tracker</h1>
              <p className="text-muted-foreground">Manage SKUs and track production batches</p>
            </div>
            <div className="flex gap-4">
              <Card className="px-4 py-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{getTotalProduction()}</div>
                  <div className="text-sm text-muted-foreground">Total Pieces</div>
                </div>
              </Card>
              <Card className="px-4 py-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">{getTodayProduction()}</div>
                  <div className="text-sm text-muted-foreground">Today's Production</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-6">
          <div className="flex gap-1">
            <Button
              variant={activeTab === "production" ? "default" : "ghost"}
              onClick={() => setActiveTab("production")}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Production Entry
            </Button>
            <Button
              variant={activeTab === "skus" ? "default" : "ghost"}
              onClick={() => setActiveTab("skus")}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Package className="w-4 h-4 mr-2" />
              SKU Management
            </Button>
            <Button
              variant={activeTab === "history" ? "default" : "ghost"}
              onClick={() => setActiveTab("history")}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <History className="w-4 h-4 mr-2" />
              Production History
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {activeTab === "production" && (
          <ProductionEntry
            skus={skus}
            onAddBatch={addBatch}
            getNextBatchNumber={getNextBatchNumber}
          />
        )}
        
        {activeTab === "skus" && (
          <SKUManager
            skus={skus}
            onAddSKU={addSKU}
          />
        )}
        
        {activeTab === "history" && (
          <ProductionHistory
            batches={batches}
            skus={skus}
          />
        )}
      </main>
    </div>
  );
};

export default Index;