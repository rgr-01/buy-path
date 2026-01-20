import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar, 
  Building2, 
  User, 
  FileText, 
  Package,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";

interface RequisicaoItem {
  id: string;
  nome: string;
  descricao?: string;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
}

interface Requisicao {
  id: string;
  codigo: string;
  justificativa: string;
  status: string;
  valor_total: number;
  created_at: string;
  updated_at: string;
  data_aprovacao?: string;
  observacoes_aprovador?: string;
  solicitante?: { nome: string; email: string } | null;
  departamento?: { nome: string } | null;
  aprovador?: { nome: string } | null;
  fornecedor_sugerido?: { nome: string } | null;
  itens?: RequisicaoItem[];
}

interface RequisicaoViewDialogProps {
  requisicao: Requisicao | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequisicaoViewDialog({ requisicao, open, onOpenChange }: RequisicaoViewDialogProps) {
  if (!requisicao) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      rascunho: { className: "bg-muted text-muted-foreground", label: "Rascunho", icon: FileText },
      pendente: { className: "bg-warning-light text-warning-foreground", label: "Pendente", icon: Clock },
      aprovada: { className: "bg-success-light text-success-foreground", label: "Aprovada", icon: CheckCircle2 },
      rejeitada: { className: "bg-destructive-light text-destructive-foreground", label: "Rejeitada", icon: XCircle }
    };

    const config = variants[status as keyof typeof variants] || variants.rascunho;
    const Icon = config.icon;
    
    return (
      <Badge variant="secondary" className={`${config.className} gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Requisição {requisicao.codigo}
            </DialogTitle>
            {getStatusBadge(requisicao.status)}
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Informações Gerais */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Solicitante
              </label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{requisicao.solicitante?.nome || "N/A"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Departamento
              </label>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{requisicao.departamento?.nome || "N/A"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Data de Criação
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {format(new Date(requisicao.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Valor Total
              </label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-bold text-primary">{formatCurrency(requisicao.valor_total)}</span>
              </div>
            </div>

            {requisicao.fornecedor_sugerido && (
              <div className="space-y-1 col-span-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Fornecedor Sugerido
                </label>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{requisicao.fornecedor_sugerido.nome}</span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Justificativa */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Justificativa
            </label>
            <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">
              {requisicao.justificativa}
            </p>
          </div>

          <Separator />

          {/* Itens */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <label className="text-sm font-semibold">
                Itens da Requisição ({requisicao.itens?.length || 0})
              </label>
            </div>
            
            {requisicao.itens && requisicao.itens.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-center">Qtd</TableHead>
                    <TableHead className="text-right">Preço Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requisicao.itens.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.nome}</div>
                          {item.descricao && (
                            <div className="text-xs text-muted-foreground">{item.descricao}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{item.quantidade}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.preco_unitario)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.preco_total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum item adicionado
              </p>
            )}
          </div>

          {/* Informações de Aprovação */}
          {(requisicao.status === 'aprovada' || requisicao.status === 'rejeitada') && (
            <>
              <Separator />
              <div className="space-y-3">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Informações de {requisicao.status === 'aprovada' ? 'Aprovação' : 'Rejeição'}
                </label>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  {requisicao.aprovador && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="text-muted-foreground">Por:</span>{" "}
                        <span className="font-medium">{requisicao.aprovador.nome}</span>
                      </span>
                    </div>
                  )}
                  {requisicao.data_aprovacao && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="text-muted-foreground">Data:</span>{" "}
                        <span className="font-medium">
                          {format(new Date(requisicao.data_aprovacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </span>
                    </div>
                  )}
                  {requisicao.observacoes_aprovador && (
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">Observações:</span>
                      <p className="text-sm mt-1">{requisicao.observacoes_aprovador}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
