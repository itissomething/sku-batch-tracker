import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface SKU {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useSKUs = () => {
  const [skus, setSKUs] = useState<SKU[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSKUs = async () => {
    try {
      const { data, error } = await supabase
        .from('skus')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSKUs(data as any || []);
    } catch (error) {
      console.error('Error fetching SKUs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch SKUs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addSKU = async (skuData: { code: string; name: string; description?: string }) => {
    try {
      const { data, error } = await supabase
        .from('skus')
        .insert([{
          code: skuData.code,
          name: skuData.name,
          description: skuData.description || null,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setSKUs(prev => [data as any, ...prev]);
      toast({
        title: "Success",
        description: "SKU added successfully"
      });
      return true;
    } catch (error: any) {
      console.error('Error adding SKU:', error);
      
      if (error.code === '23505') {
        toast({
          title: "Error",
          description: "SKU code already exists",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add SKU",
          variant: "destructive"
        });
      }
      return false;
    }
  };

  useEffect(() => {
    fetchSKUs();
  }, []);

  return {
    skus,
    loading,
    addSKU,
    refetch: fetchSKUs
  };
};