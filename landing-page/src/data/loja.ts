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
  horario: 'A confirmar com o restaurante',
  mapsUrl:
    'https://www.google.com/maps/place/Macaco+Grelhado/@-3.6872313,-40.344236,17z/data=!3m1!4b1!4m6!3m5!1s0x7eac7e4605c4f47:0xc30d674ec0792895!8m2!3d-3.6872313!4d-40.344236!16s%2Fg%2F11hzmrpdyh',
  mapsEmbedUrl: 'https://www.google.com/maps?q=-3.6872313,-40.344236&z=17&output=embed',
  // Abre a ficha do Google, onde fica o botão "Escrever avaliação".
  avaliacaoUrl:
    'https://www.google.com/maps/place/Macaco+Grelhado/@-3.6872313,-40.344236,17z/data=!4m8!3m7!1s0x7eac7e4605c4f47:0xc30d674ec0792895!8m2!3d-3.6872313!4d-40.344236!9m1!1b1!16s%2Fg%2F11hzmrpdyh',
}

export const whatsappComTexto = (texto: string) =>
  `${LOJA.whatsappUrl}?text=${encodeURIComponent(texto)}`
