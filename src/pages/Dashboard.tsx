import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export function Dashboard() {
  // Mock data - will be replaced with real data from Supabase
  const stats = [
    {
      title: "Total de Requisições",
      value: "147",
      description: "Este mês",
      icon: FileText,
      trend: { value: 12, label: "vs mês anterior" }
    },
    {
      title: "Pendentes de Aprovação",
      value: "23",
      description: "Aguardando revisão",
      icon: Clock,
      variant: "warning" as const,
      trend: { value: -8, label: "vs semana anterior" }
    },
    {
      title: "Aprovadas",
      value: "89",
      description: "Neste mês",
      icon: CheckSquare,
      variant: "success" as const,
      trend: { value: 15, label: "vs mês anterior" }
    },
    {
      title: "Valor Total",
      value: "R$ 45.320",
      description: "Requisições aprovadas",
      icon: DollarSign,
      trend: { value: 7, label: "vs mês anterior" }
    }
  ];

  const recentRequests = [
    {
      id: "REQ-2024-001",
      description: "Material de escritório - Canetas e papel",
      department: "Administrativo",
      value: "R$ 250,00",
      status: "pending",
      date: "2024-01-15"
    },
    {
      id: "REQ-2024-002", 
      description: "Equipamentos de TI - Notebook Dell",
      department: "TI",
      value: "R$ 2.500,00",
      status: "approved",
      date: "2024-01-14"
    },
    {
      id: "REQ-2024-003",
      description: "Material de limpeza",
      department: "Manutenção",
      value: "R$ 180,00",
      status: "rejected",
      date: "2024-01-13"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-warning-light text-warning-foreground">Pendente</Badge>;
      case "approved":
        return <Badge variant="secondary" className="bg-success-light text-success-foreground">Aprovada</Badge>;
      case "rejected":
        return <Badge variant="secondary" className="bg-destructive-light text-destructive-foreground">Rejeitada</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

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
        {stats.map((stat, index) => (
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
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Criar Nova Requisição
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <FileText className="h-4 w-4 mr-2" />
              Ver Todas as Requisições
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <Calendar className="h-4 w-4 mr-2" />
              Agendar Reunião
            </Button>
            <Button variant="outline" className="w-full justify-start" size="lg">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Itens Pendentes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}