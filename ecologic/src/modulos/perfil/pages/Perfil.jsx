import React from 'react';
import '../styles/perfil.css'

const Perfil = () => {
 
  const usuario = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    nome: "Carlos", 
    email: "carlos.diretor@ecologic.com.br",
    tipo: "DIRETOR",
    atributoEspecifico: "Mestre em Gestão Escolar",
    dataCriacao: "2026-06-10T09:00:00"
  };

  // Função simples para formatar a data que vem do DTO
  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="perfil-page">
      <div className="perfil-shell">
        
        {/* Barra lateral / Branding */}
        <div className="perfil-sidebar">
          <div className="perfil-brand">
            <div className="perfil-logo">
              {/* Ícone genérico de usuário/dashboard */}
              <svg viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <strong>EcoLogic</strong>
              <small>Dashboard Estratégico</small>
            </div>
          </div>
          
          <div className="perfil-copy">
            <span className="perfil-eyebrow">Área do Usuário</span>
            <h1>Olá, {usuario.nome}.</h1>
            <p>Aqui está o panorama das informações cadastradas no seu perfil.</p>
          </div>
        </div>

        {/* Conteúdo Principal do Perfil */}
        <div className="perfil-card">
          <div className="perfil-header">
            <h2>Dados do Perfil</h2>
            <p>Informações de identificação e acesso ao sistema.</p>
          </div>

          <div className="perfil-info-container">
            {/* Nome */}
            <div className="perfil-info-box">
              <span>Nome Completo</span>
              <strong>{usuario.nome}</strong>
            </div>

            {/* Email */}
            <div className="perfil-info-box">
              <span>E-mail</span>
              <strong>{usuario.email}</strong>
            </div>

            <div className="perfil-grid">
              {/* Tipo de Usuário */}
              <div className="perfil-info-box">
                <span>Tipo de Perfil</span>
                <strong>{usuario.tipo}</strong>
              </div>

              {/* Atributo Específico (Cargo ou Titulação) */}
              <div className="perfil-info-box">
                <span>{usuario.tipo === 'ADMINISTRADOR' ? 'Cargo' : 'Titulação'}</span>
                <strong>{usuario.atributoEspecifico}</strong>
              </div>
            </div>

            {/* Data de Criação */}
            <div className="perfil-info-box">
              <span>Membro Desde</span>
              <strong>{formatarData(usuario.dataCriacao)}</strong>
            </div>
            
            {/* ID do Sistema (Opcional, apenas para mostrar todos os dados do DTO) */}
            <div className="perfil-info-box">
              <span>ID do Sistema</span>
              <strong style={{ fontSize: '14px', color: '#59677d' }}>{usuario.id}</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Perfil;