import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SessaoExpirada, executarAcao, listarPedidos, sair } from '../api'
import type { Acao, Pedido } from '../api'
import { PedidoCard } from '../components/PedidoCard'
import { ModalRecusa } from '../components/ModalRecusa'
import { desligarSom, liberarSom, somLiberado, tocarAlerta } from '../som'

const INTERVALO_MS = 2000

// "/": pedidos da loja, atualizados a cada 2 segundos.
export default function PedidosPage() {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null)
  const [semConexao, setSemConexao] = useState(false)
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [recusando, setRecusando] = useState<string | null>(null)
  const [erroAcao, setErroAcao] = useState<string | null>(null)
  const [agora, setAgora] = useState(Date.now)
  const [som, setSom] = useState(somLiberado)
  const vistos = useRef<Set<string> | null>(null)

  const deslogar = useCallback(() => {
    sair()
    navigate('/login', { replace: true })
  }, [navigate])

  const tratarErro = useCallback(
    (e: unknown) => {
      if (e instanceof SessaoExpirada) deslogar()
      else setSemConexao(true)
    },
    [deslogar],
  )

  // Busca os pedidos e toca o alerta quando chega um novo.
  useEffect(() => {
    let ativo = true
    const atualizar = async () => {
      try {
        const lista = await listarPedidos()
        if (!ativo) return
        const novos = lista.filter((p) => p.etapa === 0 && !p.recusado)
        if (vistos.current && novos.some((p) => !vistos.current!.has(p.id))) tocarAlerta()
        vistos.current = new Set(lista.map((p) => p.id))
        setPedidos(lista)
        setSemConexao(false)
        setAgora(Date.now())
      } catch (e) {
        if (ativo) tratarErro(e)
      }
    }
    atualizar()
    const t = setInterval(atualizar, INTERVALO_MS)
    return () => {
      ativo = false
      clearInterval(t)
    }
  }, [tratarErro])

  // Mostra a quantidade de pedidos novos no título da aba.
  const novos = pedidos?.filter((p) => p.etapa === 0 && !p.recusado) ?? []
  useEffect(() => {
    document.title = novos.length ? `(${novos.length}) Novo pedido! · Painel` : 'Painel · Macaco Grelhado'
  }, [novos.length])

  const agir = async (id: string, acao: Acao, motivo?: string) => {
    setOcupado(id)
    setErroAcao(null)
    try {
      const atualizado = await executarAcao(id, acao, motivo)
      setPedidos((lista) => lista?.map((p) => (p.id === id ? atualizado : p)) ?? null)
    } catch (e) {
      if (e instanceof SessaoExpirada) return deslogar()
      setErroAcao((e as Error).message)
    } finally {
      setOcupado(null)
      setRecusando(null)
    }
  }

  const ativarSom = async () => {
    await liberarSom()
    setSom(somLiberado())
    tocarAlerta()
  }

  const silenciar = async () => {
    await desligarSom()
    setSom(somLiberado())
  }

  const andamento = pedidos?.filter((p) => !p.recusado && p.etapa > 0 && p.etapa < 3) ?? []
  const finalizados = (pedidos?.filter((p) => p.recusado || p.etapa >= 3) ?? []).slice(0, 20)

  const coluna = (titulo: string, lista: Pedido[], vazio: string, classe = '') => (
    <section className={`coluna ${classe}`}>
      <h2 className="display">
        {titulo} <span className="contador">{lista.length}</span>
      </h2>
      {lista.length === 0 ? (
        <p className="coluna-vazia">{vazio}</p>
      ) : (
        lista.map((p) => (
          <PedidoCard
            key={p.id}
            pedido={p}
            agora={agora}
            ocupado={ocupado === p.id}
            onAcao={(acao) => agir(p.id, acao)}
            onRecusar={() => setRecusando(p.id)}
          />
        ))
      )}
    </section>
  )

  return (
    <div className="painel">
      <header className="painel-topo">
        <div className="painel-marca">
          <img src="/logo.png" alt="" />
          <div>
            <h1 className="display">Painel da loja</h1>
            <span className={`conexao ${semConexao ? 'off' : 'on'}`}>
              {semConexao ? '● Sem conexão' : '● Recebendo pedidos'}
            </span>
          </div>
        </div>
        <div className="painel-botoes">
          {som ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={silenciar} title="Clique para desligar o alerta">🔔 Som ligado</button>
          ) : (
            <button type="button" className="btn btn-primary btn-sm" onClick={ativarSom}>🔕 Ativar som</button>
          )}
          <Link to="/dashboard" className="btn btn-ghost btn-sm" title="Pede o login do gerente">📊 Ver dashboard</Link>
          <button type="button" className="btn btn-ghost btn-sm" onClick={deslogar}>Sair</button>
        </div>
      </header>

      {erroAcao && (
        <p className="aviso-erro" role="alert" onClick={() => setErroAcao(null)}>⚠️ {erroAcao}</p>
      )}

      {pedidos === null ? (
        <p className="carregando">{semConexao ? 'Sem conexão com o servidor. Tentando de novo…' : 'Carregando pedidos…'}</p>
      ) : (
        <main className="colunas">
          {coluna('Novos', novos, 'Nenhum pedido esperando. Os novos aparecem aqui com um alerta sonoro.', 'novos')}
          {coluna('Em andamento', andamento, 'Pedidos aceitos aparecem aqui.')}
          {coluna('Finalizados', finalizados, 'Entregues, retirados e recusados.')}
        </main>
      )}

      {recusando && (
        <ModalRecusa
          pedidoId={recusando}
          onCancelar={() => setRecusando(null)}
          onConfirmar={(motivo) => agir(recusando, 'recusar', motivo)}
        />
      )}
    </div>
  )
}
