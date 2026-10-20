// Endereço do site do cardápio (projeto separado).
// Em produção: defina VITE_URL_CARDAPIO no Vercel (ex.: https://cardapio.macacogrelhado.com.br).
// Em desenvolvimento: usa o mesmo computador na porta 5181, o que funciona também pelo celular na rede local.
export const URL_CARDAPIO = (
  import.meta.env.VITE_URL_CARDAPIO ||
    // Só em desenvolvimento cai no mesmo computador; em produção a variável é obrigatória
    (import.meta.env.DEV ? `${window.location.protocol}//${window.location.hostname}:5181` : '')
).replace(/\/$/, '')

export const linkCardapio = (caminho = '/cardapio') => `${URL_CARDAPIO}${caminho}`
