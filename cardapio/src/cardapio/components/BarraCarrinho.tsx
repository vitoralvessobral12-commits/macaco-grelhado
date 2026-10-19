import { Link } from 'react-router-dom'
import { brl } from '../../data/cardapio'
import { useCarrinho } from '../context/CarrinhoContext'

// Barra fixa no rodapé que aparece quando há itens no carrinho.
export function BarraCarrinho() {
  const { quantidade, subtotal } = useCarrinho()
  if (!quantidade) return null
  return (
    <div className="barra-fixa">
      <Link to="/cardapio/carrinho" className="btn btn-primary barra-btn">
        <span className="barra-qtd">{quantidade}</span>
        <span>Ver carrinho</span>
        <span>{brl(subtotal)}</span>
      </Link>
    </div>
  )
}
