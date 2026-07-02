import { useState } from 'react'
import './App.css'
import Dashboard from './modulos/dashboard/pages/Dashboard'
import Login from './modulos/autenticacao/pages/Login'
import CriarPerfil from './modulos/autenticacao/pages/CriarPerfil'
import Perfil from './modulos/perfil/pages/Perfil'
import Produtos from './modulos/Produtos/pages/Produtos'
import NavBar from './shared/components/NavBar'
import SideBar from './shared/components/SideBar'
import Setores from './modulos/setores/pages/Setores'
import SetoresAdm from './modulos/setores/pages/SetoresAdm'
import Relatorios from './modulos/relatorios/pages/Relatorios'


// Função para identificar a rota inicial a partir da URL
const getInitialPage = () => {
  const path = window.location.pathname
  if (path === '/dashboard') return 'dashboard'
  if (path === '/perfil') return 'perfil'
  if (path === '/criar-perfil') return 'criar-perfil'
  if (path === '/produtos') return 'produtos'
  if (path === '/setores') return 'setores'
  if (path === '/relatorios') return 'relatorios'
  if (path === '/setores-adm') return 'setores-adm'
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
 const showNavBar = 
  currentPage === 'dashboard' || 
  currentPage === 'perfil' || 
  currentPage === 'produtos' || 
  currentPage === 'setores' ||
  currentPage === 'setores-adm' ||
  currentPage === 'relatorios'
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
      currentPage={currentPage}              
      onNavigate={handleNavigateWithMenu}     
      isMobileMenuOpen={isMobileMenuOpen}
      closeMobileMenu={() => setIsMobileMenuOpen(false)}
    />
  )}

        <main className="app-content">
          {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigateWithMenu} />}
          {currentPage === 'login' && <Login onNavigate={handleNavigateWithMenu} />}
          {currentPage === 'criar-perfil' && <CriarPerfil onNavigate={handleNavigateWithMenu} />}
          {currentPage === 'perfil' && <Perfil onNavigate={handleNavigateWithMenu} />}
          {currentPage === 'produtos' && <Produtos onNavigate={handleNavigateWithMenu} />}
          {currentPage === 'setores' && <Setores onNavigate={handleNavigateWithMenu} />}
          {currentPage === 'setores-adm' && <SetoresAdm onNavigate={handleNavigateWithMenu} />}
          {currentPage === 'relatorios' && <Relatorios />}
        </main>
      </div>
    </>
  )
}

export default App
