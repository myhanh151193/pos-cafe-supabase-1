import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useShop } from '@/contexts/ShopContext';

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  product?: {
    name: string;
    image_url: string;
  };
}

export interface Order {
  id: string;
  table_id: string;
  order_number: string;
  total_amount: number;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  customer_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  table?: {
    table_number: number;
  };
  order_items?: OrderItem[];
}

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { currentShop } = (() => {
    try {
      return useShop();
    } catch (e) {
      return { currentShop: null } as any;
    }
  })();

  const fetchOrders = async () => {
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          table:tables(table_number),
          order_items(
            *,
            product:products(name, image_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (currentShop) query = query.eq('shop_id', currentShop.id);

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data as Order[] || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Không thể tải danh sách đơn hàng');
    }
  };

  const createOrder = async (
    tableId: string,
    items: Array<{
      product_id: string;
      quantity: number;
      unit_price: number;
      total_price: number;
      notes?: string;
    }>,
    customerName?: string,
    notes?: string
  ) => {
    try {
      // Generate order number
      const orderNumber = `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${String(Date.now()).slice(-4)}`;
      
      const totalAmount = items.reduce((sum, item) => sum + item.total_price, 0);

      // Create order
      // attach shop_id if available
      let shopId: string | null = null;
      try {
        const { currentShop } = useShop();
        if (currentShop) shopId = currentShop.id;
      } catch (e) {}

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_id: tableId,
          order_number: orderNumber,
          total_amount: totalAmount,
          customer_name: customerName,
          notes: notes,
          status: 'pending',
          shop_id: shopId,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        ...item,
        order_id: orderData.id
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Refresh orders
      await fetchOrders();

      toast({
        title: "Đã tạo đơn hàng",
        description: `Đơn hàng ${orderNumber} đã được tạo thành công`,
      });

      return orderData;
    } catch (err) {
      console.error('Error creating order:', err);
      toast({
        title: "Lỗi tạo đơn hàng",
        description: "Không thể tạo đơn hàng. Vui lòng thử lại.",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status, updated_at: new Date().toISOString() }
          : order
      ));

      toast({
        title: "Đã cập nhật trạng thái",
        description: `Đơn hàng đã chuyển sang trạng thái: ${status}`,
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      toast({
        title: "Lỗi cập nhật",
        description: "Không thể cập nhật trạng thái đơn hàng",
        variant: "destructive"
      });
      throw err;
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cancelled' as const, updated_at: new Date().toISOString() }
          : order
      ));

      toast({
        title: "Đã hủy đơn hàng",
        description: "Đơn hàng đã được hủy thành công",
      });
    } catch (err) {
      console.error('Error cancelling order:', err);
      toast({
        title: "Lỗi hủy đơn",
        description: "Không thể hủy đơn hàng",
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      await fetchOrders();
      setLoading(false);
    };

    loadOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    refetch: fetchOrders
  };
};
