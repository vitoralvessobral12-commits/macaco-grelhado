const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const config = require('./../config')
const { listarPedidos, buscarPedido, atualizarPedido } = require('./../armazenamento')
const { autenticarLoja } = require('./../middlewares/autenticar')
const { validar } = require('./../middlewares/validar')
const { limiteLoginPainel } = require('./../middlewares/limites')
const { login, paramsPedido, acaoPedido } = require('./../esquemas')
const { loginConfere } = require('./../seguranca')

const ULTIMA_ETAPA = 3

// A loja não precisa da chave secreta do cliente: tira das respostas do painel
const semChave = ({ chave, ...pedido }) => pedido

// Login do painel (atendente): usuário e senha definidos no .env
router.post('/painel/login', limiteLoginPainel, validar({ body: login }), (req, res) => {
    const { usuario, senha } = req.validado.body

    if (!loginConfere(config.painel, usuario, senha)) {
        return res.status(401).json({ error: 'Usuário ou senha incorretos' })
    }

    const token = jwt.sign({ usuario, papel: 'atendente' }, config.jwtSecret, { algorithm: 'HS256', expiresIn: config.duracaoToken.atendente })
    res.json({ token, usuario })
})

// Daqui para baixo, só com login
router.get('/painel/pedidos', autenticarLoja, (req, res) => {
    res.json(listarPedidos().map(semChave))
})

// Ações da loja sobre um pedido
router.patch('/painel/pedidos/:id', autenticarLoja, validar({ params: paramsPedido, body: acaoPedido }), (req, res) => {
    const pedido = buscarPedido(req.validado.params.id)

    if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' })
    }

    const { acao, motivo } = req.validado.body
    const finalizado = pedido.recusado || pedido.etapa >= ULTIMA_ETAPA

    if (finalizado) {
        return res.status(409).json({ error: 'Esse pedido já foi finalizado' })
    }

    if (acao === 'aceitar' || acao === 'recusar') {
        if (pedido.etapa !== 0) {
            return res.status(409).json({ error: 'Esse pedido já foi aceito' })
        }

        if (acao === 'aceitar') {
            return res.json(semChave(atualizarPedido(pedido.id, { etapa: 1 })))
        }

        return res.json(semChave(atualizarPedido(pedido.id, { recusado: { motivo: motivo || 'A loja não pôde aceitar o pedido.' } })))
    }

    // acao === 'avancar': saiu para entrega / pronto para retirar, e depois concluído
    if (pedido.etapa === 0) {
        return res.status(409).json({ error: 'Aceite o pedido primeiro' })
    }
    res.json(semChave(atualizarPedido(pedido.id, { etapa: pedido.etapa + 1 })))
})

module.exports = router
