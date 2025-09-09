import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useRequisicoes } from "@/hooks/useRequisicoes";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileUpload } from "@/components/forms/FileUpload";
import { 
  Plus, 
  Trash2, 
  Upload, 
  Save, 
  Send,
  Calculator,
  Building2,
  FileText,
  Paperclip,
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useParams } from "react-router-dom";

interface ItemRequisicao {
  id: string;
  nome: string;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
}

export function EditarRequisicao() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const { profile } = useAuth();
  const { requisicoes, departamentos, fornecedores, updateRequisicao, enviarParaAprovacao } = useRequisicoes();
  
  const [loading, setLoading] = useState(false);
  const [requisicao, setRequisicao] = useState<any>(null);
  const [departamento, setDepartamento] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [anexos, setAnexos] = useState<{ name: string; url: string; size: number }[]>([]);
  const [itens, setItens] = useState<ItemRequisicao[]>([]);

  useEffect(() => {
    if (id && requisicoes.length > 0) {
      const req = requisicoes.find(r => r.id === id);
      if (req) {
        setRequisicao(req);
        setDepartamento(req.departamento_id || "");
        setFornecedor(req.fornecedor_sugerido_id || "");
        setJustificativa(req.justificativa || "");
        
        // Carregar itens existentes
        if (req.itens && req.itens.length > 0) {
          setItens(req.itens.map((item: any) => ({
            id: item.id || Date.now().toString(),
            nome: item.nome || "",
            descricao: item.descricao || "",
            quantidade: item.quantidade || 1,
            preco_unitario: item.preco_unitario || 0,
            preco_total: item.preco_total || (item.quantidade * item.preco_unitario)
          })));
        } else {
          // Se não há itens, inicializar com um item vazio
          setItens([{
            id: "1",
            nome: "",
            descricao: "",
            quantidade: 1,
            preco_unitario: 0,
            preco_total: 0
          }]);
        }
      } else {
        toast({
          title: "Erro",
          description: "Requisição não encontrada.",
          variant: "destructive",
        });
        navigate('/requisicoes');
      }
    }
  }, [id, requisicoes, navigate, toast]);

  // Verificar se a requisição pode ser editada
  if (requisicao && requisicao.status !== 'rascunho') {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Requisição não pode ser editada
            </h3>
            <p className="text-muted-foreground mb-4">
              Apenas requisições em rascunho podem ser editadas
            </p>
            <Button variant="outline" onClick={() => navigate('/requisicoes')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Requisições
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const adicionarItem = () => {
    const novoItem: ItemRequisicao = {
      id: Date.now().toString(),
      nome: "",
      descricao: "",
      quantidade: 1,
      preco_unitario: 0,
      preco_total: 0
    };
    setItens([...itens, novoItem]);
  };

  const removerItem = (id: string) => {
    if (itens.length > 1) {
      setItens(itens.filter(item => item.id !== id));
    }
  };

  const atualizarItem = (id: string, campo: keyof ItemRequisicao, valor: any) => {
    setItens(itens.map(item => {
      if (item.id === id) {
        const itemAtualizado = { ...item, [campo]: valor };
        
        // Recalcular preço total se quantidade ou preço unitário mudou
        if (campo === 'quantidade' || campo === 'preco_unitario') {
          itemAtualizado.preco_total = itemAtualizado.quantidade * itemAtualizado.preco_unitario;
        }
        
        return itemAtualizado;
      }
      return item;
    }));
  };

  const calcularTotal = () => {
    return itens.reduce((total, item) => total + item.preco_total, 0);
  };

  const salvarAlteracoes = async () => {
    if (!departamento || !justificativa.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha departamento e justificativa.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await updateRequisicao(
        id!,
        {
          departamento_id: departamento,
          fornecedor_sugerido_id: fornecedor || null,
          justificativa,
        },
        itens.filter(item => item.nome.trim()).map(item => ({
          nome: item.nome,
          descricao: item.descricao || null,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
        }))
      );

      if (error) {
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar as alterações.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Alterações salvas",
          description: "Sua requisição foi atualizada com sucesso.",
        });
        navigate('/requisicoes');
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const enviarRequisicao = async () => {
    // Validação básica
    if (!departamento || !justificativa.trim()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (itens.some(item => !item.nome.trim() || item.quantidade <= 0)) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os itens corretamente.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Primeiro salvar as alterações
      const { error: updateError } = await updateRequisicao(
        id!,
        {
          departamento_id: departamento,
          fornecedor_sugerido_id: fornecedor || null,
          justificativa,
        },
        itens.filter(item => item.nome.trim()).map(item => ({
          nome: item.nome,
          descricao: item.descricao || null,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
        }))
      );

      if (updateError) {
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar as alterações.",
          variant: "destructive",
        });
        return;
      }

      // Enviar para aprovação
      const { error: enviarError } = await enviarParaAprovacao(id!);
      
      if (enviarError) {
        toast({
          title: "Erro ao enviar",
          description: "Alterações salvas mas não foi possível enviar para aprovação.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Requisição enviada",
          description: "Sua requisição foi enviada para aprovação.",
        });
        navigate('/requisicoes');
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!requisicao) {
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
            <div className="flex items-center gap-4 mb-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/requisicoes')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Editar Requisição</h1>
            <p className="text-muted-foreground">
              Código: {requisicao.codigo}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={salvarAlteracoes}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
            <Button 
              onClick={enviarRequisicao} 
              className="bg-gradient-primary hover:bg-primary-hover"
              disabled={loading}
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar para Aprovação
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Formulário Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações Básicas */}
            <Card className="bg-gradient-card shadow-soft border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Informações Básicas
                </CardTitle>
                <CardDescription>
                  Dados gerais da requisição
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="requisicao-id">ID da Requisição</Label>
                    <Input 
                      id="requisicao-id" 
                      value={requisicao.codigo} 
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="data">Data</Label>
                    <Input 
                      id="data" 
                      value={new Date(requisicao.created_at).toLocaleDateString('pt-BR')} 
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="solicitante">Solicitante</Label>
                    <Input 
                      id="solicitante" 
                      value={profile?.nome || "Carregando..."}
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="departamento">Departamento *</Label>
                    <Select value={departamento} onValueChange={setDepartamento}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {departamentos.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="fornecedor">Fornecedor Sugerido</Label>
                  <Select value={fornecedor} onValueChange={setFornecedor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um fornecedor (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {fornecedores.map((forn) => (
                        <SelectItem key={forn.id} value={forn.id}>
                          {forn.nome} {forn.categoria && `- ${forn.categoria}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Informações Adicionais */}
            <Card className="bg-gradient-card shadow-soft border-border">
              <CardHeader>
                <CardTitle>Informações Adicionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="justificativa">Justificativa *</Label>
                  <Textarea
                    id="justificativa"
                    value={justificativa}
                    onChange={(e) => setJustificativa(e.target.value)}
                    placeholder="Explique a necessidade desta compra..."
                    rows={4}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Itens da Requisição */}
            <Card className="bg-gradient-card shadow-soft border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Itens da Requisição
                </CardTitle>
                <CardDescription>
                  Edite os itens que precisam ser comprados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {itens.map((item, index) => (
                    <Card key={item.id} className="border border-border/50">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-4">
                          <Badge variant="outline">Item {index + 1}</Badge>
                          {itens.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removerItem(item.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid gap-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`nome-${item.id}`}>Nome do Item *</Label>
                              <Input
                                id={`nome-${item.id}`}
                                value={item.nome}
                                onChange={(e) => atualizarItem(item.id, 'nome', e.target.value)}
                                placeholder="Ex: Notebook Dell"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`quantidade-${item.id}`}>Quantidade *</Label>
                              <Input
                                id={`quantidade-${item.id}`}
                                type="number"
                                min="1"
                                value={item.quantidade}
                                onChange={(e) => atualizarItem(item.id, 'quantidade', parseInt(e.target.value) || 1)}
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor={`descricao-${item.id}`}>Descrição</Label>
                            <Textarea
                              id={`descricao-${item.id}`}
                              value={item.descricao}
                              onChange={(e) => atualizarItem(item.id, 'descricao', e.target.value)}
                              placeholder="Descrição detalhada do item..."
                              rows={2}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`preco-unitario-${item.id}`}>Preço Unitário (R$)</Label>
                              <Input
                                id={`preco-unitario-${item.id}`}
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.preco_unitario}
                                onChange={(e) => atualizarItem(item.id, 'preco_unitario', parseFloat(e.target.value) || 0)}
                                placeholder="0,00"
                              />
                            </div>
                            <div>
                              <Label>Preço Total (R$)</Label>
                              <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-sm font-medium">
                                R$ {item.preco_total.toFixed(2).replace('.', ',')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={adicionarItem}
                  className="w-full border-dashed border-2 hover:border-primary hover:text-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Item
                </Button>
              </CardContent>
            </Card>

            {/* Anexos */}
            <Card className="bg-gradient-card shadow-soft border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  Anexos
                </CardTitle>
                <CardDescription>
                  Anexe documentos, cotações ou arquivos relacionados à requisição
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  onFilesChange={setAnexos}
                  existingFiles={anexos}
                  maxFiles={5}
                  maxSize={10}
                />
              </CardContent>
            </Card>
          </div>

          {/* Resumo */}
          <div className="space-y-6">
            <Card className="bg-gradient-card shadow-soft border-border sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Resumo da Requisição
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total de itens:</span>
                    <span className="font-medium">{itens.length}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Valor Total:</span>
                    <span className="font-bold text-lg text-primary">
                      R$ {calcularTotal().toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-4">
                  <h4 className="font-medium text-sm">Status:</h4>
                  <Badge variant="secondary" className="bg-muted text-muted-foreground">
                    {requisicao.status === 'rascunho' ? 'Rascunho' : requisicao.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}