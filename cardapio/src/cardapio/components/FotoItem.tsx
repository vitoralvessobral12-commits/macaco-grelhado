import { CATEGORIA_DO_ITEM } from '../../data/cardapio'
import type { Item } from '../../data/cardapio'

const ICONE = { burgers: '🍔', combos: '🍔', acompanhamentos: '🍟', bebidas: '🥤' }

type Props = { item: Item; className?: string; prioridade?: boolean }

// Foto do item; sem foto, mostra o ícone da categoria num fundo neutro.
export function FotoItem({ item, className = '', prioridade = false }: Props) {
  if (!item.foto) {
    return (
      <div className={`foto-item sem-foto ${className}`} aria-hidden="true">
        <span>{ICONE[CATEGORIA_DO_ITEM[item.id]]}</span>
      </div>
    )
  }
  return (
    <div className={`foto-item ${className}`}>
      <img src={item.foto} alt={item.nome} loading={prioridade ? 'eager' : 'lazy'} decoding="async" style={item.posicaoFoto ? { objectPosition: item.posicaoFoto } : undefined} />
    </div>
  )
}
