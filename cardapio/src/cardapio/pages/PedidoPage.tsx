import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { brl } from '../../data/cardapio'
import { TEMPO_ENTREGA, TEMPO_RETIRADA } from '../../data/entrega'
import { LOJA, whatsappComTexto } from '../../data/loja'
import { Topo } from '../components/Topo'
import { NOME_PAGAMENTO, ULTIMA_ETAPA, buscarPedido, etapasDo } from '../pedidos'
import type { Pedido } from '../pedidos'

const INTERVALO_MS = 3000

// /pedido/:id: acompanhamento do pedido.
// Consulta a API a cada 3 segundos; o status muda quando a loja clica no painel.
export default function PedidoPage() {
  const { id = '' } = useParams()
  const chave = useSearchParams()[0].get('chave') ?? ''
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [naoEncontrado, setNaoEncontrado] = useState(false)
  const [semConexao, setSemConexao] = useState(false)

  const finalizado = !!pedido && (pedido.etapa >= ULTIMA_ETAPA || !!pedido.recusado)

  useEffect(() => {
    if (finalizado || naoEncontrado) return
    let ativo = true
    const atualizar = async () => {
      try {
        const p = await buscarPedido(id, chave)
        if (!ativo) return
        setPedido(p)
        setSemConexao(false)
      } catch (e) {
        if (!ativo) return
        if ((e as Error).message === 'Pedido não encontrado') setNaoEncontrado(true)
        else setSemConexao(true)
      }
    }
    atualizar()
    const t = setInterval(atualizar, INTERVALO_MS)
    return () => {
      ativo = false
      clearInterval(t)
    }
  }, [id, chave, finalizado, naoEncontrado])

  if (naoEncontrado) {
    return (
      <>
        <Topo titulo="Pedido" voltarPara="/cardapio" />
        <main className="conteudo vazio">
          <span className="vazio-icone">🔎</span>
          <h2 className="display">Pedido não encontrado</h2>
          <p>Confira o link ou faça um novo pedido.</p>
          <Link to="/cardapio" className="btn btn-primary">Ver cardápio</Link>
        </main>
      </>
    )
  }

  if (!pedido) {
    return (
      <>
        <Topo titulo={`Pedido #${id}`} voltarPara="/cardapio" />
        <main className="conteudo carregando">{semConexao ? 'Sem conexão com a loja. Tentando de novo…' : 'Carregando pedido…'}</main>
      </>
    )
  }

  const etapas = etapasDo(pedido.tipo)
  const etapa = etapas[pedido.etapa]
  const hora = new Date(pedido.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const msgWhats = `Olá! Sobre o meu pedido #${pedido.id} (${pedido.cliente.nome}).`

  return (
    <>
      <Topo titulo={`Pedido #${pedido.id}`} voltarPara="/cardapio" subtitulo={`Feito às ${hora}`} />
      <main className="conteudo pedido">
        {pedido.recusado ? (
          <div className="status-cartao recusado">
            <span className="status-icone">😕</span>
            <h2 className="display">Pedido recusado</h2>
            <p>{pedido.recusado.motivo}</p>
          </div>
        ) : (
          <div className={`status-cartao${finalizado ? ' concluido' : ''}`}>
            <span className="status-icone">{etapa.icone}</span>
            <h2 className="display">{etapa.titulo}</h2>
            <p>{etapa.descricao}</p>
            {!finalizado && (
              <span className="previsao">
                Previsão: {pedido.tipo === 'entrega' ? TEMPO_ENTREGA : TEMPO_RETIRADA}
              </span>
            )}
          </div>
        )}

        {semConexao && <p className="erro-envio">Sem conexão com a loja. Tentando de novo…</p>}

        {!pedido.recusado && (
          <ol className="linha-tempo">
            {etapas.map((e, i) => (
              <li key={e.titulo} className={i < pedido.etapa || finalizado ? 'feito' : i === pedido.etapa ? 'atual' : ''}>
                <span className="marcador">{i < pedido.etapa || finalizado ? '✓' : ''}</span>
                <span>{e.titulo}</span>
              </li>
            ))}
          </ol>
        )}

        {pedido.pagamento === 'pix' && pedido.etapa >= 1 && !pedido.recusado && (
          <div className="pix">
            <b>⚡ Pagamento via Pix</b>
            <p>Chave Pix: <code>[a definir com a loja]</code></p>
            <small>Envie o comprovante pelo WhatsApp.</small>
          </div>
        )}

        <section className="bloco">
          <h3>Itens</h3>
          <ul className="itens-pedido">
            {pedido.itens.map((it, i) => (
              <li key={i}>
                <span>
                  <b>{it.qtd}x</b> {it.nome}
                  {it.obs && <small>“{it.obs}”</small>}
                </span>
                <span>{brl(it.preco * it.qtd)}</span>
              </li>
            ))}
          </ul>
          <div className="resumo sem-borda">
            <div><span>Subtotal</span><span>{brl(pedido.subtotal)}</span></div>
            {pedido.tipo === 'entrega' && <div><span>Entrega ({pedido.bairro})</span><span>{brl(pedido.frete)}</span></div>}
            <div className="resumo-total"><span>Total</span><span>{brl(pedido.total)}</span></div>
          </div>
        </section>

        <section className="bloco">
          <h3>{pedido.tipo === 'entrega' ? 'Entrega' : 'Retirada'}</h3>
          {pedido.tipo === 'entrega' ? (
            <p>
              {pedido.endereco} · {pedido.bairro}
              {pedido.referencia && <><br /><small>Ref.: {pedido.referencia}</small></>}
            </p>
          ) : (
            <p>{LOJA.endereco}</p>
          )}
          <h3>Pagamento</h3>
          <p>
            {NOME_PAGAMENTO[pedido.pagamento] ?? 'Cartão na entrega'}
            {pedido.trocoPara ? ` · troco para ${brl(pedido.trocoPara)}` : ''}
          </p>
        </section>

        <div className="acoes-pedido">
          <a href={whatsappComTexto(msgWhats)} target="_blank" rel="noopener" className="btn btn-ghost largo">
            💬 Falar com a loja
          </a>
          <Link to="/cardapio" className="btn btn-primary largo">Fazer outro pedido</Link>
        </div>
        {!finalizado && <p className="nota-demo">Esta tela se atualiza sozinha quando a loja muda o status.</p>}
      </main>
    </>
  )
}
