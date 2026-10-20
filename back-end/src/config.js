// Lê e confere as variáveis de ambiente. Se faltar alguma obrigatória, o servidor nem sobe
// (melhor falhar na hora do deploy do que rodar sem senha ou com segredo fraco).

const producao = process.env.NODE_ENV === 'production'

const OBRIGATORIAS = ['JWT_SECRET', 'PAINEL_USUARIO', 'PAINEL_SENHA', 'GERENTE_USUARIO', 'GERENTE_SENHA']
// Em produção também é obrigatório dizer quais sites podem chamar a API
if (producao) OBRIGATORIAS.push('CORS_ORIGINS')

const faltando = OBRIGATORIAS.filter((nome) => !process.env[nome]?.trim())
if (faltando.length) {
    throw new Error(`Faltam variáveis no .env: ${faltando.join(', ')} (veja o .env.example)`)
}

if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET muito curto: use pelo menos 32 caracteres aleatórios (veja o .env.example)')
}

// Sites que podem chamar a API, separados por vírgula.
// Em desenvolvimento, sem CORS_ORIGINS, libera tudo (para testar pelo celular na rede local).
const origens = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean)

module.exports = {
    producao,
    porta: Number(process.env.PORT) || 4002,
    jwtSecret: process.env.JWT_SECRET,
    painel: { usuario: process.env.PAINEL_USUARIO.trim().toLowerCase(), senha: process.env.PAINEL_SENHA },
    gerente: { usuario: process.env.GERENTE_USUARIO.trim().toLowerCase(), senha: process.env.GERENTE_SENHA },
    origens,
    // Tempo de login: atendente cobre um turno; gerente só o tempo de olhar os números
    duracaoToken: { atendente: '8h', gerente: '2h' }
}
