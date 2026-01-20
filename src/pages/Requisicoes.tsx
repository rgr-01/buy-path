import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useRequisicoes } from "@/hooks/useRequisicoes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { downloadRequisicaoPDF, generateRelatorioGeralPDF } from "@/utils/pdfGenerator";
import { useNavigate } from "react-router-dom";
import { RequisicaoViewDialog } from "@/components/requisicoes/RequisicaoViewDialog";
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Edit,
  Calendar,
  Building2,
  User,
  FileBarChart,
  Download,
  Send,
  Trash2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Requisicao = ReturnType<typeof useRequisicoes>['minhasRequisicoes'][0];

export function Requisicoes() {
  const { minhasRequisicoes, loading, enviarParaAprovacao, deleteRequisicao } = useRequisicoes();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequisicao, setSelectedRequisicao] = useState<Requisicao | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleViewRequisicao = (requisicao: Requisicao) => {
    setSelectedRequisicao(requisicao);
    setViewDialogOpen(true);
  };

  const filteredRequisicoes = minhasRequisicoes.filter(req => {
    const matchesSearch = req.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.justificativa.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      rascunho: { variant: "secondary" as const, className: "bg-muted text-muted-foreground", label: "Rascunho" },
      pendente: { variant: "secondary" as const, className: "bg-warning-light text-warning-foreground", label: "Pendente" },
      aprovada: { variant: "secondary" as const, className: "bg-success-light text-success-foreground", label: "Aprovada" },
      rejeitada: { variant: "secondary" as const, className: "bg-destructive-light text-destructive-foreground", label: "Rejeitada" }
    };

    const config = variants[status as keyof typeof variants] || variants.rascunho;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleDownloadPDF = async (requisicao: any) => {
    try {
      await downloadRequisicaoPDF(requisicao);
      toast({
        title: "Sucesso",
        description: "PDF gerado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao gerar PDF",
        variant: "destructive",
      });
    }
  };

  const handleDownloadRelatorio = async () => {
    try {
      await generateRelatorioGeralPDF(filteredRequisicoes);
      toast({
        title: "Sucesso",
        description: "Relatório geral gerado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao gerar relatório",
        variant: "destructive",
      });
    }
  };

  const handleEditarRequisicao = (id: string) => {
    navigate(`/editar-requisicao/${id}`);
  };

  const handleEnviarParaAprovacao = async (requisicao: any) => {
    try {
      const { error } = await enviarParaAprovacao(requisicao.id);
      
      if (error) {
        toast({
          title: "Erro ao enviar",
          description: "Não foi possível enviar para aprovação.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Enviado para aprovação",
          description: `Requisição ${requisicao.codigo} enviada para aprovação.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRequisicao = async (requisicao: any) => {
    try {
      const { error } = await deleteRequisicao(requisicao.id);
      
      if (error) {
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir a requisição.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Requisição excluída",
          description: `Requisição ${requisicao.codigo} foi excluída com sucesso.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-2"></div>
            <div className="h-4 bg-muted rounded w-96"></div>
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Minhas Requisições</h1>
            <p className="text-muted-foreground">
              Gerencie suas requisições de compras
            </p>
          </div>
          
          <Button onClick={handleDownloadRelatorio} variant="outline">
            <FileBarChart className="h-4 w-4 mr-2" />
            Relatório Geral
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-gradient-card shadow-soft border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por código ou descrição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="rejeitada">Rejeitada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="bg-gradient-card shadow-soft border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Requisições ({filteredRequisicoes.length})
            </CardTitle>
            <CardDescription>
              Lista completa das suas requisições
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRequisicoes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchTerm || statusFilter !== "all" ? "Nenhuma requisição encontrada" : "Nenhuma requisição criada"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || statusFilter !== "all" 
                    ? "Tente ajustar os filtros de busca" 
                    : "Crie sua primeira requisição de compras"
                  }
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button 
                    className="bg-gradient-primary hover:bg-primary-hover"
                    onClick={() => navigate('/nova-requisicao')}
                  >
                    Criar Nova Requisição
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequisicoes.map((requisicao) => (
                    <TableRow key={requisicao.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{requisicao.codigo}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-48">
                            {requisicao.justificativa}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {format(new Date(requisicao.created_at), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {requisicao.departamento?.nome || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {formatCurrency(requisicao.valor_total)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {requisicao.itens?.length || 0} {requisicao.itens?.length === 1 ? "item" : "itens"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(requisicao.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewRequisicao(requisicao)}
                            title="Visualizar"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownloadPDF(requisicao)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {requisicao.status === 'rascunho' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditarRequisicao(requisicao.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEnviarParaAprovacao(requisicao)}
                                className="text-primary hover:text-primary hover:bg-primary/10"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir requisição?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta ação não pode ser desfeita. A requisição {requisicao.codigo} será permanentemente excluída.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteRequisicao(requisicao)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Excluir
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View Dialog */}
        <RequisicaoViewDialog
          requisicao={selectedRequisicao}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
        />
      </div>
    </AppLayout>
  );
}