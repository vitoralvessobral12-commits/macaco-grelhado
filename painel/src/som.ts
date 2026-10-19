// Alerta sonoro de pedido novo, gerado pelo navegador (sem arquivo de áudio).
// Navegadores só liberam som depois que a pessoa clica em algo na página.

let ctx: AudioContext | null = null

export function somLiberado() {
  return ctx?.state === 'running'
}

// Chamar dentro de um clique (ex.: botão "Entrar" ou "Ativar som").
export async function liberarSom() {
  ctx ??= new AudioContext()
  if (ctx.state !== 'running') await ctx.resume()
}

export function tocarAlerta() {
  if (!ctx || ctx.state !== 'running') return
  const agora = ctx.currentTime
  // "Ding-dong": duas notas curtas, repetidas duas vezes
  ;[0, 0.35, 0.9, 1.25].forEach((t, i) => {
    const osc = ctx!.createOscillator()
    const vol = ctx!.createGain()
    osc.type = 'sine'
    osc.frequency.value = i % 2 === 0 ? 880 : 660
    vol.gain.setValueAtTime(0.0001, agora + t)
    vol.gain.exponentialRampToValueAtTime(0.4, agora + t + 0.02)
    vol.gain.exponentialRampToValueAtTime(0.0001, agora + t + 0.3)
    osc.connect(vol).connect(ctx!.destination)
    osc.start(agora + t)
    osc.stop(agora + t + 0.32)
  })
}

// Botão "Som ligado": silencia os alertas até clicar em "Ativar som" de novo.
export async function desligarSom() {
  if (ctx?.state === 'running') await ctx.suspend()
}
