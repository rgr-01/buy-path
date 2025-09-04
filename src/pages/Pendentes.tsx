import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useRequisicoes } from "@/hooks/useRequisicoes";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  CheckSquare, 
  X, 
  Eye, 
  Calendar,
  Building2,
  User,
  DollarSign,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

type Requisicao = ReturnType<typeof useRequisicoes>['requisicoesParaAprovar'][0];

export function Pendentes() {
  const { requisicoesParaAprovar, aprovarRequisicao, rejeitarRequisicao, loading } = useRequisicoes();
  const { isAprovador } = useAuth();
  const { toast } = useToast();
  const [selectedRequisicao, setSelectedRequisicao] = useState<Requisicao | null>(null);
  const [observacoes, setObservacoes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleAprovar = async (requisicao: Requisicao) => {
    setActionLoading(true);
    try {
      const { error } = await aprovarRequisicao(requisicao.id, observacoes);
      
      if (error) {
        toast({
          title: "Erro ao aprovar",
          description: "Não foi possível aprovar a requisição.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Requisição aprovada!",
          description: `A requisição ${requisicao.codigo} foi aprovada com sucesso.`,
        });
        setSelectedRequisicao(null);
        setObservacoes("");
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejeitar = async (requisicao: Requisicao) => {
    if (!observacoes.trim()) {
      toast({
        title: "Observações obrigatórias",
        description: "É necessário informar o motivo da rejeição.",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      const { error } = await rejeitarRequisicao(requisicao.id, observacoes);
      
      if (error) {
        toast({
          title: "Erro ao rejeitar",
          description: "Não foi possível rejeitar a requisição.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Requisição rejeitada",
          description: `A requisição ${requisicao.codigo} foi rejeitada.`,
        });
        setSelectedRequisicao(null);
        setObservacoes("");
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (!isAprovador) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <X className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Requisições Pendentes</h1>
            <p className="text-muted-foreground">
              Analise e aprove as requisições de compras
            </p>
          </div>
          <Badge variant="secondary" className="bg-warning-light text-warning-foreground text-lg px-4 py-2">
            <Clock className="h-4 w-4 mr-2" />
            {requisicoesParaAprovar.length} pendente{requisicoesParaAprovar.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Results */}
        <Card className="bg-gradient-card shadow-soft border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Aguardando Aprovação
            </CardTitle>
            <CardDescription>
              Requisições que precisam da sua análise
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requisicoesParaAprovar.length === 0 ? (
              <div className="text-center py-12">
                <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma requisição pendente
                </h3>
                <p className="text-muted-foreground">
                  Todas as requisições foram processadas!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requisicoesParaAprovar.map((requisicao) => (
                  <Card key={requisicao.id} className="border border-warning/20 bg-warning-light/10">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-4">
                            <div>
                              <h3 className="font-semibold text-lg">{requisicao.codigo}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  {requisicao.solicitante?.nome}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Building2 className="h-4 w-4" />
                                  {requisicao.departamento?.nome}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  {format(new Date(requisicao.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-card/50 rounded-lg p-4">
                            <h4 className="font-medium mb-2">Justificativa:</h4>
                            <p className="text-sm text-muted-foreground">{requisicao.justificativa}</p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-primary" />
                              <span className="font-semibold text-lg">
                                {formatCurrency(requisicao.valor_total)}
                              </span>
                              <span className="text-muted-foreground text-sm ml-2">
                                ({requisicao.itens?.length || 0} {requisicao.itens?.length === 1 ? "item" : "itens"})
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-6">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedRequisicao(requisicao)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <FileText className="h-5 w-5 text-primary" />
                                  Detalhes da Requisição - {selectedRequisicao?.codigo}
                                </DialogTitle>
                                <DialogDescription>
                                  Analise todos os detalhes antes de aprovar ou rejeitar
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedRequisicao && (
                                <div className="space-y-6">
                                  {/* Basic Info */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-sm font-medium">Solicitante</Label>
                                      <p className="text-sm text-muted-foreground">{selectedRequisicao.solicitante?.nome}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Departamento</Label>
                                      <p className="text-sm text-muted-foreground">{selectedRequisicao.departamento?.nome}</p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Data de Criação</Label>
                                      <p className="text-sm text-muted-foreground">
                                        {format(new Date(selectedRequisicao.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                      </p>
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium">Fornecedor Sugerido</Label>
                                      <p className="text-sm text-muted-foreground">{selectedRequisicao.fornecedor_sugerido?.nome || "N/A"}</p>
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Items */}
                                  <div>
                                    <Label className="text-sm font-medium mb-3 block">Itens Solicitados</Label>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Item</TableHead>
                                          <TableHead>Qtd</TableHead>
                                          <TableHead>Preço Unit.</TableHead>
                                          <TableHead>Total</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {selectedRequisicao.itens?.map((item) => (
                                          <TableRow key={item.id}>
                                            <TableCell>
                                              <div>
                                                <div className="font-medium">{item.nome}</div>
                                                {item.descricao && (
                                                  <div className="text-sm text-muted-foreground">{item.descricao}</div>
                                                )}
                                              </div>
                                            </TableCell>
                                            <TableCell>{item.quantidade}</TableCell>
                                            <TableCell>{formatCurrency(item.preco_unitario)}</TableCell>
                                            <TableCell className="font-medium">{formatCurrency(item.preco_total)}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                    <div className="flex justify-end mt-4 p-4 bg-muted/50 rounded-lg">
                                      <div className="text-lg font-bold">
                                        Total: {formatCurrency(selectedRequisicao.valor_total)}
                                      </div>
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Justification */}
                                  <div>
                                    <Label className="text-sm font-medium mb-2 block">Justificativa</Label>
                                    <div className="bg-muted/50 rounded-lg p-4">
                                      <p className="text-sm">{selectedRequisicao.justificativa}</p>
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* Actions */}
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="observacoes">Observações (opcional para aprovação, obrigatório para rejeição)</Label>
                                      <Textarea
                                        id="observacoes"
                                        value={observacoes}
                                        onChange={(e) => setObservacoes(e.target.value)}
                                        placeholder="Adicione suas observações sobre esta requisição..."
                                        rows={3}
                                      />
                                    </div>

                                    <div className="flex justify-end gap-3">
                                      <Button
                                        variant="outline"
                                        onClick={() => handleRejeitar(selectedRequisicao)}
                                        disabled={actionLoading}
                                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        Rejeitar
                                      </Button>
                                      <Button
                                        onClick={() => handleAprovar(selectedRequisicao)}
                                        disabled={actionLoading}
                                        className="bg-success hover:bg-success/90 text-success-foreground"
                                      >
                                        <CheckSquare className="h-4 w-4 mr-2" />
                                        Aprovar
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}