import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Departamento {
  id: string;
  nome: string;
  orcamento_mensal: number | null;
  responsavel_id: string | null;
  created_at: string;
}

export interface DepartamentoInput {
  nome: string;
  orcamento_mensal?: number | null;
  responsavel_id?: string | null;
}

export function useDepartamentos() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDepartamentos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("departamentos")
        .select("*")
        .order("nome");

      if (error) throw error;
      setDepartamentos(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar departamentos:", error);
      toast.error("Erro ao carregar departamentos");
    } finally {
      setLoading(false);
    }
  };

  const createDepartamento = async (input: DepartamentoInput) => {
    try {
      const { data, error } = await supabase
        .from("departamentos")
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      
      setDepartamentos(prev => [...prev, data]);
      toast.success("Departamento criado com sucesso!");
      return { data, error: null };
    } catch (error: any) {
      console.error("Erro ao criar departamento:", error);
      toast.error("Erro ao criar departamento");
      return { data: null, error };
    }
  };

  const updateDepartamento = async (id: string, input: Partial<DepartamentoInput>) => {
    try {
      const { data, error } = await supabase
        .from("departamentos")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      
      setDepartamentos(prev => prev.map(d => d.id === id ? data : d));
      toast.success("Departamento atualizado com sucesso!");
      return { data, error: null };
    } catch (error: any) {
      console.error("Erro ao atualizar departamento:", error);
      toast.error("Erro ao atualizar departamento");
      return { data: null, error };
    }
  };

  const deleteDepartamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from("departamentos")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setDepartamentos(prev => prev.filter(d => d.id !== id));
      toast.success("Departamento excluído com sucesso!");
      return { error: null };
    } catch (error: any) {
      console.error("Erro ao excluir departamento:", error);
      toast.error("Erro ao excluir departamento");
      return { error };
    }
  };

  useEffect(() => {
    fetchDepartamentos();
  }, []);

  return {
    departamentos,
    loading,
    fetchDepartamentos,
    createDepartamento,
    updateDepartamento,
    deleteDepartamento,
  };
}
