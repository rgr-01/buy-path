import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Profile {
  id: string
  nome: string
  email: string
  departamento: string | null
  cargo: string | null
  role: 'solicitante' | 'aprovador' | 'admin'
  created_at: string
  updated_at: string
}

export interface Departamento {
  id: string
  nome: string
  orcamento_mensal: number | null
  responsavel_id: string | null
  created_at: string
}

export interface Fornecedor {
  id: string
  nome: string
  cnpj: string | null
  email: string | null
  telefone: string | null
  endereco: string | null
  categoria: string | null
  ativo: boolean
  created_at: string
}

export interface Requisicao {
  id: string
  codigo: string
  solicitante_id: string
  departamento_id: string | null
  fornecedor_sugerido_id: string | null
  justificativa: string
  valor_total: number
  status: 'rascunho' | 'pendente' | 'aprovada' | 'rejeitada'
  aprovador_id: string | null
  data_aprovacao: string | null
  observacoes_aprovador: string | null
  created_at: string
  updated_at: string
  
  // Relationships
  solicitante?: Profile
  departamento?: Departamento
  fornecedor_sugerido?: Fornecedor
  aprovador?: Profile
  itens?: ItemRequisicao[]
}

export interface ItemRequisicao {
  id: string
  requisicao_id: string
  nome: string
  descricao: string | null
  quantidade: number
  preco_unitario: number
  preco_total: number
  created_at: string
}

export interface Anexo {
  id: string
  requisicao_id: string
  nome_arquivo: string
  url_arquivo: string
  tamanho_arquivo: number | null
  tipo_arquivo: string | null
  uploaded_by: string
  created_at: string
}

export interface LogAuditoria {
  id: string
  requisicao_id: string | null
  user_id: string | null
  acao: string
  detalhes: any
  created_at: string
}