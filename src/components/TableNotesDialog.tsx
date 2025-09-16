import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StickyNote, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Table {
  id: string;
  table_number: number;
  seats: number;
  status: "available" | "occupied" | "reserved" | "cleaning";
  notes?: string;
}

interface TableNotesDialogProps {
  table: Table | null;
  isOpen: boolean;
  onClose: () => void;
  currentNote: string;
  onSaveNote: (note: string) => void;
}

export function TableNotesDialog({ 
  table, 
  isOpen, 
  onClose, 
  currentNote, 
  onSaveNote 
}: TableNotesDialogProps) {
  const [note, setNote] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (table) {
      setNote(table.notes || currentNote || "");
    }
  }, [table, currentNote]);

  const handleSave = () => {
    onSaveNote(note);
    toast({
      title: "Đã lưu ghi chú",
      description: `Ghi chú cho bàn ${table?.table_number} đã được cập nhật`,
    });
    onClose();
  };

  const handleClear = () => {
    setNote("");
  };

  if (!table) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <StickyNote className="w-5 h-5 text-coffee-primary" />
            <span>Ghi chú bàn {table.table_number}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="table-note">Ghi chú về bàn</Label>
            <Textarea
              id="table-note"
              placeholder="Nhập ghi chú về khách hàng, đặc biệt, yêu cầu..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Ví dụ: Khách VIP, đặt bàn sinh nhật, yêu cầu không hành, dị ứng hải sản...
            </p>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
              >
                <X className="w-4 h-4 mr-1" />
                Xóa
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button variant="pos" onClick={handleSave}>
                <Save className="w-4 h-4 mr-1" />
                Lưu ghi chú
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}