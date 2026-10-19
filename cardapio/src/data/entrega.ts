// Bairros atendidos e taxa de entrega. Valores de EXEMPLO: confirmar com a loja.

export type Bairro = { nome: string; frete: number }

export const BAIRROS: Bairro[] = [
  { nome: 'Centro', frete: 4 },
  { nome: 'Alto da Brasília', frete: 6 },
  { nome: 'Campo dos Velhos', frete: 6 },
  { nome: 'Derby', frete: 6 },
  { nome: 'Dom Expedito', frete: 7 },
  { nome: 'Pedrinhas', frete: 7 },
  { nome: 'Junco', frete: 8 },
  { nome: 'Sumaré', frete: 8 },
  { nome: 'Cohab II', frete: 9 },
  { nome: 'Expectativa', frete: 9 },
]

export const TEMPO_ENTREGA = '40–60 min'
export const TEMPO_RETIRADA = '20–30 min'
