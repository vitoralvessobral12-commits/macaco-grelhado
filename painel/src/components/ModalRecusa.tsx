import { useState } from 'react'

const MOTIVOS = [
  'Estamos fechando, não conseguimos preparar a tempo.',
  'Um dos itens acabou.',
  'Endereço fora da nossa área de entrega.',
  'Muitos pedidos no momento, tente novamente mais tarde.',
]

type Props = { pedidoId: string; onConfirmar: (motivo: string) => void; onCancelar: () => void }

// Pergunta o motivo da recusa: o cliente vê essa mensagem na tela dele.
export function ModalRecusa({ pedidoId, onConfirmar, onCancelar }: Props) {
  const [motivo, setMotivo] = useState(MOTIVOS[0])
  const [outro, setOutro] = useState('')
  const final = motivo === 'outro' ? outro.trim() : motivo

  return (
    <div className="modal-fundo" onClick={onCancelar}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-recusa" onClick={(e) => e.stopPropagation()}>
        <h2 id="titulo-recusa" className="display">Recusar pedido #{pedidoId}</h2>
        <p>O cliente vai ver este motivo na tela do pedido.</p>
        <div className="motivos">
          {MOTIVOS.map((m) => (
            <label key={m}>
              <input type="radio" name="motivo" checked={motivo === m} onChange={() => setMotivo(m)} />
              {m}
            </label>
          ))}
          <label>
            <input type="radio" name="motivo" checked={motivo === 'outro'} onChange={() => setMotivo('outro')} />
            Outro motivo
          </label>
          {motivo === 'outro' && (
            <input className="campo" autoFocus placeholder="Escreva o motivo" value={outro} onChange={(e) => setOutro(e.target.value)} />
          )}
        </div>
        <div className="modal-acoes">
          <button type="button" className="btn btn-ghost" onClick={onCancelar}>Voltar</button>
          <button type="button" className="btn btn-perigo" disabled={!final} onClick={() => onConfirmar(final)}>
            Recusar pedido
          </button>
        </div>
      </div>
    </div>
  )
}
