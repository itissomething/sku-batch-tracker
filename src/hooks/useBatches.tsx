import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Batch {
  id: string;
  sku_id: string;
  batch_number: string;
  pieces: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  skus?: {
    code: string;
    name: string;
  };
}

export const useBatches = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBatches = async () => {
    try {
      const { data, error } = await supabase
        .from('batches')
        .select(`
          *,
          skus (
            code,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBatches(data as any || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast({
        title: "Error",
        description: "Failed to fetch batches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addBatch = async (batchData: { sku_id: string; pieces: number }) => {
    try {
      // Get next batch number using the database function
      const { data: batchNumber, error: batchError } = await supabase
        .rpc('generate_batch_number', { _sku_id: batchData.sku_id });

      if (batchError) throw batchError;

      const { data, error } = await supabase
        .from('batches')
        .insert([{
          sku_id: batchData.sku_id,
          batch_number: batchNumber,
          pieces: batchData.pieces,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select(`
          *,
          skus (
            code,
            name
          )
        `)
        .single();

      if (error) throw error;

      setBatches(prev => [data as any, ...prev]);
      toast({
        title: "Success",
        description: `Batch ${batchNumber} added successfully`
      });
      return true;
    } catch (error: any) {
      console.error('Error adding batch:', error);
      toast({
        title: "Error",
        description: "Failed to add batch",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  return {
    batches,
    loading,
    addBatch,
    refetch: fetchBatches
  };
};