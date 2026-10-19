import { Link } from 'react-router-dom'
import { URL_LANDING } from '../../config'

type Props = { titulo: string; voltarPara?: string; subtitulo?: string }

// Cabeçalho das páginas internas do cardápio: botão de voltar + título.
export function Topo({ titulo, voltarPara, subtitulo }: Props) {
  return (
    <header className="topo">
      <div className="conteudo topo-linha">
        {voltarPara ? (
          <Link to={voltarPara} className="voltar" aria-label="Voltar">
            ←
          </Link>
        ) : (
          <a href={URL_LANDING} aria-label="Página inicial">
            <img src="/fotos/logo.png" alt="" className="topo-logo" />
          </a>
        )}
        <div>
          <h1 className="display">{titulo}</h1>
          {subtitulo && <p>{subtitulo}</p>}
        </div>
      </div>
    </header>
  )
}
