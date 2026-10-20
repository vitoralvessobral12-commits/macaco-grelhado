import { URL_API } from '../config'

// Pedidos: enviados para a API e acompanhados por ela.
// O status (etapa) é alterado pela loja no painel.

export type TipoPedido = 'entrega' | 'retirada'
export type Pagamento = 'pix' | 'credito' | 'debito' | 'dinheiro'

export type ItemPedido = { itemId: string; nome: string; preco: number; qtd: number; obs: string }

export type NovoPedido = {
  cliente: { nome: string; telefone: string }
  tipo: TipoPedido
  bairro?: string
  endereco?: string
  referencia?: string
  pagamento: Pagamento
  trocoPara?: number
  itens: ItemPedido[]
  frete: number
}

export type Pedido = NovoPedido & {
  id: string
  chave: string // secreta: só quem fez o pedido consegue acompanhar
  criadoEm: number
  subtotal: number
  total: number
  etapa: number
  recusado?: { motivo: string }
}

export type Etapa = { titulo: string; descricao: string; icone: string }

export function etapasDo(tipo: TipoPedido): Etapa[] {
  return [
    { titulo: 'Pedido enviado', descricao: 'Aguardando a loja confirmar.', icone: '📨' },
    { titulo: 'Pedido aceito', descricao: 'Seu hambúrguer já está na grelha.', icone: '🔥' },
    tipo === 'entrega'
      ? { titulo: 'Saiu para entrega', descricao: 'O entregador está a caminho.', icone: '🛵' }
      : { titulo: 'Pronto para retirar', descricao: 'Pode vir buscar no balcão.', icone: '🛍️' },
    tipo === 'entrega'
      ? { titulo: 'Entregue', descricao: 'Bom apetite! 🍔', icone: '🍔' }
      : { titulo: 'Retirado', descricao: 'Bom apetite! 🍔', icone: '🍔' },
  ]
}

export const ULTIMA_ETAPA = 3

async function chamarApi<T>(caminho: string, opcoes?: RequestInit): Promise<T> {
  let resposta: Response
  try {
    resposta = await fetch(`${URL_API}${caminho}`, {
      ...opcoes,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    throw new Error('Não foi possível falar com a loja. Verifique sua internet e tente de novo.')
  }
  const corpo = await resposta.json().catch(() => ({}))
  if (!resposta.ok) throw new Error(corpo.error || 'Algo deu errado. Tente de novo.')
  return corpo as T
}

export const enviarPedido = (pedido: NovoPedido) =>
  chamarApi<Pedido>('/pedidos', { method: 'POST', body: JSON.stringify(pedido) })

export const buscarPedido = (id: string, chave: string) =>
  chamarApi<Pedido>(`/pedidos/${encodeURIComponent(id)}?chave=${encodeURIComponent(chave)}`)

// Link de acompanhamento: número + chave secreta (sem a chave, a API não mostra o pedido)
export const linkDoPedido = (p: Pick<Pedido, 'id' | 'chave'>) => `/pedido/${p.id}?chave=${p.chave}`

export const NOME_PAGAMENTO: Record<Pagamento, string> = {
  pix: 'Pix',
  credito: 'Crédito na entrega',
  debito: 'Débito na entrega',
  dinheiro: 'Dinheiro',
}
