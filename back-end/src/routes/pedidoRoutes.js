const express = require('express')
const router = express.Router()
const { adicionarPedido, buscarPedido, novoId } = require('./../armazenamento')

// Rotas públicas: usadas pelo site do cardápio (cliente)

// Cliente envia o pedido
router.post('/pedidos', (req, res) => {
    const { cliente, tipo, bairro, endereco, referencia, pagamento, trocoPara, itens, frete } = req.body || {}

    if (!cliente?.nome || !cliente?.telefone) {
        return res.status(400).json({ error: 'Informe nome e telefone' })
    }

    if (!Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ error: 'O pedido está vazio' })
    }

    if (tipo !== 'entrega' && tipo !== 'retirada') {
        return res.status(400).json({ error: 'Escolha entrega ou retirada' })
    }

    const itensLimpos = itens.map((i) => ({
        itemId: String(i.itemId),
        nome: String(i.nome),
        preco: Number(i.preco) || 0,
        qtd: Math.max(1, Number(i.qtd) || 1),
        obs: String(i.obs || '')
    }))

    // O total é sempre refeito aqui a partir dos itens
    const subtotal = itensLimpos.reduce((soma, i) => soma + i.preco * i.qtd, 0)
    const valorFrete = tipo === 'entrega' ? Number(frete) || 0 : 0

    const pedido = {
        id: novoId(),
        criadoEm: Date.now(),
        atualizadoEm: Date.now(),
        cliente: { nome: String(cliente.nome), telefone: String(cliente.telefone) },
        tipo,
        ...(tipo === 'entrega' && { bairro, endereco, referencia }),
        pagamento,
        ...(trocoPara && { trocoPara: Number(trocoPara) }),
        itens: itensLimpos,
        subtotal,
        frete: valorFrete,
        total: subtotal + valorFrete,
        // 0 = enviado, 1 = aceito (na grelha), 2 = saiu para entrega / pronto, 3 = entregue / retirado
        etapa: 0
    }

    adicionarPedido(pedido)
    res.status(201).json(pedido)
})

// Cliente acompanha o pedido
router.get('/pedidos/:id', (req, res) => {
    const pedido = buscarPedido(req.params.id)

    if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' })
    }

    res.json(pedido)
})

module.exports = router
