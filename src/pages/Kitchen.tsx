import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useOrders } from "@/hooks/useOrders";
import { Link } from "react-router-dom";
import { ChefHat, RefreshCcw, CheckCircle2, Clock, ArrowLeft, ClipboardList } from "lucide-react";

const statusLabel: Record<string, string> = {
  pending: "Chờ xử lý",
  preparing: "Đang pha",
  ready: "Sẵn sàng",
  served: "Đã phục vụ",
  paid: "Đã thanh toán",
  cancelled: "Đã hủy"
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  preparing: "default",
  ready: "outline",
  served: "outline",
  paid: "outline",
  cancelled: "destructive"
};

const Kitchen: React.FC = () => {
  const { orders, loading, updateOrderStatus, refetch } = useOrders();

  const formatTime = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const grouped = {
    pending: orders.filter(o => o.status === "pending"),
    preparing: orders.filter(o => o.status === "preparing"),
    ready: orders.filter(o => o.status === "ready"),
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border/50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="w-7 h-7 text-coffee-primary" />
            <h1 className="text-2xl font-bold text-foreground">Bếp pha chế</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Trang chính
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin">
                <ClipboardList className="w-4 h-4 mr-1" />
                Quản trị
              </Link>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => refetch()} disabled={loading}>
              <RefreshCcw className="w-4 h-4 mr-1" /> Làm mới
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Chờ xử lý</span>
              <Badge variant="secondary">{grouped.pending.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {grouped.pending.length === 0 && (
              <p className="text-sm text-muted-foreground">Không có đơn hàng</p>
            )}
            {grouped.pending.map(order => (
              <div key={order.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Bàn {order.table?.table_number || order.table_id}</div>
                  <Badge variant={statusVariant[order.status]}>{statusLabel[order.status]}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatTime(order.created_at)}
                </div>
                <Separator className="my-2" />
                <ul className="text-sm list-disc ml-4 space-y-1">
                  {(order.order_items || []).map(it => (
                    <li key={`${it.product_id}-${it.notes || ""}`}>x{it.quantity} {it.product?.name} {it.notes ? `- ${it.notes}` : ""}</li>
                  ))}
                </ul>
                <div className="flex justify-end gap-2 mt-3">
                  <Button size="sm" onClick={() => updateOrderStatus(order.id, "preparing")}>Bắt đầu pha</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Đang pha</span>
              <Badge>{grouped.preparing.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {grouped.preparing.length === 0 && (
              <p className="text-sm text-muted-foreground">Không có đơn hàng</p>
            )}
            {grouped.preparing.map(order => (
              <div key={order.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Bàn {order.table?.table_number || order.table_id}</div>
                  <Badge variant={statusVariant[order.status]}>{statusLabel[order.status]}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatTime(order.created_at)}
                </div>
                <Separator className="my-2" />
                <ul className="text-sm list-disc ml-4 space-y-1">
                  {(order.order_items || []).map(it => (
                    <li key={`${it.product_id}-${it.notes || ""}`}>x{it.quantity} {it.product?.name} {it.notes ? `- ${it.notes}` : ""}</li>
                  ))}
                </ul>
                <div className="flex justify-end gap-2 mt-3">
                  <Button variant="secondary" size="sm" onClick={() => updateOrderStatus(order.id, "ready")}>
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Hoàn tất
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Sẵn sàng</span>
              <Badge variant="outline">{grouped.ready.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {grouped.ready.length === 0 && (
              <p className="text-sm text-muted-foreground">Không có đơn hàng</p>
            )}
            {grouped.ready.map(order => (
              <div key={order.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">Bàn {order.table?.table_number || order.table_id}</div>
                  <Badge variant={statusVariant[order.status]}>{statusLabel[order.status]}</Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {formatTime(order.created_at)}
                </div>
                <Separator className="my-2" />
                <ul className="text-sm list-disc ml-4 space-y-1">
                  {(order.order_items || []).map(it => (
                    <li key={`${it.product_id}-${it.notes || ""}`}>x{it.quantity} {it.product?.name} {it.notes ? `- ${it.notes}` : ""}</li>
                  ))}
                </ul>
                <div className="flex justify-end gap-2 mt-3">
                  <Button size="sm" onClick={() => updateOrderStatus(order.id, "served")}>Đã phục vụ</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Kitchen;
