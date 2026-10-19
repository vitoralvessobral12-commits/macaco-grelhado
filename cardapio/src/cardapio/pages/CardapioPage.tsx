import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { CARDAPIO, ITENS, brl } from '../../data/cardapio'
import { TEMPO_ENTREGA } from '../../data/entrega'
import { LOJA, situacaoLoja } from '../../data/loja'
import { URL_LANDING } from '../../config'
import { BarraCarrinho } from '../components/BarraCarrinho'
import { FotoItem } from '../components/FotoItem'
import { useCarrinho } from '../context/CarrinhoContext'

const FAVORITOS = ['b1', 'b3', 'b4', 'c1', 'a2'].map((id) => ITENS[id])

// /cardapio: lista de categorias e itens.
export default function CardapioPage() {
  const { qtdDoItem, adicionar } = useCarrinho()
  const location = useLocation()
  const navigate = useNavigate()
  const [ativa, setAtiva] = useState<string>(CARDAPIO[0].slug)
  const [situacao] = useState(() => situacaoLoja()) // aberto ou fechado, pelo horário da loja
  const [aviso, setAviso] = useState<string | null>((location.state as { adicionado?: string } | null)?.adicionado ?? null)
  const abasRef = useRef<HTMLDivElement>(null)

  // Destaca a aba da categoria que está no meio da tela.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entradas) => entradas.forEach((e) => e.isIntersecting && setAtiva(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    CARDAPIO.forEach((c) => {
      const el = document.getElementById(c.slug)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  // Mantém a aba ativa visível na barra de abas (rolagem horizontal).
  useEffect(() => {
    const aba = abasRef.current?.querySelector<HTMLElement>(`[data-aba="${ativa}"]`)
    const barra = abasRef.current
    if (aba && barra) barra.scrollTo({ left: aba.offsetLeft - barra.clientWidth / 2 + aba.clientWidth / 2, behavior: 'smooth' })
  }, [ativa])

  // Link direto para uma categoria (ex.: /cardapio#combos, usado na página de links).
  useEffect(() => {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView()
  }, [location.hash])

  // Aviso "adicionado ao carrinho" vindo da página do item.
  useEffect(() => {
    if (location.state) navigate('.', { replace: true, state: null }) // não repetir o aviso ao recarregar
  }, [location.state, navigate])

  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 2500)
    return () => clearTimeout(t)
  }, [aviso])

  const irPara = (slug: string) => document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth' })

  const adicionarRapido = (id: string, nome: string) => {
    adicionar(id)
    setAviso(nome)
  }

  return (
    <>
      <header className="cardapio-capa">
        <div className="conteudo">
          <a href={URL_LANDING} className="capa-logo" aria-label="Página inicial">
            <img src="/fotos/logo.png" alt="" />
          </a>
          <div>
            <h1 className="display">Cardápio</h1>
            <p>{LOJA.nome} · Centro, Sobral</p>
            <div className="capa-info">
              <span className={situacao.aberta ? 'aberto' : 'fechado'}>● {situacao.texto}</span>
              <span>🛵 {TEMPO_ENTREGA}</span>
            </div>
          </div>
        </div>
      </header>

      <nav className="abas" aria-label="Categorias">
        <div className="conteudo abas-trilho" ref={abasRef}>
          {CARDAPIO.map((c) => (
            <button
              key={c.slug}
              type="button"
              data-aba={c.slug}
              className={c.slug === ativa ? 'on' : ''}
              onClick={() => irPara(c.slug)}
            >
              {c.nome}
            </button>
          ))}
        </div>
      </nav>

      <main className="conteudo com-barra">
        <section className="favoritos" aria-label="Favoritos da casa">
          <h2 className="display">🔥 Favoritos da casa</h2>
          <div className="favoritos-trilho">
            {FAVORITOS.map((item) => (
              <Link to={`/cardapio/item/${item.id}`} className="favorito" key={item.id}>
                <FotoItem item={item} prioridade />
                <div>
                  <b>{item.nome}</b>
                  <span>{brl(item.preco)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {CARDAPIO.map((cat) => (
          <section className="categoria" id={cat.slug} key={cat.slug}>
            <h2 className="display">{cat.nome}</h2>
            {cat.itens.map((item) => {
              const qtd = qtdDoItem(item.id)
              return (
                <article className="item-linha" key={item.id}>
                  <Link to={`/cardapio/item/${item.id}`} className="item-info">
                    <h3>
                      {item.nome} {item.tag && <span className="tag">{item.tag}</span>}
                    </h3>
                    <p>{item.desc}</p>
                    <span className="item-preco">{brl(item.preco)}</span>
                  </Link>
                  <div className="item-foto">
                    <Link to={`/cardapio/item/${item.id}`} tabIndex={-1} aria-hidden="true">
                      <FotoItem item={item} />
                    </Link>
                    {qtd > 0 && <span className="item-badge">{qtd}</span>}
                    <button
                      type="button"
                      className="item-mais"
                      onClick={() => adicionarRapido(item.id, item.nome)}
                      aria-label={`Adicionar ${item.nome}`}
                    >
                      +
                    </button>
                  </div>
                </article>
              )
            })}
          </section>
        ))}
      </main>

      {aviso && (
        <div className="toast" role="status">
          ✅ {aviso} no carrinho
        </div>
      )}
      <BarraCarrinho />
    </>
  )
}
