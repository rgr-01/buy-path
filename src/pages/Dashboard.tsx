import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRequisicoes } from "@/hooks/useRequisicoes";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Clock, 
  CheckSquare, 
  AlertTriangle,
  Plus,
  TrendingUp,
  Calendar,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function Dashboard() {
  const { stats, minhasRequisicoes, requisicoesParaAprovar, loading } = useRequisicoes();
  const { profile, isAprovador } = useAuth();
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Mock data - will be replaced with real data from Supabase
  const statsData = [
    {
      title: "Total de Requisições",
      value: stats.total.toString(),
      description: "Este mês",
      icon: FileText,
      trend: { value: 12, label: "vs mês anterior" }
    },
    {
      title: isAprovador ? "Para Aprovar" : "Pendentes de Aprovação",
      value: isAprovador ? requisicoesParaAprovar.length.toString() : stats.pendentes.toString(),
      description: "Aguardando revisão",
      icon: Clock,
      variant: "warning" as const,
      trend: { value: -8, label: "vs semana anterior" }
    },
    {
      title: "Aprovadas",
      value: stats.aprovadas.toString(),
      description: "Neste mês",
      icon: CheckSquare,
      variant: "success" as const,
      trend: { value: 15, label: "vs mês anterior" }
    },
    {
      title: "Valor Total",
      value: formatCurrency(stats.valorTotal),
      description: "Requisições aprovadas",
      icon: DollarSign,
      trend: { value: 7, label: "vs mês anterior" }
    }
  ];

  const recentRequests = minhasRequisicoes.slice(0, 3).map(req => ({
    id: req.codigo,
    description: req.justificativa.length > 50 ? req.justificativa.substring(0, 50) + "..." : req.justificativa,
    department: req.departamento?.nome || "N/A",
    value: formatCurrency(req.valor_total),
    status: req.status,
    date: format(new Date(req.created_at), "dd/MM/yyyy", { locale: ptBR })
  }));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pendente":
        return <Badge variant="secondary" className="bg-warning-light text-warning-foreground">Pendente</Badge>;
      case "aprovada":
        return <Badge variant="secondary" className="bg-success-light text-success-foreground">Aprovada</Badge>;
      case "rejeitada":
        return <Badge variant="secondary" className="bg-destructive-light text-destructive-foreground">Rejeitada</Badge>;
      case "rascunho":
        return <Badge variant="secondary" className="bg-muted text-muted-foreground">Rascunho</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded w-64"></div>
          <div className="h-4 bg-muted rounded w-96"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded"></div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2 h-96 bg-muted rounded"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das suas requisições de compras
          </p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover shadow-medium hover:shadow-large transition-bounce">
          <Plus className="h-4 w-4 mr-2" />
          Nova Requisição
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Requests */}
        <Card className="lg:col-span-2 bg-gradient-card shadow-soft border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Requisições Recentes
            </CardTitle>
            <CardDescription>
              Suas últimas requisições de compras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-smooth">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{request.id}</span>
                      {getStatusBadge(request.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{request.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{request.department}</span>
                      <span>•</span>
                      <span>{request.date}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">{request.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-gradient-card shadow-soft border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" size="lg" onClick={() => navigate('/nova-requisicao')}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Nova Requisição
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg" onClick={() => navigate('/requisicoes')}>
              <FileText className="h-4 w-4 mr-2" />
              Ver Todas as Requisições
            </Button>
            {isAprovador && (
              <Button variant="outline" className="w-full justify-start" size="lg" onClick={() => navigate('/pendentes')}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Requisições Pendentes
              </Button>
            )}
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Calendar className="h-4 w-4 mr-2" />
              Agendar Reunião
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}