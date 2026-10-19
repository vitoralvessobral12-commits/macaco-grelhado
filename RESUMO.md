# 🐒 Macaco Grelhado · Resumão

> Para entender **como as peças se ligam**, veja o mapa em [README.md](README.md).
> Para **continuar com outro Claude**, use [PROMPT-claude-code.md](PROMPT-claude-code.md).

## 1. A ideia

O **Macaco Grelhado** é uma hamburgueria no Centro de Sobral/CE, aberta desde 2017 (Instagram **@macacogrelhado**, WhatsApp (88) 9 9221-9121, R. Oriano Mendes, 217). Os burgers têm nome de macaco: King Kong, Abu, Orangotango, Primatas, Soin, Gorila…

**O problema:** o Instagram não tem site, cardápio online, linktree nem um jeito fácil de avaliar no Google, e o pedido é feito só conversando no WhatsApp.

**O plano do Vitor:**
1. Montar uma **prévia funcional (MVP)**, bonita e que funcione de verdade no fluxo principal.
2. Abordar o gerente pelo Instagram e marcar uma reunião.
3. Mostrar ao vivo: o cliente pede pelo celular, o pedido aparece no painel da loja com som, a loja aceita e a tela do cliente muda sozinha.
4. Se o gerente aprovar, construir a versão completa (fase 2).

A prévia é **simples de propósito** (sem banco de dados e sem segurança pesada), porque ainda não há aprovação. **Meta: MVP funcional pronto hoje.**

## 2. O que está pronto

| Peça | Porta | O que faz |
|---|---|---|
| `landing-page/` | 5180 | Apresentação com **fotos reais**: destaque principal, os mais pedidos, "fome de gorila" (burgers com nome de macaco), por que o Macaco, história, galeria "direto da grelha", **Avaliar no Google**, mapa e WhatsApp |
| `cardapio/` | 5181 | Cardápio com **fotos e nomes reais**, carrossel de favoritos, página do item com "peça junto" (Coca, Delrio, batata), carrinho, finalização (entrega ou retirada, bairro e frete, **sugestão de rua enquanto digita**, Pix, crédito, débito ou dinheiro com troco) e **acompanhamento ao vivo** |
| `painel/` | 5182 | **Login por e-mail e senha.** Pedidos chegam em até 2 s, com som (o botão liga e desliga). Aceitar, recusar com motivo, saiu para entrega ou pronto, e entregue ou retirado. **Dashboard do gerente** em `/dashboard`, com login próprio |
| `back-end/` | 4002 | Servidor Express mínimo. Pedidos em `data/pedidos.json`, dois logins fixos no `.env` (atendente e gerente) e token JWT de 12 h |

### Dashboard do gerente
- Botão **"📊 Ver dashboard"** no painel, que pede o **login do gerente** (`gerente.teste@gmail.com`, senha de teste no `.env`).
- O atendente **não** vê o financeiro: o token dele é recusado pela API do dashboard.
- **Números:** faturamento, vendas, ticket médio, itens vendidos e recusados, cada um comparado com o período anterior.
- **Gráficos:** faturamento por dia (ou por hora, no filtro "Hoje"), mais vendidos, horários de pico, formas de pagamento, entrega × retirada e bairros que mais compram.
- **Filtros:** Hoje · 3 · 7 · 15 · 30 dias · escolher datas.
- **Planilha do Excel:** botão "📥 Baixar planilha" gera um `.xlsx` do período, com as abas Resumo (números e comparação, categorias, pagamentos, entrega × retirada, bairros), Por dia, Produtos, Pedidos e Horários.
- **Vendas de demonstração:** `npm run demo:vendas` no back-end gera 60 dias de vendas marcadas como `demo`, e `npm run demo:limpar` apaga.

### Sugestão de rua
- Busca primeiro no **ViaCEP** (base dos Correios, que tem as ruas de Sobral bem completas, com bairro e CEP). Se não achar, tenta o **OpenStreetMap**. As duas são gratuitas e sem chave, e só buscam em Sobral/CE. As sugestões aparecem a partir de 4 letras.
- Se o bairro da rua estiver na lista de entrega, ele já é selecionado.
- Se a API falhar, o campo funciona normal, só sem sugestão.
- Exemplo: "Rua Raimundinha Girão" não existe no OpenStreetMap, mas aparece pelo ViaCEP (Renato Parente, CEP 62034-070).

**Testado de ponta a ponta:** o cliente pede *Combo com Coca + Coca-Cola* → o pedido aparece no painel → a loja clica em Aceitar → a tela do cliente vira "Pedido aceito 🔥".

### Fotos
- **Originais** (salvas do Instagram): `imagens/`.
- **Renomeadas e recortadas:** `imagens/site/`, copiadas para `public/fotos/` da landing e do cardápio. Isso inclui a lata de Coca recortada da foto do Abu, a garrafa de Delrio recortada do Trio Perfeito e o **logo do macaquinho** redondo.
- Algumas artes têm texto em cima da foto. Por isso as fotos são enquadradas mais para baixo, e o Abu (que tem o texto embaixo) tem um ajuste próprio (`posicaoFoto`).

### Decisões tomadas
- **Stack:** React + Vite + TypeScript nos front-ends (a stack que o Vitor estuda) e Node/Express no back-end, no estilo do projeto Game Bots.
- **4 projetos separados:** cada um roda e publica sozinho. Os endereços entre eles ficam em `src/config.ts`.
- **Login do painel:** um único usuário, `vitor.teste@gmail.com`, com a senha de teste guardada no `back-end/.env`.
- **Login do dashboard:** separado, só do gerente (`gerente.teste@gmail.com`), para o atendente não ver o faturamento.
- **Gráficos sem biblioteca:** feitos em HTML/CSS, para não adicionar dependência.
- **Horário real:** todos os dias das 17h15 às 23h30, fechado às quartas. O cardápio mostra "Aberto agora" ou "Fechado · abre …" sozinho (`situacaoLoja` em `src/data/loja.ts`).
- **Preços, descrições, bairros, frete e chave Pix são ilustrativos.** Confirmar com a loja.
- **Linktree:** fica para a hora de publicar.

## 3. O que falta para fechar o MVP hoje

1. ✅ ~~Fotos reais~~ (feito)
2. **Testar no celular:** cliente no celular e painel no computador.
3. **Linktree `/links`** para a bio do Instagram.
4. **Publicar** para ter um link para mandar ao gerente:
   - os 3 front-ends no **Vercel**;
   - o back-end no **Render** ou no **Railway**.
5. **Mensagem de abordagem** para o gerente no Instagram.
6. Ajustar textos (história da marca, horário) quando houver informação real.

## 4. Fase 2 (só se o gerente aprovar)

- MySQL + Sequelize, bcrypt, limite de tentativas e várias contas de atendente (como no Game Bots).
- O servidor recalcula preço e frete (o cliente não consegue alterar valores).
- Loja aberta ou fechada e itens indisponíveis controlados pelo painel.
- Mensagem automática no WhatsApp, pagamento online e frete por distância.

## 5. Como rodar

```bash
cd back-end && npm run dev
cd landing-page && npm run dev -- --host
cd cardapio && npm run dev -- --host
cd painel && npm run dev -- --host
```

- **Computador:** `localhost:5180` (landing), `localhost:5181/cardapio` (cardápio), `localhost:5182` (painel), `localhost:5182/dashboard` (dashboard).
- **Celular** (mesmo Wi-Fi): troque `localhost` pelo IP do PC (ex.: `192.168.0.14`). Se o Windows perguntar, permita o Node.js em "Redes privadas".
