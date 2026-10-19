import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CATEGORIA_DO_ITEM, ITENS, brl } from '../../data/cardapio'
import { FotoItem } from '../components/FotoItem'
import { Quantidade } from '../components/Quantidade'
import { Topo } from '../components/Topo'
import { useCarrinho } from '../context/CarrinhoContext'

// Sugestões que aparecem na página dos burgers (vão direto para o carrinho).
const PECA_JUNTO = ['d1', 'd2', 'a1'].map((id) => ITENS[id])

// /cardapio/item/:id: detalhes do item, quantidade e observação.
export default function ItemPage() {
  const { id } = useParams()
  const item = id ? ITENS[id] : undefined
  const { adicionar, qtdDoItem } = useCarrinho()
  const navigate = useNavigate()
  const [qtd, setQtd] = useState(1)
  const [obs, setObs] = useState('')

  if (!item) {
    return (
      <>
        <Topo titulo="Item não encontrado" voltarPara="/cardapio" />
        <main className="conteudo vazio">
          <p>Esse item não está mais no cardápio.</p>
          <Link to="/cardapio" className="btn btn-primary">Ver cardápio</Link>
        </main>
      </>
    )
  }

  const confirmar = () => {
    adicionar(item.id, qtd, obs)
    navigate('/cardapio', { state: { adicionado: qtd > 1 ? `${qtd}x ${item.nome}` : item.nome } })
  }

  return (
    <>
      <Topo titulo={item.nome} voltarPara="/cardapio" />
      <main className="conteudo com-barra">
        <div className="item-destaque">
          <FotoItem item={item} prioridade />
          {item.tag && <span className="tag">{item.tag}</span>}
        </div>
        <h2 className="item-titulo display">{item.nome}</h2>
        <p className="item-desc">{item.desc}</p>
        <p className="item-valor">{brl(item.preco)}</p>

        <label htmlFor="obs" className="rotulo">
          Alguma observação? <small>(opcional)</small>
        </label>
        <textarea
          id="obs"
          className="campo"
          rows={3}
          maxLength={140}
          placeholder="Ex.: sem cebola, ponto da carne bem passado…"
          value={obs}
          onChange={(e) => setObs(e.target.value)}
        />

        {CATEGORIA_DO_ITEM[item.id] === 'burgers' && (
          <section className="peca-junto">
            <h3 className="display">Peça junto</h3>
            {PECA_JUNTO.map((extra) => {
              const qtdExtra = qtdDoItem(extra.id)
              return (
                <div className="extra" key={extra.id}>
                  <FotoItem item={extra} className="extra-foto" />
                  <div className="extra-info">
                    <b>{extra.nome}</b>
                    <span>+ {brl(extra.preco)}</span>
                  </div>
                  <button type="button" className={`extra-btn${qtdExtra ? ' on' : ''}`} onClick={() => adicionar(extra.id)} aria-label={`Adicionar ${extra.nome}`}>
                    {qtdExtra ? `${qtdExtra} ✓` : '+'}
                  </button>
                </div>
              )
            })}
          </section>
        )}
      </main>

      <div className="barra-fixa">
        <div className="barra-item">
          <Quantidade valor={qtd} min={1} onMenos={() => setQtd((q) => q - 1)} onMais={() => setQtd((q) => q + 1)} />
          <button type="button" className="btn btn-primary" onClick={confirmar}>
            Adicionar · {brl(item.preco * qtd)}
          </button>
        </div>
      </div>
    </>
  )
}
