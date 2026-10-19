import { brl } from '../api'
import type { Acao, Pedido } from '../api'

const PAGAMENTO = {
  pix: '⚡ Pix',
  credito: '💳 Crédito na entrega',
  debito: '💳 Débito na entrega',
  dinheiro: '💵 Dinheiro',
  cartao: '💳 Cartão na entrega', // pedidos feitos antes de separar crédito e débito
}

type Props = {
  pedido: Pedido
  agora: number
  ocupado: boolean
  onAcao: (acao: Acao) => void
  onRecusar: () => void
}

function tempoDesde(ms: number) {
  const min = Math.floor(ms / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  return `há ${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}`
}

function situacao(p: Pedido) {
  if (p.recusado) return { texto: 'Recusado', classe: 'recusado' }
  const entrega = p.tipo === 'entrega'
  return [
    { texto: 'Novo', classe: 'novo' },
    { texto: 'Na grelha', classe: 'andamento' },
    { texto: entrega ? 'Saiu para entrega' : 'Pronto para retirar', classe: 'andamento' },
    { texto: entrega ? 'Entregue' : 'Retirado', classe: 'concluido' },
  ][p.etapa]
}

export function PedidoCard({ pedido: p, agora, ocupado, onAcao, onRecusar }: Props) {
  const s = situacao(p)
  const hora = new Date(p.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const whats = `https://wa.me/55${p.cliente.telefone.replace(/\D/g, '')}`
  const qtdItens = p.itens.reduce((soma, i) => soma + i.qtd, 0)

  return (
    <article className={`pedido-card ${s.classe}`}>
      <header>
        <div>
          <span className="pedido-id display">#{p.id}</span>
          <span className={`selo ${s.classe}`}>{s.texto}</span>
        </div>
        <span className="pedido-hora" title={`Feito às ${hora}`}>
          {hora} · {tempoDesde(agora - p.criadoEm)}
        </span>
      </header>

      <div className="pedido-cliente">
        <b>{p.cliente.nome}</b>
        <a href={whats} target="_blank" rel="noopener">{p.cliente.telefone}</a>
      </div>

      <div className={`pedido-tipo ${p.tipo}`}>
        {p.tipo === 'entrega' ? (
          <>
            🛵 <span><b>{p.bairro}</b> · {p.endereco}{p.referencia && <small> (ref.: {p.referencia})</small>}</span>
          </>
        ) : (
          <>🏪 <b>Retirada no balcão</b></>
        )}
      </div>

      <ul className="pedido-itens">
        {p.itens.map((it, i) => (
          <li key={i}>
            <span><b>{it.qtd}x</b> {it.nome}</span>
            {it.obs && <em>⚠️ {it.obs}</em>}
          </li>
        ))}
      </ul>

      <div className="pedido-pagamento">
        <span>
          {PAGAMENTO[p.pagamento]}
          {p.trocoPara ? ` · troco p/ ${brl(p.trocoPara)} (devolver ${brl(p.trocoPara - p.total)})` : ''}
        </span>
        <span className="pedido-total">
          <small>{qtdItens} {qtdItens > 1 ? 'itens' : 'item'}{p.frete ? ` + entrega ${brl(p.frete)}` : ''}</small>
          {brl(p.total)}
        </span>
      </div>

      {p.recusado && <p className="pedido-motivo">Motivo: {p.recusado.motivo}</p>}

      {!p.recusado && p.etapa < 3 && (
        <div className="pedido-acoes">
          {p.etapa === 0 && (
            <>
              <button type="button" className="btn btn-perigo-borda" disabled={ocupado} onClick={onRecusar}>Recusar</button>
              <button type="button" className="btn btn-sucesso" disabled={ocupado} onClick={() => onAcao('aceitar')}>Aceitar pedido</button>
            </>
          )}
          {p.etapa === 1 && (
            <button type="button" className="btn btn-primary" disabled={ocupado} onClick={() => onAcao('avancar')}>
              {p.tipo === 'entrega' ? '🛵 Saiu para entrega' : '🛍️ Pronto para retirar'}
            </button>
          )}
          {p.etapa === 2 && (
            <button type="button" className="btn btn-primary" disabled={ocupado} onClick={() => onAcao('avancar')}>
              ✓ {p.tipo === 'entrega' ? 'Marcar como entregue' : 'Marcar como retirado'}
            </button>
          )}
        </div>
      )}
    </article>
  )
}
