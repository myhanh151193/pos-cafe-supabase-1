import React, { useState } from "react";
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Table as TableComponent, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { 
  BarChart3, 
  Package, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Coffee, 
  Plus, 
  Edit, 
  Trash2,
  Home,
  Settings,
  FileText,
  Warehouse,
  Menu
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/useProducts";
import { useTables } from "@/hooks/useTables";
import { useOrders } from "@/hooks/useOrders";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useShop } from "@/contexts/ShopContext";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";

// Using the types from hooks
import type { Product } from "@/hooks/useProducts";
import type { Table as TableType } from "@/hooks/useTables";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { products, categories, loading: productsLoading, addProduct, updateProduct, deleteProduct, refetch } = useProducts({ includeUnavailable: true });
  const { tables, loading: tablesLoading } = useTables();
  const { orders, loading: ordersLoading } = useOrders();
  
  const { toast } = useToast();
  const { shops, currentShop, setCurrentShopById, loading: shopLoading } = useShop();

  // Orders UI state: filters, pagination
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>("all");
  const [orderSearch, setOrderSearch] = useState<string>("");
  const [orderDateFrom, setOrderDateFrom] = useState<string>("");
  const [orderDateTo, setOrderDateTo] = useState<string>("");
  const [orderPage, setOrderPage] = useState<number>(1);
  const [orderPageSize, setOrderPageSize] = useState<number>(10);

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    price: 0,
    category_id: "",
    description: "",
    image_url: "",
    image_file: null as File | null,
    image_preview: "",
    is_available: true,
  });
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };


  const getTableStatusInfo = (status: string) => {
    switch (status) {
      case "available":
        return { label: "Trống", color: "default" };
      case "occupied":
        return { label: "Có khách", color: "destructive" };
      case "reserved":
        return { label: "Đã đặt", color: "secondary" };
      case "cleaning":
        return { label: "Dọn dẹp", color: "outline" };
      default:
        return { label: "Không xác định", color: "outline" };
    }
  };


  // Calculate overview stats from real data
  const totalRevenue = orders
    .filter(order => {
      const today = new Date().toDateString();
      return new Date(order.created_at).toDateString() === today;
    })
    .reduce((sum, order) => sum + order.total_amount, 0);
  
  const totalOrders = orders.filter(order => {
    const today = new Date().toDateString();
    return new Date(order.created_at).toDateString() === today;
  }).length;
  
  const totalCustomers = new Set(orders
    .filter(order => {
      const today = new Date().toDateString();
      return new Date(order.created_at).toDateString() === today && order.customer_name;
    })
    .map(order => order.customer_name)
  ).size;
  
  const lowStockItems = 0; // Products don't have stock info in current schema

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu hôm nay</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              +12% so với hôm qua
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đơn hàng</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +8 đơn so với hôm qua
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khách hàng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              +5 khách so với hôm qua
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cảnh báo tồn kho</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Sản phẩm sắp hết hàng
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sản phẩm bán chạy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.slice(0, 3).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-coffee-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-coffee-primary">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.category?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPrice(product.price)}</p>
                    <p className="text-sm text-muted-foreground">Có sẵn</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trạng thái bàn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {tables.filter(t => t.status === "available").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Bàn trống</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {tables.filter(t => t.status === "occupied").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Có khách</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {tables.filter(t => t.status === "reserved").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Đã đặt</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {tables.filter(t => t.status === "cleaning").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Dọn dẹp</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Báo cáo doanh thu</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-coffee-primary">{formatPrice(totalRevenue)}</div>
                <p className="text-muted-foreground">Hôm nay</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-coffee-primary">{formatPrice(totalRevenue * 7)}</div>
                <p className="text-muted-foreground">Tuần này (ước tính)</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-coffee-primary">{formatPrice(totalRevenue * 30)}</div>
                <p className="text-muted-foreground">Tháng này (ước tính)</p>
              </div>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thống kê theo danh mục</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map((category) => {
              const categoryProducts = products.filter(p => p.category_id === category.id);
              const percentage = products.length > 0 ? (categoryProducts.length / products.length) * 100 : 0;
              return (
                <div key={category.id} className="flex items-center justify-between">
                  <span>{category.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-coffee-primary rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{Math.round(percentage)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Danh sách sản phẩm</h2>
        <Button
          variant="pos"
          onClick={() => {
            setEditingProduct(null);
            setForm({ name: "", price: 0, category_id: categories[0]?.id || "", description: "", image_url: "", is_available: true });
            setIsProductDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
        </Button>
      </div>

        <Card>
          <CardContent className="p-0">
            <TableComponent>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên sản phẩm</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Giá bán</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category?.name}</TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                    <TableCell>
                      <Badge variant={product.is_available ? "default" : "outline"}>
                        {product.is_available ? "Có sẵn" : "Hết hàng"}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingProduct(product);
                          setForm({
                            name: product.name,
                            price: product.price,
                            category_id: product.category_id || "",
                            description: product.description || "",
                            image_url: product.image_url || "",
                            is_available: product.is_available,
                          });
                          setIsProductDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setProductToDelete(product)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableComponent>
          </CardContent>
        </Card>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6">      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tổng sản phẩm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sản phẩm có sẵn</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {products.filter(p => p.is_available).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách sản phẩm</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <TableComponent>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Giá bán</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category?.name}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>
                    <Badge variant={product.is_available ? "default" : "outline"}>
                      {product.is_available ? "Có sẵn" : "Hết hàng"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableComponent>
        </CardContent>
      </Card>
    </div>
  );

  const renderTables = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý bàn</h2>
      </div>

      <Card>
        <CardContent className="p-0">
          <TableComponent>
            <TableHeader>
              <TableRow>
                <TableHead>Số bàn</TableHead>
                <TableHead>Số chỗ ngồi</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ghi chú</TableHead>
                
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.map((table) => {
                const statusInfo = getTableStatusInfo(table.status);
                return (
                  <TableRow key={table.id}>
                    <TableCell className="font-medium">Bàn {table.table_number}</TableCell>
                    <TableCell>{table.seats} chỗ</TableCell>
                    <TableCell>
                      <Badge variant={statusInfo.color as any}>
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{table.notes || "-"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </TableComponent>
        </CardContent>
      </Card>
    </div>
  );

  // Computed filtered + paginated orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (orderFilterStatus !== 'all' && order.status !== orderFilterStatus) return false;
      if (orderSearch) {
        const q = orderSearch.toLowerCase();
        if (!(order.order_number?.toLowerCase().includes(q) || (order.customer_name || '').toLowerCase().includes(q))) return false;
      }
      if (orderDateFrom) {
        const from = new Date(orderDateFrom).setHours(0,0,0,0);
        if (new Date(order.created_at).getTime() < from) return false;
      }
      if (orderDateTo) {
        const to = new Date(orderDateTo).setHours(23,59,59,999);
        if (new Date(order.created_at).getTime() > to) return false;
      }
      return true;
    });
  }, [orders, orderFilterStatus, orderSearch, orderDateFrom, orderDateTo]);

  const totalOrdersFiltered = filteredOrders.length;
  const totalOrderPages = Math.max(1, Math.ceil(totalOrdersFiltered / orderPageSize));
  const paginatedOrders = filteredOrders.slice((orderPage - 1) * orderPageSize, orderPage * orderPageSize);

  const exportCSV = () => {
    const headers = ['order_number','table_number','customer_name','total_amount','status','created_at'];
    const rows = filteredOrders.map(o => ([
      o.order_number,
      o.table?.table_number ?? '-',
      o.customer_name ?? '-',
      o.total_amount,
      o.status,
      o.created_at,
    ]));
    const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Đơn hàng</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => { setOrderPage(1); setOrderFilterStatus('all'); setOrderSearch(''); setOrderDateFrom(''); setOrderDateTo(''); }}>Reset</Button>
          <Button variant="pos" size="sm" onClick={exportCSV}>Xuất CSV</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="text-sm font-medium">Trạng thái</label>
              <select className="w-full mt-1 p-2 border rounded" value={orderFilterStatus} onChange={(e) => { setOrderFilterStatus(e.target.value); setOrderPage(1); }}>
                <option value="all">Tất cả</option>
                <option value="pending">pending</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Từ ngày</label>
              <Input type="date" value={orderDateFrom} onChange={(e) => { setOrderDateFrom(e.target.value); setOrderPage(1); }} />
            </div>
            <div>
              <label className="text-sm font-medium">Đến ngày</label>
              <Input type="date" value={orderDateTo} onChange={(e) => { setOrderDateTo(e.target.value); setOrderPage(1); }} />
            </div>
            <div>
              <label className="text-sm font-medium">Tìm</label>
              <Input placeholder="Mã đơn hoặc khách" value={orderSearch} onChange={(e) => { setOrderSearch(e.target.value); setOrderPage(1); }} />
            </div>
          </div>

          <TableComponent>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn</TableHead>
                <TableHead>Bàn</TableHead>
                <TableHead>Khách hàng</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>{order.table?.table_number ?? '-'}</TableCell>
                  <TableCell>{order.customer_name || '-'}</TableCell>
                  <TableCell>{formatPrice(order.total_amount)}</TableCell>
                  <TableCell>
                    <Badge variant={order.status === 'pending' ? 'secondary' : order.status === 'completed' ? 'default' : 'destructive'}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                  <TableCell className="space-x-2">
                    {order.status !== 'completed' && (
                      <Button
                        variant="pos"
                        size="sm"
                        onClick={async () => {
                          try {
                            await updateOrderStatus(order.id, 'completed');
                            toast({ title: 'Đã hoàn tất đơn' });
                          } catch (e) {
                            toast({ title: 'Lỗi', description: 'Không thể cập nhật trạng thái', variant: 'destructive' });
                          }
                        }}
                      >
                        Hoàn tất
                      </Button>
                    )}
                    {order.status !== 'cancelled' && (
                      <Button variant="destructive" size="sm" onClick={async () => {
                        try {
                          await cancelOrder(order.id);
                          toast({ title: 'Đã hủy đơn' });
                        } catch (e) {
                          toast({ title: 'Lỗi', description: 'Không thể hủy đơn', variant: 'destructive' });
                        }
                      }}>Hủy</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableComponent>

          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">Hiển thị {(orderPage-1)*orderPageSize + 1} - {Math.min(orderPage*orderPageSize, totalOrdersFiltered)} trên {totalOrdersFiltered} đơn</div>
            <div className="flex items-center space-x-2">
              <select value={orderPageSize} onChange={(e) => { setOrderPageSize(Number(e.target.value)); setOrderPage(1); }} className="p-1 border rounded">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
              <Button variant="outline" size="sm" onClick={() => setOrderPage(Math.max(1, orderPage-1))}>Prev</Button>
              <div className="px-2">{orderPage} / {totalOrderPages}</div>
              <Button variant="outline" size="sm" onClick={() => setOrderPage(Math.min(totalOrderPages, orderPage+1))}>Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "reports":
        return renderReports();
      case "products":
        return renderProducts();
      case "inventory":
        return renderInventory();
      case "tables":
        return renderTables();
      case "orders":
        return renderOrders();
      default:
        return renderOverview();
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-card border-b border-border/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold text-foreground">
                  {activeTab === "overview" && "Tổng quan"}
                  {activeTab === "reports" && "Báo cáo"}
                  {activeTab === "products" && "Quản lý sản phẩm"}
                  {activeTab === "inventory" && "Quản lý tồn kho"}
                  {activeTab === "tables" && "Quản lý bàn"}
                  {activeTab === "orders" && "Đơn hàng"}
                </h1>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Hệ thống quản trị</span>
                <div>
                  <Select value={currentShop?.id || ""} onValueChange={(v) => setCurrentShopById(v || null)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={shopLoading ? "Đang tải..." : "Chọn cửa hàng"} />
                    </SelectTrigger>
                    <SelectContent>
                      {shops.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </div>
      </div>
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tên sản phẩm</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Giá bán (VND)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
            </div>

            <div>
              <Label>Danh mục</Label>
              <Select value={form.category_id} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ảnh sản phẩm</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file) {
                    const preview = URL.createObjectURL(file);
                    setForm({ ...form, image_file: file, image_preview: preview });
                  } else {
                    setForm({ ...form, image_file: null, image_preview: "" });
                  }
                }}
              />

              {form.image_preview ? (
                <div className="mt-2">
                  <img src={form.image_preview} alt="preview" className="h-28 object-cover rounded" />
                </div>
              ) : form.image_url ? (
                <div className="mt-2">
                  <img src={form.image_url} alt="current" className="h-28 object-cover rounded" />
                </div>
              ) : null}
            </div>

            <div>
              <Label>Mô tả</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="is_available" checked={form.is_available} onCheckedChange={(v) => setForm({ ...form, is_available: Boolean(v) })} />
              <Label htmlFor="is_available">Có sẵn</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>Hủy</Button>
            <Button
              onClick={async () => {
                try {
                  // handle image upload if a file was selected
                  let imageUrl = form.image_url || null;
                  if (form.image_file) {
                    const file = form.image_file as File;
                    const ext = file.name.split('.').pop();
                    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
                    const path = `${filename}`;
                    const { error: uploadError } = await supabase.storage.from('products').upload(path, file);
                    if (uploadError) throw uploadError;
                    const { data } = supabase.storage.from('products').getPublicUrl(path);
                    imageUrl = (data as any)?.publicUrl || null;
                  }

                  const payload = {
                    name: form.name,
                    price: Number(form.price),
                    category_id: form.category_id || null,
                    description: form.description || null,
                    image_url: imageUrl,
                    is_available: form.is_available,
                  };

                  if (editingProduct) {
                    await updateProduct(editingProduct.id, payload);
                    toast({ title: "Đã cập nhật sản phẩm" });
                  } else {
                    await addProduct(payload as any);
                    toast({ title: "Đã thêm sản phẩm" });
                  }

                  setIsProductDialogOpen(false);
                  setEditingProduct(null);
                  // reset preview
                  setForm({ name: "", price: 0, category_id: categories[0]?.id || "", description: "", image_url: "", image_file: null, image_preview: "", is_available: true });
                  await refetch();
                } catch (e) {
                  console.error(e);
                  toast({ title: "Lỗi", description: "Không thể lưu sản phẩm", variant: "destructive" });
                }
              }}
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => { if (!open) setProductToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (productToDelete) {
                  try {
                    await deleteProduct(productToDelete.id);
                    toast({ title: "Đã xóa sản phẩm" });
                  } catch (e) {
                    toast({ title: "Lỗi", description: "Không thể xóa sản phẩm", variant: "destructive" });
                  } finally {
                    setProductToDelete(null);
                  }
                }
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </SidebarProvider>
  );
};

export default Admin;
