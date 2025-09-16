import { Button } from "@/components/ui/button";
import { Minus, Plus, X } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: { name: string; price: number };
  image: string;
  toppings?: { [key: string]: number };
  toppingsNames?: string[];
}

interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const totalPrice = item.price * item.quantity;

  return (
    <div className="flex items-center space-x-3 py-3 border-b border-border/50 last:border-b-0">
      <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream flex-shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-foreground truncate">
          {item.name}
        </h4>
        {item.size && (
          <p className="text-xs text-muted-foreground">
            Size: {item.size.name}
          </p>
        )}
        {item.toppingsNames && item.toppingsNames.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {item.toppingsNames.join(', ')}
          </p>
        )}
        <p className="text-sm font-semibold text-coffee-primary">
          {formatPrice(totalPrice)}
        </p>
      </div>
      
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
          className="w-7 h-7 p-0 rounded-full"
        >
          <Minus className="w-3 h-3" />
        </Button>
        
        <span className="min-w-[2rem] text-center text-sm font-medium">
          {item.quantity}
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="w-7 h-7 p-0 rounded-full"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(item.id)}
        className="w-7 h-7 p-0 rounded-full text-destructive hover:text-destructive"
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
}