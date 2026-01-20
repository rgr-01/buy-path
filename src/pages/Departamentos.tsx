import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Building2, Plus, Search, Edit, Trash2, DollarSign, Users } from "lucide-react";
import { useState } from "react";
import { useDepartamentos, DepartamentoInput } from "@/hooks/useDepartamentos";

export function Departamentos() {
  const { departamentos, loading, createDepartamento, updateDepartamento, deleteDepartamento } = useDepartamentos();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDepartamento, setEditingDepartamento] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<DepartamentoInput>({
    nome: "",
    orcamento_mensal: null,
  });

  const filteredDepartamentos = departamentos.filter(dept =>
    dept.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number | null) => {
    if (value === null) return "—";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const resetForm = () => {
    setFormData({ nome: "", orcamento_mensal: null });
    setEditingDepartamento(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = (dept: typeof departamentos[0]) => {
    setFormData({
      nome: dept.nome,
      orcamento_mensal: dept.orcamento_mensal,
    });
    setEditingDepartamento(dept.id);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.nome.trim()) {
      return;
    }

    if (editingDepartamento) {
      await updateDepartamento(editingDepartamento, formData);
    } else {
      await createDepartamento(formData);
    }
    
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    await deleteDepartamento(id);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-page-title">Departamentos</h1>
            <p className="text-muted-foreground">Gerencie os departamentos da empresa</p>
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
            <h1 className="text-page-title">Departamentos</h1>
            <p className="text-muted-foreground">
              {departamentos.length} departamento{departamentos.length !== 1 ? "s" : ""} cadastrado{departamentos.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={handleOpenCreate}>
                <Plus className="w-4 h-4" />
                Novo Departamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingDepartamento ? "Editar Departamento" : "Cadastrar Novo Departamento"}
                </DialogTitle>
                <DialogDescription>
                  {editingDepartamento 
                    ? "Atualize as informações do departamento"
                    : "Preencha as informações do departamento"
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Departamento *</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Tecnologia da Informação"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orcamento">Orçamento Mensal</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="orcamento"
                      type="number"
                      placeholder="0,00"
                      className="pl-10"
                      value={formData.orcamento_mensal || ""}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        orcamento_mensal: e.target.value ? parseFloat(e.target.value) : null 
                      }))}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco se não houver limite de orçamento
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.nome.trim()}>
                  {editingDepartamento ? "Salvar" : "Cadastrar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar departamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Lista de Departamentos
            </CardTitle>
            <CardDescription>
              Gerencie os departamentos e seus orçamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredDepartamentos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Nenhum departamento encontrado</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm ? "Tente ajustar os filtros de busca" : "Cadastre o primeiro departamento"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Orçamento Mensal</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepartamentos.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-primary" />
                          </div>
                          {dept.nome}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={dept.orcamento_mensal ? "text-foreground" : "text-muted-foreground"}>
                          {formatCurrency(dept.orcamento_mensal)}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(dept.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(dept)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir departamento?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. O departamento "{dept.nome}" será 
                                  permanentemente removido do sistema.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(dept.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
