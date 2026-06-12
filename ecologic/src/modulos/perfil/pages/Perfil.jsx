import usePerfil from '../hooks/usePerfil';
import '../styles/perfil.css';

const Perfil = ({ onNavigate }) => {
  const { usuario, loading, error } = usePerfil();

  const formatarData = (dataString) => {
    if (!dataString) return '-';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onNavigate) {
      onNavigate('login');
    } else {
      window.location.href = '/login';
    }
  };

  if (loading) {
    return (
      <div className="perfil-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2>Carregando perfil...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="perfil-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <h2 style={{ color: '#d32f2f' }}>Ops! Ocorreu um erro.</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!usuario) return null;

  const atributoPerfil =
    usuario.tipo === 'ADMINISTRADOR'
      ? usuario.cargo || usuario.atributoEspecifico
      : usuario.titulacao || usuario.atributoEspecifico;

  return (
    <div className="perfil-page">
      <div className="perfil-shell">
        
        {/* Conteúdo Principal do Perfil */}
        <div className="perfil-card">
          <div className="perfil-header">
            <h2>Dados do Perfil</h2>
            <p>Informações de identificação e acesso ao sistema.</p>
          </div>

          <div className="perfil-info-container">
            <div className="perfil-info-box">
              <span>Nome Completo</span>
              <strong>{usuario.nome}</strong>
            </div>

            <div className="perfil-info-box">
              <span>E-mail</span>
              <strong>{usuario.email}</strong>
            </div>

            <div className="perfil-grid">
              <div className="perfil-info-box">
                <span>Tipo de Perfil</span>
                <strong>{usuario.tipo}</strong>
              </div>

              <div className="perfil-info-box">
                <span>{usuario.tipo === 'ADMINISTRADOR' ? 'Cargo' : 'Titulação'}</span>
                <strong>{atributoPerfil || '-'}</strong>
              </div>
            </div>

            <div className="perfil-info-box">
              <span>Membro Desde</span>
              <strong>{formatarData(usuario.dataCriacao)}</strong>
            </div>
            
            {/* Botão de Logout realocado para dentro do card */}
            <button className="perfil-logout-btn" onClick={handleLogout}>
              <svg viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Sair da Conta
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Perfil;
