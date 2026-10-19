import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SessaoExpirada, brl, pedidosDoPeriodo, sair } from '../api'
import type { Pedido } from '../api'
import { GraficoBarras } from '../components/GraficoBarras'
import { FILTROS, calcularPeriodo, paraISO, periodoAnterior, resumir, variacao } from '../dashboard'
import type { Filtro } from '../dashboard'
import '../dashboard.css'

const INTERVALO_MS = 15000 // atualiza sozinho, para ver as vendas de hoje entrando
const CHAVE_FILTRO = 'mg_dashboard_filtro'

const qtd = (v: number) => v.toLocaleString('pt-BR')

function filtroSalvo(): Filtro {
  try {
    const f = localStorage.getItem(CHAVE_FILTRO) as Filtro | null
    return f && FILTROS.some((x) => x.id === f) ? f : 'hoje'
  } catch {
    return 'hoje'
  }
}

// "/dashboard": faturamento e vendas, só para o gerente (login próprio).
export default function DashboardPage() {
  const navigate = useNavigate()
  const [hojeISO] = useState(() => paraISO(new Date()))
  const [filtro, setFiltro] = useState<Filtro>(filtroSalvo)
  const [datas, setDatas] = useState(() => ({ de: paraISO(new Date(Date.now() - 6 * 86_400_000)), ate: hojeISO }))
  // Guarda junto o período buscado: ao trocar o filtro, mostra "Carregando" até chegar o novo
  const [dados, setDados] = useState<{ chave: string; lista: Pedido[] } | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const periodo = useMemo(() => calcularPeriodo(filtro, datas), [filtro, datas])
  const anterior = useMemo(() => periodoAnterior(periodo), [periodo])
  const chave = `${anterior.de.getTime()}-${periodo.ate.getTime()}`
  const pedidos = dados?.chave === chave ? dados.lista : null

  const deslogar = useCallback(() => {
    sair('dashboard')
    navigate('/dashboard/login', { replace: true })
  }, [navigate])

  // Busca o período atual + o anterior de uma vez (para comparar)
  useEffect(() => {
    let ativo = true
    const buscar = async () => {
      try {
        const lista = await pedidosDoPeriodo(anterior.de.getTime(), periodo.ate.getTime())
        if (!ativo) return
        setDados({ chave, lista })
        setErro(null)
      } catch (e) {
        if (e instanceof SessaoExpirada) return deslogar()
        if (ativo) setErro((e as Error).message)
      }
    }
    buscar()
    const t = setInterval(buscar, INTERVALO_MS)
    return () => {
      ativo = false
      clearInterval(t)
    }
  }, [periodo, anterior, chave, deslogar])

  const escolherFiltro = (f: Filtro) => {
    setFiltro(f)
    try {
      localStorage.setItem(CHAVE_FILTRO, f)
    } catch {
      /* sem armazenamento */
    }
  }

  const atual = useMemo(
    () => pedidos && resumir(pedidos.filter((p) => p.criadoEm >= periodo.de.getTime()), periodo),
    [pedidos, periodo],
  )
  const antes = useMemo(
    () => pedidos && resumir(pedidos.filter((p) => p.criadoEm < periodo.de.getTime()), anterior),
    [pedidos, periodo, anterior],
  )
  const temDemo = pedidos?.some((p) => (p as Pedido & { demo?: boolean }).demo)

  // Planilha do Excel com o período escolhido (a biblioteca só carrega no clique)
  const [gerando, setGerando] = useState(false)
  const baixar = async () => {
    if (!pedidos) return
    setGerando(true)
    try {
      const { baixarPlanilha } = await import('../planilha')
      const inicio = periodo.de.getTime()
      await baixarPlanilha(pedidos.filter((p) => p.criadoEm >= inicio), periodo, pedidos.filter((p) => p.criadoEm < inicio), anterior)
    } catch {
      setErro('Não foi possível gerar a planilha. Tente de novo.')
    } finally {
      setGerando(false)
    }
  }

  const descricaoPeriodo =
    periodo.dias === 1
      ? paraISO(periodo.de) === hojeISO
        ? 'Hoje'
        : periodo.de.toLocaleDateString('pt-BR')
      : `${periodo.de.toLocaleDateString('pt-BR')} a ${new Date(periodo.ate.getTime() - 1).toLocaleDateString('pt-BR')}`

  const comparar = (a: number, b: number) => {
    const v = variacao(a, b)
    if (v === null) return <span className="kpi-var neutra">sem dados para comparar</span>
    const sobe = v >= 0
    return (
      <span className={`kpi-var ${sobe ? 'sobe' : 'desce'}`}>
        {sobe ? '▲' : '▼'} {Math.abs(Math.round(v * 100))}% <small>vs {periodo.dias === 1 ? 'dia' : `${periodo.dias} dias`} anterior{periodo.dias === 1 ? '' : 'es'}</small>
      </span>
    )
  }

  return (
    <div className="painel dashboard">
      <header className="painel-topo">
        <div className="painel-marca">
          <img src="/logo.png" alt="" />
          <div>
            <h1 className="display">Dashboard</h1>
            <span className="dash-sub">Faturamento e vendas · {descricaoPeriodo}</span>
          </div>
        </div>
        <div className="painel-botoes">
          <Link to="/" className="btn btn-ghost btn-sm">← Pedidos</Link>
          <button type="button" className="btn btn-ghost btn-sm" onClick={deslogar}>Sair do dashboard</button>
        </div>
      </header>

      <main className="dash-conteudo">
        <div className="dash-filtros" role="group" aria-label="Período">
          {FILTROS.map((f) => (
            <button type="button" key={f.id} className={`chip${filtro === f.id ? ' on' : ''}`} aria-pressed={filtro === f.id} onClick={() => escolherFiltro(f.id)}>
              {f.id === 'datas' ? '📅 ' : ''}{f.nome}
            </button>
          ))}
          {filtro === 'datas' && (
            <div className="dash-datas">
              <label>
                De
                <input type="date" className="campo" value={datas.de} max={hojeISO} onChange={(e) => e.target.value && setDatas((d) => ({ ...d, de: e.target.value }))} />
              </label>
              <label>
                Até
                <input type="date" className="campo" value={datas.ate} max={hojeISO} onChange={(e) => e.target.value && setDatas((d) => ({ ...d, ate: e.target.value }))} />
              </label>
            </div>
          )}
          <button type="button" className="btn btn-primary btn-sm dash-planilha" disabled={!pedidos || gerando} onClick={baixar}>
            {gerando ? 'Gerando planilha…' : '📥 Baixar planilha (Excel)'}
          </button>
        </div>

        {temDemo && <p className="dash-aviso">🧪 Inclui vendas de demonstração geradas para a apresentação.</p>}
        {erro && <p className="aviso-erro" role="alert">⚠️ {erro}</p>}

        {!atual || !antes ? (
          <p className="carregando">{erro ? 'Tentando de novo…' : 'Carregando números…'}</p>
        ) : (
          <>
            <section className="kpis">
              <article className="kpi destaque">
                <h2>Faturamento</h2>
                <strong>{brl(atual.faturamento)}</strong>
                {comparar(atual.faturamento, antes.faturamento)}
              </article>
              <article className="kpi">
                <h2>Vendas</h2>
                <strong>{qtd(atual.vendas)}</strong>
                {comparar(atual.vendas, antes.vendas)}
              </article>
              <article className="kpi">
                <h2>Ticket médio</h2>
                <strong>{brl(atual.ticketMedio)}</strong>
                {comparar(atual.ticketMedio, antes.ticketMedio)}
              </article>
              <article className="kpi">
                <h2>Itens vendidos</h2>
                <strong>{qtd(atual.itensVendidos)}</strong>
                {comparar(atual.itensVendidos, antes.itensVendidos)}
              </article>
              <article className="kpi">
                <h2>Recusados</h2>
                <strong>{qtd(atual.recusados)}</strong>
                <span className="kpi-var neutra">
                  {atual.aguardando ? `${atual.aguardando} aguardando aceite` : 'não entram no faturamento'}
                </span>
              </article>
            </section>

            <section className="dash-grade">
              <article className="dash-cartao largo">
                <h2>{periodo.dias === 1 ? 'Faturamento por hora' : 'Faturamento por dia'}</h2>
                <GraficoBarras dados={atual.porTempo} formato={(v) => brl(v).replace(',00', '')} orientacao="vertical" />
                <details className="dash-tabela">
                  <summary>Ver em tabela</summary>
                  <table>
                    <thead>
                      <tr><th>{periodo.dias === 1 ? 'Hora' : 'Dia'}</th><th>Detalhes</th></tr>
                    </thead>
                    <tbody>
                      {atual.porTempo.map((b) => (
                        <tr key={b.rotulo}><td>{b.rotulo}</td><td>{b.dica.split(' · ').slice(1).join(' · ')}</td></tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              </article>

              <article className="dash-cartao">
                <h2>🍔 Mais vendidos</h2>
                <GraficoBarras dados={atual.maisVendidos} formato={(v) => `${qtd(v)} un.`} />
              </article>

              <article className="dash-cartao">
                <h2>⏰ Horários de pico</h2>
                <GraficoBarras dados={atual.porHorario} formato={(v) => qtd(v)} orientacao="vertical" />
              </article>

              <article className="dash-cartao">
                <h2>💳 Formas de pagamento</h2>
                <GraficoBarras dados={atual.pagamentos} formato={brl} />
              </article>

              <article className="dash-cartao">
                <h2>🛵 Entrega × retirada</h2>
                <GraficoBarras dados={atual.tipos} formato={brl} />
                <h2 className="dash-subtitulo">📍 Bairros que mais compram</h2>
                <GraficoBarras dados={atual.bairros} formato={brl} vazio="Nenhuma entrega no período." />
              </article>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
