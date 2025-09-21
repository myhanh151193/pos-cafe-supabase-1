import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [shopCode, setShopCode] = React.useState<string>(() => localStorage.getItem("currentShop") || "");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (shopCode) localStorage.setItem("currentShop", shopCode);
      const to = location.state?.from?.pathname || "/";
      navigate(to, { replace: true });
      toast({ title: "Đăng nhập thành công" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Không thể đăng nhập";
      toast({ title: "Lỗi đăng nhập", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="max-w-sm w-full">
        <CardHeader>
          <CardTitle>Đăng nhập quản trị</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shop">Mã cửa hàng</Label>
              <Input id="shop" placeholder="vd: shop-hn-01" value={shopCode} onChange={(e) => setShopCode(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</Button>
            <div className="text-xs text-muted-foreground text-center">
              Chưa có tài khoản? Liên hệ quản trị để cấp quyền.
            </div>
            <div className="text-center">
              <Link to="/">Về trang chính</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
