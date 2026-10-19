import { Link } from 'react-router-dom'

export default function NaoEncontrada() {
  return (
    <main className="wrap" style={{ minHeight: '100vh', display: 'grid', placeContent: 'center', textAlign: 'center', gap: 16 }}>
      <img src="/fotos/logo.png" alt="" width={120} style={{ margin: '0 auto' }} />
      <h1 className="display" style={{ fontSize: '3rem', color: 'var(--yellow)' }}>Página não encontrada</h1>
      <p style={{ color: 'var(--muted)' }}>Confira o endereço ou volte para o cardápio.</p>
      <Link to="/cardapio" className="btn btn-primary" style={{ justifySelf: 'center' }}>Ver cardápio</Link>
    </main>
  )
}
