const { rateLimit } = require('express-rate-limit')

// Limite de requisições por IP (rate limiting).
const QUINZE_MIN = 15 * 60 * 1000

const resposta = (mensagem) => ({ error: mensagem })

// Geral: folgado, porque o painel consulta os pedidos a cada 2 s (~450 por 15 min)
// e o cliente acompanha o pedido a cada 3 s.
const limiteGeral = rateLimit({
    windowMs: QUINZE_MIN,
    limit: 1000,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: resposta('Muitas requisições. Espere alguns minutos e tente de novo.')
})

// Login: 10 tentativas ERRADAS a cada 15 min por IP.
// Um contador para cada tela, para erros no painel não bloquearem o login do gerente.
const criarLimiteLogin = () =>
    rateLimit({
        windowMs: QUINZE_MIN,
        limit: 10,
        skipSuccessfulRequests: true,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: resposta('Muitas tentativas de login. Espere 15 minutos e tente de novo.')
    })
const limiteLoginPainel = criarLimiteLogin()
const limiteLoginDashboard = criarLimiteLogin()

// Novos pedidos: evita alguém encher o painel da loja com pedidos falsos
const limitePedidos = rateLimit({
    windowMs: QUINZE_MIN,
    limit: 15,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: resposta('Muitos pedidos seguidos. Se precisar, chame a loja no WhatsApp.')
})

module.exports = { limiteGeral, limiteLoginPainel, limiteLoginDashboard, limitePedidos }
