import { z } from 'zod';

// CNPJ validation (Brazilian tax ID)
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

// Phone validation (Brazilian format)
const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;

export const requisicaoItemSchema = z.object({
  nome: z.string()
    .trim()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  descricao: z.string()
    .trim()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional(),
  quantidade: z.number()
    .positive('Quantidade deve ser positiva')
    .int('Quantidade deve ser um número inteiro')
    .max(999999, 'Quantidade muito alta'),
  preco_unitario: z.number()
    .positive('Preço deve ser positivo')
    .max(9999999.99, 'Preço muito alto'),
});

export const requisicaoSchema = z.object({
  justificativa: z.string()
    .trim()
    .min(10, 'Justificativa deve ter pelo menos 10 caracteres')
    .max(5000, 'Justificativa deve ter no máximo 5000 caracteres'),
  departamento_id: z.string().uuid('Departamento inválido'),
  fornecedor_sugerido_id: z.string().uuid('Fornecedor inválido').optional(),
  itens: z.array(requisicaoItemSchema)
    .min(1, 'Adicione pelo menos um item'),
});

export const fornecedorSchema = z.object({
  nome: z.string()
    .trim()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  cnpj: z.string()
    .trim()
    .regex(cnpjRegex, 'CNPJ inválido. Use o formato: 00.000.000/0000-00')
    .optional()
    .or(z.literal('')),
  email: z.string()
    .trim()
    .email('Email inválido')
    .max(255, 'Email muito longo')
    .optional()
    .or(z.literal('')),
  telefone: z.string()
    .trim()
    .regex(phoneRegex, 'Telefone inválido. Use o formato: (00) 00000-0000')
    .optional()
    .or(z.literal('')),
  endereco: z.string()
    .trim()
    .max(500, 'Endereço deve ter no máximo 500 caracteres')
    .optional(),
  categoria: z.string()
    .trim()
    .max(100, 'Categoria deve ter no máximo 100 caracteres')
    .optional(),
});

export const departamentoSchema = z.object({
  nome: z.string()
    .trim()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  orcamento_mensal: z.number()
    .positive('Orçamento deve ser positivo')
    .max(999999999.99, 'Orçamento muito alto')
    .optional(),
});

// Sanitize text to prevent XSS
export function sanitizeText(text: string): string {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Format CNPJ
export function formatCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 14) {
    return numbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return value;
}

// Format phone
export function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
  return value;
}
