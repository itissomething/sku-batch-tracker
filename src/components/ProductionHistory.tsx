import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { History, Search, Calendar, Package, Hash, TrendingUp } from "lucide-react";

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

interface ProductionHistoryProps {
  batches: Batch[];
  skus: SKU[];
}

export const ProductionHistory = ({ batches, skus }: ProductionHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSKU, setSelectedSKU] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const filteredBatches = useMemo(() => {
    let filtered = [...batches];

    // Filter by search term (SKU code, name, or batch number)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(batch =>
        batch.skuCode.toLowerCase().includes(search) ||
        batch.skuName.toLowerCase().includes(search) ||
        batch.batchNumber.toLowerCase().includes(search)
      );
    }

    // Filter by SKU
    if (selectedSKU !== "all") {
      filtered = filtered.filter(batch => batch.skuId === selectedSKU);
    }

    // Filter by date
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case "today":
          filtered = filtered.filter(batch => {
            const batchDate = new Date(batch.createdAt);
            return batchDate.toDateString() === now.toDateString();
          });
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(batch => new Date(batch.createdAt) >= filterDate);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(batch => new Date(batch.createdAt) >= filterDate);
          break;
      }
    }

    // Sort by creation date (newest first)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [batches, searchTerm, selectedSKU, dateFilter]);

  const getTotalPieces = () => {
    return filteredBatches.reduce((total, batch) => total + batch.pieces, 0);
  };

  const getUniqueSkuCount = () => {
    const uniqueSkus = new Set(filteredBatches.map(batch => batch.skuId));
    return uniqueSkus.size;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Production History</h2>
        <p className="text-muted-foreground">View and filter production batch records</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{filteredBatches.length}</div>
                <div className="text-sm text-muted-foreground">Total Batches</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold">{getTotalPieces().toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Pieces</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Hash className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{getUniqueSkuCount()}</div>
                <div className="text-sm text-muted-foreground">Unique SKUs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search by SKU code, name, or batch number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">SKU</label>
              <Select value={selectedSKU} onValueChange={setSelectedSKU}>
                <SelectTrigger>
                  <SelectValue placeholder="Select SKU" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All SKUs</SelectItem>
                  {skus.map((sku) => (
                    <SelectItem key={sku.id} value={sku.id}>
                      {sku.code} - {sku.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Batch Records ({filteredBatches.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBatches.length === 0 ? (
            <div className="text-center py-8">
              {batches.length === 0 ? (
                <>
                  <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No production batches recorded yet</p>
                  <p className="text-sm text-muted-foreground">Start recording production to see history here</p>
                </>
              ) : (
                <>
                  <Search className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No batches match your filters</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search criteria</p>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Batch #</TableHead>
                    <TableHead className="text-right">Pieces</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {new Date(batch.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(batch.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {batch.skuCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {batch.skuName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3" />
                          <span className="font-mono">{batch.batchNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {batch.pieces.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};