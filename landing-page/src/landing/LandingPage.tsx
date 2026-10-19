import { linkCardapio } from '../config'
import { Estrelas, IconeWhatsApp } from '../components/Icones'
import { LOJA } from '../data/loja'
import { DESTAQUES, ITENS, brl } from '../data/cardapio'
import './landing.css'

// Burgers com nome de macaco (seção "fome de gorila")
const BANDO = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'].map((id) => ITENS[id])

const GALERIA = [
  { foto: '/fotos/burger-ovo.jpg', alt: 'Hambúrguer com ovo, presunto e queijo coalho' },
  { foto: '/fotos/batata-cheddar.jpg', alt: 'Batata frita com bacon e cheddar' },
  { foto: '/fotos/abu.jpg', alt: 'Hambúrguer Abu com cebola caramelizada e Coca-Cola', pos: 'center 12%' },
  { foto: '/fotos/primatas.jpg', alt: 'Primatas Burguer com nachos' },
  { foto: '/fotos/combo-coca.jpg', alt: 'Hambúrguer com batata e Coca-Cola' },
  { foto: '/fotos/king-kong.jpg', alt: 'Hambúrguer King Kong de pão vermelho' },
]

const DIFERENCIAIS = [
  { icone: '🔥', titulo: 'Grelhado na hora', texto: 'Nada de chapa parada: o blend vai para a grelha quando o pedido chega.' },
  { icone: '🥩', titulo: 'Carne selecionada', texto: 'Blend próprio, suculento, no ponto que Sobral já conhece.' },
  { icone: '📍', titulo: 'No coração do Centro', texto: 'Fácil de chegar, para retirar no balcão ou comer por aqui.' },
  { icone: '🛵', titulo: 'Delivery em Sobral', texto: 'Monte o pedido pelo celular e acompanhe até chegar.' },
]

