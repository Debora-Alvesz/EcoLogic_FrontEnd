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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleNavigate = (page) => {
    setCurrentPage(page)
    // Sincroniza a URL do navegador sem disparar recarregamento
    const newPath = page === 'dashboard' ? '/dashboard' : `/${page}`
    window.history.pushState({}, '', newPath)
  }

  // Fecha o menu mobile sempre que navegar
  const handleNavigateWithMenu = (page) => {
    setIsMobileMenuOpen(false)
    handleNavigate(page)
  }

  // Verifica se a página atual deve exibir barra superior e barra lateral
  const showNavBar = currentPage === 'dashboard' || currentPage === 'perfil'
  const showSideBar = showNavBar

  return (
    <>
      {showNavBar && (
        <NavBar 
          currentPage={currentPage} 
          onNavigate={handleNavigateWithMenu}
          toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
      )}

      <div className={`app-container ${showSideBar ? 'with-sidebar' : 'full-width'}`}>
        {showSideBar && (
          <SideBar 
            isMobileMenuOpen={isMobileMenuOpen}
            closeMobileMenu={() => setIsMobileMenuOpen(false)}
          />
        )}

        <main className="app-content">
          {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigateWithMenu} />}
          {currentPage === 'login' && <Login onNavigate={handleNavigateWithMenu} />}
          {currentPage === 'criar-perfil' && <CriarPerfil onNavigate={handleNavigateWithMenu} />}
          {currentPage === 'perfil' && <Perfil onNavigate={handleNavigateWithMenu} />}
        </main>
      </div>
    </>
  )
}

export default App
