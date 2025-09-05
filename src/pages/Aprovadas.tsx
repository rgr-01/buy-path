import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Eye, Download, Calendar, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface RequisicaoAprovada {
  id: string;
  codigo: string;
  justificativa: string;
  valor_total: number;
  data_aprovacao: string;
  aprovado_por: string;
  solicitante: string;
  departamento: string;
  status: string;
}

export function Aprovadas() {
  const [requisicoes, setRequisicoes] = useState<RequisicaoAprovada[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchRequisicoesAprovadas();
  }, []);

  const fetchRequisicoesAprovadas = async () => {
    try {
      const { data, error } = await supabase
        .from('requisicoes')
        .select(`
          id,
          codigo,
          justificativa,
          valor_total,
          data_aprovacao,
          status,
          solicitante:profiles!solicitante_id(nome, departamento),
          aprovador:profiles!aprovador_id(nome)
        `)
        .eq('status', 'aprovada')
        .order('data_aprovacao', { ascending: false });

      if (error) {
        console.error('Erro ao buscar requisições aprovadas:', error);
        toast.error('Erro ao carregar requisições aprovadas');
      } else {
        const formattedData = data?.map(req => ({
          id: req.id,
          codigo: req.codigo,
          justificativa: req.justificativa,
          valor_total: req.valor_total || 0,
          data_aprovacao: req.data_aprovacao,
          aprovado_por: req.aprovador?.nome || 'N/A',
          solicitante: req.solicitante?.nome || 'N/A',
          departamento: req.solicitante?.departamento || 'N/A',
          status: req.status
        })) || [];
        setRequisicoes(formattedData);
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Requisições Aprovadas</h1>
            <p className="text-muted-foreground">Visualize todas as requisições aprovadas</p>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Requisições Aprovadas</h1>
            <p className="text-muted-foreground">
              {requisicoes.length} requisições aprovadas encontradas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              Total: {requisicoes.length}
            </Badge>
          </div>
        </div>

        {/* Requisições List */}
        <div className="grid gap-4">
          {requisicoes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhuma requisição aprovada</h3>
                <p className="text-muted-foreground text-center">
                  Quando houver requisições aprovadas, elas aparecerão aqui.
                </p>
              </CardContent>
            </Card>
          ) : (
            requisicoes.map((requisicao) => (
              <Card key={requisicao.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        {requisicao.codigo}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {requisicao.justificativa}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Aprovada
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Solicitante</p>
                      <p className="text-sm">{requisicao.solicitante}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Departamento</p>
                      <p className="text-sm">{requisicao.departamento}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Aprovado por</p>
                      <p className="text-sm">{requisicao.aprovado_por}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium text-foreground">
                          {formatCurrency(requisicao.valor_total)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Aprovada em {formatDate(requisicao.data_aprovacao)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}