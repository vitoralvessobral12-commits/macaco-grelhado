import { Link } from 'react-router-dom'
import { ITENS, brl } from '../../data/cardapio'
import { FotoItem } from '../components/FotoItem'
import { Quantidade } from '../components/Quantidade'
import { Topo } from '../components/Topo'
import { useCarrinho } from '../context/CarrinhoContext'

// /cardapio/carrinho: revisar itens antes de finalizar.
export default function CarrinhoPage() {
  const { linhas, subtotal, quantidade, alterarQtd, remover } = useCarrinho()

  if (!quantidade) {
    return (
      <>
        <Topo titulo="Seu carrinho" voltarPara="/cardapio" />
        <main className="conteudo vazio">
          <span className="vazio-icone">🛒</span>
          <h2 className="display">Carrinho vazio</h2>
          <p>Que tal começar por um Macaco Clássico?</p>
          <Link to="/cardapio" className="btn btn-primary">Ver cardápio</Link>
        </main>
      </>
    )
  }

  return (
    <>
      <Topo titulo="Seu carrinho" voltarPara="/cardapio" subtitulo={`${quantidade} ${quantidade > 1 ? 'itens' : 'item'}`} />
      <main className="conteudo com-barra">
        <ul className="lista-carrinho">
          {linhas.map((l) => {
            const item = ITENS[l.itemId]
            return (
              <li key={l.chave}>
                <FotoItem item={item} className="lc-foto" />
                <div className="lc-info">
                  <b>{item.nome}</b>
                  {l.obs && <small className="lc-obs">“{l.obs}”</small>}
                  <span className="lc-preco">{brl(item.preco * l.qtd)}</span>
                </div>
                <div className="lc-acoes">
                  <Quantidade valor={l.qtd} onMenos={() => alterarQtd(l.chave, -1)} onMais={() => alterarQtd(l.chave, 1)} />
                  <button type="button" className="link-remover" onClick={() => remover(l.chave)}>
                    Remover
                  </button>
                </div>
              </li>
            )
          })}
        </ul>

        <Link to="/cardapio" className="btn btn-ghost largo">+ Adicionar mais itens</Link>

        <div className="resumo">
          <div><span>Subtotal</span><span>{brl(subtotal)}</span></div>
          <div className="resumo-nota"><span>Taxa de entrega</span><span>calculada no próximo passo</span></div>
        </div>
      </main>

      <div className="barra-fixa">
        <Link to="/cardapio/finalizar" className="btn btn-primary barra-btn">
          <span>Continuar</span>
          <span>{brl(subtotal)}</span>
        </Link>
      </div>
    </>
  )
}
