import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { lerToken } from '../api'
import type { Acesso } from '../api'

// Sem login, manda para a tela de login daquele acesso.
export function RotaProtegida({ children, acesso = 'painel' }: { children: ReactNode; acesso?: Acesso }) {
  if (!lerToken(acesso)) return <Navigate to={acesso === 'dashboard' ? '/dashboard/login' : '/login'} replace />
  return children
}
