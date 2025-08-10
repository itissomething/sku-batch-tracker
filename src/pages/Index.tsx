import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, TrendingUp, History, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SKUManager } from "@/components/SKUManager";
import { ProductionEntry } from "@/components/ProductionEntry";
import { ProductionHistory } from "@/components/ProductionHistory";
import { AdminPanel } from "@/components/AdminPanel";

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
  const [activeTab, setActiveTab] = useState<"production" | "skus" | "history" | "admin">("production");
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
    const today = new Date();
    const todayString = today.toDateString();
    
    // Filter batches for this SKU and today's date
    const todaySkuBatches = batches.filter(batch => {
      const batchDate = new Date(batch.createdAt);
      return batch.skuId === skuId && batchDate.toDateString() === todayString;
    });
    
    if (todaySkuBatches.length === 0) {
      return "001";
    }
    
    // Get the highest batch number for today
    const batchNumbers = todaySkuBatches.map(batch => parseInt(batch.batchNumber));
    const maxBatchNumber = Math.max(...batchNumbers);
    return String(maxBatchNumber + 1).padStart(3, '0');
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
        <div className="container mx-auto px-2 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-foreground">Factory Production Tracker</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Manage SKUs and track production batches</p>
            </div>
            <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
              <Card className="px-2 sm:px-4 py-2 flex-1 sm:flex-none">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-primary">{getTotalProduction()}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Total Pieces</div>
                </div>
              </Card>
              <Card className="px-2 sm:px-4 py-2 flex-1 sm:flex-none">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-accent">{getTodayProduction()}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">Today's Production</div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-border bg-card overflow-x-auto">
        <div className="container mx-auto px-2 sm:px-6">
          <div className="flex gap-1 min-w-max sm:min-w-0">
            <Button
              variant={activeTab === "production" ? "default" : "ghost"}
              onClick={() => setActiveTab("production")}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Production
            </Button>
            <Button
              variant={activeTab === "skus" ? "default" : "ghost"}
              onClick={() => setActiveTab("skus")}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap"
            >
              <Package className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              SKUs
            </Button>
            <Button
              variant={activeTab === "history" ? "default" : "ghost"}
              onClick={() => setActiveTab("history")}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap"
            >
              <History className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              History
            </Button>
            <Button
              variant={activeTab === "admin" ? "default" : "ghost"}
              onClick={() => setActiveTab("admin")}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap"
            >
              <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Admin
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-6 py-4 sm:py-8">
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
        
        {activeTab === "admin" && (
          <AdminPanel
            batches={batches}
            skus={skus}
          />
        )}
      </main>
    </div>
  );
};

export default Index;