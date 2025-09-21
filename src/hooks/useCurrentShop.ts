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
        const { data: sessionData, error: sessErr } = await supabase.auth.getSession();
        if (sessErr) console.warn('Auth getSession error:', sessErr.message);
        const session = sessionData?.session || null;
        if (!session) {
          if (mounted) {
            setShopId(null);
            setShopName('—');
          }
          return;
        }
        const uid = session.user.id;
        if (!mounted) return;
        setShopId(uid);
        try {
          const { data, error: shopErr } = await supabase
            .from("user_shops")
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
      } catch (e) {
        console.warn('Auth session check failed:', e);
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
