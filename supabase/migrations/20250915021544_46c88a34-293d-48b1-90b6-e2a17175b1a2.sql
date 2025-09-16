-- Create categories table for product organization
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table for menu items
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES public.categories(id),
  image_url TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tables for restaurant seating
CREATE TABLE public.tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number INTEGER NOT NULL UNIQUE,
  seats INTEGER NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  table_id UUID REFERENCES public.tables(id),
  order_number TEXT NOT NULL UNIQUE,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'paid', 'cancelled')),
  customer_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table for items in each order
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public access for POS system)
CREATE POLICY "Allow public access to categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Allow public access to products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow public access to tables" ON public.tables FOR ALL USING (true);
CREATE POLICY "Allow public access to orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Allow public access to order_items" ON public.order_items FOR ALL USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tables_updated_at
  BEFORE UPDATE ON public.tables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Insert sample data
INSERT INTO public.categories (name, description) VALUES
  ('Cà phê', 'Các loại cà phê truyền thống và hiện đại'),
  ('Trà', 'Trà truyền thống và trà trái cây'),
  ('Nước ép', 'Nước ép tự nhiên và sinh tố'),
  ('Đồ uống khác', 'Các loại đồ uống khác');

INSERT INTO public.products (name, description, price, category_id, image_url, is_available) 
SELECT 
  'Cà phê đen', 'Cà phê đen truyền thống', 25000, c.id, '/src/assets/espresso.jpg', true
FROM public.categories c WHERE c.name = 'Cà phê'
UNION ALL
SELECT 
  'Cappuccino', 'Cà phê cappuccino thơm ngon', 35000, c.id, '/src/assets/cappuccino.jpg', true
FROM public.categories c WHERE c.name = 'Cà phê'
UNION ALL
SELECT 
  'Trà đá', 'Trà đá truyền thống', 15000, c.id, '/src/assets/iced-tea.jpg', true
FROM public.categories c WHERE c.name = 'Trà'
UNION ALL
SELECT 
  'Trà sữa trân châu', 'Trà sữa với trân châu ngon', 45000, c.id, '/src/assets/bubble-tea.jpg', true
FROM public.categories c WHERE c.name = 'Trà';

INSERT INTO public.tables (table_number, seats, status) VALUES
  (1, 2, 'available'),
  (2, 4, 'available'),
  (3, 4, 'occupied'),
  (4, 6, 'available'),
  (5, 2, 'reserved'),
  (6, 8, 'available'),
  (7, 4, 'cleaning'),
  (8, 4, 'available');