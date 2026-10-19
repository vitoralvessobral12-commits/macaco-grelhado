import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import CardapioLayout from './cardapio/CardapioLayout'
import CardapioPage from './cardapio/pages/CardapioPage'
import ItemPage from './cardapio/pages/ItemPage'
import CarrinhoPage from './cardapio/pages/CarrinhoPage'
import FinalizarPage from './cardapio/pages/FinalizarPage'
import PedidoPage from './cardapio/pages/PedidoPage'
import NaoEncontrada from './components/NaoEncontrada'

// Volta ao topo ao trocar de página (exceto quando o link aponta para uma âncora).
function ScrollTopo() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <>
      <ScrollTopo />
      <Routes>
        <Route path="/" element={<Navigate to="/cardapio" replace />} />

        {/* Todas as páginas compartilham o mesmo carrinho */}
        <Route element={<CardapioLayout />}>
          <Route path="/cardapio" element={<CardapioPage />} />
          <Route path="/cardapio/item/:id" element={<ItemPage />} />
          <Route path="/cardapio/carrinho" element={<CarrinhoPage />} />
          <Route path="/cardapio/finalizar" element={<FinalizarPage />} />
          <Route path="/pedido/:id" element={<PedidoPage />} />
        </Route>

        <Route path="*" element={<NaoEncontrada />} />
      </Routes>
    </>
  )
}
