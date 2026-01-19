import { 
  LayoutDashboard, 
  FileText, 
  Plus, 
  Clock, 
  CheckSquare, 
  Users, 
  Settings,
  BarChart3,
  Building2,
  ShoppingCart
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Nova Requisição", url: "/nova-requisicao", icon: Plus },
  { title: "Requisições", url: "/requisicoes", icon: FileText },
  { title: "Aprovações", url: "/pendentes", icon: Clock },
  { title: "Aprovadas", url: "/aprovadas", icon: CheckSquare },
];

const adminItems = [
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Fornecedores", url: "/fornecedores", icon: Building2 },
  { title: "Usuários", url: "/admin/usuarios", icon: Users },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar
      className="w-[260px] border-r border-sidebar-border"
      collapsible="none"
    >
      <SidebarContent className="bg-sidebar">
        {/* Logo/Header - ComprasPro */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
              <ShoppingCart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-base">ComprasPro</h2>
              <p className="text-xs text-muted-foreground">Gestão de Requisições</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup className="px-3 py-4">
          <SidebarGroupLabel className="text-label text-muted-foreground uppercase tracking-wider mb-2 px-3">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end 
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-smooth relative",
                          isActive 
                            ? "bg-accent text-accent-foreground font-medium" 
                            : "text-sidebar-foreground hover:bg-muted"
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full" />
                        )}
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        <SidebarGroup className="px-3 py-4 border-t border-sidebar-border">
          <SidebarGroupLabel className="text-label text-muted-foreground uppercase tracking-wider mb-2 px-3">
            Administração
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {adminItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-smooth relative",
                          isActive 
                            ? "bg-accent text-accent-foreground font-medium" 
                            : "text-sidebar-foreground hover:bg-muted"
                        )}
                      >
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-primary rounded-r-full" />
                        )}
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
