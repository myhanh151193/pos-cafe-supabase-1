import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  sizes?: { name: string; price: number }[];
  toppings?: { id: string; name: string; price: number }[];
}

interface ProductCardProps {
  product: Product;
  onOpenModal: (product: Product) => void;
}

export function ProductCard({ product, onOpenModal }: ProductCardProps) {
  const handleClick = () => {
    onOpenModal(product);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const hasCustomization = (product.sizes && product.sizes.length > 1) || (product.toppings && product.toppings.length > 0);

  return (
    <Card className="group cursor-pointer hover:shadow-medium transition-all duration-200 hover:scale-[1.02] bg-card border-border/50">
      <CardContent className="p-4">
        <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-cream">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-coffee-primary">
              {formatPrice(product.price)}
            </span>
            
            <Button
              variant="add"
              size="sm"
              onClick={handleClick}
              className="rounded-full w-8 h-8 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {hasCustomization && (
            <div className="text-xs text-muted-foreground">
              {product.sizes && product.sizes.length > 1 && `${product.sizes.length} size`}
              {product.sizes && product.sizes.length > 1 && product.toppings && product.toppings.length > 0 && " • "}
              {product.toppings && product.toppings.length > 0 && `${product.toppings.length} topping`}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}