const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const { listarPedidos } = require('./../armazenamento')
const { autenticarGerente } = require('./../middlewares/autenticar')

// Login do dashboard: só o gerente (GERENTE_USUARIO e GERENTE_SENHA no .env)
router.post('/dashboard/login', (req, res) => {
    if (!process.env.GERENTE_USUARIO || !process.env.GERENTE_SENHA) {
        return res.status(503).json({ error: 'Dashboard não configurado (veja o .env.example)' })
    }

    const { usuario, senha } = req.body || {}
    const emailCorreto = String(usuario || '').trim().toLowerCase() === process.env.GERENTE_USUARIO.toLowerCase()

    if (!emailCorreto || senha !== process.env.GERENTE_SENHA) {
        return res.status(401).json({ error: 'Usuário ou senha incorretos' })
    }

    const token = jwt.sign({ usuario, papel: 'gerente' }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '12h' })
    res.json({ token, usuario })
})

// Pedidos de um período (?de=<ms>&ate=<ms>), para os números e gráficos do dashboard.
// O período é calculado no navegador, no fuso de quem está vendo.
router.get('/dashboard/pedidos', autenticarGerente, (req, res) => {
    const de = Number(req.query.de)
    const ate = Number(req.query.ate)

    if (!Number.isFinite(de) || !Number.isFinite(ate) || de > ate) {
        return res.status(400).json({ error: 'Período inválido' })
    }

    res.json(listarPedidos().filter((p) => p.criadoEm >= de && p.criadoEm < ate))
})

module.exports = router
