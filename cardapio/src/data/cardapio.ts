// Cardápio da PRÉVIA. Nomes e fotos vêm do Instagram do Macaco Grelhado;
// descrições e preços são ilustrativos: confirmar com a loja antes de publicar.
// ATENÇÃO: existe uma cópia deste arquivo em landing-page/src/data/ (usada nos destaques).

export type Categoria = 'burgers' | 'combos' | 'acompanhamentos' | 'bebidas'

export type Item = {
  id: string
  nome: string
  desc: string
  preco: number
  tag?: string
  foto?: string // caminho em /public (ex.: /fotos/king-kong.jpg)
  posicaoFoto?: string // enquadramento (object-position) quando a arte tem texto; padrão: 'center 68%'
}

export type Secao = {
  slug: Categoria
  nome: string
  itens: Item[]
}

export const CARDAPIO: Secao[] = [
  {
    slug: 'burgers',
    nome: 'Burgers',
    itens: [
      { id: 'b1', nome: 'King Kong', desc: 'Pão vermelho, blend grelhado, queijo derretido, cebola roxa, picles, alface e batata palha.', preco: 36.9, tag: 'Mais pedido', foto: '/fotos/king-kong.jpg' },
      { id: 'b2', nome: 'Abu', desc: 'Pão brioche, blend 150g, bacon, cebola caramelizada e creme de queijo.', preco: 34.9, foto: '/fotos/abu.jpg', posicaoFoto: 'center 12%' },
      { id: 'b3', nome: 'Orangotango', desc: 'Pão australiano, blend, calabresa grelhada, presunto, queijo coalho, ovo, alface e tomate.', preco: 39.9, tag: 'Fome de gorila', foto: '/fotos/orangotango.jpg' },
      { id: 'b4', nome: 'Primatas Burguer', desc: 'Blend 150g, cheddar cremoso, nachos crocantes e cebola caramelizada.', preco: 35.9, tag: 'Crocante', foto: '/fotos/primatas.jpg' },
      { id: 'b5', nome: 'Soin Burguer', desc: 'Pão australiano, blend, queijo coalho grelhado, presunto, ovo, alface e tomate.', preco: 33.9, foto: '/fotos/soin.jpg' },
      { id: 'b6', nome: 'Gorila', desc: 'Pão australiano, blend, bacon, ovo, queijo, molho barbecue, alface e tomate.', preco: 37.9, foto: '/fotos/gorila.jpg' },
      { id: 'b7', nome: 'Chicken Grelhado', desc: 'Pão brioche, frango grelhado, presunto, queijo, ovo, alface e tomate.', preco: 29.9, foto: '/fotos/chicken.jpg' },
    ],
  },
  {
    slug: 'combos',
    nome: 'Combos',
    itens: [
      { id: 'c1', nome: 'O Trio Perfeito', desc: 'King Kong + batata frita + Delrio 220ml.', preco: 46.9, tag: 'Economize', foto: '/fotos/trio-perfeito.jpg' },
      { id: 'c2', nome: 'Combo com Coca', desc: 'Soin Burguer + batata frita + Coca-Cola lata.', preco: 44.9, foto: '/fotos/combo-coca.jpg' },
      { id: 'c3', nome: 'Combo Bando', desc: '4 burgers à sua escolha + 2 batatas grandes + 4 refris. Para dividir com a galera.', preco: 149.9, tag: 'Para 4', foto: '/fotos/mesa-neon.jpg' },
    ],
  },
  {
    slug: 'acompanhamentos',
    nome: 'Acompanhamentos',
    itens: [
      { id: 'a1', nome: 'Batata frita', desc: 'Porção média, crocante, com sal e páprica.', preco: 14.9 },
      { id: 'a2', nome: 'Batata bacon e cheddar', desc: 'Batata coberta com cheddar cremoso e muito bacon crocante.', preco: 24.9, tag: 'Queridinha', foto: '/fotos/batata-cheddar.jpg' },
      { id: 'a3', nome: 'Onion rings', desc: 'Anéis de cebola empanados (8 un).', preco: 18.9 },
    ],
  },
  {
    slug: 'bebidas',
    nome: 'Bebidas',
    itens: [
      { id: 'd1', nome: 'Coca-Cola lata', desc: 'Coca-Cola original 350ml, bem gelada.', preco: 6.5, foto: '/fotos/coca-cola.jpg' },
      { id: 'd2', nome: 'Delrio 220ml', desc: 'O refrigerante de garrafinha que combina com tudo.', preco: 5.5, foto: '/fotos/delrio.jpg' },
      { id: 'd3', nome: 'Suco natural', desc: 'Laranja, maracujá ou acerola (400ml).', preco: 9.9 },
      { id: 'd4', nome: 'Milkshake', desc: 'Chocolate, morango ou ovomaltine (400ml).', preco: 18.9 },
    ],
  },
]

export const ITENS: Record<string, Item> = Object.fromEntries(
  CARDAPIO.flatMap((c) => c.itens.map((i) => [i.id, i])),
)

// Categoria de cada item (usada para escolher o ícone quando o item não tem foto).
export const CATEGORIA_DO_ITEM: Record<string, Categoria> = Object.fromEntries(
  CARDAPIO.flatMap((c) => c.itens.map((i) => [i.id, c.slug])),
)

export const DESTAQUES = ['b1', 'b3', 'c1'].map((id) => ITENS[id])

export const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
