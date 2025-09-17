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
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData.user?.id || null;
        if (!mounted) return;
        setShopId(uid);
        if (uid) {
          // Try to fetch shop record where id equals user id
          const { data } = await supabase
            .from("shops")
            .select("id, name")
            .eq("id", uid)
            .single();
          const record = data as ShopRecord | null;
          setShopName(record?.name || uid);
        } else {
          setShopName("—");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return { shopId, shopName, loading };
};
