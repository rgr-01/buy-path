import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Database } from '@/integrations/supabase/types';

type Requisicao = Database['public']['Tables']['requisicoes']['Row'] & {
  solicitante?: Database['public']['Tables']['profiles']['Row'];
  departamento?: Database['public']['Tables']['departamentos']['Row'];
  fornecedor_sugerido?: Database['public']['Tables']['fornecedores']['Row'];
  aprovador?: Database['public']['Tables']['profiles']['Row'];
  itens?: Database['public']['Tables']['itens_requisicao']['Row'][];
};

export const generateRequisicaoPDF = async (requisicao: Requisicao) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // Header
  pdf.setFontSize(20);
  pdf.setTextColor(44, 62, 80);
  pdf.text('REQUISIÇÃO DE COMPRA', margin, yPosition);
  
  yPosition += 15;
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Código: ${requisicao.codigo}`, margin, yPosition);
  pdf.text(`Data: ${new Date(requisicao.created_at).toLocaleDateString('pt-BR')}`, pageWidth - 80, yPosition);

  // Informações gerais
  yPosition += 20;
  pdf.setFontSize(14);
  pdf.setTextColor(44, 62, 80);
  pdf.text('INFORMAÇÕES GERAIS', margin, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);
  
  const generalInfo = [
    `Solicitante: ${requisicao.solicitante?.nome || 'N/A'}`,
    `Email: ${requisicao.solicitante?.email || 'N/A'}`,
    `Departamento: ${requisicao.departamento?.nome || 'N/A'}`,
    `Fornecedor Sugerido: ${requisicao.fornecedor_sugerido?.nome || 'N/A'}`,
    `Status: ${requisicao.status.toUpperCase()}`,
    `Valor Total: R$ ${requisicao.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
  ];

  generalInfo.forEach((info) => {
    yPosition += 8;
    pdf.text(info, margin, yPosition);
  });

  // Justificativa
  yPosition += 20;
  pdf.setFontSize(14);
  pdf.setTextColor(44, 62, 80);
  pdf.text('JUSTIFICATIVA', margin, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);
  
  const justificativaLines = pdf.splitTextToSize(requisicao.justificativa, pageWidth - 2 * margin);
  justificativaLines.forEach((line: string) => {
    yPosition += 6;
    pdf.text(line, margin, yPosition);
  });

  // Itens
  yPosition += 20;
  pdf.setFontSize(14);
  pdf.setTextColor(44, 62, 80);
  pdf.text('ITENS', margin, yPosition);

  if (requisicao.itens && requisicao.itens.length > 0) {
    yPosition += 15;
    
    // Cabeçalho da tabela
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.setFillColor(44, 62, 80);
    pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 12, 'F');
    
    pdf.text('Item', margin + 5, yPosition + 3);
    pdf.text('Qtd', margin + 80, yPosition + 3);
    pdf.text('Preço Unit.', margin + 110, yPosition + 3);
    pdf.text('Total', margin + 150, yPosition + 3);

    yPosition += 12;
    pdf.setTextColor(60, 60, 60);

    requisicao.itens.forEach((item, index) => {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = margin;
      }

      const backgroundColor = index % 2 === 0 ? 245 : 255;
      pdf.setFillColor(backgroundColor, backgroundColor, backgroundColor);
      pdf.rect(margin, yPosition - 3, pageWidth - 2 * margin, 10, 'F');

      pdf.text(item.nome, margin + 5, yPosition + 3);
      pdf.text(item.quantidade.toString(), margin + 80, yPosition + 3);
      pdf.text(`R$ ${item.preco_unitario.toFixed(2)}`, margin + 110, yPosition + 3);
      pdf.text(`R$ ${item.preco_total.toFixed(2)}`, margin + 150, yPosition + 3);

      yPosition += 10;
    });
  }

  // Aprovação
  if (requisicao.status === 'aprovada' || requisicao.status === 'rejeitada') {
    yPosition += 20;
    pdf.setFontSize(14);
    pdf.setTextColor(44, 62, 80);
    pdf.text('APROVAÇÃO', margin, yPosition);
    
    yPosition += 10;
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    
    const aprovacaoInfo = [
      `Aprovador: ${requisicao.aprovador?.nome || 'N/A'}`,
      `Data da Aprovação: ${requisicao.data_aprovacao ? new Date(requisicao.data_aprovacao).toLocaleDateString('pt-BR') : 'N/A'}`,
      `Observações: ${requisicao.observacoes_aprovador || 'Nenhuma observação'}`,
    ];

    aprovacaoInfo.forEach((info) => {
      yPosition += 8;
      pdf.text(info, margin, yPosition);
    });
  }

  // Footer
  const pageCount = pdf.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleString('pt-BR')}`,
      margin,
      pdf.internal.pageSize.getHeight() - 10
    );
  }

  return pdf;
};

export const downloadRequisicaoPDF = async (requisicao: Requisicao) => {
  const pdf = await generateRequisicaoPDF(requisicao);
  pdf.save(`requisicao-${requisicao.codigo}.pdf`);
};

export const generateRelatorioGeralPDF = async (requisicoes: Requisicao[]) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = margin;

  // Header
  pdf.setFontSize(20);
  pdf.setTextColor(44, 62, 80);
  pdf.text('RELATÓRIO GERAL DE REQUISIÇÕES', margin, yPosition);
  
  yPosition += 15;
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, yPosition);
  pdf.text(`Total de Requisições: ${requisicoes.length}`, pageWidth - 80, yPosition);

  // Estatísticas
  yPosition += 20;
  pdf.setFontSize(14);
  pdf.setTextColor(44, 62, 80);
  pdf.text('ESTATÍSTICAS', margin, yPosition);

  const stats = {
    pendentes: requisicoes.filter(r => r.status === 'pendente').length,
    aprovadas: requisicoes.filter(r => r.status === 'aprovada').length,
    rejeitadas: requisicoes.filter(r => r.status === 'rejeitada').length,
    rascunhos: requisicoes.filter(r => r.status === 'rascunho').length,
    valorTotal: requisicoes.filter(r => r.status === 'aprovada').reduce((sum, r) => sum + r.valor_total, 0),
  };

  yPosition += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);
  
  const statsInfo = [
    `Pendentes: ${stats.pendentes}`,
    `Aprovadas: ${stats.aprovadas}`,
    `Rejeitadas: ${stats.rejeitadas}`,
    `Rascunhos: ${stats.rascunhos}`,
    `Valor Total Aprovado: R$ ${stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
  ];

  statsInfo.forEach((info) => {
    yPosition += 8;
    pdf.text(info, margin, yPosition);
  });

  // Lista de requisições
  yPosition += 20;
  pdf.setFontSize(14);
  pdf.setTextColor(44, 62, 80);
  pdf.text('REQUISIÇÕES', margin, yPosition);

  yPosition += 15;
  
  // Cabeçalho da tabela
  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  pdf.setFillColor(44, 62, 80);
  pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 12, 'F');
  
  pdf.text('Código', margin + 5, yPosition + 3);
  pdf.text('Solicitante', margin + 40, yPosition + 3);
  pdf.text('Status', margin + 90, yPosition + 3);
  pdf.text('Valor', margin + 120, yPosition + 3);
  pdf.text('Data', margin + 150, yPosition + 3);

  yPosition += 12;
  pdf.setTextColor(60, 60, 60);

  requisicoes.forEach((requisicao, index) => {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = margin;
    }

    const backgroundColor = index % 2 === 0 ? 245 : 255;
    pdf.setFillColor(backgroundColor, backgroundColor, backgroundColor);
    pdf.rect(margin, yPosition - 3, pageWidth - 2 * margin, 10, 'F');

    pdf.text(requisicao.codigo, margin + 5, yPosition + 3);
    pdf.text(requisicao.solicitante?.nome?.substring(0, 20) || 'N/A', margin + 40, yPosition + 3);
    pdf.text(requisicao.status.toUpperCase(), margin + 90, yPosition + 3);
    pdf.text(`R$ ${requisicao.valor_total.toFixed(2)}`, margin + 120, yPosition + 3);
    pdf.text(new Date(requisicao.created_at).toLocaleDateString('pt-BR'), margin + 150, yPosition + 3);

    yPosition += 10;
  });

  // Footer
  const pageCount = pdf.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Página ${i} de ${pageCount}`,
      margin,
      pdf.internal.pageSize.getHeight() - 10
    );
  }

  pdf.save(`relatorio-requisicoes-${new Date().toISOString().split('T')[0]}.pdf`);
};