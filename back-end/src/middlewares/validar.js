// Confere body, params e query da requisição com esquemas do Zod.
// Se algo vier errado, responde 400 com a primeira mensagem, sem chegar na rota.
// Os dados já limpos ficam em req.validado (no Express 5 o req.query não pode ser trocado).

function validar(esquemas) {
    return (req, res, next) => {
        req.validado = {}
        for (const parte of ['params', 'query', 'body']) {
            if (!esquemas[parte]) continue
            const resultado = esquemas[parte].safeParse(req[parte] ?? {})
            if (!resultado.success) {
                const mensagem = resultado.error.issues[0]?.message || 'Dados inválidos'
                return res.status(400).json({ error: mensagem })
            }
            req.validado[parte] = resultado.data
        }
        next()
    }
}

module.exports = { validar }
