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
import { useAuth } from './shared/components/../contexts/AuthContext' // Alinhar caminho do import se necessário
import EsqueciSenha from './modulos/autenticacao/pages/EsqueciSenha'
import RedefinirSenha from './modulos/autenticacao/pages/RedefinirSenha'

// REGRA DE NAVEGAÇÃO: Função auxiliar que analisa a URL digitada no navegador 
// para manter o usuário na página correta mesmo se ele atualizar a tela (F5)
const getInitialPage = () => {
  const path = window.location.pathname
  if (path === '/dashboard') return 'dashboard'
  if (path === '/perfil') return 'perfil'
  if (path === '/criar-perfil') return 'criar-perfil'
  if (path === '/produtos') return 'produtos'
  if (path === '/setores') return 'setores'
  if (path === '/relatorios') return 'relatorios'
  if (path === '/setores-adm') return 'setores-adm'
  if (path === '/esqueci-senha') return 'esqueci-senha'
  if (path === '/redefinir-senha') return 'redefinir-senha' 
  return 'login' // Por padrão, joga para o Login caso não encontre o caminho
}

function App() {
  const [currentPage, setCurrentPage] = useState(getInitialPage)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // CONTROLE DE ACESSO: Consome o contexto global de autenticação para saber o perfil logado
  const { isAdmin } = useAuth();
  
  // REGRA DE NEGÓCIO: No escopo do sistema, se o usuário NÃO for administrador, ele é classificado como Diretor
  const ehDiretor = !isAdmin;

  // Gerenciador de mudanças de página e histórico do navegador
  const handleNavigate = (page) => {
    // TRAVA DE SEGURANÇA: Impede que um Administrador tente forçar a entrada no Dashboard digitando a URL manualmente
    if (page === 'dashboard' && isAdmin) {
      setCurrentPage('produtos'); // Redireciona o operador para a tela permitida (Produtos)
      window.history.pushState({}, '', '/produtos');
      return;
    }

    setCurrentPage(page)
    const newPath = page === 'dashboard' ? '/dashboard' : `/${page}`
    window.history.pushState({}, '', newPath) // Sincroniza a barra de endereço sem recarregar o sistema
  }

  const handleNavigateWithMenu = (page) => {
    setIsMobileMenuOpen(false) // Fecha a barra lateral no mobile automaticamente ao clicar em um link
    handleNavigate(page)
  }

  // CONTROLE VISUAL: Define quais telas internas exigem a exibição dos menus de navegação superior e lateral
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
      {/* Renderização Condicional da Barra Superior */}
      {showNavBar && (
        <NavBar 
          currentPage={currentPage} 
          onNavigate={handleNavigateWithMenu}
          toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
      )}

      <div className={`app-container ${showSideBar ? 'with-sidebar' : 'full-width'}`}>
        {/* Renderização Condicional da Barra Lateral repassando a permissão do usuário */}
        {showSideBar && (
          <SideBar 
            currentPage={currentPage}              
            onNavigate={handleNavigateWithMenu}     
            isMobileMenuOpen={isMobileMenuOpen}
            closeMobileMenu={() => setIsMobileMenuOpen(false)}
            ehDiretor={ehDiretor} // Informa à Sidebar se o botão do Dashboard deve ficar visível ou oculto
          />
        )}

        {/* PROVEDOR DE TELAS (ROTEAMENTO DINÂMICO): Renderiza o componente na tela baseado no estado atual */}
        <main className="app-content">
          {/* O painel gerencial (Dashboard) exige validação explícita de Diretor para ser montado */}
          {currentPage === 'dashboard' && ehDiretor && <Dashboard onNavigate={handleNavigateWithMenu} />}
          
          {/* Telas públicas ou comuns para os operadores do sistema */}
          {currentPage === 'login' && <Login onNavigate={handleNavigateWithMenu} />}
          {currentPage === 'criar-perfil' && <CriarPerfil onNavigate={handleNavigateWithMenu} />}
          {currentPage === 'perfil' && <Perfil onNavigate={handleNavigateWithMenu} />}
          {currentPage === 'produtos' && <Produtos onNavigate={handleNavigateWithMenu} />}
          {currentPage === 'setores' && <Setores onNavigate={handleNavigateWithMenu} />}
          {currentPage === 'setores-adm' && <SetoresAdm onNavigate={handleNavigateWithMenu} />}
          {currentPage === 'relatorios' && <Relatorios />}
          {currentPage === 'esqueci-senha' && <EsqueciSenha onNavigate={handleNavigateWithMenu} />}
          {currentPage === 'redefinir-senha' && <RedefinirSenha onNavigate={handleNavigateWithMenu} />} 
        </main>
      </div>
    </>
  )
}

export default App