import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Users, Shield, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const userSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  departamento: z.string().optional(),
  cargo: z.string().optional(),
  role: z.enum(['solicitante', 'aprovador', 'admin']),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres').optional().or(z.literal('')),
});

type UserForm = z.infer<typeof userSchema>;

export default function AdminUsuarios() {
  const { user, profile, isAdmin } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const { toast } = useToast();

  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nome: '',
      email: '',
      departamento: '',
      cargo: '',
      role: 'solicitante',
      senha: '',
    },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UserForm) => {
    try {
      if (editingUser) {
        // Update existing user profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            nome: data.nome,
            departamento: data.departamento,
            cargo: data.cargo,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingUser.id);

        if (updateError) throw updateError;

        // Update password if provided
        if (data.senha && data.senha.trim() !== '') {
          const { error: passwordError } = await supabase.auth.admin.updateUserById(
            editingUser.user_id,
            { password: data.senha }
          );

          if (passwordError) throw passwordError;
        }

        // Update role in user_roles table (server-side validation via RLS)
        // First delete existing role
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', editingUser.user_id);

        // Then insert new role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: editingUser.user_id,
            role: data.role,
          });

        if (roleError) throw roleError;

        toast({
          title: "Sucesso",
          description: data.senha ? "Usuário e senha atualizados com sucesso" : "Usuário atualizado com sucesso",
        });
      } else {
        // Create new user via auth
        const senha = data.senha && data.senha.trim() !== '' ? data.senha : 'TempPass123!';
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: data.email,
          password: senha,
          email_confirm: true,
        });

        if (authError) throw authError;

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            nome: data.nome,
            email: data.email,
            departamento: data.departamento,
            cargo: data.cargo,
          });

        if (profileError) throw profileError;

        // Create role in user_roles table (server-side validation via RLS)
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: data.role,
          });

        if (roleError) throw roleError;

        toast({
          title: "Sucesso",
          description: data.senha ? `Usuário criado com senha definida` : `Usuário criado com senha temporária: TempPass123!`,
        });
      }

      setDialogOpen(false);
      setEditingUser(null);
      form.reset();
      fetchUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao salvar usuário",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (user: Profile) => {
    setEditingUser(user);
    form.reset({
      nome: user.nome,
      email: user.email,
      departamento: user.departamento || '',
      cargo: user.cargo || '',
      role: user.role as 'solicitante' | 'aprovador' | 'admin',
      senha: '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso",
      });
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao excluir usuário",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'aprovador':
        return <Users className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive' as const;
      case 'aprovador':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  // SECURITY: Server-side role validation via user_roles table
  if (!isAdmin) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar esta página. Acesso restrito a administradores.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, permissões e acessos do sistema
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingUser(null);
              form.reset();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </DialogTitle>
                <DialogDescription>
                  {editingUser 
                    ? 'Atualize as informações do usuário'
                    : 'Crie um novo usuário no sistema'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    {...form.register('nome')}
                    placeholder="Nome completo"
                  />
                  {form.formState.errors.nome && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.nome.message}
                    </p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="email@empresa.com"
                    disabled={!!editingUser}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Input
                    id="departamento"
                    {...form.register('departamento')}
                    placeholder="TI, RH, Financeiro..."
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    {...form.register('cargo')}
                    placeholder="Analista, Gerente, Diretor..."
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="role">Função</Label>
                  <Select 
                    value={form.watch('role')} 
                    onValueChange={(value) => form.setValue('role', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solicitante">Solicitante</SelectItem>
                      <SelectItem value="aprovador">Aprovador</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="senha">
                    {editingUser ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}
                  </Label>
                  <Input
                    id="senha"
                    type="password"
                    {...form.register('senha')}
                    placeholder={editingUser ? 'Digite para alterar senha' : 'Mínimo 6 caracteres'}
                  />
                  {form.formState.errors.senha && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.senha.message}
                    </p>
                  )}
                  {!editingUser && !form.watch('senha') && (
                    <p className="text-sm text-muted-foreground">
                      Senha padrão será: TempPass123!
                    </p>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting 
                    ? 'Salvando...' 
                    : editingUser ? 'Atualizar' : 'Criar'
                  }
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
          <CardDescription>
            Lista de todos os usuários cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Carregando usuários...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nome}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.departamento || '-'}</TableCell>
                    <TableCell>{user.cargo || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="flex items-center gap-1 w-fit">
                        {getRoleIcon(user.role)}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {user.id !== user?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
    </div>
  );
}