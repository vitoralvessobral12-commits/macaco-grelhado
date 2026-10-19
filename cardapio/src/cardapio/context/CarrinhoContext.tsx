import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ITENS } from '../../data/cardapio'

// Uma linha do carrinho. O mesmo item com observações diferentes vira linhas separadas
// (ex.: 1 Clássico normal + 1 Clássico "sem cebola").
export type Linha = { chave: string; itemId: string; qtd: number; obs: string }

type Carrinho = {
  linhas: Linha[]
  quantidade: number
  subtotal: number
  qtdDoItem: (itemId: string) => number
  adicionar: (itemId: string, qtd?: number, obs?: string) => void
  alterarQtd: (chave: string, delta: number) => void
  remover: (chave: string) => void
  limpar: () => void
}

const CHAVE_STORAGE = 'mg_carrinho'
const CarrinhoCtx = createContext<Carrinho | null>(null)

function carregar(): Linha[] {
  try {
    const salvo: Linha[] = JSON.parse(localStorage.getItem(CHAVE_STORAGE) || '[]')
    return salvo.filter((l) => ITENS[l.itemId] && l.qtd > 0)
  } catch {
    return []
  }
}

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [linhas, setLinhas] = useState<Linha[]>(carregar)

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(linhas))
    } catch {
      /* navegação anônima: segue sem salvar */
    }
  }, [linhas])

  const valor = useMemo<Carrinho>(() => {
    const adicionar = (itemId: string, qtd = 1, obs = '') => {
      const obsLimpa = obs.trim()
      const chave = `${itemId}|${obsLimpa}`
      setLinhas((atual) => {
        const existe = atual.find((l) => l.chave === chave)
        if (existe) return atual.map((l) => (l.chave === chave ? { ...l, qtd: l.qtd + qtd } : l))
        return [...atual, { chave, itemId, qtd, obs: obsLimpa }]
      })
    }
    const alterarQtd = (chave: string, delta: number) =>
      setLinhas((atual) =>
        atual.map((l) => (l.chave === chave ? { ...l, qtd: l.qtd + delta } : l)).filter((l) => l.qtd > 0),
      )
    return {
      linhas,
      quantidade: linhas.reduce((s, l) => s + l.qtd, 0),
      subtotal: linhas.reduce((s, l) => s + ITENS[l.itemId].preco * l.qtd, 0),
      qtdDoItem: (itemId) => linhas.filter((l) => l.itemId === itemId).reduce((s, l) => s + l.qtd, 0),
      adicionar,
      alterarQtd,
      remover: (chave) => setLinhas((atual) => atual.filter((l) => l.chave !== chave)),
      limpar: () => setLinhas([]),
    }
  }, [linhas])

  return <CarrinhoCtx.Provider value={valor}>{children}</CarrinhoCtx.Provider>
}

export function useCarrinho() {
  const ctx = useContext(CarrinhoCtx)
  if (!ctx) throw new Error('useCarrinho precisa estar dentro de <CarrinhoProvider>')
  return ctx
}
