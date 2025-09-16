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
      // First fetch user_shops entries to get shop IDs (more robust across schemas/RLS)
      const { data: usData, error: usError } = await supabase
        .from('user_shops')
        .select('shop_id')
        .eq('user_id', user.id);

      if (usError) {
        // provide detailed logging
        console.error('Error fetching user_shops:', {
          message: usError.message,
          details: (usError as any).details,
          hint: (usError as any).hint,
          code: (usError as any).code,
        });
        throw usError;
      }

      const shopIds = (usData || []).map((r: any) => r.shop_id).filter(Boolean);

      if (shopIds.length === 0) {
        setShops([]);
        setCurrentShop(null);
        setLoading(false);
        return;
      }

      const { data: shopsData, error: shopsError } = await supabase
        .from('shops')
        .select('id,name,description,created_at,updated_at')
        .in('id', shopIds)
        .order('name');

      if (shopsError) {
        console.error('Error fetching shops rows:', {
          message: shopsError.message,
          details: (shopsError as any).details,
          hint: (shopsError as any).hint,
          code: (shopsError as any).code,
        });
        throw shopsError;
      }

      const mapped = (shopsData || []) as Shop[];
      console.debug('[ShopContext] user', user?.id, 'user_shops', shopIds, 'shops', mapped.map(s=>s.id));
      setShops(mapped);
      if (mapped.length > 0) {
        setCurrentShop((prev) => prev ?? mapped[0]);
      } else {
        setCurrentShop(null);
      }
    } catch (err: any) {
      // Try to extract useful info
      const message = err?.message || JSON.stringify(err);
      console.error('Error fetching shops for user:', message, err);
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
