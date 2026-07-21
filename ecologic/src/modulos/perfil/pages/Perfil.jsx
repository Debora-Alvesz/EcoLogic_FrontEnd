import { useEffect, useState } from 'react';
import usePerfil from '../hooks/usePerfil';
import '../styles/perfil.css';
import { useAuth } from '../../../shared/contexts/AuthContext';

const Perfil = ({ onNavigate }) => {
  const { usuario, loading, error: fetchError } = usePerfil();
  const { setUserRole, clearAuth, isAdmin, isDiretor } = useAuth();

  // Estados para o Modal de Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '', atributoEspecifico: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (usuario?.tipo) {
      setUserRole(usuario.tipo);
    }
  }, [usuario, setUserRole]);

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
    clearAuth();
    if (onNavigate) {
      onNavigate('login');
    } else {
      window.location.href = '/login';
    }
  };

  // Abre o modal e preenche os dados garantindo valores não nulos
  const handleOpenEdit = () => {
    const valorAtributo = usuario?.tipo === 'ADMINISTRADOR'
      ? usuario?.cargo
      : usuario?.titulacao;

    setFormData({
      nome: usuario?.nome || '',
      email: usuario?.email || '',
      senha: '',
      atributoEspecifico: valorAtributo || usuario?.atributoEspecifico || '',
    });
    setUpdateError(null);
    setUpdateSuccess(false);
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Envia a requisição de atualização para a API usando o ID do usuário (rota v1.1)
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const token = localStorage.getItem('token');

      // Monta o payload apenas com campos preenchidos (todos opcionais conforme contrato)
      const payload = {};

      if (formData.nome && formData.nome.trim() !== '') {
        payload.nome = formData.nome.trim();
      }

      if (formData.email && formData.email.trim() !== '') {
        payload.email = formData.email.trim();
      }

      // Envia a senha apenas se o usuário preencheu (mínimo 6 caracteres conforme contrato)
      if (formData.senha && formData.senha.trim() !== '') {
        payload.senha = formData.senha;
      }

      // O atributoEspecifico é inteligente no backend: atualiza cargo (ADMIN) ou titulação (DIRETOR)
      if (formData.atributoEspecifico && formData.atributoEspecifico.trim() !== '') {
        payload.atributoEspecifico = formData.atributoEspecifico.trim();
      }

      // Usa o ID do usuário na rota conforme contrato v1.1: PUT /api/v1/usuarios/id/{id}
      const response = await fetch(`http://localhost:8080/api/v1/usuarios/id/${usuario.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        if (errorData.erros && Array.isArray(errorData.erros)) {
          throw new Error(errorData.erros.join(', '));
        }

        throw new Error(errorData.mensagem || errorData.message || 'Erro ao atualizar perfil. Verifique os dados e tente novamente.');
      }

      setUpdateSuccess(true);

      // Aguarda um momento para exibir o feedback de sucesso antes de recarregar
      setTimeout(() => {
        setIsModalOpen(false);
        window.location.reload();
      }, 1200);
    } catch (err) {
      setUpdateError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="perfil-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h2>Carregando perfil...</h2>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="perfil-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <h2 style={{ color: '#d32f2f' }}>Ops! Ocorreu um erro.</h2>
        <p>{fetchError}</p>
      </div>
    );
  }

  if (!usuario) return null;

  const atributoPerfil = usuario.tipo === 'ADMINISTRADOR'
    ? usuario.cargo || usuario.atributoEspecifico
    : usuario.titulacao || usuario.atributoEspecifico;

  const labelAtributo = usuario.tipo === 'ADMINISTRADOR' ? 'Cargo' : 'Titulação';

  return (
    <div className="perfil-page">
      <div className="perfil-shell">
        <div className="perfil-card">
          <div className="perfil-header">
            <h2>Dados do Perfil</h2>
            <p>Informações de identificação e acesso ao sistema.</p>
            <button className="perfil-edit-btn" onClick={handleOpenEdit}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar Perfil
            </button>
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
                <strong>{isAdmin ? '🛡️ Administrador' : isDiretor ? '🎓 Diretor' : usuario.tipo}</strong>
              </div>

              <div className="perfil-info-box">
                <span>{labelAtributo}</span>
                <strong>{atributoPerfil || '-'}</strong>
              </div>
            </div>

            <div className="perfil-info-box">
              <span>Membro Desde</span>
              <strong>{formatarData(usuario.dataCriacao)}</strong>
            </div>

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

      {/* Modal de Edição de Perfil */}
      {isModalOpen && (
        <div className="perfil-modal-overlay" onClick={(e) => e.target === e.currentTarget && !isUpdating && setIsModalOpen(false)}>
          <div className="perfil-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">

            {/* Cabeçalho do Modal */}
            <div className="perfil-modal-header">
              <div className="perfil-modal-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h3 id="modal-title" className="perfil-modal-title">Editar Perfil</h3>
                <p className="perfil-modal-subtitle">Atualize suas informações de acesso</p>
              </div>
              <button
                className="perfil-modal-close"
                onClick={() => !isUpdating && setIsModalOpen(false)}
                aria-label="Fechar modal"
                disabled={isUpdating}
              >
                ×
              </button>
            </div>

            {/* Feedback de Erro */}
            {updateError && (
              <div className="perfil-modal-alert perfil-modal-alert--error" role="alert">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{updateError}</span>
              </div>
            )}

            {/* Feedback de Sucesso */}
            {updateSuccess && (
              <div className="perfil-modal-alert perfil-modal-alert--success" role="status">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Perfil atualizado com sucesso!</span>
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={handleUpdate} className="perfil-modal-form" noValidate>

              <div className="perfil-modal-field">
                <label className="perfil-modal-label" htmlFor="edit-nome">Nome Completo</label>
                <input
                  id="edit-nome"
                  className="perfil-modal-input"
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  required
                  disabled={isUpdating}
                />
              </div>

              <div className="perfil-modal-field">
                <label className="perfil-modal-label" htmlFor="edit-email">E-mail</label>
                <input
                  id="edit-email"
                  className="perfil-modal-input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  required
                  disabled={isUpdating}
                />
              </div>

              <div className="perfil-modal-field">
                <label className="perfil-modal-label" htmlFor="edit-atributo">{labelAtributo}</label>
                <input
                  id="edit-atributo"
                  className="perfil-modal-input"
                  type="text"
                  name="atributoEspecifico"
                  value={formData.atributoEspecifico}
                  onChange={handleChange}
                  placeholder={usuario.tipo === 'ADMINISTRADOR' ? 'Ex: Gerente de TI' : 'Ex: Doutora em Gestão Ambiental'}
                  disabled={isUpdating}
                />
              </div>

              <div className="perfil-modal-field">
                <label className="perfil-modal-label" htmlFor="edit-senha">
                  Nova Senha
                  <span className="perfil-modal-label-hint">(deixe em branco para manter a atual)</span>
                </label>
                <input
                  id="edit-senha"
                  className="perfil-modal-input"
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  disabled={isUpdating}
                />
              </div>

              {/* Rodapé com Botões */}
              <div className="perfil-modal-footer">
                <button
                  type="button"
                  className="perfil-modal-btn perfil-modal-btn--cancel"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isUpdating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="btn-salvar-perfil"
                  className="perfil-modal-btn perfil-modal-btn--save"
                  disabled={isUpdating || updateSuccess}
                >
                  {isUpdating ? (
                    <>
                      <span className="perfil-modal-spinner" aria-hidden="true" />
                      Salvando...
                    </>
                  ) : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;