import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, RequireAuth } from "@/contexts/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OrderProvider } from "./contexts/OrderContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Kitchen from "./pages/Kitchen.tsx";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OrderProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/kitchen" element={<Kitchen />} />
            <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
            <Route path="/login" element={<Login />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </OrderProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
