const crypto = require('crypto')

// Compara textos em tempo constante, para não dar pistas pela demora da resposta (timing attack).
// Os dois lados viram um hash do mesmo tamanho antes de comparar.
function iguais(a, b) {
    const ha = crypto.createHash('sha256').update(String(a)).digest()
    const hb = crypto.createHash('sha256').update(String(b)).digest()
    return crypto.timingSafeEqual(ha, hb)
}

// Confere e-mail (sem diferenciar maiúsculas) e senha de um login fixo do .env
function loginConfere(conta, usuario, senha) {
    const emailOk = iguais(String(usuario).trim().toLowerCase(), conta.usuario)
    const senhaOk = iguais(senha, conta.senha)
    return emailOk && senhaOk
}

// Chave secreta do pedido (32 caracteres hex): sem ela, não dá para ver o pedido de outra pessoa
const novaChave = () => crypto.randomBytes(16).toString('hex')

module.exports = { iguais, loginConfere, novaChave }
