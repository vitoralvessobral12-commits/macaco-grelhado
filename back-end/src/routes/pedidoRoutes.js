const express = require('express')
const router = express.Router()
const { adicionarPedido, buscarPedido, novoId } = require('./../armazenamento')
const { validar } = require('./../middlewares/validar')
const { limitePedidos } = require('./../middlewares/limites')
const { paramsPedido, queryAcompanhar, novoPedido } = require('./../esquemas')
const { iguais, novaChave } = require('./../seguranca')

// Rotas públicas: usadas pelo site do cardápio (cliente)

const centavos = (v) => Math.round(v * 100) / 100

// Cliente envia o pedido
router.post('/pedidos', limitePedidos, validar({ body: novoPedido }), (req, res) => {
    const { cliente, tipo, bairro, endereco, referencia, pagamento, trocoPara, itens, frete } = req.validado.body

    // O total é sempre refeito aqui a partir dos itens
    const subtotal = centavos(itens.reduce((soma, i) => soma + i.preco * i.qtd, 0))
    const valorFrete = tipo === 'entrega' ? frete : 0

    const pedido = {
        id: novoId(),
        // Chave secreta: vai só para quem fez o pedido, no link de acompanhamento
        chave: novaChave(),
        criadoEm: Date.now(),
        atualizadoEm: Date.now(),
        cliente,
        tipo,
        ...(tipo === 'entrega' && { bairro, endereco, referencia: referencia || '' }),
        pagamento,
        ...(pagamento === 'dinheiro' && trocoPara && { trocoPara }),
        itens,
        subtotal,
        frete: valorFrete,
        total: centavos(subtotal + valorFrete),
        // 0 = enviado, 1 = aceito (na grelha), 2 = saiu para entrega / pronto, 3 = entregue / retirado
        etapa: 0
    }

    adicionarPedido(pedido)
    res.status(201).json(pedido)
})

// Cliente acompanha o pedido: precisa do número E da chave secreta (/pedidos/4821?chave=...).
// Sem a chave, trocar o número não mostra o pedido (nem nome, telefone e endereço) de outra pessoa.
router.get('/pedidos/:id', validar({ params: paramsPedido, query: queryAcompanhar }), (req, res) => {
    const pedido = buscarPedido(req.validado.params.id)

    // Mesma resposta para "não existe" e "chave errada", para não revelar quais números existem
    if (!pedido || !pedido.chave || !iguais(pedido.chave, req.validado.query.chave)) {
        return res.status(404).json({ error: 'Pedido não encontrado' })
    }

    res.json(pedido)
})

module.exports = router
