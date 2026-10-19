# Prompt · Macaco Grelhado (para começar um chat novo com o Claude)

> Abra o Claude Code na pasta `D:\Users\projeto-macaco-grelhado`, copie tudo abaixo da linha e cole.

---

Oi, Claude! Você vai me ajudar a **terminar um projeto que já está bem adiantado**. Leia tudo antes de agir.

## 1. Como eu quero trabalhar

- Sou o **Vitor**. Estudo React + TypeScript e Node/Express. Explique em **português simples** o que está fazendo e por quê.
- **Peça minha permissão antes de criar, apagar ou alterar** qualquer coisa: explique a necessidade e espere o meu "ok".
- Trabalhe **por partes**: faça uma, teste, me mostre e só então siga.
- Mantenha a organização que já existe (projetos separados, uma página por arquivo) e o estilo do código.
- **Não refaça o que já funciona.** Continue de onde parou.

## 2. A ideia (por que este projeto existe)

O **Macaco Grelhado** é uma hamburgueria no Centro de Sobral/CE, aberta desde 2017. Os burgers têm nome de macaco (King Kong, Abu, Orangotango, Primatas, Soin, Gorila). O Instagram (**@macacogrelhado**) não tem site, cardápio online, linktree nem um jeito fácil de avaliar no Google, e o pedido é feito só por conversa no WhatsApp.

Estou montando uma **prévia funcional (MVP)** para mostrar ao gerente **antes** de ele aprovar qualquer coisa. Vou abordar pelo Instagram, marcar uma reunião e mostrar funcionando no celular. Por isso:

- a prévia precisa ser **bonita, clara e funcionar de verdade** no fluxo principal: cliente pede → loja recebe no painel e aceita → cliente vê o status mudar;
- **não** quero banco de dados nem segurança pesada agora (isso é fase 2);
- **meta: MVP funcional pronto hoje.**

## 3. Leia primeiro estes arquivos

1. **`README.md`**: o **mapa do projeto**, com diagramas de quem fala com quem, todas as rotas, os arquivos de cada projeto e onde mudar cada coisa.
2. **`RESUMO.md`**: a ideia, o que está pronto, as decisões e o que falta.

Resumo rápido da estrutura:

```
D:\Users\projeto-macaco-grelhado\
├── landing-page/  React+Vite+TS · :5180 · apresentação da loja (fotos reais)
├── cardapio/      React+Vite+TS · :5181 · cardápio → item → carrinho → finalizar → /pedido/:id
├── painel/        React+Vite+TS · :5182 · login (e-mail+senha) + pedidos da loja
├── back-end/      Node+Express  · :4002 · pedidos em data/pedidos.json + login JWT
├── imagens/       fotos originais do Instagram (imagens/site/ = renomeadas e recortadas)
├── macaco-demo/   HTML antigo, só referência
├── README.md · RESUMO.md · PROMPT-claude-code.md
```

### Pontos importantes
- **Cardápio:** a fonte principal é `cardapio/src/data/cardapio.ts`. Existe uma **cópia** em `landing-page/src/data/cardapio.ts`; mantenha as duas iguais. Nomes e fotos são reais; **preços e descrições são ilustrativos**.
- **Back-end, rotas públicas:** `POST /pedidos` e `GET /pedidos/:id`.
- **Back-end, rotas do painel:** `POST /painel/login`, mais `GET /painel/pedidos` e `PATCH /painel/pedidos/:id` (`acao`: aceitar, recusar ou avancar). As duas últimas exigem token.
- **Back-end, rotas do dashboard (gerente):** `POST /dashboard/login` e `GET /dashboard/pedidos?de=&ate=`. O token do atendente é recusado aqui.
- **Pagamento:** `pix`, `credito`, `debito` ou `dinheiro` (pedidos antigos podem ter `cartao`).
- **Sugestão de rua:** `cardapio/src/cardapio/components/BuscaEndereco.tsx`, usando o ViaCEP (Correios) e, como reserva, o OpenStreetMap, só em Sobral.
- **Vendas de demonstração:** `npm run demo:vendas` e `npm run demo:limpar`, no back-end.
- **Etapas do pedido:** 0 = enviado, 1 = aceito, 2 = saiu ou pronto, 3 = entregue ou retirado. Um pedido recusado tem `recusado: { motivo }`.
- **Login do painel:** `back-end/.env` (`PAINEL_USUARIO=vitor.teste@gmail.com` e `PAINEL_SENHA`). Não mostre a senha no chat.
- **Login do dashboard:** `back-end/.env` (`GERENTE_USUARIO=gerente.teste@gmail.com` e `GERENTE_SENHA`).
- **Endereços entre os projetos:** `src/config.ts` de cada front (`VITE_URL_API`, `VITE_URL_CARDAPIO`, `VITE_URL_LANDING`). Em desenvolvimento, usam o mesmo host com a porta de cada um.
- **Visual:**
  - fundo `#0f0d0a`, amarelo `#ffc21a`, laranja `#f26b1d`, creme `#fff4dc`;
  - **Bebas Neue** nos títulos e **Inter** no texto;
  - pensado primeiro para celular;
  - o logo é o macaquinho amarelo (`/fotos/logo.png`).

### Como rodar

```bash
cd back-end && npm run dev
cd landing-page && npm run dev -- --host
cd cardapio && npm run dev -- --host
cd painel && npm run dev -- --host
```

## 4. O que falta (nesta ordem)

1. **Conferir que tudo roda:** suba os 4 projetos, faça um pedido completo (cardápio → painel → aceitar) e corrija o que quebrar.
2. **Linktree, `/links`:** página simples na `landing-page` para a bio do Instagram, com os botões:
   - **Fazer pedido** (cardápio);
   - **Conheça o Macaco** (landing);
   - **WhatsApp**;
   - **Avaliar no Google**;
   - **Como chegar**;
   - **Instagram**.

   O visual segue o de `macaco-demo/links.html`, com o logo real. Como hoje a landing não usa router, sugira a forma mais simples de ter essa rota.
3. **Publicar** (me guie passo a passo e peça confirmação antes de cada ação):
   - back-end no **Render** ou no **Railway**, com as variáveis do `.env` e o `data/` funcionando (ou explique a limitação de arquivo em servidor gratuito);
   - `landing-page`, `cardapio` e `painel` no **Vercel**, como 3 projetos, com as variáveis `VITE_URL_*` apontando para os endereços publicados;
   - teste final pelo celular, com os links públicos.
4. **Mensagem de abordagem:** me ajude a escrever a mensagem para o gerente no Instagram, curta, explicando que é uma prévia e convidando para uma conversa.

## 5. O que NÃO fazer agora (fase 2, só se o gerente aprovar)

- MySQL/Sequelize, bcrypt, limite de tentativas e várias contas de atendente.
- O servidor recalcular preço e frete.
- Loja aberta ou fechada e itens indisponíveis pelo painel.
- WhatsApp automático, pagamento online e frete por distância.

## 6. Comece assim

Leia o `README.md` e o `RESUMO.md`, rode `npm run build` nos 3 front-ends e me diga em poucas linhas se está tudo ok. Depois me apresente o plano da **etapa 1** e **espere a minha aprovação**.
