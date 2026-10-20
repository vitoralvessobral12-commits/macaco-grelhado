const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const config = require('./../config')
const { listarPedidos } = require('./../armazenamento')
const { autenticarGerente } = require('./../middlewares/autenticar')
const { validar } = require('./../middlewares/validar')
const { limiteLoginDashboard } = require('./../middlewares/limites')
const { login, queryPeriodo } = require('./../esquemas')
const { loginConfere } = require('./../seguranca')

// Login do dashboard: só o gerente (GERENTE_USUARIO e GERENTE_SENHA no .env)
router.post('/dashboard/login', limiteLoginDashboard, validar({ body: login }), (req, res) => {
    const { usuario, senha } = req.validado.body

    if (!loginConfere(config.gerente, usuario, senha)) {
        return res.status(401).json({ error: 'Usuário ou senha incorretos' })
    }

    const token = jwt.sign({ usuario, papel: 'gerente' }, config.jwtSecret, { algorithm: 'HS256', expiresIn: config.duracaoToken.gerente })
    res.json({ token, usuario })
})

// Pedidos de um período (?de=<ms>&ate=<ms>), para os números e gráficos do dashboard.
// O período é calculado no navegador, no fuso de quem está vendo.
router.get('/dashboard/pedidos', autenticarGerente, validar({ query: queryPeriodo }), (req, res) => {
    const { de, ate } = req.validado.query
    res.json(
        listarPedidos()
            .filter((p) => p.criadoEm >= de && p.criadoEm < ate)
            // Sem a chave secreta do cliente nem o telefone: o financeiro não precisa disso
            .map(({ chave, cliente, ...p }) => ({ ...p, cliente: { nome: cliente.nome } }))
    )
})

module.exports = router
