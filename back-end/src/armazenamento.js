const fs = require('fs')
const path = require('path')

// Guarda os pedidos em um arquivo JSON. Suficiente para a demonstração;
// na versão real, isso vira uma tabela no banco de dados.
const ARQUIVO = path.resolve(__dirname, '../data/pedidos.json')

function listarPedidos() {
    try {
        return JSON.parse(fs.readFileSync(ARQUIVO, 'utf8'))
    } catch (error) {
        return []
    }
}

function salvarPedidos(pedidos) {
    fs.mkdirSync(path.dirname(ARQUIVO), { recursive: true })
    fs.writeFileSync(ARQUIVO, JSON.stringify(pedidos, null, 2))
}

function buscarPedido(id) {
    return listarPedidos().find((p) => p.id === id)
}

function adicionarPedido(pedido) {
    salvarPedidos([pedido, ...listarPedidos()])
}

function atualizarPedido(id, alteracoes) {
    const pedidos = listarPedidos()
    const indice = pedidos.findIndex((p) => p.id === id)
    if (indice === -1) return null

    pedidos[indice] = { ...pedidos[indice], ...alteracoes, atualizadoEm: Date.now() }
    salvarPedidos(pedidos)
    return pedidos[indice]
}

// Código curto de 4 dígitos, fácil de falar no telefone ("pedido 4821")
function novoId() {
    const usados = new Set(listarPedidos().map((p) => p.id))
    let id
    do {
        id = String(1000 + Math.floor(Math.random() * 9000))
    } while (usados.has(id))
    return id
}

module.exports = {
    listarPedidos,
    salvarPedidos,
    buscarPedido,
    adicionarPedido,
    atualizarPedido,
    novoId
}
