const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const { listarPedidos, buscarPedido, atualizarPedido } = require('./../armazenamento')
const { autenticarLoja } = require('./../middlewares/autenticar')

const ULTIMA_ETAPA = 3

// Login do painel: usuário e senha definidos no .env
router.post('/painel/login', (req, res) => {
    const { usuario, senha } = req.body || {}

    // E-mail sem diferenciar maiúsculas/minúsculas ("Vitor@..." = "vitor@...")
    const emailCorreto = String(usuario || '').trim().toLowerCase() === process.env.PAINEL_USUARIO.toLowerCase()

    if (!emailCorreto || senha !== process.env.PAINEL_SENHA) {
        return res.status(401).json({ error: 'Usuário ou senha incorretos' })
    }

    const token = jwt.sign({ usuario, papel: 'atendente' }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '12h' })
    res.json({ token, usuario })
})

// Daqui para baixo, só com login
router.get('/painel/pedidos', autenticarLoja, (req, res) => {
    res.json(listarPedidos())
})

// Ações da loja sobre um pedido
router.patch('/painel/pedidos/:id', autenticarLoja, (req, res) => {
    const pedido = buscarPedido(req.params.id)

    if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' })
    }

    const { acao, motivo } = req.body || {}
    const finalizado = pedido.recusado || pedido.etapa >= ULTIMA_ETAPA

    if (finalizado) {
        return res.status(409).json({ error: 'Esse pedido já foi finalizado' })
    }

    if (acao === 'aceitar' || acao === 'recusar') {
        if (pedido.etapa !== 0) {
            return res.status(409).json({ error: 'Esse pedido já foi aceito' })
        }

        if (acao === 'aceitar') {
            return res.json(atualizarPedido(pedido.id, { etapa: 1 }))
        }

        return res.json(atualizarPedido(pedido.id, { recusado: { motivo: String(motivo || 'A loja não pôde aceitar o pedido.') } }))
    }

    // Saiu para entrega / pronto para retirar, e depois concluído
    if (acao === 'avancar') {
        if (pedido.etapa === 0) {
            return res.status(409).json({ error: 'Aceite o pedido primeiro' })
        }
        return res.json(atualizarPedido(pedido.id, { etapa: pedido.etapa + 1 }))
    }

    res.status(400).json({ error: 'Ação inválida' })
})

module.exports = router
