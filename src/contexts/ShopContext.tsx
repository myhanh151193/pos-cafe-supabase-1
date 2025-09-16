import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Shop {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface ShopContextValue {
  shops: Shop[];
  currentShop: Shop | null;
  loading: boolean;
  setCurrentShopById: (id: string | null) => void;
  refetch: () => Promise<void>;
}

const ShopContext = createContext<ShopContextValue | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [currentShop, setCurrentShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchShops = async () => {
    if (!user) {
      setShops([]);
      setCurrentShop(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // user_shops table expected to have user_id and shop_id, with shops table
      const { data, error } = await supabase
        .from('user_shops')
        .select('shop_id, shop:shops(id,name,description,created_at,updated_at)')
        .eq('user_id', user.id);

      if (error) throw error;

      const mapped = (data || []).map((row: any) => row.shop).filter(Boolean) as Shop[];
      setShops(mapped);
      if (mapped.length > 0) {
        setCurrentShop((prev) => prev ?? mapped[0]);
      } else {
        setCurrentShop(null);
      }
    } catch (err) {
      console.error('Error fetching shops for user:', err);
      setShops([]);
      setCurrentShop(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
    // refetch whenever user changes
  }, [user?.id]);

  const setCurrentShopById = (id: string | null) => {
    if (!id) {
      setCurrentShop(null);
      return;
    }
    const found = shops.find(s => s.id === id) || null;
    setCurrentShop(found);
  };

  const refetch = async () => await fetchShops();

  return (
    <ShopContext.Provider value={{ shops, currentShop, loading, setCurrentShopById, refetch }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used within ShopProvider');
  return ctx;
};
