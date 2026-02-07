import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Download,
  FileText,
  PieChart,
  Activity
} from "lucide-react";
import { useRequisicoes } from "@/hooks/useRequisicoes";

export function Relatorios() {
  const { requisicoes, loading } = useRequisicoes();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Calcular estatísticas reais do banco de dados
  const requisicoesAprovadas = requisicoes.filter(r => r.status === 'aprovada').length;
  const requisicoesPendentes = requisicoes.filter(r => r.status === 'pendente').length;
  const requisicoesRejeitadas = requisicoes.filter(r => r.status === 'rejeitada').length;
  const requisicoesRascunho = requisicoes.filter(r => r.status === 'rascunho').length;
  const totalRequisicoes = requisicoes.length;
  
  const valorTotalGasto = requisicoes
    .filter(r => r.status === 'aprovada')
    .reduce((sum, r) => sum + (r.valor_total || 0), 0);
  
  const valorTotalPendente = requisicoes
    .filter(r => r.status === 'pendente')
    .reduce((sum, r) => sum + (r.valor_total || 0), 0);

  const valorTotalRejeitado = requisicoes
    .filter(r => r.status === 'rejeitada')
    .reduce((sum, r) => sum + (r.valor_total || 0), 0);

  const valorTotalGeral = requisicoes.reduce((sum, r) => sum + (r.valor_total || 0), 0);
  
  const valorMedioRequisicao = requisicoesAprovadas > 0 
    ? valorTotalGasto / requisicoesAprovadas 
    : 0;

  const calcularPercentual = (valor: number, total: number) => {
    return total > 0 ? ((valor / total) * 100).toFixed(1) : '0';
  };

  const relatoriosDisponiveis = [
    {
      titulo: "Relatório Mensal",
      descricao: "Requisições do mês atual",
      icone: Calendar,
      formato: "PDF"
    },
    {
      titulo: "Relatório por Departamento",
      descricao: "Análise por departamento",
      icone: PieChart,
      formato: "Excel"
    },
    {
      titulo: "Relatório de Custos",
      descricao: "Análise de gastos e custos",
      icone: DollarSign,
      formato: "PDF"
    },
    {
      titulo: "Relatório de Performance",
      descricao: "Tempos de aprovação",
      icone: Activity,
      formato: "PDF"
    }
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground">Análises e relatórios do sistema</p>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando dados...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
            <p className="text-muted-foreground">
              Análises e relatórios detalhados do sistema de requisições
            </p>
          </div>
          <Button className="gap-2">
            <Download className="w-4 h-4" />
            Exportar Dados
          </Button>
        </div>

        {/* Estatísticas Gerais */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Requisições</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRequisicoes}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                Dados sincronizados com o banco
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
              <BarChart3 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{requisicoesAprovadas}</div>
              <p className="text-xs text-muted-foreground">
                {calcularPercentual(requisicoesAprovadas, totalRequisicoes)}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Activity className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{requisicoesPendentes}</div>
              <p className="text-xs text-muted-foreground">
                {calcularPercentual(requisicoesPendentes, totalRequisicoes)}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total Aprovado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(valorTotalGasto)}</div>
              <p className="text-xs text-muted-foreground">
                Média: {formatCurrency(valorMedioRequisicao)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos e Análises */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Status das Requisições</CardTitle>
              <CardDescription>Distribuição por status atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                    <span className="text-sm">Aprovadas</span>
                  </div>
                  <Badge variant="secondary">{requisicoesAprovadas}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-warning rounded-full"></div>
                    <span className="text-sm">Pendentes</span>
                  </div>
                  <Badge variant="secondary">{requisicoesPendentes}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-destructive rounded-full"></div>
                    <span className="text-sm">Rejeitadas</span>
                  </div>
                  <Badge variant="secondary">{requisicoesRejeitadas}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                    <span className="text-sm">Rascunhos</span>
                  </div>
                  <Badge variant="secondary">{requisicoesRascunho}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
              <CardDescription>Valores das requisições por status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Aprovado</span>
                  <span className="font-semibold text-success">
                    {formatCurrency(valorTotalGasto)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Pendente</span>
                  <span className="font-semibold text-warning">
                    {formatCurrency(valorTotalPendente)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Rejeitado</span>
                  <span className="font-semibold text-destructive">
                    {formatCurrency(valorTotalRejeitado)}
                  </span>
                </div>
                <div className="border-t pt-4 flex items-center justify-between">
                  <span className="text-sm font-medium">Valor Total Geral</span>
                  <span className="font-bold">
                    {formatCurrency(valorTotalGeral)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Relatórios Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle>Relatórios Disponíveis</CardTitle>
            <CardDescription>Gere relatórios detalhados em diferentes formatos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {relatoriosDisponiveis.map((relatorio, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <relatorio.icone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{relatorio.titulo}</h4>
                      <p className="text-xs text-muted-foreground">{relatorio.descricao}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{relatorio.formato}</Badge>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Gerar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
