import React from 'react';
import useNavbar from '../hooks/useNavBar';
import '../styles/nav-bar.css';

const NavBar = ({ currentPage, onNavigate }) => {
  const { usuario } = useNavbar();

  // Define títulos e legendas com base na página ativa
  const getPageMeta = () => {
    switch (currentPage) {
      case 'dashboard':
        return {
          titulo: 'Dashboard Estratégico',
          legenda: 'Visão geral de consumo e desperdício • E.E. Prof. Maria Silva'
        };
      case 'perfil':
        return {
          titulo: 'Dados do Perfil',
          legenda: 'Informações de identificação e acesso ao sistema.'
        };
      default:
        return {
          titulo: 'EcoLogic',
          legenda: 'Auditoria Sustentável'
        };
    }
  };

  const meta = getPageMeta();

  return (
    <header className="navbar-container">
      {/* Esquerda: Branding & Título da Página */}
      <div className="navbar-brand-section">
        <div className="navbar-brand-wrapper" onClick={() => onNavigate('dashboard')}>
          <div className="navbar-logo">
            <svg viewBox="0 0 24 24" role="presentation">
              <path d="M19.6 4.4c-5.7.4-10 2.1-12.9 5C3.9 12.2 3 16 4.8 19.2c3.2 1.8 7 .9 9.8-1.9 2.9-2.9 4.6-7.2 5-12.9Z" />
              <path d="M7.6 16.4c2.2-3.2 4.8-5.2 8.4-6.4" />
            </svg>
          </div>
          <div className="navbar-brand-text">
            <strong>EcoLogic</strong>
            <small>Auditoria Sustentável</small>
          </div>
        </div>

        <div className="navbar-divider"></div>

        <div className="navbar-page-title-section">
          <h2>{meta.titulo}</h2>
          <p>{meta.legenda}</p>
        </div>
      </div>

      {/* Direita: Busca, Notificações e Perfil */}
      <div className="navbar-actions-section">
        {/* Input de Busca */}
        <div className="navbar-search-container">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Buscar item, anomalia ou relatório..." 
            className="navbar-search-input"
          />
        </div>

        {/* Botão de Notificações */}
        <button className="navbar-notification-btn" aria-label="Notificações">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className="navbar-notification-dot"></span>
        </button>

        {/* Bloco de Perfil do Usuário */}
        <div className="navbar-profile-wrapper" onClick={() => onNavigate('perfil')}>
          <div className="navbar-profile-info">
            <strong>{usuario.nome}</strong>
            <small>{usuario.cargo}</small>
          </div>
          <div className="navbar-avatar">
            {usuario.iniciais}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
