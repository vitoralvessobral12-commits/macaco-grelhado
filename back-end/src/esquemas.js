const { z } = require('zod')

// Formato aceito em cada rota (validação de entrada com Zod).
// Tudo que não estiver aqui é descartado; textos têm tamanho máximo.

const texto = (max, msg) => z.string({ error: msg }).trim().max(max, msg)

// ---------- parâmetros e query ----------
const paramsPedido = z.object({
    id: z.string().regex(/^\d{4}$/, 'Pedido não encontrado')
})

// Chave secreta do pedido: só quem fez o pedido tem (vai no link de acompanhamento)
const queryAcompanhar = z.object({
    chave: z.string({ error: 'Pedido não encontrado' }).regex(/^[a-f0-9]{32}$/, 'Pedido não encontrado')
})

const DIA_MS = 86_400_000
const queryPeriodo = z
    .object({
        de: z.coerce.number({ error: 'Período inválido' }).int().nonnegative(),
        ate: z.coerce.number({ error: 'Período inválido' }).int().nonnegative()
    })
    .refine((q) => q.de <= q.ate, 'Período inválido')
    .refine((q) => q.ate - q.de <= 400 * DIA_MS, 'Escolha um período de até 400 dias')

// ---------- corpos ----------
const login = z.object({
    usuario: z.string({ error: 'Informe o e-mail' }).trim().toLowerCase().max(100, 'E-mail inválido'),
    senha: z.string({ error: 'Informe a senha' }).min(1, 'Informe a senha').max(100, 'Senha inválida')
})

const acaoPedido = z.object({
    acao: z.enum(['aceitar', 'recusar', 'avancar'], { error: 'Ação inválida' }),
    motivo: texto(200, 'Motivo muito longo').optional()
})

const itemPedido = z.object({
    itemId: z.string().regex(/^[a-z]\d{1,2}$/, 'Item inválido'),
    nome: texto(60, 'Item inválido').min(1, 'Item inválido'),
    preco: z.number({ error: 'Preço inválido' }).min(0).max(1000),
    qtd: z.number({ error: 'Quantidade inválida' }).int().min(1, 'Quantidade inválida').max(50, 'Quantidade inválida'),
    obs: texto(140, 'Observação muito longa').default('')
})

const novoPedido = z
    .object({
        cliente: z.object({
            nome: texto(60, 'Nome muito longo').min(2, 'Informe nome e telefone'),
            telefone: z.string({ error: 'Informe nome e telefone' }).trim().regex(/^[\d\s()+-]{10,20}$/, 'Telefone inválido')
        }, { error: 'Informe nome e telefone' }),
        tipo: z.enum(['entrega', 'retirada'], { error: 'Escolha entrega ou retirada' }),
        bairro: texto(60, 'Bairro inválido').optional(),
        endereco: texto(120, 'Endereço muito longo').optional(),
        referencia: texto(120, 'Referência muito longa').optional(),
        pagamento: z.enum(['pix', 'credito', 'debito', 'dinheiro'], { error: 'Escolha a forma de pagamento' }),
        trocoPara: z.number().min(0).max(10000).optional(),
        itens: z.array(itemPedido, { error: 'O pedido está vazio' }).min(1, 'O pedido está vazio').max(30, 'Pedido grande demais'),
        frete: z.number({ error: 'Taxa de entrega inválida' }).min(0).max(50)
    })
    .refine((p) => p.tipo === 'retirada' || (p.bairro && p.endereco && p.endereco.length >= 5), 'Informe bairro, rua e número')

module.exports = { paramsPedido, queryAcompanhar, queryPeriodo, login, acaoPedido, novoPedido }
