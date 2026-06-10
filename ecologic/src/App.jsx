import { useState } from 'react'
import './App.css'
import Dashboard from './modulos/dashboard/pages/Dashboard'
import Login from './modulos/autenticacao/pages/Login'
import CriarPerfil from './modulos/autenticacao/pages/CriarPerfil'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  return (
    <>
      {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
      {currentPage === 'login' && <Login onNavigate={handleNavigate} />}
      {currentPage === 'criar-perfil' && <CriarPerfil onNavigate={handleNavigate} />}
    </>
  )
}

export default App
