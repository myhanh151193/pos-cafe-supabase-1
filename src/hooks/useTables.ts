import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useShop } from '@/contexts/ShopContext';

export interface Table {
  id: string;
  table_number: number;
  seats: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentShop } = (() => {
    try {
      return useShop();
    } catch (e) {
      return { currentShop: null } as any;
    }
  })();

  const fetchTables = async () => {
    try {
      let query = supabase
        .from('tables')
        .select('*')
        .order('table_number');

      if (currentShop) query = query.eq('shop_id', currentShop.id);

      const { data, error } = await query;

      if (error) throw error;
      setTables(data as Table[] || []);
    } catch (err) {
      console.error('Error fetching tables:', err);
      setError('Không thể tải danh sách bàn');
    }
  };

  const updateTableStatus = async (tableId: string, status: Table['status'], notes?: string) => {
    try {
      const updateData: any = { status, updated_at: new Date().toISOString() };
      if (notes !== undefined) {
        updateData.notes = notes;
      }

      const { error } = await supabase
        .from('tables')
        .update(updateData)
        .eq('id', tableId);

      if (error) throw error;
      
      // Update local state
      setTables(prev => prev.map(table => 
        table.id === tableId 
          ? { ...table, ...updateData }
          : table
      ));
    } catch (err) {
      console.error('Error updating table status:', err);
      throw new Error('Không thể cập nhật trạng thái bàn');
    }
  };

  const updateTableNotes = async (tableId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('tables')
        .update({ notes, updated_at: new Date().toISOString() })
        .eq('id', tableId);

      if (error) throw error;
      
      // Update local state
      setTables(prev => prev.map(table => 
        table.id === tableId 
          ? { ...table, notes, updated_at: new Date().toISOString() }
          : table
      ));
    } catch (err) {
      console.error('Error updating table notes:', err);
      throw new Error('Không thể cập nhật ghi chú bàn');
    }
  };

  useEffect(() => {
    const loadTables = async () => {
      setLoading(true);
      await fetchTables();
      setLoading(false);
    };

    loadTables();
  }, []);

  return {
    tables,
    loading,
    error,
    updateTableStatus,
    updateTableNotes,
    refetch: fetchTables
  };
};
