import type { Pedido } from './api'
import { ehVenda, paraISO, resumir, variacao } from './dashboard'
import type { Periodo } from './dashboard'

// Planilha do Excel (.xlsx) com tudo o que aconteceu no período escolhido no dashboard.
// Abas: Resumo · Por dia · Produtos · Pedidos · Horários.
// A biblioteca (ExcelJS) só é baixada quando o gerente clica em "Baixar planilha".

const CATEGORIAS: Record<string, string> = { b: 'Burgers', c: 'Combos', a: 'Acompanhamentos', d: 'Bebidas' }
const categoriaDo = (itemId: string) => CATEGORIAS[itemId[0]] ?? 'Outros'

const NOME_PAGAMENTO: Record<string, string> = { pix: 'Pix', credito: 'Crédito', debito: 'Débito', dinheiro: 'Dinheiro', cartao: 'Cartão' }
const DIA_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const ETAPAS = ['Aguardando aceite', 'Na grelha', 'Saiu / pronto', 'Entregue / retirado']

// Cores da marca (ARGB, como o Excel pede)
const PRETO = 'FF0F0D0A'
const AMARELO = 'FFFFC21A'
const CREME = 'FFFFF4DC'
const ZEBRA = 'FFFFF8E8'
const LINHA = 'FFE6D8BA'
const MOEDA = '"R$" #,##0.00'
const PORCENTO = '0.0%'

type Coluna = { titulo: string; largura: number; formato?: string }

