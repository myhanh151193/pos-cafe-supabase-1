import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Table as TableComponent, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
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
  const { products, categories, loading: productsLoading, refetch: refetchProducts } = useProducts();
  const { tables, loading: tablesLoading, refetch: refetchTables } = useTables();
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

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredProducts = products.filter(p => {
    const byName = p.name.toLowerCase().includes(search.toLowerCase());
    const byCat = categoryFilter === 'all' || p.category_id === categoryFilter;
    return byName && byCat;
  });
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const pageProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const exportCSV = () => {
    const header = ['Tên', 'Danh mục', 'Giá', 'Mô tả', 'Trạng thái'];
    const rows = filteredProducts.map(p => [
      p.name,
      p.category?.name || '',
      String(p.price),
      p.description || '',
      p.is_available ? 'Có sẵn' : 'Hết hàng',
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${(v || '').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const [openAdd, setOpenAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState<string>("");
  const [newCategoryId, setNewCategoryId] = useState<string>("");
  const [newDesc, setNewDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState<string>("");
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState<string>("");
  const [editCategoryId, setEditCategoryId] = useState<string>("");
  const [editDesc, setEditDesc] = useState("");
  const [editAvailable, setEditAvailable] = useState<boolean>(true);
  const [savingEdit, setSavingEdit] = useState(false);

  const addProduct = async () => {
    try {
      if (!newName || !newPrice || !newCategoryId) {
        toast({ title: 'Thiếu thông tin', description: 'Vui lòng nhập tên, giá và danh mục', variant: 'destructive' });
        return;
      }
      setSaving(true);
      const { error } = await supabase.from('products').insert({
        name: newName,
        price: Number(newPrice),
        category_id: newCategoryId,
        description: newDesc || null,
        is_available: true,
      });
      if (error) throw error;
      setOpenAdd(false);
      setNewName(""); setNewPrice(""); setNewCategoryId(""); setNewDesc("");
      await refetchProducts();
      toast({ title: 'Đã thêm sản phẩm' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Không thể thêm sản phẩm';
      toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (p: Product) => {
    setEditId(p.id);
    setEditName(p.name);
    setEditPrice(String(p.price));
    setEditCategoryId(p.category_id);
    setEditDesc(p.description || "");
    setEditAvailable(!!p.is_available);
    setOpenEdit(true);
  };

  const updateProduct = async () => {
    try {
      if (!editId || !editName || !editPrice || !editCategoryId) {
        toast({ title: 'Thiếu thông tin', description: 'Vui lòng nhập tên, giá và danh mục', variant: 'destructive' });
        return;
      }
      setSavingEdit(true);
      const { error } = await supabase.from('products').update({
        name: editName,
        price: Number(editPrice),
        category_id: editCategoryId,
        description: editDesc || null,
        is_available: editAvailable,
        updated_at: new Date().toISOString(),
      }).eq('id', editId);
      if (error) throw error;
      setOpenEdit(false);
      await refetchProducts();
      toast({ title: 'Đã cập nhật sản phẩm' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Không thể cập nhật sản phẩm';
      toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const ok = window.confirm('Xóa sản phẩm này?');
      if (!ok) return;
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      await refetchProducts();
      toast({ title: 'Đã xóa sản phẩm' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Không thể xóa sản phẩm';
      toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
    }
  };

  const renderProducts = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-2xl font-bold">Danh sách sản phẩm</h2>
        <div className="flex gap-2">
          <Input placeholder="Tìm theo tên..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="h-8 w-48" />
          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
            <SelectTrigger className="h-8 w-48">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCSV}>Xuất CSV</Button>
          <Button size="sm" onClick={() => setOpenAdd(true)}>
            <Plus className="w-4 h-4 mr-1" /> Thêm sản phẩm
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <TableComponent>
            <TableHeader>
              <TableRow>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Giá bán</TableHead>
                <TableHead className="hidden md:table-cell">Mô tả</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category?.name}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell className="max-w-xs truncate hidden md:table-cell">{product.description}</TableCell>
                  <TableCell>
                    <Badge variant={product.is_available ? 'default' : 'outline'}>
                      {product.is_available ? 'Có sẵn' : 'Hết hàng'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => startEdit(product)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => deleteProduct(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pageProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Không có sản phẩm</TableCell>
                </TableRow>
              )}
            </TableBody>
          </TableComponent>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm">
        <span>Tổng: {filteredProducts.length} sản phẩm</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page<=1}>Trước</Button>
          <span>Trang {page}/{totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page>=totalPages}>Sau</Button>
        </div>
      </div>

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm sản phẩm</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Tên</Label>
              <Input value={newName} onChange={e=>setNewName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Giá</Label>
              <Input type="number" value={newPrice} onChange={e=>setNewPrice(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Danh mục</Label>
              <Select value={newCategoryId} onValueChange={setNewCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Mô tả</Label>
              <Textarea value={newDesc} onChange={e=>setNewDesc(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={()=>setOpenAdd(false)}>Hủy</Button>
              <Button onClick={addProduct} disabled={saving}>{saving? 'Đang lưu...' : 'Lưu'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Tên</Label>
              <Input value={editName} onChange={e=>setEditName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Giá</Label>
              <Input type="number" value={editPrice} onChange={e=>setEditPrice(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Danh mục</Label>
              <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Mô tả</Label>
              <Textarea value={editDesc} onChange={e=>setEditDesc(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <input id="avail" type="checkbox" checked={editAvailable} onChange={(e)=>setEditAvailable(e.target.checked)} className="h-4 w-4" />
              <Label htmlFor="avail">Có sẵn</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={()=>setOpenEdit(false)}>Hủy</Button>
              <Button onClick={updateProduct} disabled={savingEdit}>{savingEdit? 'Đang lưu...' : 'Lưu'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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

  // Tables management state and helpers
  const [tableSearch, setTableSearch] = useState("");
  const [tableStatusFilter, setTableStatusFilter] = useState<string>("all");
  const [tableSeatsMin, setTableSeatsMin] = useState<string>("");
  const [tablePage, setTablePage] = useState(1);
  const tablePageSize = 10;

  const filteredTables = tables.filter(t => {
    const byStatus = tableStatusFilter === 'all' || t.status === tableStatusFilter;
    const term = tableSearch.toLowerCase().trim();
    const bySearch =
      term === "" ||
      String(t.table_number).includes(term) ||
      (t.notes || "").toLowerCase().includes(term) ||
      String(t.seats).includes(term);
    const bySeats = tableSeatsMin === "" || t.seats >= Number(tableSeatsMin);
    return byStatus && bySearch && bySeats;
  });
  const totalTablePages = Math.max(1, Math.ceil(filteredTables.length / tablePageSize));
  const pageTables = filteredTables.slice((tablePage - 1) * tablePageSize, tablePage * tablePageSize);

  const exportTablesCSV = () => {
    const header = ['Số bàn','Số chỗ','Trạng thái','Ghi chú'];
    const rows = filteredTables.map(t => [
      String(t.table_number),
      String(t.seats),
      getTableStatusInfo(t.status).label,
      t.notes || ''
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${(v || '').toString().replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tables.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const [openAddTable, setOpenAddTable] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState<string>("");
  const [newSeats, setNewSeats] = useState<string>("");
  const [newTableStatus, setNewTableStatus] = useState<string>("available");
  const [newTableNotes, setNewTableNotes] = useState("");
  const [savingTable, setSavingTable] = useState(false);

  const addTable = async () => {
    try {
      if (!newTableNumber || !newSeats) {
        toast({ title: 'Thiếu thông tin', description: 'Vui lòng nhập số bàn và số chỗ', variant: 'destructive' });
        return;
      }
      const tnum = Number(newTableNumber);
      const seatsNum = Number(newSeats);
      if (isNaN(tnum) || isNaN(seatsNum) || tnum <= 0 || seatsNum <= 0) {
        toast({ title: 'Giá trị không hợp lệ', description: 'Số bàn và số chỗ phải là số dương', variant: 'destructive' });
        return;
      }
      if (tables.some(t => t.table_number === tnum)) {
        toast({ title: 'Trùng số bàn', description: `Bàn số ${tnum} đã tồn tại`, variant: 'destructive' });
        return;
      }
      setSavingTable(true);
      const { error } = await supabase.from('tables').insert({
        table_number: tnum,
        seats: seatsNum,
        status: newTableStatus,
        notes: newTableNotes || null
      });
      if (error) throw error;
      setOpenAddTable(false);
      setNewTableNumber(""); setNewSeats(""); setNewTableStatus("available"); setNewTableNotes("");
      await refetchTables();
      toast({ title: 'Đã thêm bàn' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Không thể thêm bàn';
      toast({ title: 'Lỗi', description: msg, variant: 'destructive' });
    } finally {
      setSavingTable(false);
    }
  };

  const renderTables = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h2 className="text-2xl font-bold">Quản lý bàn</h2>
        <div className="flex gap-2">
          <Input placeholder="Tìm số bàn/ghi chú..." value={tableSearch} onChange={(e) => { setTableSearch(e.target.value); setTablePage(1); }} className="h-8 w-48" />
          <Select value={tableStatusFilter} onValueChange={(v) => { setTableStatusFilter(v); setTablePage(1); }}>
            <SelectTrigger className="h-8 w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="available">Trống</SelectItem>
              <SelectItem value="occupied">Có khách</SelectItem>
              <SelectItem value="reserved">Đã đặt</SelectItem>
              <SelectItem value="cleaning">Dọn dẹp</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Số chỗ tối thiểu" type="number" value={tableSeatsMin} onChange={(e) => { setTableSeatsMin(e.target.value); setTablePage(1); }} className="h-8 w-44" />
          <Button variant="outline" size="sm" onClick={exportTablesCSV}>Xuất CSV</Button>
          <Button size="sm" onClick={() => setOpenAddTable(true)}>
            <Plus className="w-4 h-4 mr-1" /> Thêm bàn
          </Button>
        </div>
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
              {pageTables.map((table) => {
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
                    <TableCell className="max-w-xs truncate">{table.notes || "-"}</TableCell>
                  </TableRow>
                );
              })}
              {pageTables.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Không có bàn</TableCell>
                </TableRow>
              )}
            </TableBody>
          </TableComponent>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm">
        <span>Tổng: {filteredTables.length} bàn</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setTablePage(p => Math.max(1, p-1))} disabled={tablePage<=1}>Trước</Button>
          <span>Trang {tablePage}/{totalTablePages}</span>
          <Button variant="outline" size="sm" onClick={() => setTablePage(p => Math.min(totalTablePages, p+1))} disabled={tablePage>=totalTablePages}>Sau</Button>
        </div>
      </div>

      <Dialog open={openAddTable} onOpenChange={setOpenAddTable}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thêm bàn</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Số bàn</Label>
              <Input type="number" value={newTableNumber} onChange={e=>setNewTableNumber(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Số chỗ ngồi</Label>
              <Input type="number" value={newSeats} onChange={e=>setNewSeats(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Trạng thái</Label>
              <Select value={newTableStatus} onValueChange={setNewTableStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Trống</SelectItem>
                  <SelectItem value="occupied">Có khách</SelectItem>
                  <SelectItem value="reserved">Đã đặt</SelectItem>
                  <SelectItem value="cleaning">Dọn dẹp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Ghi chú</Label>
              <Textarea value={newTableNotes} onChange={e=>setNewTableNotes(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={()=>setOpenAddTable(false)}>Hủy</Button>
              <Button onClick={addTable} disabled={savingTable}>{savingTable? 'Đang lưu...' : 'Lưu'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
