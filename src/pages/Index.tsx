import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductCard } from "@/components/ProductCard";
import { CartItem } from "@/components/CartItem";
import { CategoryFilter } from "@/components/CategoryFilter";
import { SearchBar } from "@/components/SearchBar";
import { ProductModal } from "@/components/ProductModal";
import { TableSelection } from "@/components/TableSelection";
import { TableManager } from "@/components/TableManager";
import { useProducts } from "@/hooks/useProducts";
import { useTables } from "@/hooks/useTables";
import { useOrders } from "@/hooks/useOrders";
import cappuccinoImg from "@/assets/cappuccino.jpg";
import bubbleTeaImg from "@/assets/bubble-tea.jpg";
import icedTeaImg from "@/assets/iced-tea.jpg";
import espressoImg from "@/assets/espresso.jpg";
import { Coffee, ShoppingCart, CreditCard, Users, UtensilsCrossed, CheckCircle, Trash2, ChefHat, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Link } from "react-router-dom";

interface CartItemType {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: { name: string; price: number };
  image: string;
  toppings?: { [key: string]: number };
  toppingsNames?: string[];
}

interface CartProduct {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category?: {
    name: string;
  };
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("tables");
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [searchTerm, setSearchTerm] = useState("");
  const [tableCartItems, setTableCartItems] = useState<{[tableId: string]: CartItemType[]}>({});
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vatPercent, setVatPercent] = useState(10);
  const [confirmedOrders, setConfirmedOrders] = useState<{[tableId: string]: number}>({});
  const { toast } = useToast();
  
  // Use hooks to fetch data from Supabase
  const { products, categories: dbCategories, loading: productsLoading } = useProducts();
  const { tables, updateTableStatus, updateTableNotes } = useTables();
  const { createOrder } = useOrders();

  // Get cart items for current table
  const cartItems = selectedTable ? (tableCartItems[selectedTable.id] || []) : [];

  // Categories for filter (add "Tất cả" to database categories)
  const categories = ["Tất cả", ...dbCategories.map(cat => cat.name)];

  // Filter products by category and search
  const filteredProducts = products.filter(product => {
    const categoryName = product.category?.name || '';
    const matchesCategory = activeCategory === "Tất cả" || categoryName === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Convert database product to display format
  const getProductImage = (imageUrl: string) => {
    const imageMap: {[key: string]: string} = {
      '/src/assets/espresso.jpg': espressoImg,
      '/src/assets/cappuccino.jpg': cappuccinoImg,
      '/src/assets/iced-tea.jpg': icedTeaImg,
      '/src/assets/bubble-tea.jpg': bubbleTeaImg,
    };
    return imageMap[imageUrl] || cappuccinoImg;
  };

  const handleTableSelect = (table: any) => {
    setSelectedTable(table);
    setActiveTab("menu");
    toast({
      title: "Đã chọn bàn",
      description: `Bàn ${table.table_number} - ${table.seats} chỗ ngồi`,
    });
  };

  const handleConfirmTable = () => {
    if (selectedTable) {
      setActiveTab("menu");
      toast({
        title: "Đã chọn bàn",
        description: `Bàn ${selectedTable.table_number} - ${selectedTable.seats} chỗ ngồi`,
      });
    }
  };

  const openProductModal = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  const addToCart = (
    product: any, 
    size?: { name: string; price: number },
    toppings?: { [key: string]: number }
  ) => {
    // Generate unique cart item ID including toppings
    const toppingsStr = toppings ? Object.entries(toppings)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => `${id}:${qty}`)
      .sort()
      .join(',') : '';
    
    const cartItemId = `${product.id}|${size?.name || 'default'}|${toppingsStr}`;
    const basePrice = size?.price || Number(product.price);
    
    // Calculate toppings price
    const toppingsPrice = toppings ? Object.entries(toppings).reduce((total, [toppingId, qty]) => {
      const topping = product.toppings?.find(t => t.id === toppingId);
      return total + (topping ? topping.price * qty : 0);
    }, 0) : 0;
    
    const totalPrice = basePrice + toppingsPrice;
    
    // Get topping names for display
    const toppingsNames = toppings ? Object.entries(toppings)
      .filter(([_, qty]) => qty > 0)
      .map(([toppingId, qty]) => {
        const topping = product.toppings?.find(t => t.id === toppingId);
        return topping ? `${topping.name} (${qty})` : '';
      })
      .filter(Boolean) : [];
    
    setTableCartItems(prev => {
      if (!selectedTable) return prev;
      
      const tableItems = prev[selectedTable.id] || [];
      const existingItem = tableItems.find(item => item.id === cartItemId);
      
      const updatedTableItems = existingItem
        ? tableItems.map(item =>
            item.id === cartItemId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...tableItems, {
            id: cartItemId,
            productId: product.id,
            name: product.name,
            price: totalPrice,
            quantity: 1,
            size,
            image: getProductImage(product.image_url),
            toppings,
            toppingsNames
          }];

      return {
        ...prev,
        [selectedTable.id]: updatedTableItems
      };
    });

    const toppingsText = toppingsNames.length > 0 ? ` với ${toppingsNames.join(', ')}` : '';
    toast({
      title: "Đã thêm vào giỏ",
      description: `${product.name}${size ? ` (${size.name})` : ""}${toppingsText}`,
    });
  };

  const updateCartItemQuantity = (id: string, quantity: number) => {
    if (!selectedTable) return;
    
    if (quantity === 0) {
      removeFromCart(id);
      return;
    }
    
    setTableCartItems(prev => ({
      ...prev,
      [selectedTable.id]: (prev[selectedTable.id] || []).map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    }));
  };

  const removeFromCart = (id: string) => {
    if (!selectedTable) return;
    
    setTableCartItems(prev => ({
      ...prev,
      [selectedTable.id]: (prev[selectedTable.id] || []).filter(item => item.id !== id)
    }));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateVAT = () => {
    return calculateSubtotal() * (vatPercent / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Giỏ hàng trống",
        description: "Vui lòng thêm sản phẩm vào giỏ hàng trước khi xác nhận",
        variant: "destructive"
      });
      return;
    }

    if (selectedTable) {
      try {
        const orderTotal = calculateTotal();
        
        // Prepare order items for database
        const orderItems = cartItems.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.price / item.quantity,
          total_price: item.price * item.quantity,
          notes: item.toppingsNames?.join(', ') || ''
        }));

        // Create order in database
        await createOrder(selectedTable.id, orderItems);
        
        // Update table status to occupied
        await updateTableStatus(selectedTable.id, 'occupied');
        
        setConfirmedOrders(prev => ({
          ...prev,
          [selectedTable.id]: orderTotal
        }));
        
        toast({
          title: "Đã xác nhận đơn hàng!",
          description: `Bàn ${selectedTable.table_number} - Tổng tiền: ${formatPrice(orderTotal)} - Đã gửi đến bếp`,
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : JSON.stringify(error);
        console.error('Error confirming order:', errMsg);
      }
    }
  };

  const handleDeleteOrder = () => {
    if (!selectedTable || cartItems.length === 0) {
      toast({
        title: "Giỏ hàng trống",
        description: "Không có đơn hàng để xóa",
        variant: "destructive"
      });
      return;
    }

    setTableCartItems(prev => ({
      ...prev,
      [selectedTable.id]: []
    }));
    
    // Also remove confirmed order status for this table
    setConfirmedOrders(prev => {
      const updated = { ...prev };
      delete updated[selectedTable.id];
      return updated;
    });
    
    toast({
      title: "Đã xóa đơn hàng",
      description: "Giỏ hàng đã được làm trống",
    });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Giỏ hàng trống",
        description: "Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Thanh toán thành công!",
      description: `Bàn ${selectedTable?.table_number} - Tổng tiền: ${formatPrice(calculateTotal())}`,
    });
    
    setTableCartItems(prev => {
      if (!selectedTable) return prev;
      const updated = { ...prev };
      delete updated[selectedTable.id];
      return updated;
    });
    
    setConfirmedOrders(prev => {
      const updated = { ...prev };
      delete updated[selectedTable.id];
      return updated;
    });
    
    // Reset về tab chọn bàn sau khi thanh toán
    setActiveTab("tables");
    setSelectedTable(null);
  };

  const handleUpdateTableNote = async (tableId: string, note: string) => {
    try {
      await updateTableNotes(tableId, note);
      toast({
        title: "Đã cập nhật ghi chú",
        description: "Ghi chú bàn đã được lưu",
      });
    } catch (error) {
      console.error('Error updating table note:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <Coffee className="w-8 h-8 text-coffee-primary" />
            <h1 className="text-2xl font-bold text-foreground">Café POS Vista</h1>
            <div className="flex space-x-2">
              <Link to="/kitchen">
                <Button variant="outline" size="sm">
                  <ChefHat className="w-4 h-4 mr-2" />
                  Bếp pha chế
                </Button>
              </Link>
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Quản trị
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {selectedTable && (
              <div className="flex items-center space-x-2 bg-coffee-primary/10 px-3 py-1 rounded-full">
                <Users className="w-4 h-4" />
                <span>Bàn {selectedTable.table_number}</span>
              </div>
            )}
            <span>Hệ thống bán hàng</span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4 h-8 w-fit">
            <TabsTrigger value="tables" className="flex items-center space-x-1 text-xs h-6 px-4">
              <Users className="w-3 h-3" />
              <span>Bàn</span>
            </TabsTrigger>
            <TabsTrigger 
              value="menu" 
              className="flex items-center space-x-1 text-xs h-6 px-4"
              disabled={!selectedTable}
            >
              <UtensilsCrossed className="w-3 h-3" />
              <span>Menu</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tables" className="mt-0">
            <TableSelection
              tables={tables}
              selectedTable={selectedTable}
              onTableSelect={handleTableSelect}
              onConfirmTable={handleConfirmTable}
              confirmedOrders={confirmedOrders}
              formatPrice={formatPrice}
              onUpdateTableNote={handleUpdateTableNote}
            />
          </TabsContent>

          <TabsContent value="menu" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Products Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-4">
                  <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                  />
                  
                  <CategoryFilter
                    categories={categories}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {productsLoading ? (
                    <div className="col-span-full text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-primary mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">Đang tải sản phẩm...</p>
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={{
                          ...product,
                          image: getProductImage(product.image_url),
                          category: product.category?.name || ''
                        }}
                        onOpenModal={openProductModal}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Cart Section */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6 bg-card border-border/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 text-foreground">
                      <ShoppingCart className="w-5 h-5" />
                      <span>Giỏ hàng ({cartItems.length})</span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {cartItems.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Giỏ hàng trống</p>
                      </div>
                    ) : (
                      <>
                        <div className="max-h-64 overflow-y-auto space-y-1">
                          {cartItems.map((item) => (
                            <CartItem
                              key={item.id}
                              item={item}
                              onUpdateQuantity={updateCartItemQuantity}
                              onRemove={removeFromCart}
                            />
                          ))}
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span>Tạm tính:</span>
                            <span>{formatPrice(calculateSubtotal())}</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <Label htmlFor="vat">VAT (%):</Label>
                            <div className="flex items-center space-x-2">
                              <Input
                                id="vat"
                                type="number"
                                value={vatPercent}
                                onChange={(e) => setVatPercent(Number(e.target.value))}
                                className="w-16 h-8 text-xs"
                                min="0"
                                max="100"
                              />
                              <span className="text-xs w-16 text-right">
                                {formatPrice(calculateVAT())}
                              </span>
                            </div>
                          </div>

                          <Separator />
                          
                          <div className="flex justify-between text-lg font-semibold text-foreground">
                            <span>Tổng cộng:</span>
                            <span className="text-coffee-primary">
                              {formatPrice(calculateTotal())}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="pos"
                              size="sm"
                              onClick={handleConfirmOrder}
                              className="w-full"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Xác nhận
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDeleteOrder}
                              className="w-full"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Xóa đơn
                            </Button>
                          </div>

                          <TableManager
                            selectedTable={selectedTable}
                            tableCartItems={tableCartItems}
                            setTableCartItems={setTableCartItems}
                            confirmedOrders={confirmedOrders}
                            setConfirmedOrders={setConfirmedOrders}
                            formatPrice={formatPrice}
                            tableNotes={{}}
                            onTableSwitch={setSelectedTable}
                          />

                          <Button
                            variant="default"
                            size="lg"
                            onClick={handleCheckout}
                            className="w-full"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Thanh toán
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Product Modal */}
        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={closeProductModal}
          onAddToCart={addToCart}
        />
      </div>
    </div>
  );
};

export default Index;
