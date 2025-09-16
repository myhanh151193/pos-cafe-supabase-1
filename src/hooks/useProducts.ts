import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useShop } from '@/contexts/ShopContext';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  category?: {
    name: string;
  };
  image_url: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export const useProducts = (options?: { includeUnavailable?: boolean }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentShop } = (() => {
    try {
      return useShop();
    } catch (e) {
      return { currentShop: null } as any;
    }
  })();

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Không thể tải danh mục');
    }
  };

  const fetchProducts = async () => {
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(name)
        `)
        .order('name');

      if (!options?.includeUnavailable) {
        query = query.eq('is_available', true);
      }

      if (currentShop) {
        query = query.eq('shop_id', currentShop.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Không thể tải sản phẩm');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCategories(), fetchProducts()]);
      setLoading(false);
    };

    loadData();
  }, [currentShop?.id]);

  const addProduct = async (input: {
    name: string;
    price: number;
    category_id: string;
    description?: string;
    image_url?: string | null;
    is_available?: boolean;
  }) => {
    const shopId = currentShop?.id || null;

    const { data, error } = await supabase
      .from('products')
      .insert({
        name: input.name,
        price: input.price,
        category_id: input.category_id || null,
        description: input.description || null,
        image_url: input.image_url || null,
        is_available: input.is_available ?? true,
        shop_id: shopId,
      })
      .select(`*, category:categories(name)`).single();

    if (error) throw error;
    await fetchProducts();
    return data as Product;
  };

  const updateProduct = async (id: string, input: {
    name?: string;
    price?: number;
    category_id?: string | null;
    description?: string | null;
    image_url?: string | null;
    is_available?: boolean;
  }) => {
    const payload: any = {
      ...input,
    };
    if (input.category_id !== undefined) payload.category_id = input.category_id || null;
    if (input.description !== undefined) payload.description = input.description || null;
    if (input.image_url !== undefined) payload.image_url = input.image_url || null;

    const { error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id);

    if (error) throw error;
    await fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchProducts();
  };

  return {
    products,
    categories,
    loading,
    error,
    refetch: () => {
      fetchCategories();
      fetchProducts();
    },
    addProduct,
    updateProduct,
    deleteProduct,
  };
};
