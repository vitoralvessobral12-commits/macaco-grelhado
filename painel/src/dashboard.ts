import type { Pedido } from './api'

// Cálculos do dashboard (faturamento, mais vendidos, horários...).
// Conta como VENDA só o pedido aceito pela loja e não recusado.

export type Filtro = 'hoje' | '3d' | '7d' | '15d' | '30d' | 'datas'

export const FILTROS: { id: Filtro; nome: string; dias?: number }[] = [
  { id: 'hoje', nome: 'Hoje', dias: 1 },
  { id: '3d', nome: '3 dias', dias: 3 },
  { id: '7d', nome: '7 dias', dias: 7 },
  { id: '15d', nome: '15 dias', dias: 15 },
  { id: '30d', nome: '30 dias', dias: 30 },
  { id: 'datas', nome: 'Escolher datas' },
]

const DIA_MS = 86_400_000

export const inicioDoDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const somarDias = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

// "2026-10-19" ⇄ Date no fuso local (sem o deslocamento de UTC do new Date("2026-10-19"))
export const paraISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const deISO = (s: string) => {
  const [a, m, d] = s.split('-').map(Number)
  return new Date(a, m - 1, d)
}

export type Periodo = { de: Date; ate: Date; dias: number } // "ate" é o início do dia seguinte (fora do período)

export function calcularPeriodo(filtro: Filtro, datas: { de: string; ate: string }): Periodo {
  const hoje = inicioDoDia(new Date())
  if (filtro === 'datas') {
    let de = deISO(datas.de)
    let ate = deISO(datas.ate)
    if (de > ate) [de, ate] = [ate, de]
    const fim = somarDias(ate, 1)
    return { de, ate: fim, dias: Math.round((fim.getTime() - de.getTime()) / DIA_MS) }
  }
  const dias = FILTROS.find((f) => f.id === filtro)!.dias!
  return { de: somarDias(hoje, -(dias - 1)), ate: somarDias(hoje, 1), dias }
}

// Mesmo tamanho de período, logo antes (para comparar "vs período anterior")
export const periodoAnterior = (p: Periodo): Periodo => ({ de: somarDias(p.de, -p.dias), ate: p.de, dias: p.dias })

export const ehVenda = (p: Pedido) => !p.recusado && p.etapa >= 1

export type Barra = { rotulo: string; valor: number; dica: string }

export type Resumo = {
  faturamento: number
  vendas: number
  ticketMedio: number
  itensVendidos: number
  recusados: number
  aguardando: number
  porTempo: Barra[] // por dia, ou por hora quando o período é um dia só
  porHorario: Barra[]
  maisVendidos: Barra[]
  pagamentos: Barra[]
  tipos: Barra[]
  bairros: Barra[]
}

