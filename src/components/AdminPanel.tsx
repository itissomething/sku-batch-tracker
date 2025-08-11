import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Download, Calendar, FileSpreadsheet, Lock } from "lucide-react";
import * as XLSX from "xlsx";

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

interface AdminPanelProps {
  batches: any[];
  skus: any[];
}

const ADMIN_PASSWORD = "admin123"; // You can change this

export const AdminPanel = ({ batches, skus }: AdminPanelProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSKU, setSelectedSKU] = useState<string>("all");
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { toast } = useToast();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setShowAuthDialog(false);
      setPassword("");
      toast({
        title: "Success",
        description: "Admin access granted",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid password",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword("");
  };

  const getFilteredBatches = () => {
    const targetDate = new Date(selectedDate);
    let filtered = batches.filter(batch => {
      const batchDate = new Date(batch.createdAt);
      return batchDate.toDateString() === targetDate.toDateString();
    });

    if (selectedSKU !== "all") {
      filtered = filtered.filter(batch => batch.skuId === selectedSKU);
    }

    return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const generateExcelReport = () => {
    const filteredBatches = getFilteredBatches();
    
    if (filteredBatches.length === 0) {
      toast({
        title: "No Data",
        description: "No production data found for the selected date and SKU",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for Excel
    const excelData: any[] = filteredBatches.map((batch, index) => ({
      "Sr. No.": index + 1,
      "Date": new Date(batch.createdAt).toLocaleDateString(),
      "Time": new Date(batch.createdAt).toLocaleTimeString(),
      "SKU Code": batch.skuCode,
      "Product Name": batch.skuName,
      "Batch Number": batch.batchNumber,
      "Pieces Produced": batch.pieces,
    }));

    // Add summary row
    const totalPieces = filteredBatches.reduce((sum, batch) => sum + batch.pieces, 0);
    excelData.push({
      "Sr. No.": "",
      "Date": "",
      "Time": "",
      "SKU Code": "",
      "Product Name": "TOTAL",
      "Batch Number": "",
      "Pieces Produced": totalPieces,
    });

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 8 },  // Sr. No.
      { wch: 12 }, // Date
      { wch: 12 }, // Time
      { wch: 15 }, // SKU Code
      { wch: 25 }, // Product Name
      { wch: 15 }, // Batch Number
      { wch: 18 }, // Pieces Produced
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Production Report");

    // Generate filename
    const dateStr = new Date(selectedDate).toLocaleDateString('en-GB').replace(/\//g, '-');
    const skuStr = selectedSKU === "all" ? "All-SKUs" : skus.find(s => s.id === selectedSKU)?.code || "Unknown";
    const filename = `Production-Report_${dateStr}_${skuStr}.xlsx`;

    // Download file
    XLSX.writeFile(workbook, filename);

    toast({
      title: "Export Successful",
      description: `Report downloaded as ${filename}`,
    });
  };

  const getDailySummary = () => {
    const filteredBatches = getFilteredBatches();
    const totalPieces = filteredBatches.reduce((sum, batch) => sum + batch.pieces, 0);
    const uniqueSKUs = new Set(filteredBatches.map(batch => batch.skuId)).size;
    
    return {
      totalBatches: filteredBatches.length,
      totalPieces,
      uniqueSKUs,
    };
  };

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Admin Panel</h2>
          <p className="text-muted-foreground mb-6">Access restricted to administrators only</p>
          
          <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
            <DialogTrigger asChild>
              <Button>
                <Lock className="w-4 h-4 mr-2" />
                Admin Login
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Admin Authentication
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Admin Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    autoFocus
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Login
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowAuthDialog(false);
                      setPassword("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  const summary = getDailySummary();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Admin Panel</h2>
          <p className="text-muted-foreground">Generate production reports and manage data</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <Shield className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Select Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Select SKU</Label>
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
          </div>
        </CardContent>
      </Card>

      {/* Daily Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{summary.totalBatches}</div>
              <div className="text-sm text-muted-foreground">Total Batches</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{summary.totalPieces.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Pieces</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{summary.uniqueSKUs}</div>
              <div className="text-sm text-muted-foreground">Unique SKUs</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Export Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Generate and download Excel report for the selected date and SKU.
            </p>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline">
                Date: {new Date(selectedDate).toLocaleDateString()}
              </Badge>
              <Badge variant="outline">
                SKU: {selectedSKU === "all" ? "All SKUs" : skus.find(s => s.id === selectedSKU)?.code || "Unknown"}
              </Badge>
              <Badge variant="outline">
                {summary.totalBatches} batches, {summary.totalPieces.toLocaleString()} pieces
              </Badge>
            </div>
            
            <Button 
              onClick={generateExcelReport}
              disabled={summary.totalBatches === 0}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download Excel Report
            </Button>
            
            {summary.totalBatches === 0 && (
              <p className="text-sm text-muted-foreground">
                No production data found for the selected filters.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};