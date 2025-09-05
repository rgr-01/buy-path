import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin,
  Star,
  Edit,
  Trash2,
  ExternalLink
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  categoria: string;
  rating: number;
  status: 'ativo' | 'inativo';
  observacoes?: string;
}

export function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // Simular carregamento de dados
    setTimeout(() => {
      setFornecedores([
        {
          id: '1',
          nome: 'Tech Solutions Ltda',
          cnpj: '12.345.678/0001-90',
          email: 'contato@techsolutions.com.br',
          telefone: '(11) 98765-4321',
          endereco: 'Rua das Flores, 123 - São Paulo/SP',
          categoria: 'Tecnologia',
          rating: 4.8,
          status: 'ativo'
        },
        {
          id: '2',
          nome: 'Papelaria Central',
          cnpj: '98.765.432/0001-10',
          email: 'vendas@papelariacentral.com.br',
          telefone: '(11) 91234-5678',
          endereco: 'Av. Paulista, 456 - São Paulo/SP',
          categoria: 'Material de Escritório',
          rating: 4.2,
          status: 'ativo'
        },
        {
          id: '3',
          nome: 'Móveis & Cia',
          cnpj: '11.222.333/0001-44',
          email: 'comercial@moveisecia.com.br',
          telefone: '(11) 95555-1111',
          endereco: 'Rua dos Móveis, 789 - São Paulo/SP',
          categoria: 'Mobiliário',
          rating: 3.9,
          status: 'inativo'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredFornecedores = fornecedores.filter(fornecedor =>
    fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fornecedor.cnpj.includes(searchTerm)
  );

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
            <p className="text-muted-foreground">Gerencie os fornecedores cadastrados</p>
          </div>
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Fornecedores</h1>
            <p className="text-muted-foreground">
              {fornecedores.length} fornecedores cadastrados
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Fornecedor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Fornecedor</DialogTitle>
                <DialogDescription>
                  Preencha as informações do fornecedor
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Empresa</Label>
                    <Input id="nome" placeholder="Ex: Tech Solutions Ltda" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input id="cnpj" placeholder="00.000.000/0000-00" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" placeholder="contato@empresa.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" placeholder="(11) 99999-9999" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input id="endereco" placeholder="Rua, número - Cidade/UF" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input id="categoria" placeholder="Ex: Tecnologia, Material de Escritório" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea id="observacoes" placeholder="Informações adicionais..." />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setDialogOpen(false)}>
                  Cadastrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar fornecedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Fornecedores Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFornecedores.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Nenhum fornecedor encontrado</h3>
                  <p className="text-muted-foreground text-center">
                    {searchTerm ? 'Tente ajustar os filtros de busca' : 'Cadastre o primeiro fornecedor'}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredFornecedores.map((fornecedor) => (
              <Card key={fornecedor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{fornecedor.nome}</CardTitle>
                      <CardDescription>{formatCNPJ(fornecedor.cnpj)}</CardDescription>
                    </div>
                    <Badge 
                      variant={fornecedor.status === 'ativo' ? 'default' : 'secondary'}
                    >
                      {fornecedor.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{fornecedor.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{fornecedor.telefone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{fornecedor.endereco}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{fornecedor.categoria}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {getRatingStars(fornecedor.rating)}
                        <span className="text-xs text-muted-foreground ml-1">
                          {fornecedor.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}