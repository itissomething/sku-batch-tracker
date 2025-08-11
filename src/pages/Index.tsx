import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, TrendingUp, History, Shield, LogOut, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSKUs } from "@/hooks/useSKUs";
import { useBatches } from "@/hooks/useBatches";
import { SKUManager } from "@/components/SKUManager";
import { ProductionEntry } from "@/components/ProductionEntry";
import { ProductionHistory } from "@/components/ProductionHistory";
import { AdminPanel } from "@/components/AdminPanel";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"production" | "skus" | "history" | "admin">("production");
  const { user, loading: authLoading, signOut } = useAuth();
  const { skus, loading: skusLoading, addSKU } = useSKUs();
  const { batches, loading: batchesLoading, addBatch } = useBatches();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully"
    });
    navigate("/auth");
  };

  const getTotalProduction = () => {
    return batches.reduce((total, batch) => total + batch.pieces, 0);
  };

  const getTodayProduction = () => {
    const today = new Date();
    const todayBatches = batches.filter(batch => {
      const batchDate = new Date(batch.created_at);
      return batchDate.toDateString() === today.toDateString();
    });
    return todayBatches.reduce((total, batch) => total + batch.pieces, 0);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
            <div className="flex items-center gap-4">
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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
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
            <Button
              variant={activeTab === "admin" ? "default" : "ghost"}
              onClick={() => setActiveTab("admin")}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Shield className="w-4 h-4 mr-2" />
              Admin Panel
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {(skusLoading || batchesLoading) ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {activeTab === "production" && (
              <ProductionEntry
                skus={skus}
                onAddBatch={addBatch}
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
          </>
        )}
      </main>
    </div>
  );
};

export default Index;