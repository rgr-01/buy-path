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
import { useState, useEffect } from "react";

interface RelatorioDados {
  totalRequisicoes: number;
  requisicoesAprovadas: number;
  requisicoesPendentes: number;
  requisicoesRejeitadas: number;
  valorTotalGasto: number;
  valorMedioRequisicao: number;
}

export function Relatorios() {
  const [dados, setDados] = useState<RelatorioDados>({
    totalRequisicoes: 0,
    requisicoesAprovadas: 0,
    requisicoesPendentes: 0,
    requisicoesRejeitadas: 0,
    valorTotalGasto: 0,
    valorMedioRequisicao: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setDados({
        totalRequisicoes: 156,
        requisicoesAprovadas: 124,
        requisicoesPendentes: 23,
        requisicoesRejeitadas: 9,
        valorTotalGasto: 45680.50,
        valorMedioRequisicao: 1250.75
      });
      setLoading(false);
    }, 1000);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

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
              <div className="text-2xl font-bold">{dados.totalRequisicoes}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                +12% em relação ao mês anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovadas</CardTitle>
              <BarChart3 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{dados.requisicoesAprovadas}</div>
              <p className="text-xs text-muted-foreground">
                {calcularPercentual(dados.requisicoesAprovadas, dados.totalRequisicoes)}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Activity className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{dados.requisicoesPendentes}</div>
              <p className="text-xs text-muted-foreground">
                {calcularPercentual(dados.requisicoesPendentes, dados.totalRequisicoes)}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(dados.valorTotalGasto)}</div>
              <p className="text-xs text-muted-foreground">
                Média: {formatCurrency(dados.valorMedioRequisicao)}
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
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Aprovadas</span>
                  </div>
                  <Badge variant="secondary">{dados.requisicoesAprovadas}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Pendentes</span>
                  </div>
                  <Badge variant="secondary">{dados.requisicoesPendentes}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Rejeitadas</span>
                  </div>
                  <Badge variant="secondary">{dados.requisicoesRejeitadas}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tendência Mensal</CardTitle>
              <CardDescription>Requisições nos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                <p>Gráfico será implementado em breve</p>
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