const PASSOS = [
  { titulo: 'Escolha no cardápio', texto: 'Fotos, descrições e preços. Toque e adicione ao carrinho.' },
  { titulo: 'Finalize em 1 minuto', texto: 'Entrega ou retirada, endereço e forma de pagamento em uma tela só.' },
  { titulo: 'Acompanhe o pedido', texto: 'Veja quando a loja aceitou, quando saiu e quando está chegando.' },
]

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="nav">
        <div className="wrap">
          <a href="#topo" className="brand">
            <img src="/fotos/logo.png" alt="" />
            <span className="display">Macaco Grelhado</span>
          </a>
          <ul>
            <li><a href="#destaques">Destaques</a></li>
            <li><a href="#historia">Nossa história</a></li>
            <li><a href="#avaliar">Avaliações</a></li>
            <li><a href="#onde">Onde estamos</a></li>
          </ul>
          <a href={linkCardapio()} className="btn btn-primary btn-sm">Pedir agora</a>
        </div>
      </header>

      <section className="hero" id="topo">
        <div className="wrap">
          <div className="hero-texto">
            <span className="eyebrow">Centro · Sobral/CE · desde {LOJA.desde}</span>
            <h1 className="display">
              Hambúrguer<br /><em>de verdade.</em>
            </h1>
            <p className="lead">
              Blend grelhado na hora, pão macio e aquele tempero que Sobral conhece.
              Monte seu pedido pelo celular e receba em casa.
            </p>
            <div className="ctas">
              <a href={linkCardapio()} className="btn btn-primary">Ver cardápio e pedir</a>
              <a href="#onde" className="btn btn-ghost">Como chegar</a>
            </div>
          </div>
          <div className="hero-arte">
            <div className="hero-brilho" />
            <figure className="hero-foto principal">
              <img src="/fotos/gorila.jpg" alt="Hambúrguer de pão australiano com bacon, ovo e queijo" fetchPriority="high" />
            </figure>
            <figure className="hero-foto secundaria">
              <img src="/fotos/burger-maos.jpg" alt="Hambúrguer com queijo derretido, bacon e cebola" />
            </figure>
            <span className="selo selo-a">🔥 Grelhado na hora</span>
            <span className="selo selo-b">Desde {LOJA.desde}</span>
          </div>
        </div>
      </section>

      <div className="faixa" aria-hidden="true">
        <div className="faixa-trilho">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i}>
              🍔 Hambúrguer de verdade · 🔥 Grelhado na hora · 🛵 Delivery em Sobral · 📍 Centro · 🐒 Macaco Grelhado ·&nbsp;
            </span>
          ))}
        </div>
      </div>

      <section id="destaques">
        <div className="wrap">
          <h2 className="titulo display">Os mais pedidos</h2>
          <p className="subtitulo">Uma amostra do cardápio. Toque no item para ver os detalhes e pedir.</p>
          <div className="grade3">
            {DESTAQUES.map((item) => (
              <a href={linkCardapio(`/cardapio/item/${item.id}`)} className="destaque" key={item.id}>
                <div className="foto">
                  <img src={item.foto} alt={item.nome} loading="lazy" />
                  {item.tag && <span className="tag">{item.tag}</span>}
                </div>
                <div className="corpo">
                  <h3 className="display">{item.nome}</h3>
                  <p>{item.desc}</p>
                  <div className="preco">
                    <span>{brl(item.preco)}</span>
                    <span className="btn btn-primary btn-sm">Pedir</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
          <p className="centro">
            <a href={linkCardapio()} className="btn btn-ghost">Ver cardápio completo</a>
          </p>
        </div>
      </section>

      <section className="fome">
        <div className="wrap fome-grade">
          <figure className="fome-foto">
            <img src="/fotos/fome-de-gorila.jpg" alt="Cliente mordendo um hambúrguer do Macaco Grelhado" loading="lazy" />
          </figure>
          <div>
            <span className="eyebrow">Cardápio de primata</span>
            <h2 className="titulo display">Bateu aquela <em>fome de gorila?</em></h2>
            <p className="subtitulo">
              Aqui cada burger tem nome de macaco e tamanho de respeito. Escolha o seu bando:
            </p>
            <div className="chips">
              {BANDO.map((item) => (
                <a key={item.id} href={linkCardapio(`/cardapio/item/${item.id}`)} className="chip">
                  <img src={item.foto} alt="" loading="lazy" style={item.posicaoFoto ? { objectPosition: item.posicaoFoto } : undefined} />
                  {item.nome}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="fundo2">
        <div className="wrap">
          <h2 className="titulo display">Por que o Macaco?</h2>
          <div className="grade4">
            {DIFERENCIAIS.map((d) => (
              <div className="diferencial" key={d.titulo}>
                <span className="icone">{d.icone}</span>
                <h3>{d.titulo}</h3>
                <p>{d.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="historia">
        <div className="wrap historia">
          <figure className="historia-foto">
            <img src="/fotos/mesa-neon.jpg" alt="Mesa com vários hambúrgueres, batata e refrigerantes sob a luz neon da loja" loading="lazy" />
            <span className="ano display">{LOJA.desde}</span>
          </figure>
          <div>
            <h2 className="titulo display">Nossa história</h2>
            <p className="subtitulo">
              Desde {LOJA.desde} o Macaco Grelhado serve hambúrguer de verdade no Centro de Sobral.
              Carne selecionada, grelha quente e atendimento de casa.
            </p>
            <p className="subtitulo">
              Por aqui cada burger ganhou nome de macaco: do King Kong ao Soin, tem tamanho para toda fome.
              É o ponto de encontro de quem gosta de comer bem, seja na mesa com a galera ou no sofá de casa.
            </p>
          </div>
        </div>
      </section>

      <section className="fundo2" id="como-pedir">
        <div className="wrap">
          <h2 className="titulo display">Pedir é fácil</h2>
          <p className="subtitulo">Sem baixar aplicativo. Direto do celular.</p>
          <ol className="passos">
            {PASSOS.map((p) => (
              <li key={p.titulo}>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </li>
            ))}
          </ol>
          <p className="centro">
            <a href={linkCardapio()} className="btn btn-primary">Começar meu pedido</a>
          </p>
        </div>
      </section>

      <section id="galeria">
        <div className="wrap">
          <h2 className="titulo display">Direto da grelha</h2>
          <p className="subtitulo">Do nosso Instagram para a sua tela. Difícil escolher um só.</p>
          <div className="galeria">
            {GALERIA.map((g) => (
              <figure key={g.foto}>
                <img src={g.foto} alt={g.alt} loading="lazy" style={g.pos ? { objectPosition: g.pos } : undefined} />
              </figure>
            ))}
          </div>
          <p className="centro">
            <a href={LOJA.instagramUrl} target="_blank" rel="noopener" className="btn btn-ghost">📸 Seguir {LOJA.instagramUser}</a>
          </p>
        </div>
      </section>

      <section id="avaliar">
        <div className="wrap">
          <div className="avaliar">
            <Estrelas />
            <h2 className="display">Comeu e gostou?</h2>
            <p>Sua avaliação no Google ajuda mais gente de Sobral a descobrir o Macaco. Leva menos de 1 minuto.</p>
            <a href={LOJA.avaliacaoUrl} target="_blank" rel="noopener" className="btn btn-dark">
              Avaliar no Google
            </a>
          </div>
        </div>
      </section>

      <section className="fundo2" id="onde">
        <div className="wrap">
          <h2 className="titulo display">Onde estamos</h2>
          <p className="subtitulo">Retire no balcão ou peça delivery.</p>
          <div className="local">
            <div className="info">
              <div><b>Endereço</b><span>{LOJA.endereco}</span></div>
              <div><b>Horário</b><span>{LOJA.horario}</span></div>
              <div><b>WhatsApp</b><a href={LOJA.whatsappUrl} target="_blank" rel="noopener">{LOJA.telefoneExibicao}</a></div>
              <div><b>Instagram</b><a href={LOJA.instagramUrl} target="_blank" rel="noopener">{LOJA.instagramUser}</a></div>
              <a href={LOJA.mapsUrl} target="_blank" rel="noopener" className="btn btn-ghost">Abrir no Google Maps</a>
            </div>
            <div className="mapa">
              <iframe src={LOJA.mapsEmbedUrl} loading="lazy" title="Mapa do Macaco Grelhado" />
            </div>
          </div>
        </div>
      </section>

      <div className="cta-final">
        <h2 className="display">Bateu a fome?</h2>
        <a href={linkCardapio()} className="btn btn-dark">Pedir agora</a>
      </div>

      <footer className="rodape">
        <div className="wrap">
          <img src="/fotos/logo.png" alt="" />
          <p>Macaco Grelhado · Sobral/CE</p>
          <nav>
            <a href={linkCardapio()}>Cardápio</a>
            <a href={LOJA.avaliacaoUrl} target="_blank" rel="noopener">Avaliar no Google</a>
          </nav>
          
        </div>
      </footer>

      <a className="fab" href={LOJA.whatsappUrl} target="_blank" rel="noopener" aria-label="Falar no WhatsApp">
        <IconeWhatsApp />
      </a>
    </div>
  )
}
