import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, Merge, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DBTable {
  id: string;
  table_number: number;
  seats: number;
  status: "available" | "occupied" | "reserved" | "cleaning";
  notes?: string | null;
}

interface CartItemType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: { name: string; price: number };
  image: string;
  toppings?: { [key: string]: number };
  toppingsNames?: string[];
}

interface TableManagerProps {
  selectedTable: Table | null;
  tableCartItems: {[tableId: string]: CartItemType[]};
  setTableCartItems: React.Dispatch<React.SetStateAction<{[tableId: string]: CartItemType[]}>>;
  confirmedOrders: {[tableId: string]: number};
  setConfirmedOrders: React.Dispatch<React.SetStateAction<{[tableId: string]: number}>>;
  formatPrice: (price: number) => string;
  tableNotes: {[tableId: string]: string};
  onTableSwitch?: (newTable: Table) => void;
}

const tables: Table[] = [
  { id: "t1", number: 1, seats: 2, status: "available" },
  { id: "t2", number: 2, seats: 4, status: "available" },
  { id: "t3", number: 3, seats: 2, status: "occupied", notes: "Khách VIP - Đang dùng bữa" },
  { id: "t4", number: 4, seats: 6, status: "available" },
  { id: "t5", number: 5, seats: 4, status: "reserved", notes: "Đặt bàn 19:00 - Gia đình Nguyễn" },
  { id: "t6", number: 6, seats: 8, status: "available" },
  { id: "t7", number: 7, seats: 2, status: "available" },
  { id: "t8", number: 8, seats: 4, status: "available" },
  { id: "t9", number: 9, seats: 6, status: "available" },
  { id: "t10", number: 10, seats: 2, status: "occupied" },
  { id: "t11", number: 11, seats: 4, status: "available" },
  { id: "t12", number: 12, seats: 8, status: "available" },
];

