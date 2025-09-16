import React, { createContext, useContext, useState, ReactNode } from 'react';

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

interface KitchenOrder {
  id: string;
  tableNumber: number;
  items: CartItemType[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'served';
  orderTime: Date;
  completedTime?: Date;
}

interface OrderContextType {
  kitchenOrders: KitchenOrder[];
  addKitchenOrder: (order: Omit<KitchenOrder, 'id' | 'orderTime'>) => void;
  updateOrderStatus: (orderId: string, status: KitchenOrder['status']) => void;
  removeOrder: (orderId: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>([]);

  const addKitchenOrder = (order: Omit<KitchenOrder, 'id' | 'orderTime'>) => {
    const newOrder: KitchenOrder = {
      ...order,
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderTime: new Date(),
      status: 'pending'
    };
    
    setKitchenOrders(prev => [...prev, newOrder]);
  };

  const updateOrderStatus = (orderId: string, status: KitchenOrder['status']) => {
    setKitchenOrders(prev => 
      prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status,
              completedTime: status === 'ready' ? new Date() : order.completedTime
            }
          : order
      )
    );
  };

  const removeOrder = (orderId: string) => {
    setKitchenOrders(prev => prev.filter(order => order.id !== orderId));
  };

  return (
    <OrderContext.Provider value={{
      kitchenOrders,
      addKitchenOrder,
      updateOrderStatus,
      removeOrder
    }}>
      {children}
    </OrderContext.Provider>
  );
};