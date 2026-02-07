import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Fornecedor = Database['public']['Tables']['fornecedores']['Row'];

interface FornecedorComboboxProps {
  fornecedores: Fornecedor[];
  value: string;
  onChange: (value: string) => void;
  onFornecedorCreated?: () => void;
}

export function FornecedorCombobox({ 
  fornecedores, 
  value, 
  onChange,
  onFornecedorCreated 
}: FornecedorComboboxProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Form fields for new supplier
  const [novoFornecedor, setNovoFornecedor] = useState({
    nome: "",
    cnpj: "",
    email: "",
    telefone: "",
    categoria: "",
  });

  const selectedFornecedor = useMemo(() => 
    fornecedores.find((f) => f.id === value),
    [fornecedores, value]
  );

  const filteredFornecedores = useMemo(() => {
    if (!searchQuery) return fornecedores;
    const query = searchQuery.toLowerCase();
    return fornecedores.filter((f) => 
      f.nome.toLowerCase().includes(query) ||
      (f.categoria && f.categoria.toLowerCase().includes(query)) ||
      (f.cnpj && f.cnpj.includes(query))
    );
  }, [fornecedores, searchQuery]);

  const showCreateOption = searchQuery.trim() && 
    !filteredFornecedores.some(f => f.nome.toLowerCase() === searchQuery.toLowerCase());

  const handleCreateFornecedor = async () => {
    if (!novoFornecedor.nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome do fornecedor é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .insert({
          nome: novoFornecedor.nome.trim(),
          cnpj: novoFornecedor.cnpj.trim() || null,
          email: novoFornecedor.email.trim() || null,
          telefone: novoFornecedor.telefone.trim() || null,
          categoria: novoFornecedor.categoria.trim() || null,
          ativo: true,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Fornecedor cadastrado",
        description: `${novoFornecedor.nome} foi adicionado com sucesso.`,
      });

      // Select the newly created supplier
      onChange(data.id);
      
      // Reset form and close dialogs
      setNovoFornecedor({ nome: "", cnpj: "", email: "", telefone: "", categoria: "" });
      setDialogOpen(false);
      setOpen(false);
      setSearchQuery("");
      
      // Notify parent to refresh suppliers list
      onFornecedorCreated?.();
    } catch (error) {
      console.error('Error creating fornecedor:', error);
      toast({
        title: "Erro ao cadastrar",
        description: "Não foi possível cadastrar o fornecedor. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const openCreateDialog = () => {
    setNovoFornecedor({
      ...novoFornecedor,
      nome: searchQuery.trim(),
    });
    setDialogOpen(true);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {selectedFornecedor ? (
              <span className="truncate">
                {selectedFornecedor.nome}
                {selectedFornecedor.categoria && (
                  <span className="text-muted-foreground ml-1">
                    - {selectedFornecedor.categoria}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-muted-foreground">
                Digite ou selecione um fornecedor (opcional)
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Buscar fornecedor..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                {searchQuery.trim() ? (
                  <div className="py-3 px-2 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Nenhum fornecedor encontrado
                    </p>
                    <Button 
                      size="sm" 
                      onClick={openCreateDialog}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Cadastrar "{searchQuery}"
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-3">
                    Digite para buscar ou cadastrar
                  </p>
                )}
              </CommandEmpty>
              
              {filteredFornecedores.length > 0 && (
                <CommandGroup heading="Fornecedores">
                  {filteredFornecedores.map((fornecedor) => (
                    <CommandItem
                      key={fornecedor.id}
                      value={fornecedor.id}
                      onSelect={() => {
                        onChange(fornecedor.id === value ? "" : fornecedor.id);
                        setOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === fornecedor.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span>{fornecedor.nome}</span>
                        {fornecedor.categoria && (
                          <span className="text-xs text-muted-foreground">
                            {fornecedor.categoria}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {showCreateOption && filteredFornecedores.length > 0 && (
                <CommandSeparator />
              )}
              
              {showCreateOption && (
                <CommandGroup>
                  <CommandItem
                    onSelect={openCreateDialog}
                    className="cursor-pointer"
                  >
                    <Plus className="mr-2 h-4 w-4 text-primary" />
                    <span>
                      Cadastrar novo fornecedor: <strong>"{searchQuery}"</strong>
                    </span>
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Dialog para cadastrar novo fornecedor */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Fornecedor</DialogTitle>
            <DialogDescription>
              Preencha os dados do fornecedor. Apenas o nome é obrigatório.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="novo-nome">Nome *</Label>
              <Input
                id="novo-nome"
                value={novoFornecedor.nome}
                onChange={(e) => setNovoFornecedor({ ...novoFornecedor, nome: e.target.value })}
                placeholder="Nome do fornecedor"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="novo-cnpj">CNPJ</Label>
                <Input
                  id="novo-cnpj"
                  value={novoFornecedor.cnpj}
                  onChange={(e) => setNovoFornecedor({ ...novoFornecedor, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="novo-categoria">Categoria</Label>
                <Input
                  id="novo-categoria"
                  value={novoFornecedor.categoria}
                  onChange={(e) => setNovoFornecedor({ ...novoFornecedor, categoria: e.target.value })}
                  placeholder="Ex: Tecnologia"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="novo-email">Email</Label>
                <Input
                  id="novo-email"
                  type="email"
                  value={novoFornecedor.email}
                  onChange={(e) => setNovoFornecedor({ ...novoFornecedor, email: e.target.value })}
                  placeholder="contato@empresa.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="novo-telefone">Telefone</Label>
                <Input
                  id="novo-telefone"
                  value={novoFornecedor.telefone}
                  onChange={(e) => setNovoFornecedor({ ...novoFornecedor, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={creating}>
              Cancelar
            </Button>
            <Button onClick={handleCreateFornecedor} disabled={creating}>
              {creating ? "Cadastrando..." : "Cadastrar Fornecedor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
