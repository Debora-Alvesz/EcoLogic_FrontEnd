import usePerfil from '../hooks/usePerfil';
import '../styles/perfil.css';

const Perfil = () => {
  const { usuario, loading, error } = usePerfil();

  const formatarData = (dataString) => {
    if (!dataString) return '-';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
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
      ? usuario.cargo
      : usuario.titulacao || usuario.atributoEspecifico;

  return (
    <div className="perfil-page">
      <div className="perfil-shell">
        
        {/* Barra lateral / Branding */}
        <div className="perfil-sidebar">
          <div className="perfil-brand">
            <div className="perfil-logo">
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
          </div>
        </div>

      </div>
    </div>
  );
};

export default Perfil;
