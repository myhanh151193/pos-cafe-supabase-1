import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToppingSelector } from "./ToppingSelector";
import { ShoppingCart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  sizes?: { name: string; price: number }[];
  toppings?: { id: string; name: string; price: number }[];
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (
    product: Product, 
    size?: { name: string; price: number },
    toppings?: { [key: string]: number }
  ) => void;
}

export function ProductModal({ product, isOpen, onClose, onAddToCart }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<{ name: string; price: number } | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<{ [key: string]: number }>({});
  const [quantity, setQuantity] = useState(1);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const calculateTotalPrice = () => {
    if (!product) return 0;
    
    const basePrice = selectedSize?.price || product.price;
    const toppingsPrice = Object.entries(selectedToppings).reduce((total, [toppingId, qty]) => {
      const topping = product.toppings?.find(t => t.id === toppingId);
      return total + (topping ? topping.price * qty : 0);
    }, 0);
    
    return (basePrice + toppingsPrice) * quantity;
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // Đặt size mặc định nếu có sizes nhưng chưa chọn
    const finalSize = selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);
    
    for (let i = 0; i < quantity; i++) {
      onAddToCart(product, finalSize, selectedToppings);
    }
    
    // Reset form
    setSelectedSize(null);
    setSelectedToppings({});
    setQuantity(1);
    onClose();
  };

  const handleToppingChange = (toppingId: string, toppingQuantity: number) => {
    setSelectedToppings(prev => ({
      ...prev,
      [toppingId]: toppingQuantity
    }));
  };

  // Set default size when product changes
  useState(() => {
    if (product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
  });

  if (!product) return null;

  const hasCustomization = (product.sizes && product.sizes.length > 1) || (product.toppings && product.toppings.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{product.name}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 max-h-[60vh] pr-4">
          <div className="space-y-4">
            {/* Product Image */}
            <div className="aspect-square w-32 mx-auto rounded-lg overflow-hidden bg-cream">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 1 && (
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Chọn size</h4>
                <div className="grid grid-cols-2 gap-2">
                  {product.sizes.map((size) => (
                    <Button
                      key={size.name}
                      variant={selectedSize?.name === size.name ? "default" : "outline"}
                      onClick={() => setSelectedSize(size)}
                      className="flex justify-between"
                    >
                      <span>{size.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {formatPrice(size.price)}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Topping Selection */}
            {product.toppings && product.toppings.length > 0 && (
              <ToppingSelector
                toppings={product.toppings}
                selectedToppings={selectedToppings}
                onToppingChange={handleToppingChange}
              />
            )}

            {/* Quantity */}
            <div className="flex items-center justify-between">
              <span className="font-medium">Số lượng:</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 p-0"
                >
                  -
                </Button>
                <span className="min-w-[2rem] text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 p-0"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Total Price */}
            <div className="bg-secondary/50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Tổng tiền:</span>
                <span className="text-lg font-bold text-coffee-primary">
                  {formatPrice(calculateTotalPrice())}
                </span>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="pos" onClick={handleAddToCart}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Thêm vào giỏ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}