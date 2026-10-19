import { Outlet } from 'react-router-dom'
import { CarrinhoProvider } from './context/CarrinhoContext'
import './cardapio.css'

// Envolve todas as páginas do cardápio (lista, item, carrinho, finalizar e acompanhamento),
// para que todas compartilhem o mesmo carrinho e o mesmo visual.
export default function CardapioLayout() {
  return (
    <CarrinhoProvider>
      <div className="cardapio-app">
        <Outlet />
      </div>
    </CarrinhoProvider>
  )
}
