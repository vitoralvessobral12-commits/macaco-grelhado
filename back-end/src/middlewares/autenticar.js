const jwt = require('jsonwebtoken')

// Lê e confere o token do cabeçalho "Authorization: Bearer <token>".
// Devolve os dados do token ou null (sem token, inválido ou vencido).
function lerToken(req) {
    const [esquema, token] = (req.headers.authorization || '').split(' ')
    if (esquema !== 'Bearer' || !token) return null

    try {
        return jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
    } catch (error) {
        return null
    }
}

// Só deixa passar quem fez login no painel (atendente)
function autenticarLoja(req, res, next) {
    const decoded = lerToken(req)

    if (!decoded || decoded.papel === 'gerente') {
        return res.status(401).json({ error: 'Sessão expirada, faça login novamente' })
    }

    req.loja = { usuario: decoded.usuario }
    next()
}

// Só deixa passar quem fez login no dashboard (gerente).
// O token do atendente NÃO serve aqui: o financeiro fica só com o gerente.
function autenticarGerente(req, res, next) {
    const decoded = lerToken(req)

    if (!decoded || decoded.papel !== 'gerente') {
        return res.status(401).json({ error: 'Faça login no dashboard' })
    }

    req.gerente = { usuario: decoded.usuario }
    next()
}

module.exports = { autenticarLoja, autenticarGerente }
