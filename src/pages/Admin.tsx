import React, { useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { useCurrentShop } from "@/hooks/useCurrentShop";

// Using the types from hooks
import type { Product } from "@/hooks/useProducts";
import type { Table as TableType } from "@/hooks/useTables";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { products, categories, loading: productsLoading } = useProducts();
  const { tables, loading: tablesLoading } = useTables();
  const { orders, loading: ordersLoading } = useOrders();
  const { shopName } = useCurrentShop();

  const { toast } = useToast();

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
                </h1>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Cửa hàng: {shopName}</span>
                <span>Hệ thống quản trị</span>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Admin;
