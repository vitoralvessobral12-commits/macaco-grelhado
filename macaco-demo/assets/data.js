// ===== CONFIGURAÇÃO =====
// DEMO = true: o botão de pedido mostra a mensagem pronta, mas NÃO abre o WhatsApp real.
// Quando o cliente aprovar, troque para false e confira o número.
window.MACACO = {
  DEMO: true,
  whatsapp: "5588992219121", // (88) 99221-9121 — número que aparece nas artes do Instagram
  instagram: "https://www.instagram.com/macacogrelhado/",
  endereco: "R. Oriano Mendes, 217 – Centro, Sobral/CE",
  mapsQuery: "Rua Oriano Mendes 217 Centro Sobral CE",
  horario: "A confirmar com o restaurante",
  taxaEntrega: 0, // a confirmar
};

// ===== CARDÁPIO DE EXEMPLO =====
// Itens e preços são ILUSTRATIVOS. Substituir pelo cardápio oficial antes de publicar.
window.CARDAPIO = [
  { cat: "Burgers", itens: [
    { id: "b1", nome: "Macaco Clássico", desc: "Pão brioche, blend 150g, queijo cheddar, alface, tomate e molho da casa.", preco: 28.9, tag: "Mais pedido" },
    { id: "b2", nome: "Macaco Bacon", desc: "Blend 150g, cheddar duplo, bacon crocante e cebola caramelizada.", preco: 34.9 },
    { id: "b3", nome: "Gorila Duplo", desc: "Dois blends de 150g, queijo prato, bacon, picles e maionese verde.", preco: 42.9, tag: "Fome de gorila" },
    { id: "b4", nome: "Banana Smash", desc: "Dois smash 90g, queijo, banana caramelizada e barbecue.", preco: 31.9 },
    { id: "b5", nome: "Chicken Grelhado", desc: "Frango empanado crocante, queijo, alface e molho especial.", preco: 27.9 },
  ]},
  { cat: "Combos", itens: [
    { id: "c1", nome: "Combo Clássico", desc: "Macaco Clássico + batata média + refri lata.", preco: 39.9, tag: "Economize" },
    { id: "c2", nome: "Combo Kids", desc: "Mini burger + batata pequena + suco.", preco: 26.9 },
    { id: "c3", nome: "Combo Dupla", desc: "2 Macaco Bacon + batata grande + 2 refris.", preco: 84.9 },
  ]},
  { cat: "Acompanhamentos", itens: [
    { id: "a1", nome: "Batata frita média", desc: "Crocante, com sal e páprica.", preco: 14.9 },
    { id: "a2", nome: "Batata cheddar e bacon", desc: "Batata média coberta com cheddar cremoso e bacon.", preco: 22.9 },
    { id: "a3", nome: "Onion rings", desc: "Anéis de cebola empanados (8 un).", preco: 18.9 },
  ]},
  { cat: "Bebidas", itens: [
    { id: "d1", nome: "Refrigerante lata", desc: "Coca-Cola, Guaraná ou Fanta (350ml).", preco: 6.5 },
    { id: "d2", nome: "Suco natural", desc: "Laranja, maracujá ou acerola (400ml).", preco: 9.9 },
    { id: "d3", nome: "Milkshake", desc: "Chocolate, morango ou ovomaltine (400ml).", preco: 18.9 },
  ]},
];

window.brl = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
