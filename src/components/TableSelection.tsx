import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Check, StickyNote, Edit3 } from "lucide-react";
import { TableNotesDialog } from "./TableNotesDialog";

interface DBTable {
  id: string;
  table_number: number;
  seats: number;
  status: "available" | "occupied" | "reserved" | "cleaning";
  notes?: string;
}

interface TableSelectionProps {
  tables: DBTable[];
  selectedTable: any;
  onTableSelect: (table: any) => void;
  onConfirmTable: () => void;
  confirmedOrders: {[tableId: string]: number};
  formatPrice: (price: number) => string;
  onUpdateTableNote: (tableId: string, note: string) => Promise<void>;
}


const getTableStatusColor = (status: string, hasConfirmedOrder: boolean = false) => {
  switch (status) {
    case "available":
      return "bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-800";
    case "occupied":
      return hasConfirmedOrder
        ? "bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-800"
        : "bg-red-100 border-red-300 text-red-800";
    case "reserved":
      return "bg-yellow-100 border-yellow-300 text-yellow-800 cursor-not-allowed opacity-60";
    default:
      return "bg-gray-100 border-gray-300 text-gray-800";
  }
};

const getStatusText = (status: string, hasConfirmedOrder: boolean = false) => {
  switch (status) {
    case "available":
      return "Trống";
    case "occupied":
      return hasConfirmedOrder ? "Đang phục vụ" : "Có khách";
    case "reserved":
      return "Đã đặt";
    default:
      return "";
  }
};

export function TableSelection({ tables, selectedTable, onTableSelect, onConfirmTable, confirmedOrders, formatPrice, onUpdateTableNote }: TableSelectionProps) {
  const [notesDialogTable, setNotesDialogTable] = useState<DBTable | null>(null);
  
  const handleOpenNotesDialog = (table: DBTable, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotesDialogTable(table);
  };

  const handleSaveNote = (note: string) => {
    if (notesDialogTable) {
      onUpdateTableNote(notesDialogTable.id, note);
    }
  };

  // Function to get dynamic table status based on orders
  const getDynamicTableStatus = (table: DBTable) => {
    if (confirmedOrders[table.id]) {
      return "occupied";
    }
    return table.status;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Chọn bàn</h2>
        <p className="text-muted-foreground">Chọn bàn để bắt đầu order</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-4">
        {tables.map((table) => {
          const dynamicStatus = getDynamicTableStatus(table);
          const hasConfirmedOrder = !!confirmedOrders[table.id];
          const isClickable = dynamicStatus === "available" || dynamicStatus === "occupied";
          
          return (
          <Card
            key={table.id}
            className={`transition-all ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'} border-2 ${
              selectedTable?.id === table.id
                ? "ring-2 ring-coffee-primary border-coffee-primary"
                : getTableStatusColor(dynamicStatus, hasConfirmedOrder)
            }`}
            onClick={() => isClickable && onTableSelect(table)}
          >
            <CardContent className="p-4 text-center relative">
              {/* Notes button for occupied/reserved tables */}
              {(dynamicStatus === "occupied" || dynamicStatus === "reserved") && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 w-6 h-6 p-0"
                  onClick={(e) => handleOpenNotesDialog(table, e)}
                >
                  {table.notes ? (
                    <StickyNote className="w-3 h-3 text-coffee-primary" />
                  ) : (
                    <Edit3 className="w-3 h-3 text-muted-foreground" />
                  )}
                </Button>
              )}
              
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/80 mx-auto mb-2">
                <span className="text-lg font-bold">
                  {table.table_number}
                </span>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Bàn {table.table_number}</h3>
                
                <div className="flex items-center justify-center space-x-1 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{table.seats} chỗ</span>
                </div>
                
                <Badge 
                  variant={dynamicStatus === "available" ? "default" : "secondary"}
                  className="text-xs"
                >
                  {getStatusText(dynamicStatus, hasConfirmedOrder)}
                </Badge>

                {confirmedOrders[table.id] && (
                  <div className="text-xs font-semibold text-coffee-primary mt-1">
                    {formatPrice(confirmedOrders[table.id])}
                  </div>
                )}
                
                {table.notes && (
                  <div className="text-xs text-muted-foreground mt-1 px-1 py-1 bg-muted/50 rounded text-center line-clamp-2">
                    {table.notes}
                  </div>
                )}
                
                {dynamicStatus === "occupied" && !table.notes && (
                  <div className="text-xs text-red-500 mt-1 font-medium">
                    ⚠️ Thiếu ghi chú
                  </div>
                )}
              </div>
              
              {selectedTable?.id === table.id && (
                <div className="mt-2 flex justify-center">
                  <Check className="w-5 h-5 text-coffee-primary" />
                </div>
              )}
            </CardContent>
          </Card>
          );
        })}
      </div>

      <div className="flex justify-center space-x-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-emerald-300"></div>
            <span>Trống</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-orange-300"></div>
            <span>Đang phục vụ</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-300"></div>
            <span>Có khách</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
            <span>Đã đặt</span>
          </div>
        </div>
      </div>

      {selectedTable && (
        <div className="flex justify-center">
          <Button
            variant="pos"
            size="lg"
            onClick={onConfirmTable}
            className="px-8"
          >
            <Check className="w-4 h-4 mr-2" />
            Xác nhận bàn {selectedTable.table_number}
          </Button>
        </div>
      )}

      {/* Table Notes Dialog */}
      <TableNotesDialog
        table={notesDialogTable}
        isOpen={!!notesDialogTable}
        onClose={() => setNotesDialogTable(null)}
        currentNote={notesDialogTable?.notes || ""}
        onSaveNote={handleSaveNote}
      />
    </div>
  );
}