export async function baixarPlanilha(pedidos: Pedido[], periodo: Periodo, anteriores: Pedido[], anterior: Periodo) {
  const { default: ExcelJS } = await import('exceljs')
  const livro = new ExcelJS.Workbook()
  livro.creator = 'Macaco Grelhado · Dashboard'
  livro.created = new Date()

  const fimPeriodo = new Date(periodo.ate.getTime() - 1)
  const textoPeriodo =
    periodo.dias === 1
      ? periodo.de.toLocaleDateString('pt-BR')
      : `${periodo.de.toLocaleDateString('pt-BR')} a ${fimPeriodo.toLocaleDateString('pt-BR')}`
  const vendas = pedidos.filter(ehVenda)
  const atual = resumir(pedidos, periodo)
  const antes = resumir(anteriores, anterior)

  // ---------- ajudantes de formatação ----------
  type Aba = ReturnType<typeof livro.addWorksheet>

  const cabecalhoDaAba = (aba: Aba, titulo: string, colunas: number) => {
    aba.mergeCells(1, 1, 1, colunas)
    const t = aba.getCell(1, 1)
    t.value = `🐒 Macaco Grelhado · ${titulo}`
    t.font = { name: 'Calibri', size: 16, bold: true, color: { argb: AMARELO } }
    t.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PRETO } }
    t.alignment = { vertical: 'middle', indent: 1 }
    aba.getRow(1).height = 30

    aba.mergeCells(2, 1, 2, colunas)
    const s = aba.getCell(2, 1)
    s.value = `Período: ${textoPeriodo}  ·  Gerado em ${new Date().toLocaleString('pt-BR')}`
    s.font = { size: 10, italic: true, color: { argb: 'FF5A4A2E' } }
    s.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CREME } }
    s.alignment = { indent: 1 }
  }

  // Tabela com cabeçalho preto/amarelo, linhas zebradas e linha de total opcional.
  // Devolve a próxima linha livre.
  const tabela = (aba: Aba, linhaInicial: number, colunas: Coluna[], linhas: (string | number | Date | null)[][], total?: (string | number | null)[]) => {
    const cab = aba.getRow(linhaInicial)
    colunas.forEach((c, i) => {
      const cel = cab.getCell(i + 1)
      cel.value = c.titulo
      cel.font = { bold: true, color: { argb: AMARELO } }
      cel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PRETO } }
      cel.alignment = { vertical: 'middle', horizontal: c.formato ? 'right' : 'left' }
      cel.border = { bottom: { style: 'medium', color: { argb: AMARELO } } }
    })
    cab.height = 20

    linhas.forEach((valores, n) => {
      const linha = aba.getRow(linhaInicial + 1 + n)
      valores.forEach((v, i) => {
        const cel = linha.getCell(i + 1)
        cel.value = v
        if (colunas[i].formato) cel.numFmt = colunas[i].formato!
        cel.border = { bottom: { style: 'hair', color: { argb: LINHA } } }
        if (n % 2 === 1) cel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ZEBRA } }
      })
    })

    let proxima = linhaInicial + 1 + linhas.length
    if (total) {
      const linha = aba.getRow(proxima)
      total.forEach((v, i) => {
        const cel = linha.getCell(i + 1)
        cel.value = v
        cel.font = { bold: true }
        if (colunas[i].formato) cel.numFmt = colunas[i].formato!
        cel.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CREME } }
        cel.border = { top: { style: 'thin', color: { argb: PRETO } } }
      })
      proxima++
    }
    return proxima + 1
  }

  const larguras = (aba: Aba, colunas: Coluna[]) => colunas.forEach((c, i) => (aba.getColumn(i + 1).width = c.largura))

  const subtitulo = (aba: Aba, linha: number, texto: string) => {
    const cel = aba.getCell(linha, 1)
    cel.value = texto
    cel.font = { bold: true, size: 12, color: { argb: 'FF8A5A00' } }
    return linha + 1
  }

  // ---------- agrupamentos ----------
  const somaItens = (lista: Pedido[]) => lista.reduce((s, p) => s + p.itens.reduce((t, i) => t + i.qtd, 0), 0)
  const recusados = pedidos.filter((p) => p.recusado)
  const taxaEntrega = vendas.reduce((s, p) => s + p.frete, 0)

  const categorias = new Map<string, { itens: number; valor: number }>()
  const produtos = new Map<string, { categoria: string; qtd: number; valor: number; pedidos: number }>()
  for (const p of vendas) {
    for (const i of p.itens) {
      const cat = categoriaDo(i.itemId)
      const c = categorias.get(cat) ?? { itens: 0, valor: 0 }
      categorias.set(cat, { itens: c.itens + i.qtd, valor: c.valor + i.preco * i.qtd })
      const pr = produtos.get(i.nome) ?? { categoria: cat, qtd: 0, valor: 0, pedidos: 0 }
      produtos.set(i.nome, { ...pr, qtd: pr.qtd + i.qtd, valor: pr.valor + i.preco * i.qtd, pedidos: pr.pedidos + 1 })
    }
  }
  const totalProdutos = [...categorias.values()].reduce((s, c) => s + c.valor, 0)

  const agrupar = (chave: (p: Pedido) => string) => {
    const m = new Map<string, { qtd: number; valor: number }>()
    for (const p of vendas) {
      const k = chave(p)
      const g = m.get(k) ?? { qtd: 0, valor: 0 }
      m.set(k, { qtd: g.qtd + 1, valor: g.valor + p.total })
    }
    return [...m].sort((a, b) => b[1].valor - a[1].valor)
  }

  // ---------- aba 1: Resumo ----------
  const resumo = livro.addWorksheet('Resumo', { views: [{ showGridLines: false }] })
  const colResumo: Coluna[] = [
    { titulo: 'Indicador', largura: 34 },
    { titulo: 'Período', largura: 18, formato: MOEDA },
    { titulo: 'Período anterior', largura: 18, formato: MOEDA },
    { titulo: 'Variação', largura: 12, formato: PORCENTO },
  ]
  larguras(resumo, colResumo)
  cabecalhoDaAba(resumo, 'Resumo do período', 4)

  let l = subtitulo(resumo, 4, 'Números principais')
  const indicador = (nome: string, a: number, b: number, formato = MOEDA) => [nome, a, b, variacao(a, b), formato] as const
  const indicadores = [
    indicador('Faturamento (com entrega)', atual.faturamento, antes.faturamento),
    indicador('Faturamento só dos produtos', atual.faturamento - taxaEntrega, antes.faturamento - anteriores.filter(ehVenda).reduce((s, p) => s + p.frete, 0)),
    indicador('Taxas de entrega recebidas', taxaEntrega, anteriores.filter(ehVenda).reduce((s, p) => s + p.frete, 0)),
    indicador('Vendas (pedidos aceitos)', atual.vendas, antes.vendas, '0'),
    indicador('Ticket médio', atual.ticketMedio, antes.ticketMedio),
    indicador('Itens vendidos', atual.itensVendidos, antes.itensVendidos, '0'),
    indicador('Pedidos recusados', atual.recusados, antes.recusados, '0'),
    indicador('Valor dos pedidos recusados (não entrou)', recusados.reduce((s, p) => s + p.total, 0), anteriores.filter((p) => p.recusado).reduce((s, p) => s + p.total, 0)),
  ]
  l = tabela(resumo, l, colResumo, indicadores.map(([n, a, b, v]) => [n, a, b, v]))
  // formato próprio das linhas de quantidade
  indicadores.forEach(([, , , , formato], i) => {
    if (formato !== MOEDA) [2, 3].forEach((c) => (resumo.getRow(l - 1 - indicadores.length + i).getCell(c).numFmt = formato))
  })
  const notaVar = resumo.getCell(l - 1, 1)
  notaVar.value = `Período anterior: os ${periodo.dias === 1 ? 'dia' : `${periodo.dias} dias`} logo antes do período escolhido.`
  notaVar.font = { size: 9, italic: true, color: { argb: 'FF8C7B5E' } }
  l++

  l = subtitulo(resumo, l, 'Vendas por categoria')
  const catOrdem = [...categorias].sort((a, b) => b[1].valor - a[1].valor)
  l = tabela(
    resumo, l,
    [{ titulo: 'Categoria', largura: 34 }, { titulo: 'Itens vendidos', largura: 18, formato: '0' }, { titulo: 'Faturamento', largura: 18, formato: MOEDA }, { titulo: '% do total', largura: 12, formato: PORCENTO }],
    catOrdem.map(([nome, c]) => [nome, c.itens, c.valor, totalProdutos ? c.valor / totalProdutos : 0]),
    ['Total', somaItens(vendas), totalProdutos, totalProdutos ? 1 : 0],
  )

  l = subtitulo(resumo, l, 'Formas de pagamento')
  l = tabela(
    resumo, l,
    [{ titulo: 'Pagamento', largura: 34 }, { titulo: 'Pedidos', largura: 18, formato: '0' }, { titulo: 'Faturamento', largura: 18, formato: MOEDA }, { titulo: '% do total', largura: 12, formato: PORCENTO }],
    agrupar((p) => NOME_PAGAMENTO[p.pagamento] ?? p.pagamento).map(([nome, g]) => [nome, g.qtd, g.valor, atual.faturamento ? g.valor / atual.faturamento : 0]),
  )

  l = subtitulo(resumo, l, 'Entrega × retirada')
  l = tabela(
    resumo, l,
    [{ titulo: 'Tipo', largura: 34 }, { titulo: 'Pedidos', largura: 18, formato: '0' }, { titulo: 'Faturamento', largura: 18, formato: MOEDA }, { titulo: '% do total', largura: 12, formato: PORCENTO }],
    agrupar((p) => (p.tipo === 'entrega' ? 'Entrega' : 'Retirada no balcão')).map(([nome, g]) => [nome, g.qtd, g.valor, atual.faturamento ? g.valor / atual.faturamento : 0]),
  )

  l = subtitulo(resumo, l, 'Bairros que mais compram')
  tabela(
    resumo, l,
    [{ titulo: 'Bairro', largura: 34 }, { titulo: 'Pedidos', largura: 18, formato: '0' }, { titulo: 'Faturamento', largura: 18, formato: MOEDA }, { titulo: '% do total', largura: 12, formato: PORCENTO }],
    agrupar((p) => (p.tipo === 'entrega' ? p.bairro ?? '—' : 'Retirada no balcão'))
      .filter(([nome]) => nome !== 'Retirada no balcão')
      .map(([nome, g]) => [nome, g.qtd, g.valor, atual.faturamento ? g.valor / atual.faturamento : 0]),
  )

  // ---------- aba 2: Por dia ----------
  const porDia = livro.addWorksheet('Por dia', { views: [{ state: 'frozen', ySplit: 3, showGridLines: false }] })
  const colDia: Coluna[] = [
    { titulo: 'Data', largura: 13, formato: 'dd/mm/yyyy' },
    { titulo: 'Dia da semana', largura: 15 },
    { titulo: 'Vendas', largura: 10, formato: '0' },
    { titulo: 'Itens', largura: 10, formato: '0' },
    { titulo: 'Faturamento', largura: 16, formato: MOEDA },
    { titulo: 'Ticket médio', largura: 15, formato: MOEDA },
    { titulo: 'Recusados', largura: 12, formato: '0' },
  ]
  larguras(porDia, colDia)
  cabecalhoDaAba(porDia, 'Vendas por dia', colDia.length)
  const linhasDia = Array.from({ length: periodo.dias }, (_, i) => {
    const dia = new Date(periodo.de.getFullYear(), periodo.de.getMonth(), periodo.de.getDate() + i)
    const doDia = pedidos.filter((p) => paraISO(new Date(p.criadoEm)) === paraISO(dia))
    const v = doDia.filter(ehVenda)
    const fat = v.reduce((s, p) => s + p.total, 0)
    return [dia, DIA_SEMANA[dia.getDay()], v.length, somaItens(v), fat, v.length ? fat / v.length : 0, doDia.filter((p) => p.recusado).length]
  })
  tabela(porDia, 3, colDia, linhasDia, ['Total', null, atual.vendas, atual.itensVendidos, atual.faturamento, atual.ticketMedio, atual.recusados])

  // ---------- aba 3: Produtos ----------
  const abaProdutos = livro.addWorksheet('Produtos', { views: [{ state: 'frozen', ySplit: 3, showGridLines: false }] })
  const colProd: Coluna[] = [
    { titulo: 'Posição', largura: 9, formato: '0"º"' },
    { titulo: 'Produto', largura: 28 },
    { titulo: 'Categoria', largura: 18 },
    { titulo: 'Quantidade', largura: 12, formato: '0' },
    { titulo: 'Faturamento', largura: 16, formato: MOEDA },
    { titulo: '% dos produtos', largura: 15, formato: PORCENTO },
  ]
  larguras(abaProdutos, colProd)
  cabecalhoDaAba(abaProdutos, 'Produtos mais vendidos', colProd.length)
  const listaProdutos = [...produtos].sort((a, b) => b[1].qtd - a[1].qtd)
  tabela(
    abaProdutos, 3, colProd,
    listaProdutos.map(([nome, p], i) => [i + 1, nome, p.categoria, p.qtd, p.valor, totalProdutos ? p.valor / totalProdutos : 0]),
    [null, 'Total', null, somaItens(vendas), totalProdutos, totalProdutos ? 1 : 0],
  )
  if (listaProdutos.length) abaProdutos.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3 + listaProdutos.length, column: colProd.length } }

  // ---------- aba 4: Pedidos ----------
  const abaPedidos = livro.addWorksheet('Pedidos', { views: [{ state: 'frozen', ySplit: 3, showGridLines: false }] })
  const colPed: Coluna[] = [
    { titulo: 'Nº', largura: 8 },
    { titulo: 'Data', largura: 12, formato: 'dd/mm/yyyy' },
    { titulo: 'Hora', largura: 8 },
    { titulo: 'Cliente', largura: 20 },
    { titulo: 'Tipo', largura: 11 },
    { titulo: 'Bairro', largura: 18 },
    { titulo: 'Pagamento', largura: 12 },
    { titulo: 'Itens', largura: 48 },
    { titulo: 'Produtos', largura: 13, formato: MOEDA },
    { titulo: 'Entrega', largura: 11, formato: MOEDA },
    { titulo: 'Total', largura: 13, formato: MOEDA },
    { titulo: 'Situação', largura: 20 },
  ]
  larguras(abaPedidos, colPed)
  cabecalhoDaAba(abaPedidos, 'Todos os pedidos do período', colPed.length)
  const ordenados = [...pedidos].sort((a, b) => a.criadoEm - b.criadoEm)
  tabela(
    abaPedidos, 3, colPed,
    ordenados.map((p) => {
      const quando = new Date(p.criadoEm)
      return [
        p.id,
        new Date(quando.getFullYear(), quando.getMonth(), quando.getDate()),
        quando.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        p.cliente.nome,
        p.tipo === 'entrega' ? 'Entrega' : 'Retirada',
        p.bairro ?? '—',
        NOME_PAGAMENTO[p.pagamento] ?? p.pagamento,
        p.itens.map((i) => `${i.qtd}x ${i.nome}`).join(', '),
        p.subtotal,
        p.frete,
        p.total,
        p.recusado ? `Recusado: ${p.recusado.motivo}` : ETAPAS[p.etapa] ?? '',
      ]
    }),
  )
  // Recusados em vermelho, para saltar aos olhos
  ordenados.forEach((p, i) => {
    if (p.recusado) abaPedidos.getRow(4 + i).eachCell((c) => (c.font = { color: { argb: 'FFB3261E' } }))
  })
  if (ordenados.length) abaPedidos.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3 + ordenados.length, column: colPed.length } }

  // ---------- aba 5: Horários ----------
  const abaHoras = livro.addWorksheet('Horários', { views: [{ showGridLines: false }] })
  const colHora: Coluna[] = [
    { titulo: 'Horário', largura: 16 },
    { titulo: 'Vendas', largura: 10, formato: '0' },
    { titulo: 'Faturamento', largura: 16, formato: MOEDA },
    { titulo: '% das vendas', largura: 14, formato: PORCENTO },
  ]
  larguras(abaHoras, colHora)
  cabecalhoDaAba(abaHoras, 'Horários de pico', colHora.length)
  const porHora = atual.porHorario.map((b) => {
    const h = Number(b.rotulo.replace('h', ''))
    const v = vendas.filter((p) => new Date(p.criadoEm).getHours() === h)
    return [`${h}h às ${h}h59`, v.length, v.reduce((s, p) => s + p.total, 0), vendas.length ? v.length / vendas.length : 0]
  })
  tabela(abaHoras, 3, colHora, porHora, ['Total', atual.vendas, atual.faturamento, vendas.length ? 1 : 0])

  // ---------- baixar ----------
  const arquivo = await livro.xlsx.writeBuffer()
  const blob = new Blob([arquivo], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `macaco-grelhado_${paraISO(periodo.de)}_a_${paraISO(fimPeriodo)}.xlsx`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