export function TableManager({ 
  selectedTable, 
  tableCartItems, 
  setTableCartItems, 
  confirmedOrders, 
  setConfirmedOrders, 
  formatPrice,
  tableNotes,
  onTableSwitch
}: TableManagerProps) {
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [selectedTargetTable, setSelectedTargetTable] = useState<DBTable | null>(null);
  const { toast } = useToast();

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-800";
      case "occupied":
        return "bg-red-100 hover:bg-red-200 border-red-300 text-red-800";
      case "reserved":
        return "bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Trống";
      case "occupied":
        return "Có khách";
      case "reserved":
        return "Đã đặt";
      default:
        return "";
    }
  };

  const handleSwitchTable = () => {
    if (!selectedTable || !selectedTargetTable) return;
    
    const currentTableItems = tableCartItems[selectedTable.id] || [];
    if (currentTableItems.length === 0) {
      toast({
        title: "Không có đơn hàng để chuyển",
        description: "Bàn hiện tại không có sản phẩm nào",
        variant: "destructive"
      });
      return;
    }

    // Move items from current table to target table
    setTableCartItems(prev => {
      const newState = { ...prev };
      
      // Add current table items to target table
      const targetTableItems = newState[selectedTargetTable.id] || [];
      const mergedItems = [...targetTableItems];
      
      currentTableItems.forEach(currentItem => {
        const existingIndex = mergedItems.findIndex(item => item.id === currentItem.id);
        if (existingIndex >= 0) {
          mergedItems[existingIndex].quantity += currentItem.quantity;
        } else {
          mergedItems.push(currentItem);
        }
      });
      
      newState[selectedTargetTable.id] = mergedItems;
      delete newState[selectedTable.id]; // Remove from current table
      
      return newState;
    });

    // Move confirmed order if exists
    if (confirmedOrders[selectedTable.id]) {
      setConfirmedOrders(prev => {
        const newState = { ...prev };
        const currentOrder = newState[selectedTable.id] || 0;
        const targetOrder = newState[selectedTargetTable.id] || 0;
        
        newState[selectedTargetTable.id] = currentOrder + targetOrder;
        delete newState[selectedTable.id];
        
        return newState;
      });
    }

    toast({
      title: "Đã chuyển bàn thành công!",
      description: `Chuyển từ bàn ${selectedTable.number} sang bàn ${selectedTargetTable.number}`,
    });
    
    // Switch to the new table
    if (onTableSwitch) {
      onTableSwitch(selectedTargetTable);
    }
    
    setShowSwitchDialog(false);
    setSelectedTargetTable(null);
  };

  const handleMergeTable = () => {
    if (!selectedTable || !selectedTargetTable) return;
    
    const currentTableItems = tableCartItems[selectedTable.id] || [];
    if (currentTableItems.length === 0) {
      toast({
        title: "Không có đơn hàng để gộp",
        description: "Bàn hiện tại không có sản phẩm nào",
        variant: "destructive"
      });
      return;
    }

    // Merge items from current table to target table and clear current table
    setTableCartItems(prev => {
      const newState = { ...prev };
      const targetTableItems = newState[selectedTargetTable.id] || [];
      const mergedItems = [...targetTableItems];
      
      currentTableItems.forEach(currentItem => {
        const existingIndex = mergedItems.findIndex(item => item.id === currentItem.id);
        if (existingIndex >= 0) {
          mergedItems[existingIndex].quantity += currentItem.quantity;
        } else {
          mergedItems.push(currentItem);
        }
      });
      
      newState[selectedTargetTable.id] = mergedItems;
      delete newState[selectedTable.id]; // Clear source table after merge
      
      return newState;
    });

    // Merge confirmed orders and clear source
    if (confirmedOrders[selectedTable.id]) {
      setConfirmedOrders(prev => {
        const newState = { ...prev };
        const currentOrder = newState[selectedTable.id] || 0;
        const targetOrder = newState[selectedTargetTable.id] || 0;
        
        newState[selectedTargetTable.id] = currentOrder + targetOrder;
        delete newState[selectedTable.id]; // Clear source table order
        
        return newState;
      });
    }

    toast({
      title: "Đã gộp bàn thành công!",
      description: `Gộp bàn ${selectedTable.number} vào bàn ${selectedTargetTable.number}`,
    });
    
    setShowMergeDialog(false);
    setSelectedTargetTable(null);
  };

  const availableTables = tables.filter(table => 
    table.id !== selectedTable?.id
  );

  const currentTableItems = selectedTable ? (tableCartItems[selectedTable.id] || []) : [];
  const hasItems = currentTableItems.length > 0;

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSwitchDialog(true)}
          disabled={!hasItems}
          className="flex-1"
        >
          <ArrowRightLeft className="w-4 h-4 mr-1" />
          Đổi bàn
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMergeDialog(true)}
          disabled={!hasItems}
          className="flex-1"
        >
          <Merge className="w-4 h-4 mr-1" />
          Gộp bàn
        </Button>
      </div>

      {/* Switch Table Dialog */}
      <Dialog open={showSwitchDialog} onOpenChange={setShowSwitchDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chuyển bàn {selectedTable?.number}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Chọn bàn đích để chuyển toàn bộ đơn hàng từ bàn {selectedTable?.number}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableTables.map((table) => (
                <Card
                  key={table.id}
                  className={`cursor-pointer border-2 transition-all ${
                    selectedTargetTable?.id === table.id
                      ? "ring-2 ring-coffee-primary border-coffee-primary"
                      : getTableStatusColor(table.status)
                  }`}
                  onClick={() => setSelectedTargetTable(table)}
                >
                  <CardContent className="p-3 text-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 mx-auto mb-2">
                      <span className="font-bold">{table.table_number}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm">Bàn {table.table_number}</h4>
                      <div className="flex items-center justify-center space-x-1 text-xs">
                        <Users className="w-3 h-3" />
                        <span>{table.seats}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {getStatusText(table.status)}
                      </Badge>
                      {confirmedOrders[table.id] && (
                        <div className="text-xs font-semibold text-coffee-primary">
                          {formatPrice(confirmedOrders[table.id])}
                        </div>
                      )}
                      {(table.notes || tableNotes[table.id]) && (
                        <div className="text-xs text-muted-foreground mt-1 px-1 py-1 bg-muted/50 rounded text-center line-clamp-2">
                          {table.notes || tableNotes[table.id]}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowSwitchDialog(false)}>
                Hủy
              </Button>
              <Button 
                onClick={handleSwitchTable}
                disabled={!selectedTargetTable}
                variant="pos"
              >
                Xác nhận chuyển bàn
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Merge Table Dialog */}
      <Dialog open={showMergeDialog} onOpenChange={setShowMergeDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gộp bàn {selectedTable?.number}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Chọn bàn đích để gộp đơn hàng từ bàn {selectedTable?.number} vào
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableTables.map((table) => (
                <Card
                  key={table.id}
                  className={`cursor-pointer border-2 transition-all ${
                    selectedTargetTable?.id === table.id
                      ? "ring-2 ring-coffee-primary border-coffee-primary"
                      : getTableStatusColor(table.status)
                  }`}
                  onClick={() => setSelectedTargetTable(table)}
                >
                  <CardContent className="p-3 text-center">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 mx-auto mb-2">
                      <span className="font-bold">{table.table_number}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm">Bàn {table.table_number}</h4>
                      <div className="flex items-center justify-center space-x-1 text-xs">
                        <Users className="w-3 h-3" />
                        <span>{table.seats}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {getStatusText(table.status)}
                      </Badge>
                      {confirmedOrders[table.id] && (
                        <div className="text-xs font-semibold text-coffee-primary">
                          {formatPrice(confirmedOrders[table.id])}
                        </div>
                      )}
                      {(table.notes || tableNotes[table.id]) && (
                        <div className="text-xs text-muted-foreground mt-1 px-1 py-1 bg-muted/50 rounded text-center line-clamp-2">
                          {table.notes || tableNotes[table.id]}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowMergeDialog(false)}>
                Hủy
              </Button>
              <Button 
                onClick={handleMergeTable}
                disabled={!selectedTargetTable}
                variant="pos"
              >
                Xác nhận gộp bàn
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
