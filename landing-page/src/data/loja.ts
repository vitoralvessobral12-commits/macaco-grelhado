// Dados da loja usados em todas as páginas.
// Tudo que estiver "a confirmar" deve ser validado com o restaurante antes de publicar.

const whatsapp = '5588992219121'

export const LOJA = {
  nome: 'Macaco Grelhado',
  desde: 2017,
  telefoneExibicao: '(88) 9 9221-9121',
  whatsappUrl: `https://wa.me/${whatsapp}`,
  instagramUser: '@macacogrelhado',
  instagramUrl: 'https://www.instagram.com/macacogrelhado/',
  endereco: 'R. Oriano Mendes, 217 – Centro, Sobral/CE',
  horario: 'Todos os dias, das 17h15 às 23h30 · fechado às quartas',
  mapsUrl:
    'https://www.google.com/maps/place/Macaco+Grelhado/@-3.6872313,-40.344236,17z/data=!3m1!4b1!4m6!3m5!1s0x7eac7e4605c4f47:0xc30d674ec0792895!8m2!3d-3.6872313!4d-40.344236!16s%2Fg%2F11hzmrpdyh',
  mapsEmbedUrl: 'https://www.google.com/maps?q=-3.6872313,-40.344236&z=17&output=embed',
  // Abre a ficha do Google, onde fica o botão "Escrever avaliação".
  avaliacaoUrl:
    'https://www.google.com/maps/place/Macaco+Grelhado/@-3.6872313,-40.344236,17z/data=!4m8!3m7!1s0x7eac7e4605c4f47:0xc30d674ec0792895!8m2!3d-3.6872313!4d-40.344236!9m1!1b1!16s%2Fg%2F11hzmrpdyh',
}

export const whatsappComTexto = (texto: string) =>
  `${LOJA.whatsappUrl}?text=${encodeURIComponent(texto)}`

// Funcionamento: todos os dias das 17h15 às 23h30, menos quarta-feira (fechado).
export const HORARIO = {
  abre: { h: 17, min: 15 },
  fecha: { h: 23, min: 30 },
  diaFechado: 3, // 0 = domingo … 3 = quarta
}

// "Aberto agora" ou "Fechado · abre ..." a partir da hora do aparelho.
export function situacaoLoja(agora = new Date()) {
  const minutos = agora.getHours() * 60 + agora.getMinutes()
  const abre = HORARIO.abre.h * 60 + HORARIO.abre.min
  const fecha = HORARIO.fecha.h * 60 + HORARIO.fecha.min
  const hojeFechado = agora.getDay() === HORARIO.diaFechado
  if (!hojeFechado && minutos >= abre && minutos < fecha) return { aberta: true, texto: 'Aberto agora · até 23h30' }
  // Próxima abertura: hoje (se ainda não abriu) ou amanhã; pula a quarta.
  const amanhaFechado = (agora.getDay() + 1) % 7 === HORARIO.diaFechado
  if (!hojeFechado && minutos < abre) return { aberta: false, texto: 'Fechado · abre hoje às 17h15' }
  return { aberta: false, texto: amanhaFechado ? 'Fechado · abre quinta às 17h15' : 'Fechado · abre amanhã às 17h15' }
}
