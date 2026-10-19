import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import PedidosPage from './pages/PedidosPage'
import DashboardPage from './pages/DashboardPage'
import { RotaProtegida } from './components/RotaProtegida'
import './painel.css'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RotaProtegida>
            <PedidosPage />
          </RotaProtegida>
        }
      />
      {/* Dashboard: login separado, só do gerente */}
      <Route path="/dashboard/login" element={<LoginPage acesso="dashboard" />} />
      <Route
        path="/dashboard"
        element={
          <RotaProtegida acesso="dashboard">
            <DashboardPage />
          </RotaProtegida>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