const NOME_PAGAMENTO: Record<string, string> = { pix: 'Pix', credito: 'Crédito', debito: 'Débito', dinheiro: 'Dinheiro', cartao: 'Cartão' }
const DIA_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`
const porcento = (parte: number, todo: number) => (todo ? `${Math.round((parte / todo) * 100)}%` : '0%')

// Soma valores por chave, mantendo a ordem em que as chaves aparecem
function agrupar<T>(lista: T[], chave: (x: T) => string, valor: (x: T) => number) {
  const mapa = new Map<string, { valor: number; qtd: number }>()
  for (const x of lista) {
    const k = chave(x)
    const atual = mapa.get(k) ?? { valor: 0, qtd: 0 }
    mapa.set(k, { valor: atual.valor + valor(x), qtd: atual.qtd + 1 })
  }
  return mapa
}

export function resumir(pedidos: Pedido[], periodo: Periodo): Resumo {
  const vendas = pedidos.filter(ehVenda)
  const faturamento = vendas.reduce((s, p) => s + p.total, 0)
  const itensVendidos = vendas.reduce((s, p) => s + p.itens.reduce((t, i) => t + i.qtd, 0), 0)

  // Horas mostradas: no mínimo das 17h às 23h, abrindo mais se tiver venda fora disso
  const horas = vendas.map((p) => new Date(p.criadoEm).getHours())
  const primeiraHora = Math.min(17, ...horas)
  const ultimaHora = Math.max(23, ...horas)
  const listaHoras = Array.from({ length: ultimaHora - primeiraHora + 1 }, (_, i) => primeiraHora + i)
  const porHora = agrupar(vendas, (p) => String(new Date(p.criadoEm).getHours()), (p) => p.total)

  let porTempo: Barra[]
  if (periodo.dias === 1) {
    porTempo = listaHoras.map((h) => {
      const g = porHora.get(String(h))
      return { rotulo: `${h}h`, valor: g?.valor ?? 0, dica: `${h}h às ${h}h59 · ${brl(g?.valor ?? 0)} · ${plural(g?.qtd ?? 0, 'pedido', 'pedidos')}` }
    })
  } else {
    const porDia = agrupar(vendas, (p) => paraISO(new Date(p.criadoEm)), (p) => p.total)
    porTempo = Array.from({ length: periodo.dias }, (_, i) => {
      const dia = somarDias(periodo.de, i)
      const g = porDia.get(paraISO(dia))
      const data = dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      return { rotulo: data, valor: g?.valor ?? 0, dica: `${DIA_SEMANA[dia.getDay()]}, ${data} · ${brl(g?.valor ?? 0)} · ${plural(g?.qtd ?? 0, 'pedido', 'pedidos')}` }
    })
  }

  const porHorario = listaHoras.map((h) => {
    const qtd = porHora.get(String(h))?.qtd ?? 0
    return { rotulo: `${h}h`, valor: qtd, dica: `${h}h às ${h}h59 · ${plural(qtd, 'pedido', 'pedidos')} (${porcento(qtd, vendas.length)})` }
  })

  // Mais vendidos: quantidade de cada item
  const itens = new Map<string, { qtd: number; valor: number }>()
  for (const p of vendas) {
    for (const i of p.itens) {
      const atual = itens.get(i.nome) ?? { qtd: 0, valor: 0 }
      itens.set(i.nome, { qtd: atual.qtd + i.qtd, valor: atual.valor + i.preco * i.qtd })
    }
  }
  const maisVendidos = [...itens]
    .sort((a, b) => b[1].qtd - a[1].qtd)
    .slice(0, 8)
    .map(([nome, g]) => ({ rotulo: nome, valor: g.qtd, dica: `${plural(g.qtd, 'unidade', 'unidades')} · ${brl(g.valor)}` }))

  const emBarras = (mapa: Map<string, { valor: number; qtd: number }>, nome: (k: string) => string, limite = 99) =>
    [...mapa]
      .sort((a, b) => b[1].valor - a[1].valor)
      .slice(0, limite)
      .map(([k, g]) => ({
        rotulo: nome(k),
        valor: g.valor,
        dica: `${brl(g.valor)} · ${plural(g.qtd, 'pedido', 'pedidos')} · ${porcento(g.valor, faturamento)} do faturamento`,
      }))

  return {
    faturamento,
    vendas: vendas.length,
    ticketMedio: vendas.length ? faturamento / vendas.length : 0,
    itensVendidos,
    recusados: pedidos.filter((p) => p.recusado).length,
    aguardando: pedidos.filter((p) => !p.recusado && p.etapa === 0).length,
    porTempo,
    porHorario,
    maisVendidos,
    pagamentos: emBarras(agrupar(vendas, (p) => p.pagamento, (p) => p.total), (k) => NOME_PAGAMENTO[k] ?? k),
    tipos: emBarras(agrupar(vendas, (p) => p.tipo, (p) => p.total), (k) => (k === 'entrega' ? '🛵 Entrega' : '🏪 Retirada')),
    bairros: emBarras(agrupar(vendas.filter((p) => p.bairro), (p) => p.bairro!, (p) => p.total), (k) => k, 6),
  }
}

// Variação em relação ao período anterior (null quando não dá para comparar)
export const variacao = (atual: number, anterior: number) => (anterior > 0 ? (atual - anterior) / anterior : null)
