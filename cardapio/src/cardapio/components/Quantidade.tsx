type Props = { valor: number; onMenos: () => void; onMais: () => void; min?: number }

export function Quantidade({ valor, onMenos, onMais, min = 0 }: Props) {
  return (
    <div className="qtd">
      <button type="button" onClick={onMenos} disabled={valor <= min} aria-label="Diminuir">
        −
      </button>
      <b aria-live="polite">{valor}</b>
      <button type="button" onClick={onMais} aria-label="Aumentar">
        +
      </button>
    </div>
  )
}
