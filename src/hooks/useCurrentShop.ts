import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ShopRecord {
  id: string;
  name?: string | null;
}

export const useCurrentShop = () => {
  const [shopId, setShopId] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string>("—");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data: userData, error } = await supabase.auth.getUser();
        if (error) {
          console.warn('Auth getUser error:', error.message);
        }
        const uid = userData?.user?.id || null;
        if (!mounted) return;
        setShopId(uid);
        if (uid) {
          try {
            const { data, error: shopErr } = await supabase
              .from("shop")
              .select("id, name")
              .eq("id", uid)
              .maybeSingle();
            if (shopErr) {
              console.warn("Cannot load shop name:", shopErr.message);
            }
            const record = data as ShopRecord | null;
            setShopName(record?.name ?? "—");
          } catch (e) {
            console.warn('Shop fetch failed:', e);
            setShopName("—");
          }
        } else {
          setShopName("—");
        }
      } catch (e) {
        console.warn('Auth getUser failed:', e);
        if (mounted) setShopName("—");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return { shopId, shopName, loading };
};
