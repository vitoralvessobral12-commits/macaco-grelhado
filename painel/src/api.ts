// Comunicação do painel com a API + guarda do token de login.

export const URL_API = (
  import.meta.env.VITE_URL_API ||
    // Só em desenvolvimento cai no mesmo computador; em produção a variável é obrigatória
    (import.meta.env.DEV ? `${window.location.protocol}//${window.location.hostname}:4002` : '')
).replace(/\/$/, '')

export type ItemPedido = { itemId: string; nome: string; preco: number; qtd: number; obs: string }

export type Pedido = {
  id: string
  criadoEm: number
  atualizadoEm: number
  cliente: { nome: string; telefone: string }
  tipo: 'entrega' | 'retirada'
  bairro?: string
  endereco?: string
  referencia?: string
  pagamento: 'pix' | 'credito' | 'debito' | 'dinheiro' | 'cartao' // 'cartao': pedidos antigos
  trocoPara?: number
  itens: ItemPedido[]
  subtotal: number
  frete: number
  total: number
  etapa: number // 0 enviado · 1 aceito · 2 saiu/pronto · 3 entregue/retirado
  recusado?: { motivo: string }
}

export type Acao = 'aceitar' | 'recusar' | 'avancar'

// Dois acessos separados, cada um com o seu login e o seu token:
// "painel" (atendente, pedidos) e "dashboard" (gerente, faturamento).
export type Acesso = 'painel' | 'dashboard'

const CHAVE_TOKEN: Record<Acesso, string> = { painel: 'mg_painel_token', dashboard: 'mg_dashboard_token' }

export const lerToken = (acesso: Acesso = 'painel') => {
  try {
    return localStorage.getItem(CHAVE_TOKEN[acesso])
  } catch {
    return null
  }
}

export const sair = (acesso: Acesso = 'painel') => {
  try {
    localStorage.removeItem(CHAVE_TOKEN[acesso])
  } catch {
    /* nada a limpar */
  }
}

// Erro de sessão (token ausente/expirado): quem chamou deve mandar para o login.
export class SessaoExpirada extends Error {}

async function chamar<T>(caminho: string, opcoes: RequestInit = {}, acesso: Acesso = 'painel'): Promise<T> {
  const token = lerToken(acesso)
  let resposta: Response
  try {
    resposta = await fetch(`${URL_API}${caminho}`, {
      ...opcoes,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    })
  } catch {
    throw new Error('Sem conexão com o servidor.')
  }
  const corpo = await resposta.json().catch(() => ({}))
  if (resposta.status === 401 && !caminho.endsWith('/login')) {
    sair(acesso)
    throw new SessaoExpirada(corpo.error)
  }
  if (!resposta.ok) throw new Error(corpo.error || 'Algo deu errado.')
  return corpo as T
}

export async function entrar(usuario: string, senha: string, acesso: Acesso = 'painel') {
  const { token } = await chamar<{ token: string }>(`/${acesso}/login`, {
    method: 'POST',
    body: JSON.stringify({ usuario, senha }),
  })
  localStorage.setItem(CHAVE_TOKEN[acesso], token)
}

export const listarPedidos = () => chamar<Pedido[]>('/painel/pedidos')

export const executarAcao = (id: string, acao: Acao, motivo?: string) =>
  chamar<Pedido>(`/painel/pedidos/${id}`, { method: 'PATCH', body: JSON.stringify({ acao, motivo }) })

// Dashboard (só gerente): pedidos criados entre "de" e "ate" (em milissegundos)
export const pedidosDoPeriodo = (de: number, ate: number) =>
  chamar<Pedido[]>(`/dashboard/pedidos?de=${de}&ate=${ate}`, {}, 'dashboard')

export const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
