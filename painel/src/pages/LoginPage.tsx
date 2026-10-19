import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { entrar, lerToken } from '../api'
import type { Acesso } from '../api'
import { liberarSom } from '../som'

// Textos e destino de cada acesso: painel (atendente) e dashboard (gerente).
const TELAS: Record<Acesso, { titulo: string; subtitulo: string; destino: string }> = {
  painel: { titulo: 'Painel da loja', subtitulo: 'Macaco Grelhado · acesso restrito', destino: '/' },
  dashboard: { titulo: 'Dashboard', subtitulo: 'Faturamento e vendas · só o gerente', destino: '/dashboard' },
}

export default function LoginPage({ acesso = 'painel' }: { acesso?: Acesso }) {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [entrando, setEntrando] = useState(false)
  const tela = TELAS[acesso]

  if (lerToken(acesso)) return <Navigate to={tela.destino} replace />

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setErro(null)
    setEntrando(true)
    if (acesso === 'painel') liberarSom() // aproveita o clique para liberar o alerta sonoro
    try {
      await entrar(usuario.trim().toLowerCase(), senha, acesso)
      navigate(tela.destino, { replace: true })
    } catch (err) {
      setErro((err as Error).message)
      setEntrando(false)
    }
  }

  return (
    <main className="login">
      <form className="login-cartao" onSubmit={enviar}>
        <img src="/logo.png" alt="" />
        <h1 className="display">{tela.titulo}</h1>
        <p>{tela.subtitulo}</p>

        <label htmlFor="usuario">E-mail</label>
        <input id="usuario" className="campo" type="email" autoComplete="username" value={usuario} onChange={(e) => setUsuario(e.target.value)} required />

        <label htmlFor="senha">Senha</label>
        <input id="senha" className="campo" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />

        {erro && <p className="login-erro" role="alert">{erro}</p>}

        <button type="submit" className="btn btn-primary" disabled={entrando}>
          {entrando ? 'Entrando…' : 'Entrar'}
        </button>

        {acesso === 'dashboard' && <Link to="/" className="login-voltar">← Voltar para os pedidos</Link>}
      </form>
    </main>
  )
}
