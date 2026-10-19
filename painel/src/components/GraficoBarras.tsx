import type { Barra } from '../dashboard'

// Gráfico de barras feito só com HTML/CSS (sem biblioteca).
// - vertical: colunas ao longo do tempo (dias ou horas), com linhas de grade e balão ao passar o mouse;
// - horizontal: ranking (mais vendidos, pagamentos...), com o valor escrito ao lado de cada barra.

type Props = {
  dados: Barra[]
  formato: (v: number) => string
  orientacao?: 'vertical' | 'horizontal'
  vazio?: string
}

// Arredonda o topo da escala para um número "redondo" (ex.: 437 → 500)
function topoDaEscala(max: number) {
  if (max <= 0) return 1
  const base = 10 ** Math.floor(Math.log10(max))
  return [1, 2, 2.5, 5, 10].map((m) => m * base).find((v) => v >= max)!
}

export function GraficoBarras({ dados, formato, orientacao = 'horizontal', vazio = 'Sem vendas no período.' }: Props) {
  const max = Math.max(0, ...dados.map((d) => d.valor))
  if (max === 0) return <p className="grafico-vazio">{vazio}</p>

  if (orientacao === 'horizontal') {
    return (
      <ul className="barras-h">
        {dados.map((d) => (
          <li key={d.rotulo} tabIndex={0} data-dica={d.dica}>
            <span className="barras-h-rotulo">{d.rotulo}</span>
            <span className="barras-h-trilho">
              <span className="barras-h-barra" style={{ width: `${(d.valor / max) * 100}%` }} />
            </span>
            <span className="barras-h-valor">{formato(d.valor)}</span>
          </li>
        ))}
      </ul>
    )
  }

  const topo = topoDaEscala(max)
  // Com muitas colunas, mostra só alguns rótulos embaixo para não embolar (sempre inclui o último)
  const passo = Math.ceil(dados.length / 8)

  return (
    <div className="barras-v">
      <div className="barras-v-grade" aria-hidden="true">
        {[1, 0.5, 0].map((f) => (
          <span key={f} style={{ bottom: `${f * 100}%` }}>{formato(topo * f)}</span>
        ))}
      </div>
      <div className="barras-v-area" role="list">
        {dados.map((d, i) => (
          <div key={d.rotulo} className="barras-v-coluna" role="listitem" tabIndex={0} data-dica={d.dica} aria-label={d.dica}>
            <span className="barras-v-barra" style={{ height: `${(d.valor / topo) * 100}%` }} />
            <span className="barras-v-rotulo">{(dados.length - 1 - i) % passo === 0 ? d.rotulo : ''}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
