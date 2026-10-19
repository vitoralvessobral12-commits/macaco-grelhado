import { useEffect, useRef, useState } from 'react'

// Campo "Rua e número" com sugestões de rua enquanto a pessoa digita. Só busca em Sobral/CE.
// 1º ViaCEP (base dos Correios, a mais completa para as ruas de Sobral); se não achar nada,
// 2º OpenStreetMap (Nominatim). As duas são gratuitas e sem chave.
// Se as duas falharem, o campo continua funcionando normal, só sem sugestões.

const URL_VIACEP = 'https://viacep.com.br/ws/CE/Sobral'
const URL_OSM = 'https://nominatim.openstreetmap.org/search'
const SOBRAL = '-40.45,-3.62,-40.28,-3.78' // retângulo (oeste, norte, leste, sul) em volta da cidade
const MIN_LETRAS = 4
const MAX_SUGESTOES = 5
const ESPERA_MS = 500 // espera parar de digitar (o OpenStreetMap gratuito pede no máximo 1 busca por segundo)

type Sugestao = { rua: string; bairro: string; cep?: string }

type Props = {
  id: string
  className: string
  value: string
  onChange: (valor: string) => void
  onEscolher: (sugestao: Sugestao) => void
}

// Separa "Rua X, 120" em rua e número, para buscar só pela rua.
function separarNumero(texto: string) {
  const m = texto.match(/^(.*?)[,\s]+(\d+[a-zA-Z]?)\s*$/)
  return m ? { rua: m[1].trim(), numero: m[2] } : { rua: texto.trim(), numero: '' }
}

const normalizar = (v: string) => v.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Tira repetidas (mesma rua no mesmo bairro) e põe primeiro as que começam com o que foi digitado
function organizar(lista: Sugestao[], digitado: string) {
  const busca = normalizar(digitado)
  const vistas = new Set<string>()
  return lista
    .filter((s) => {
      const chave = normalizar(`${s.rua}|${s.bairro}`)
      if (vistas.has(chave)) return false
      vistas.add(chave)
      return true
    })
    .sort((a, b) => Number(normalizar(b.rua).startsWith(busca)) - Number(normalizar(a.rua).startsWith(busca)))
    .slice(0, MAX_SUGESTOES)
}

async function buscarViaCep(rua: string, sinal: AbortSignal): Promise<Sugestao[]> {
  const resposta = await fetch(`${URL_VIACEP}/${encodeURIComponent(rua)}/json/`, { signal: sinal })
  if (!resposta.ok) return []
  const lista: { logradouro?: string; bairro?: string; cep?: string }[] = await resposta.json()
  if (!Array.isArray(lista)) return []
  return lista.filter((r) => r.logradouro).map((r) => ({ rua: r.logradouro!, bairro: r.bairro ?? '', cep: r.cep }))
}

async function buscarOpenStreetMap(rua: string, sinal: AbortSignal): Promise<Sugestao[]> {
  const params = new URLSearchParams({
    q: `${rua}, Sobral, Ceará`,
    format: 'json',
    addressdetails: '1',
    countrycodes: 'br',
    viewbox: SOBRAL,
    bounded: '1',
    limit: '8',
    'accept-language': 'pt-BR',
  })
  const resposta = await fetch(`${URL_OSM}?${params}`, { signal: sinal })
  if (!resposta.ok) return []
  const lista: { address?: { road?: string; suburb?: string; neighbourhood?: string; postcode?: string } }[] = await resposta.json()
  return lista
    .filter((r) => r.address?.road)
    .map((r) => ({ rua: r.address!.road!, bairro: r.address?.suburb || r.address?.neighbourhood || '', cep: r.address?.postcode }))
}

async function buscarRuas(rua: string, sinal: AbortSignal): Promise<Sugestao[]> {
  try {
    const correios = await buscarViaCep(rua, sinal)
    if (correios.length) return organizar(correios, rua)
  } catch (e) {
    if (sinal.aborted) throw e
    // ViaCEP fora do ar: segue para o OpenStreetMap
  }
  return organizar(await buscarOpenStreetMap(rua, sinal), rua)
}

export function BuscaEndereco({ id, className, value, onChange, onEscolher }: Props) {
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([])
  const [aberta, setAberta] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const campo = useRef<HTMLInputElement>(null)
  const escolhido = useRef<string | null>(null) // não busca de novo logo após escolher

  useEffect(() => {
    const { rua } = separarNumero(value)
    if (rua.length < MIN_LETRAS || value === escolhido.current) {
      setSugestoes([])
      setBuscando(false)
      return
    }
    const controle = new AbortController()
    setBuscando(true)
    const t = setTimeout(async () => {
      try {
        setSugestoes(await buscarRuas(rua, controle.signal))
      } catch {
        if (!controle.signal.aborted) setSugestoes([])
      } finally {
        if (!controle.signal.aborted) setBuscando(false)
      }
    }, ESPERA_MS)
    return () => {
      clearTimeout(t)
      controle.abort()
    }
  }, [value])

  const escolher = (s: Sugestao) => {
    const { numero } = separarNumero(value)
    const novo = `${s.rua}, ${numero}`
    escolhido.current = novo
    onChange(novo)
    onEscolher(s)
    setSugestoes([])
    setAberta(false)
    campo.current?.focus() // cursor pronto para digitar o número
  }

  const mostrar = aberta && (sugestoes.length > 0 || buscando)

  return (
    <div className="busca-endereco">
      <input
        ref={campo}
        id={id}
        className={className}
        autoComplete="off"
        placeholder="Comece a digitar o nome da rua…"
        value={value}
        role="combobox"
        aria-expanded={mostrar}
        aria-controls={`${id}-sugestoes`}
        onChange={(e) => {
          onChange(e.target.value)
          setAberta(true)
        }}
        onFocus={() => setAberta(true)}
        onBlur={() => setAberta(false)}
      />
      {mostrar && (
        <ul className="sugestoes" id={`${id}-sugestoes`} role="listbox">
          {sugestoes.map((s) => (
            <li key={`${s.rua}|${s.bairro}`} role="option" aria-selected={false}>
              {/* onMouseDown: escolhe antes de o campo perder o foco e fechar a lista */}
              <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => escolher(s)}>
                <span className="sugestao-pino">📍</span>
                <span>
                  <b>{s.rua}</b>
                  <small>{s.bairro ? `${s.bairro} · ` : ''}Sobral - CE{s.cep ? ` · CEP ${s.cep}` : ''}</small>
                </span>
              </button>
            </li>
          ))}
          {buscando && sugestoes.length === 0 && <li className="sugestao-info">Procurando ruas em Sobral…</li>}
        </ul>
      )}
    </div>
  )
}
