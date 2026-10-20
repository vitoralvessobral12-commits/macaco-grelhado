import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ITENS, brl } from '../../data/cardapio'
import { BAIRROS, TEMPO_ENTREGA, TEMPO_RETIRADA } from '../../data/entrega'
import { LOJA } from '../../data/loja'
import { BuscaEndereco } from '../components/BuscaEndereco'
import { Topo } from '../components/Topo'
import { useCarrinho } from '../context/CarrinhoContext'
import { NOME_PAGAMENTO, enviarPedido, linkDoPedido } from '../pedidos'
import type { NovoPedido, Pagamento, TipoPedido } from '../pedidos'

type Dados = {
  nome: string
  telefone: string
  tipo: TipoPedido
  bairro: string
  endereco: string
  referencia: string
  pagamento: Pagamento
  semTroco: boolean
  trocoPara: string
}

const DADOS_VAZIOS: Dados = {
  nome: '', telefone: '', tipo: 'entrega', bairro: '', endereco: '', referencia: '',
  pagamento: 'pix', semTroco: false, trocoPara: '',
}

// Lembra nome, telefone e endereço para o próximo pedido (só neste aparelho).
const CHAVE_CLIENTE = 'mg_cliente'
function carregarDados(): Dados {
  try {
    const salvo = { ...DADOS_VAZIOS, ...JSON.parse(localStorage.getItem(CHAVE_CLIENTE) || '{}'), semTroco: false, trocoPara: '' }
    // Pedidos antigos podiam ter "cartao", que hoje virou crédito ou débito.
    if (!(salvo.pagamento in NOME_PAGAMENTO)) salvo.pagamento = 'pix'
    return salvo
  } catch {
    return DADOS_VAZIOS
  }
}

// Compara nomes de bairro sem acento e sem maiúsculas ("Centro" = "centro").
const normalizar = (v: string) => v.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

const ICONE_PAGAMENTO: Record<Pagamento, string> = { pix: '⚡', credito: '💳', debito: '💳', dinheiro: '💵' }

const mascaraTelefone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

const paraNumero = (v: string) => Number(v.replace(/[^\d,]/g, '').replace(',', '.')) || 0

