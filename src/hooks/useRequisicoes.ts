import { useState, useEffect } from 'react';
import { supabase, Requisicao, ItemRequisicao, Departamento, Fornecedor } from '@/lib/supabase';
import { useAuth } from './useAuth';

export function useRequisicoes() {
  const { user, profile } = useAuth();
  const [requisicoes, setRequisicoes] = useState<Requisicao[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRequisicoes();
      fetchDepartamentos();
      fetchFornecedores();
    }
  }, [user]);

  const fetchRequisicoes = async () => {
    try {
      const { data, error } = await supabase
        .from('requisicoes')
        .select(`
          *,
          solicitante:profiles!requisicoes_solicitante_id_fkey(nome, email),
          departamento:departamentos(nome),
          fornecedor_sugerido:fornecedores(nome),
          aprovador:profiles!requisicoes_aprovador_id_fkey(nome, email),
          itens:itens_requisicao(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching requisicoes:', error);
      } else {
        setRequisicoes(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartamentos = async () => {
    try {
      const { data, error } = await supabase
        .from('departamentos')
        .select('*')
        .order('nome');

      if (error) {
        console.error('Error fetching departamentos:', error);
      } else {
        setDepartamentos(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchFornecedores = async () => {
    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        console.error('Error fetching fornecedores:', error);
      } else {
        setFornecedores(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createRequisicao = async (
    requisicaoData: {
      departamento_id: string;
      fornecedor_sugerido_id?: string;
      justificativa: string;
    },
    itens: Omit<ItemRequisicao, 'id' | 'requisicao_id' | 'created_at' | 'preco_total'>[]
  ) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      // Create requisition
      const { data: requisicao, error: reqError } = await supabase
        .from('requisicoes')
        .insert([
          {
            ...requisicaoData,
            solicitante_id: user.id,
          },
        ])
        .select()
        .single();

      if (reqError) throw reqError;

      // Create items
      if (itens.length > 0) {
        const { error: itemsError } = await supabase
          .from('itens_requisicao')
          .insert(
            itens.map(item => ({
              ...item,
              requisicao_id: requisicao.id,
            }))
          );

        if (itemsError) throw itemsError;
      }

      await fetchRequisicoes();
      return { data: requisicao, error: null };
    } catch (error) {
      console.error('Error creating requisicao:', error);
      return { data: null, error };
    }
  };

  const updateRequisicao = async (
    id: string,
    updates: Partial<Requisicao>,
    itens?: Omit<ItemRequisicao, 'id' | 'requisicao_id' | 'created_at' | 'preco_total'>[]
  ) => {
    try {
      // Update requisition
      const { data, error: updateError } = await supabase
        .from('requisicoes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Update items if provided
      if (itens) {
        // Delete existing items
        await supabase
          .from('itens_requisicao')
          .delete()
          .eq('requisicao_id', id);

        // Insert new items
        if (itens.length > 0) {
          await supabase
            .from('itens_requisicao')
            .insert(
              itens.map(item => ({
                ...item,
                requisicao_id: id,
              }))
            );
        }
      }

      await fetchRequisicoes();
      return { data, error: null };
    } catch (error) {
      console.error('Error updating requisicao:', error);
      return { data: null, error };
    }
  };

  const aprovarRequisicao = async (id: string, observacoes?: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    return updateRequisicao(id, {
      status: 'aprovada',
      aprovador_id: user.id,
      data_aprovacao: new Date().toISOString(),
      observacoes_aprovador: observacoes,
    });
  };

  const rejeitarRequisicao = async (id: string, observacoes: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    return updateRequisicao(id, {
      status: 'rejeitada',
      aprovador_id: user.id,
      data_aprovacao: new Date().toISOString(),
      observacoes_aprovador: observacoes,
    });
  };

  const enviarParaAprovacao = async (id: string) => {
    return updateRequisicao(id, {
      status: 'pendente',
    });
  };

  // Computed values
  const minhasRequisicoes = requisicoes.filter(req => req.solicitante_id === user?.id);
  const requisicoesParaAprovar = requisicoes.filter(
    req => req.status === 'pendente' && (profile?.role === 'aprovador' || profile?.role === 'admin')
  );
  const requisicoesAprovadas = requisicoes.filter(req => req.status === 'aprovada');
  const requisicoesPendentes = requisicoes.filter(req => req.status === 'pendente');
  const rascunhos = requisicoes.filter(req => req.status === 'rascunho' && req.solicitante_id === user?.id);

  // Statistics
  const stats = {
    total: requisicoes.length,
    pendentes: requisicoesPendentes.length,
    aprovadas: requisicoesAprovadas.length,
    valorTotal: requisicoesAprovadas.reduce((sum, req) => sum + req.valor_total, 0),
  };

  return {
    requisicoes,
    minhasRequisicoes,
    requisicoesParaAprovar,
    requisicoesAprovadas,
    requisicoesPendentes,
    rascunhos,
    departamentos,
    fornecedores,
    stats,
    loading,
    createRequisicao,
    updateRequisicao,
    aprovarRequisicao,
    rejeitarRequisicao,
    enviarParaAprovacao,
    refetch: fetchRequisicoes,
  };
}