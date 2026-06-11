import { useState } from 'react'
import './App.css'
import Dashboard from './modulos/dashboard/pages/Dashboard'
import Login from './modulos/autenticacao/pages/Login'
import CriarPerfil from './modulos/autenticacao/pages/CriarPerfil'
import Perfil from './modulos/perfil/pages/Perfil'
import NavBar from './shared/components/NavBar'

// Função para identificar a rota inicial a partir da URL
const getInitialPage = () => {
  const path = window.location.pathname
  if (path === '/dashboard') return 'dashboard'
  if (path === '/perfil') return 'perfil'
  if (path === '/criar-perfil') return 'criar-perfil'
  return 'login' // Login é a tela padrão inicial
}

function App() {
  const [currentPage, setCurrentPage] = useState(getInitialPage)

  const handleNavigate = (page) => {
    setCurrentPage(page)
    // Sincroniza a URL do navegador sem disparar recarregamento
    const newPath = page === 'dashboard' ? '/dashboard' : `/${page}`
    window.history.pushState({}, '', newPath)
  }

  // Verifica se a página atual deve exibir a barra de navegação superior
  const showNavBar = currentPage === 'dashboard' || currentPage === 'perfil'

  return (
    <>
      {showNavBar && <NavBar currentPage={currentPage} onNavigate={handleNavigate} />}
      {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
      {currentPage === 'login' && <Login onNavigate={handleNavigate} />}
      {currentPage === 'criar-perfil' && <CriarPerfil onNavigate={handleNavigate} />}
      {currentPage === 'perfil' && <Perfil onNavigate={handleNavigate} />}
    </>
  )
}

export default App