// /cardapio/finalizar: dados do cliente, entrega e pagamento.
export default function FinalizarPage() {
  const { linhas, subtotal, quantidade, limpar } = useCarrinho()
  const navigate = useNavigate()
  const [d, setD] = useState<Dados>(carregarDados)
  const [erros, setErros] = useState<Partial<Record<keyof Dados, string>>>({})
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState<string | null>(null)

  useEffect(() => {
    if (!quantidade && !enviando) navigate('/cardapio/carrinho', { replace: true })
  }, [quantidade, enviando, navigate])

  const set = <K extends keyof Dados>(campo: K, valor: Dados[K]) => {
    setD((atual) => ({ ...atual, [campo]: valor }))
    setErros((atual) => ({ ...atual, [campo]: undefined }))
  }

  const frete = d.tipo === 'entrega' ? (BAIRROS.find((b) => b.nome === d.bairro)?.frete ?? 0) : 0
  const total = subtotal + frete

  const validar = () => {
    const e: typeof erros = {}
    if (d.nome.trim().length < 2) e.nome = 'Informe seu nome.'
    if (d.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Informe um telefone com DDD.'
    if (d.tipo === 'entrega') {
      if (!d.bairro) e.bairro = 'Escolha o bairro.'
      if (d.endereco.trim().length < 5) e.endereco = 'Informe rua e número.'
    }
    if (d.pagamento === 'dinheiro' && !d.semTroco && paraNumero(d.trocoPara) < total)
      e.trocoPara = `O troco precisa ser para ${brl(total)} ou mais.`
    setErros(e)
    return Object.keys(e).length === 0
  }

  const enviar = async (ev: FormEvent) => {
    if (enviando) return
    ev.preventDefault()
    if (!validar()) {
      document.querySelector('.campo-erro')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    const novo: NovoPedido = {
      cliente: { nome: d.nome.trim(), telefone: d.telefone },
      tipo: d.tipo,
      ...(d.tipo === 'entrega' && { bairro: d.bairro, endereco: d.endereco.trim(), referencia: d.referencia.trim() }),
      pagamento: d.pagamento,
      ...(d.pagamento === 'dinheiro' && !d.semTroco && { trocoPara: paraNumero(d.trocoPara) }),
      itens: linhas.map((l) => ({ itemId: l.itemId, nome: ITENS[l.itemId].nome, preco: ITENS[l.itemId].preco, qtd: l.qtd, obs: l.obs })),
      frete,
    }
    setEnviando(true)
    setErroEnvio(null)
    try {
      const pedido = await enviarPedido(novo)
      try {
        const { nome, telefone, tipo, bairro, endereco, referencia, pagamento } = d
        localStorage.setItem(CHAVE_CLIENTE, JSON.stringify({ nome, telefone, tipo, bairro, endereco, referencia, pagamento }))
      } catch {
        /* sem armazenamento */
      }
      limpar()
      navigate(linkDoPedido(pedido), { replace: true })
    } catch (e) {
      setErroEnvio((e as Error).message)
      setEnviando(false)
    }
  }

  const erro = (campo: keyof Dados) => erros[campo] && <span className="msg-erro">{erros[campo]}</span>
  const classe = (campo: keyof Dados) => `campo${erros[campo] ? ' campo-erro' : ''}`

  return (
    <>
      <Topo titulo="Finalizar pedido" voltarPara="/cardapio/carrinho" />
      <form className="conteudo com-barra formulario" onSubmit={enviar} noValidate>
        <fieldset>
          <legend>Seus dados</legend>
          <label className="rotulo" htmlFor="nome">Nome</label>
          <input id="nome" className={classe('nome')} autoComplete="name" value={d.nome} onChange={(e) => set('nome', e.target.value)} />
          {erro('nome')}
          <label className="rotulo" htmlFor="tel">WhatsApp / telefone</label>
          <input
            id="tel" className={classe('telefone')} type="tel" inputMode="numeric" autoComplete="tel" placeholder="(88) 9 0000-0000"
            value={d.telefone} onChange={(e) => set('telefone', mascaraTelefone(e.target.value))}
          />
          {erro('telefone')}
        </fieldset>

        <fieldset>
          <legend>Como você quer receber?</legend>
          <div className="segmentado">
            {(['entrega', 'retirada'] as TipoPedido[]).map((t) => (
              <button type="button" key={t} className={d.tipo === t ? 'on' : ''} onClick={() => set('tipo', t)}>
                {t === 'entrega' ? '🛵 Entrega' : '🏪 Retirar na loja'}
                <small>{t === 'entrega' ? TEMPO_ENTREGA : TEMPO_RETIRADA}</small>
              </button>
            ))}
          </div>

          {d.tipo === 'entrega' ? (
            <>
              <label className="rotulo" htmlFor="bairro">Bairro</label>
              <select id="bairro" className={classe('bairro')} value={d.bairro} onChange={(e) => set('bairro', e.target.value)}>
                <option value="">Selecione…</option>
                {BAIRROS.map((b) => (
                  <option key={b.nome} value={b.nome}>
                    {b.nome} — entrega {brl(b.frete)}
                  </option>
                ))}
              </select>
              {erro('bairro')}
              <label className="rotulo" htmlFor="end">Rua e número</label>
              <BuscaEndereco
                id="end" className={classe('endereco')} value={d.endereco}
                onChange={(valor) => set('endereco', valor)}
                onEscolher={({ bairro }) => {
                  // Se o bairro da rua estiver na lista de entrega, já seleciona.
                  const achado = BAIRROS.find((b) => normalizar(b.nome) === normalizar(bairro))
                  if (achado) set('bairro', achado.nome)
                }}
              />
              {erro('endereco')}
              <label className="rotulo" htmlFor="ref">Ponto de referência <small>(opcional)</small></label>
              <input id="ref" className="campo" placeholder="Ex.: casa de esquina, portão azul" value={d.referencia} onChange={(e) => set('referencia', e.target.value)} />
            </>
          ) : (
            <p className="aviso-retirada">📍 Retire em <b>{LOJA.endereco}</b></p>
          )}
        </fieldset>

        <fieldset>
          <legend>Pagamento</legend>
          <div className="segmentado">
            {(['pix', 'credito', 'debito', 'dinheiro'] as Pagamento[]).map((p) => (
              <button type="button" key={p} className={d.pagamento === p ? 'on' : ''} onClick={() => set('pagamento', p)}>
                {ICONE_PAGAMENTO[p]} {NOME_PAGAMENTO[p].replace(' na entrega', '')}
              </button>
            ))}
          </div>
          {d.pagamento === 'pix' && <p className="dica">A chave Pix aparece na tela do pedido assim que a loja aceitar.</p>}
          {(d.pagamento === 'credito' || d.pagamento === 'debito') && (
            <p className="dica">Pague no {d.pagamento === 'credito' ? 'crédito' : 'débito'} com a maquininha na {d.tipo === 'entrega' ? 'entrega' : 'retirada'}.</p>
          )}
          {d.pagamento === 'dinheiro' && (
            <>
              <label className="rotulo" htmlFor="troco">Troco para quanto?</label>
              <input
                id="troco" className={classe('trocoPara')} inputMode="decimal" placeholder="Ex.: 100" disabled={d.semTroco}
                value={d.trocoPara} onChange={(e) => set('trocoPara', e.target.value)}
              />
              {erro('trocoPara')}
              <label className="checagem">
                <input type="checkbox" checked={d.semTroco} onChange={(e) => set('semTroco', e.target.checked)} />
                Não preciso de troco
              </label>
            </>
          )}
        </fieldset>

        <div className="resumo">
          <div><span>Subtotal ({quantidade} {quantidade > 1 ? 'itens' : 'item'})</span><span>{brl(subtotal)}</span></div>
          {d.tipo === 'entrega' && (
            <div><span>Taxa de entrega</span><span>{d.bairro ? brl(frete) : '—'}</span></div>
          )}
          <div className="resumo-total"><span>Total</span><span>{brl(total)}</span></div>
          {d.pagamento === 'dinheiro' && !d.semTroco && paraNumero(d.trocoPara) > total && (
            <div className="resumo-nota"><span>Troco</span><span>{brl(paraNumero(d.trocoPara) - total)}</span></div>
          )}
        </div>

        <Link to="/cardapio/carrinho" className="link-editar">Editar itens do carrinho</Link>

        {erroEnvio && <p className="erro-envio" role="alert">⚠️ {erroEnvio}</p>}

        <div className="barra-fixa">
          <button type="submit" className="btn btn-primary barra-btn" disabled={enviando}>
            <span>{enviando ? 'Enviando pedido…' : 'Fazer pedido'}</span>
            <span>{brl(total)}</span>
          </button>
        </div>
      </form>
    </>
  )
}
