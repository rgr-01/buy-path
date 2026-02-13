import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Bell, 
  Mail, 
  Shield, 
  Database,
  Palette,
  Globe,
  Save,
  RefreshCw,
  Upload,
  ImageIcon,
  Trash2
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEmpresaConfig } from "@/hooks/useEmpresaConfig";

export function Configuracoes() {
  const { config, uploadLogo, updateConfig } = useEmpresaConfig();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [configuracoes, setConfiguracoes] = useState({
    // Gerais
    nomeEmpresa: "Minha Empresa Ltda",
    cnpj: "12.345.678/0001-90",
    endereco: "Rua das Flores, 123 - São Paulo/SP",
    
    // Notificações
    emailNotificacoes: true,
    notificacoesPush: true,
    notificarNovaRequisicao: true,
    notificarAprovacao: true,
    notificarRejeicao: true,
    
    // Sistema
    limiteTentativasLogin: 5,
    tempoSessao: 480, // minutos
    backupAutomatico: true,
    logDetalhado: false,
    
    // Aprovação
    aprovacaoAutomatica: false,
    valorLimiteAprovacao: 1000,
    aprovadorPadrao: "",
    
    // Email
    servidorSMTP: "smtp.gmail.com",
    portaSMTP: 587,
    usuarioSMTP: "",
    senhaEmailRemetente: "",
    
    // Aparência
    tema: "system",
    idioma: "pt-BR"
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      if (config) {
        await updateConfig({
          nome_empresa: configuracoes.nomeEmpresa,
          cnpj: configuracoes.cnpj,
          endereco: configuracoes.endereco,
        });
      }
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    toast.success("Configurações resetadas para o padrão");
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione um arquivo de imagem");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    setUploadingLogo(true);
    const { error } = await uploadLogo(file);
    setUploadingLogo(false);

    if (error) {
      toast.error("Erro ao enviar logo");
    } else {
      toast.success("Logo atualizada com sucesso!");
    }
  };

  const handleRemoveLogo = async () => {
    await updateConfig({ logo_url: null });
    toast.success("Logo removida");
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie as configurações do sistema
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Resetar
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="geral" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="sistema">Sistema</TabsTrigger>
            <TabsTrigger value="aprovacao">Aprovação</TabsTrigger>
            <TabsTrigger value="email">E-mail</TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Informações da Empresa
                </CardTitle>
                <CardDescription>
                  Configure as informações básicas da empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-3">
                  <Label>Logo da Empresa</Label>
                  <p className="text-sm text-muted-foreground">
                    A logo será exibida nos relatórios e PDFs gerados pelo sistema
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden bg-muted">
                      {config?.logo_url ? (
                        <img 
                          src={config.logo_url} 
                          alt="Logo da empresa" 
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingLogo}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingLogo ? "Enviando..." : "Enviar Logo"}
                      </Button>
                      {config?.logo_url && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={handleRemoveLogo}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </Button>
                      )}
                      <p className="text-xs text-muted-foreground">PNG, JPG ou SVG. Máx. 2MB</p>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                  <Input
                    id="nomeEmpresa"
                    value={configuracoes.nomeEmpresa}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      nomeEmpresa: e.target.value
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={configuracoes.cnpj}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      cnpj: e.target.value
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Textarea
                    id="endereco"
                    value={configuracoes.endereco}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      endereco: e.target.value
                    }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Aparência
                </CardTitle>
                <CardDescription>
                  Personalize a aparência do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tema">Tema</Label>
                  <Select value={configuracoes.tema} onValueChange={(value) => 
                    setConfiguracoes(prev => ({ ...prev, tema: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idioma">Idioma</Label>
                  <Select value={configuracoes.idioma} onValueChange={(value) => 
                    setConfiguracoes(prev => ({ ...prev, idioma: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Preferências de Notificação
                </CardTitle>
                <CardDescription>
                  Configure como deseja receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por E-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações por e-mail
                    </p>
                  </div>
                  <Switch
                    checked={configuracoes.emailNotificacoes}
                    onCheckedChange={(checked) => 
                      setConfiguracoes(prev => ({ ...prev, emailNotificacoes: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações no navegador
                    </p>
                  </div>
                  <Switch
                    checked={configuracoes.notificacoesPush}
                    onCheckedChange={(checked) => 
                      setConfiguracoes(prev => ({ ...prev, notificacoesPush: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Nova Requisição</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando uma nova requisição for criada
                    </p>
                  </div>
                  <Switch
                    checked={configuracoes.notificarNovaRequisicao}
                    onCheckedChange={(checked) => 
                      setConfiguracoes(prev => ({ ...prev, notificarNovaRequisicao: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Aprovação</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando uma requisição for aprovada
                    </p>
                  </div>
                  <Switch
                    checked={configuracoes.notificarAprovacao}
                    onCheckedChange={(checked) => 
                      setConfiguracoes(prev => ({ ...prev, notificarAprovacao: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sistema" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Segurança
                </CardTitle>
                <CardDescription>
                  Configurações de segurança do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="limiteTentativas">Limite de Tentativas de Login</Label>
                  <Input
                    id="limiteTentativas"
                    type="number"
                    value={configuracoes.limiteTentativasLogin}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      limiteTentativasLogin: parseInt(e.target.value)
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tempoSessao">Tempo de Sessão (minutos)</Label>
                  <Input
                    id="tempoSessao"
                    type="number"
                    value={configuracoes.tempoSessao}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      tempoSessao: parseInt(e.target.value)
                    }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Backup e Logs
                </CardTitle>
                <CardDescription>
                  Configurações de backup e registro
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Realizar backup automático diário
                    </p>
                  </div>
                  <Switch
                    checked={configuracoes.backupAutomatico}
                    onCheckedChange={(checked) => 
                      setConfiguracoes(prev => ({ ...prev, backupAutomatico: checked }))
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Log Detalhado</Label>
                    <p className="text-sm text-muted-foreground">
                      Registrar logs detalhados do sistema
                    </p>
                  </div>
                  <Switch
                    checked={configuracoes.logDetalhado}
                    onCheckedChange={(checked) => 
                      setConfiguracoes(prev => ({ ...prev, logDetalhado: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aprovacao" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Aprovação</CardTitle>
                <CardDescription>
                  Configure o fluxo de aprovação de requisições
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Aprovação Automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Aprovar automaticamente requisições abaixo do limite
                    </p>
                  </div>
                  <Switch
                    checked={configuracoes.aprovacaoAutomatica}
                    onCheckedChange={(checked) => 
                      setConfiguracoes(prev => ({ ...prev, aprovacaoAutomatica: checked }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorLimite">Valor Limite para Aprovação (R$)</Label>
                  <Input
                    id="valorLimite"
                    type="number"
                    value={configuracoes.valorLimiteAprovacao}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      valorLimiteAprovacao: parseFloat(e.target.value)
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aprovadorPadrao">Aprovador Padrão</Label>
                  <Select value={configuracoes.aprovadorPadrao} onValueChange={(value) => 
                    setConfiguracoes(prev => ({ ...prev, aprovadorPadrao: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um aprovador" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="gerente">Gerente de Compras</SelectItem>
                      <SelectItem value="diretor">Diretor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Configurações de E-mail
                </CardTitle>
                <CardDescription>
                  Configure o servidor SMTP para envio de e-mails
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="servidorSMTP">Servidor SMTP</Label>
                    <Input
                      id="servidorSMTP"
                      value={configuracoes.servidorSMTP}
                      onChange={(e) => setConfiguracoes(prev => ({
                        ...prev,
                        servidorSMTP: e.target.value
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portaSMTP">Porta</Label>
                    <Input
                      id="portaSMTP"
                      type="number"
                      value={configuracoes.portaSMTP}
                      onChange={(e) => setConfiguracoes(prev => ({
                        ...prev,
                        portaSMTP: parseInt(e.target.value)
                      }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usuarioSMTP">Usuário SMTP</Label>
                  <Input
                    id="usuarioSMTP"
                    type="email"
                    value={configuracoes.usuarioSMTP}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      usuarioSMTP: e.target.value
                    }))}
                    placeholder="usuario@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senhaEmail">Senha do E-mail</Label>
                  <Input
                    id="senhaEmail"
                    type="password"
                    value={configuracoes.senhaEmailRemetente}
                    onChange={(e) => setConfiguracoes(prev => ({
                      ...prev,
                      senhaEmailRemetente: e.target.value
                    }))}
                    placeholder="••••••••"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}