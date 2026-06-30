import React from 'react';
import '../styles/side-bar.css';
import { useSideBar } from '../hooks/SideBar';

const SideBar = ({ currentPage, onNavigate, isMobileMenuOpen, closeMobileMenu }) => {
  // Inicializando com o Dashboard selecionado
  const { activeTab, handleTabChange } = useSideBar('Dashboard');

  // Definição das opções requisitadas (Dashboard, Setores, Produtos, Relatórios)
  const menuItems = [
    {
      id: 'Dashboard',
      label: 'Dashboard',
      icon: (
        <svg viewBox="0 0 24 24" className="sidebar-item-icon">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      )
    },
    {
      id: 'Setores',
      label: 'Setores',
      icon: (
        <svg viewBox="0 0 24 24" className="sidebar-item-icon">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      )
    },
    {
      id: 'Produtos',
      label: 'Produtos',
      icon: (
        <svg viewBox="0 0 24 24" className="sidebar-item-icon">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
          <polyline points="7.5 19.79 7.5 14.6 3 12" />
          <polyline points="21 12 16.5 14.6 16.5 19.79" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      )
    },
    {
      id: 'Relatorios',
      label: 'Relatórios',
      icon: (
        <svg viewBox="0 0 24 24" className="sidebar-item-icon">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      )
    }
  ];

  return (
    <>
      {/* Overlay escuro que aparece em telas pequenas quando o menu está aberto */}
      {isMobileMenuOpen && (
        <div className="sidebar-overlay" onClick={closeMobileMenu}></div>
      )}

      <aside className={`sidebar-container ${isMobileMenuOpen ? 'open' : ''}`}>
        
        {/* Botão de Fechar Menu (Aparece só no mobile) */}
        <div className="sidebar-mobile-header">
          <button className="sidebar-close-btn" onClick={closeMobileMenu} aria-label="Fechar Menu">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Menu de Navegação - Deixando apenas da parte de operações para baixo */}
        <nav className="sidebar-menu">
          <span className="sidebar-section-title">Operações</span>

          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
              
              // A tualizamos o onClick para avisar o App.jsx quando mudar de tela
              onClick={() => {
                handleTabChange(item.id);
                
                // Redireciona apenas se for uma das telas que já criamos no App.jsx
                if (item.id === 'Produtos') onNavigate('produtos');
                if (item.id === 'Dashboard') onNavigate('dashboard');
                if (item.id === 'Setores') onNavigate('setores');
                if (item.id === 'Relatorios') onNavigate('relatorios');
              }}
            >
              <div className="sidebar-item-content">
                {item.icon}
                <span className="sidebar-item-text">{item.label}</span>
              </div>
              
              {/* Indicador de aba ativa (bolinha do lado direito) */}
              {activeTab === item.id && <div className="sidebar-active-dot" />}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default SideBar;