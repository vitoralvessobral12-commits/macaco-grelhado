// Gera vendas de DEMONSTRAÇÃO dos últimos 60 dias, para o dashboard não aparecer vazio na apresentação.
// Os pedidos gerados ficam marcados com "demo: true" e não mexem nos pedidos de verdade.
//
//   npm run demo:vendas    → apaga os de demonstração antigos e gera de novo
//   npm run demo:limpar    → apaga só os de demonstração

const { listarPedidos, salvarPedidos } = require('../src/armazenamento')

const DIAS = 60

// Itens com o mesmo id, nome e preço do cardápio. "peso" = quanto sai mais.
const ITENS = [
    { itemId: 'b1', nome: 'King Kong', preco: 36.9, peso: 10 },
    { itemId: 'b2', nome: 'Abu', preco: 34.9, peso: 7 },
    { itemId: 'b3', nome: 'Orangotango', preco: 39.9, peso: 6 },
    { itemId: 'b4', nome: 'Primatas Burguer', preco: 35.9, peso: 5 },
    { itemId: 'b5', nome: 'Soin Burguer', preco: 33.9, peso: 4 },
    { itemId: 'b6', nome: 'Gorila', preco: 37.9, peso: 6 },
    { itemId: 'b7', nome: 'Chicken Grelhado', preco: 29.9, peso: 3 },
    { itemId: 'c1', nome: 'O Trio Perfeito', preco: 46.9, peso: 5 },
    { itemId: 'c2', nome: 'Combo com Coca', preco: 44.9, peso: 8 },
    { itemId: 'c3', nome: 'Combo Bando', preco: 149.9, peso: 1 },
    { itemId: 'a1', nome: 'Batata frita', preco: 14.9, peso: 6 },
    { itemId: 'a2', nome: 'Batata bacon e cheddar', preco: 24.9, peso: 4 },
    { itemId: 'a3', nome: 'Onion rings', preco: 18.9, peso: 2 },
    { itemId: 'd1', nome: 'Coca-Cola lata', preco: 6.5, peso: 9 },
    { itemId: 'd2', nome: 'Delrio 220ml', preco: 5.5, peso: 3 },
    { itemId: 'd3', nome: 'Suco natural', preco: 9.9, peso: 2 },
    { itemId: 'd4', nome: 'Milkshake', preco: 18.9, peso: 2 },
]
const BAIRROS = [['Centro', 4], ['Alto da Brasília', 6], ['Campo dos Velhos', 6], ['Derby', 6], ['Dom Expedito', 7], ['Pedrinhas', 7], ['Junco', 8], ['Sumaré', 8]]
const NOMES = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elaine', 'Felipe', 'Gabi', 'Henrique', 'Íris', 'João', 'Larissa', 'Marcos', 'Natália', 'Paulo', 'Rafa', 'Sofia', 'Tiago', 'Vitória']
const PAGAMENTOS = [['pix', 45], ['credito', 25], ['debito', 18], ['dinheiro', 12]]
// Movimento por hora (a loja abre à tarde e pega pico no jantar)
const HORAS = [[17, 2], [18, 6], [19, 10], [20, 10], [21, 8], [22, 5], [23, 2]]

const sortear = (lista) => lista[Math.floor(Math.random() * lista.length)]
function sortearPeso(lista, peso = (x) => x[1]) {
    let r = Math.random() * lista.reduce((s, x) => s + peso(x), 0)
    for (const x of lista) if ((r -= peso(x)) < 0) return x
    return lista[0]
}
const centavos = (v) => Math.round(v * 100) / 100

const reais = listarPedidos().filter((p) => !p.demo)

if (process.argv.includes('--limpar')) {
    salvarPedidos(reais)
    console.log('Pedidos de demonstração apagados. Ficaram', reais.length, 'pedidos de verdade.')
    process.exit(0)
}

const usados = new Set(reais.map((p) => p.id))
function novoId() {
    let id
    do id = String(1000 + Math.floor(Math.random() * 9000))
    while (usados.has(id))
    usados.add(id)
    return id
}

const agora = Date.now()
const demo = []
for (let d = DIAS - 1; d >= 0; d--) {
    const dia = new Date()
    dia.setDate(dia.getDate() - d)
    const fimDeSemana = [0, 5, 6].includes(dia.getDay()) // sex, sáb e dom vendem mais
    const quantidade = Math.round((fimDeSemana ? 14 : 8) + Math.random() * 6)

    for (let n = 0; n < quantidade; n++) {
        const [hora] = sortearPeso(HORAS)
        const quando = new Date(dia)
        quando.setHours(hora, Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 0)
        if (quando.getTime() > agora) continue

        const itens = []
        const qtdLinhas = 1 + Math.floor(Math.random() * 3)
        for (let i = 0; i < qtdLinhas; i++) {
            const item = sortearPeso(ITENS, (x) => x.peso)
            const existente = itens.find((x) => x.itemId === item.itemId)
            if (existente) existente.qtd++
            else itens.push({ itemId: item.itemId, nome: item.nome, preco: item.preco, qtd: Math.random() < 0.2 ? 2 : 1, obs: '' })
        }

        const entrega = Math.random() < 0.7
        const [bairro, frete] = entrega ? sortear(BAIRROS) : [undefined, 0]
        const [pagamento] = sortearPeso(PAGAMENTOS)
        const subtotal = centavos(itens.reduce((s, i) => s + i.preco * i.qtd, 0))
        const total = centavos(subtotal + frete)
        const recusado = Math.random() < 0.05

        demo.push({
            id: novoId(),
            demo: true,
            criadoEm: quando.getTime(),
            atualizadoEm: quando.getTime() + 40 * 60000,
            cliente: { nome: `${sortear(NOMES)} (demo)`, telefone: '(88) 90000-0000' },
            tipo: entrega ? 'entrega' : 'retirada',
            ...(entrega && { bairro, endereco: 'Endereço de demonstração', referencia: '' }),
            pagamento,
            ...(pagamento === 'dinheiro' && { trocoPara: Math.ceil(total / 10) * 10 }),
            itens,
            subtotal,
            frete,
            total,
            etapa: recusado ? 0 : 3,
            ...(recusado && { recusado: { motivo: 'Pedido de demonstração recusado' } }),
        })
    }
}

// Mesma ordem do arquivo: mais novo primeiro
salvarPedidos([...reais, ...demo].sort((a, b) => b.criadoEm - a.criadoEm))
console.log(`Gerados ${demo.length} pedidos de demonstração (${DIAS} dias). Pedidos de verdade mantidos: ${reais.length}.`)
