import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plus, 
  Trash2, 
  Upload, 
  Save, 
  Send,
  Calculator,
  Building2,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ItemRequisicao {
  id: string;
  nome: string;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  precoTotal: number;
}

export function NovaRequisicao() {
  const { toast } = useToast();
  const [departamento, setDepartamento] = useState("");
  const [fornecedor, setFornecedor] = useState("");
  const [justificativa, setJustificativa] = useState("");
  const [itens, setItens] = useState<ItemRequisicao[]>([
    {
      id: "1",
      nome: "",
      descricao: "",
      quantidade: 1,
      precoUnitario: 0,
      precoTotal: 0
    }
  ]);

  const adicionarItem = () => {
    const novoItem: ItemRequisicao = {
      id: Date.now().toString(),
      nome: "",
      descricao: "",
      quantidade: 1,
      precoUnitario: 0,
      precoTotal: 0
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
        if (campo === 'quantidade' || campo === 'precoUnitario') {
          itemAtualizado.precoTotal = itemAtualizado.quantidade * itemAtualizado.precoUnitario;
        }
        
        return itemAtualizado;
      }
      return item;
    }));
  };

  const calcularTotal = () => {
    return itens.reduce((total, item) => total + item.precoTotal, 0);
  };

  const salvarRascunho = () => {
    toast({
      title: "Rascunho salvo",
      description: "Sua requisição foi salva como rascunho.",
    });
  };

  const enviarRequisicao = () => {
    // Validação básica
    if (!departamento || !fornecedor || !justificativa) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (itens.some(item => !item.nome || item.quantidade <= 0)) {
      toast({
        title: "Erro de validação",
        description: "Por favor, preencha todos os itens corretamente.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Requisição enviada",
      description: "Sua requisição foi enviada para aprovação.",
    });
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
            <Button variant="outline" onClick={salvarRascunho}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Rascunho
            </Button>
            <Button onClick={enviarRequisicao} className="bg-gradient-primary hover:bg-primary-hover">
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
                      value="REQ-2024-004" 
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
                      value="João Silva" 
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
                        <SelectItem value="ti">Tecnologia da Informação</SelectItem>
                        <SelectItem value="rh">Recursos Humanos</SelectItem>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="operacoes">Operações</SelectItem>
                        <SelectItem value="administrativo">Administrativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="fornecedor">Fornecedor Sugerido *</Label>
                  <Select value={fornecedor} onValueChange={setFornecedor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um fornecedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fornecedor-a">Fornecedor A - Material de Escritório</SelectItem>
                      <SelectItem value="fornecedor-b">Fornecedor B - Equipamentos de TI</SelectItem>
                      <SelectItem value="fornecedor-c">Fornecedor C - Móveis</SelectItem>
                      <SelectItem value="fornecedor-d">Fornecedor D - Serviços</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Itens da Requisição */}
            <Card className="bg-gradient-card shadow-soft border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      Itens da Requisição
                    </CardTitle>
                    <CardDescription>
                      Adicione os itens que deseja requisitar
                    </CardDescription>
                  </div>
                  <Button onClick={adicionarItem} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {itens.map((item, index) => (
                    <div key={item.id} className="p-4 border border-border rounded-lg bg-card/50">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary">Item {index + 1}</Badge>
                        {itens.length > 1 && (
                          <Button
                            onClick={() => removerItem(item.id)}
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid gap-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Nome do Item *</Label>
                            <Input
                              value={item.nome}
                              onChange={(e) => atualizarItem(item.id, 'nome', e.target.value)}
                              placeholder="Ex: Notebook Dell Inspiron"
                            />
                          </div>
                          <div>
                            <Label>Quantidade *</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantidade}
                              onChange={(e) => atualizarItem(item.id, 'quantidade', parseInt(e.target.value) || 1)}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label>Descrição</Label>
                          <Textarea
                            value={item.descricao}
                            onChange={(e) => atualizarItem(item.id, 'descricao', e.target.value)}
                            placeholder="Descrição detalhada do item"
                            rows={2}
                          />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label>Preço Unitário</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.precoUnitario}
                              onChange={(e) => atualizarItem(item.id, 'precoUnitario', parseFloat(e.target.value) || 0)}
                              placeholder="0,00"
                            />
                          </div>
                          <div>
                            <Label>Preço Total</Label>
                            <Input
                              value={`R$ ${item.precoTotal.toFixed(2).replace('.', ',')}`}
                              disabled
                              className="bg-muted font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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
                  />
                </div>

                <div>
                  <Label>Anexos</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Arraste arquivos aqui ou clique para fazer upload
                    </p>
                    <Button variant="outline" size="sm">
                      Selecionar Arquivos
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      PDF, JPG, PNG - Máximo 10MB por arquivo
                    </p>
                  </div>
                </div>
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
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantidade total:</span>
                    <span className="font-medium">
                      {itens.reduce((total, item) => total + item.quantidade, 0)}
                    </span>
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
                  <Badge variant="secondary" className="bg-warning-light text-warning-foreground">
                    Rascunho
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Próximos passos:</h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Revisar todos os itens</li>
                    <li>• Anexar cotações (opcional)</li>
                    <li>• Enviar para aprovação</li>
                    <li>• Aguardar análise do gestor</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}