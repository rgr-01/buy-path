import { useState, useCallback } from "react";
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
import { FornecedorCombobox } from "@/components/requisicoes/FornecedorCombobox";
import { 
  Plus, 
  Trash2, 
  Upload, 
  Save, 
  Send,
  Calculator,
  Building2,
  FileText,
  Paperclip
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

interface ItemRequisicao {
  id: string;
  nome: string;
  descricao: string;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
}

export function NovaRequisicao() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { departamentos, fornecedores, createRequisicao, enviarParaAprovacao, refetch } = useRequisicoes();
  
  // Função para atualizar a lista de fornecedores após cadastrar um novo
  const handleFornecedorCreated = useCallback(() => {
    refetch();
  }, [refetch]);
  const [departamento, setDepartamento] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [anexos, setAnexos] = useState<{ name: string; url: string; size: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [itens, setItens] = useState<ItemRequisicao[]>([
    {
      id: "1",
      nome: "",
      descricao: "",
      quantidade: 1,
      preco_unitario: 0,
      preco_total: 0
    }
  ]);

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

  const salvarRascunho = async () => {
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
      const { error } = await createRequisicao(
        {
          departamento_id: departamento,
          fornecedor_sugerido_id: fornecedor || undefined,
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
          description: "Não foi possível salvar o rascunho.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Rascunho salvo",
          description: "Sua requisição foi salva como rascunho.",
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
      const { data, error } = await createRequisicao(
        {
          departamento_id: departamento,
          fornecedor_sugerido_id: fornecedor || undefined,
          justificativa,
        },
        itens.filter(item => item.nome.trim()).map(item => ({
          nome: item.nome,
          descricao: item.descricao || null,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
        }))
      );

      if (error || !data) {
        toast({
          title: "Erro ao criar",
          description: "Não foi possível criar a requisição.",
          variant: "destructive",
        });
        return;
      }

      // Enviar para aprovação
      const { error: enviarError } = await enviarParaAprovacao(data.id);
      
      if (enviarError) {
        toast({
          title: "Erro ao enviar",
          description: "Requisição criada mas não foi possível enviar para aprovação.",
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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Nova Requisição</h1>
            <p className="text-muted-foreground">
              Criar uma nova requisição de compras
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={salvarRascunho}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Rascunho
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
                      value="Auto-gerado" 
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                  <div>
                    <Label htmlFor="data">Data</Label>
                    <Input 
                      id="data" 
                      value={new Date().toLocaleDateString('pt-BR')} 
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
                  <FornecedorCombobox
                    fornecedores={fornecedores}
                    value={fornecedor}
                    onChange={setFornecedor}
                    onFornecedorCreated={handleFornecedorCreated}
                  />
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
                  Adicione os itens que precisam ser comprados
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
                    Novo Rascunho
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