// Endereço da landing page (projeto separado).
// Em produção: defina VITE_URL_LANDING no Vercel (ex.: https://macacogrelhado.com.br).
// Em desenvolvimento: mesmo computador na porta 5180 (funciona também pelo celular na rede local).
export const URL_LANDING = (
  import.meta.env.VITE_URL_LANDING ||
    // Só em desenvolvimento cai no mesmo computador; em produção a variável é obrigatória
    (import.meta.env.DEV ? `${window.location.protocol}//${window.location.hostname}:5180` : '')
).replace(/\/$/, '')

// Endereço da API (back-end). Em desenvolvimento: mesmo computador na porta 4002.
export const URL_API = (
  import.meta.env.VITE_URL_API ||
    // Só em desenvolvimento cai no mesmo computador; em produção a variável é obrigatória
    (import.meta.env.DEV ? `${window.location.protocol}//${window.location.hostname}:4002` : '')
).replace(/\/$/, '')
