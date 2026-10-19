// Lê o .env desta pasta, mesmo se o servidor for iniciado de outro diretório
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') })

// Servidor simples da PRÉVIA: recebe os pedidos do cardápio e entrega para o painel da loja.
// Sem banco de dados: os pedidos ficam no arquivo data/pedidos.json.

if (!process.env.JWT_SECRET || !process.env.PAINEL_USUARIO || !process.env.PAINEL_SENHA) {
    throw new Error('Preencha JWT_SECRET, PAINEL_USUARIO e PAINEL_SENHA no arquivo .env (veja o .env.example)')
}

const express = require('express')
const cors = require('cors')
const app = express()

const pedidoRoutes = require('./src/routes/pedidoRoutes')
const painelRoutes = require('./src/routes/painelRoutes')
const dashboardRoutes = require('./src/routes/dashboardRoutes')

// Na prévia, aceita qualquer origem (inclusive o celular na rede local)
app.use(cors())
app.use(express.json({ limit: '20kb' }))

app.use(pedidoRoutes)
app.use(painelRoutes)
app.use(dashboardRoutes)

app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' })
})

app.use((error, req, res, next) => {
    const status = error.status || error.statusCode || 500
    if (status >= 500) console.error(error)
    res.status(status).json({ error: status >= 500 ? 'Erro interno do servidor' : 'Requisição inválida' })
})

const PORT = process.env.PORT || 4002

app.listen(PORT, () => {
    console.log(`Servidor do Macaco Grelhado rodando na porta ${PORT}`)
})
