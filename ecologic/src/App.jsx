import { useState } from 'react'
import './App.css'
import Dashboard from './modulos/dashboard/pages/Dashboard'
import Login from './modulos/autenticacao/pages/Login'
import CriarPerfil from './modulos/autenticacao/pages/CriarPerfil'
import Perfil from './modulos/perfil/pages/Perfil'
import NavBar from './shared/components/NavBar'
import SideBar from './shared/components/SideBar'

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

  // Verifica se a página atual deve exibir barra superior e barra lateral
  const showNavBar = currentPage === 'dashboard' || currentPage === 'perfil'
  const showSideBar = showNavBar

  return (
    <>
      {showNavBar && <NavBar currentPage={currentPage} onNavigate={handleNavigate} />}

      <div className={`app-container ${showSideBar ? 'with-sidebar' : 'full-width'}`}>
        {showSideBar && <SideBar />}

        <main className="app-content">
          {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
          {currentPage === 'login' && <Login onNavigate={handleNavigate} />}
          {currentPage === 'criar-perfil' && <CriarPerfil onNavigate={handleNavigate} />}
          {currentPage === 'perfil' && <Perfil onNavigate={handleNavigate} />}
        </main>
      </div>
    </>
  )
}

export default App
