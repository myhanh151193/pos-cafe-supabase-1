import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryFilter({ categories, activeCategory, onCategoryChange }: CategoryFilterProps) {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={activeCategory === category ? "category" : "outline"}
          size="sm"
          onClick={() => onCategoryChange(category)}
          className="whitespace-nowrap"
        >
          {category}
        </Button>
      ))}
    </div>
  );
}