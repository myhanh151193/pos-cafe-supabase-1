import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus } from "lucide-react";

interface Topping {
  id: string;
  name: string;
  price: number;
}

interface ToppingSelectorProps {
  toppings: Topping[];
  selectedToppings: { [key: string]: number };
  onToppingChange: (toppingId: string, quantity: number) => void;
}

export function ToppingSelector({ toppings, selectedToppings, onToppingChange }: ToppingSelectorProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-foreground">Topping (tùy chọn)</h4>
      <div className="space-y-2">
        {toppings.map((topping) => {
          const quantity = selectedToppings[topping.id] || 0;
          
          return (
            <div key={topping.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm">{topping.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    +{formatPrice(topping.price)}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToppingChange(topping.id, Math.max(0, quantity - 1))}
                  className="w-7 h-7 p-0 rounded-full"
                  disabled={quantity === 0}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                
                <span className="min-w-[1.5rem] text-center text-sm font-medium">
                  {quantity}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onToppingChange(topping.id, quantity + 1)}
                  className="w-7 h-7 p-0 rounded-full"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}