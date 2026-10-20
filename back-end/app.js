// Lê o .env desta pasta, mesmo se o servidor for iniciado de outro diretório
require('dotenv').config({ path: require('path').resolve(__dirname, '.env'), quiet: true })

// Servidor simples da PRÉVIA: recebe os pedidos do cardápio e entrega para o painel da loja.
// Sem banco de dados: os pedidos ficam no arquivo data/pedidos.json.

// Confere as variáveis do .env antes de tudo (o servidor não sobe se faltar alguma)
const config = require('./src/config')

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const { limiteGeral } = require('./src/middlewares/limites')
const app = express()

const pedidoRoutes = require('./src/routes/pedidoRoutes')
const painelRoutes = require('./src/routes/painelRoutes')
const dashboardRoutes = require('./src/routes/dashboardRoutes')

// Atrás do proxy do Render: usa o IP real do visitante (necessário para o limite por IP)
app.set('trust proxy', 1)
app.disable('x-powered-by')

// Cabeçalhos de segurança (a API só responde JSON, então a política pode ser bem fechada)
app.use(helmet())

// CORS: só os sites do cardápio e do painel podem chamar a API (CORS_ORIGINS no .env).
// Em desenvolvimento, sem CORS_ORIGINS, libera tudo para testar pelo celular na rede local.
app.use(
    cors({
        origin: config.origens.length ? config.origens : !config.producao,
        methods: ['GET', 'POST', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization']
    })
)

app.use(express.json({ limit: '10kb' }))

// Para monitoramento (UptimeRobot) e para "acordar" o servidor gratuito antes de uma apresentação
app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
})

app.use(limiteGeral)

app.use(pedidoRoutes)
app.use(painelRoutes)
app.use(dashboardRoutes)

app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' })
})

// Erros: o cliente recebe só uma mensagem genérica; o detalhe fica no log do servidor
app.use((error, req, res, next) => {
    const status = error.status || error.statusCode || 500
    if (status >= 500) console.error(config.producao ? `${req.method} ${req.path}: ${error.message}` : error)
    res.status(status).json({ error: status >= 500 ? 'Erro interno do servidor' : 'Requisição inválida' })
})

app.listen(config.porta, () => {
    console.log(`Servidor do Macaco Grelhado rodando na porta ${config.porta}`)
})
