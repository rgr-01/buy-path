import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "./components/auth/AuthGuard";
import Index from "./pages/Index";
import { NovaRequisicao } from "./pages/NovaRequisicao";
import { Requisicoes } from "./pages/Requisicoes";
import { Pendentes } from "./pages/Pendentes";
import { Aprovadas } from "./pages/Aprovadas";
import { Relatorios } from "./pages/Relatorios";
import AdminUsuarios from "./pages/AdminUsuarios";
import { Fornecedores } from "./pages/Fornecedores";
import { Configuracoes } from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthGuard>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/nova-requisicao" element={<NovaRequisicao />} />
            <Route path="/requisicoes" element={<Requisicoes />} />
            <Route path="/pendentes" element={<Pendentes />} />
            <Route path="/aprovadas" element={<Aprovadas />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/admin/usuarios" element={<AdminUsuarios />} />
            <Route path="/fornecedores" element={<Fornecedores />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthGuard>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
