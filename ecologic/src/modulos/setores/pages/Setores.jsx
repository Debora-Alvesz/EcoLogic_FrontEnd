import React from 'react';
import '../styles/Setores.css';
import { useSetores } from '../hooks/useSetores';

export default function Setores() {
  const {
    busca,
    setBusca,
    setoresFiltrados,
    loading,
    modalAberto,
    formData,
    setFormData,
    administradores,
    abrirModalCriar,
    handleEditar,
    handleExcluir,
    handleSalvar,
    fecharModal,
    obterNomeAdmin
  } = useSetores();

  return (
    <div className="conteudo-pagina">
      {/* Cabeçalho do Módulo */}
      <div className="header-modulo">
        <div>
          <h2>Setores</h2>
          <p>Gerencie o cadastro de setores e seus administradores</p>
        </div>
      </div>

      {/* Barra de Ações */}
      <div className="barra-acoes">
        <input
          type="text"
          placeholder="Buscar setor pelo nome..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="input-busca"
        />

        <button className="btn-adicionar" onClick={abrirModalCriar}>
          + Adicionar Setor
        </button>
      </div>

      {/* Estado de Carregamento */}
      {loading && <p className="loading-texto">Carregando setores...</p>}

      {/* Tabela de Setores */}
      {!loading && (
        <div className="container-tabela">
          {setoresFiltrados.length === 0 ? (
            <div className="mensagem-vazia">
              <div className="icone-vazio">🏢</div>
              <h3>Nenhum setor cadastrado</h3>
              <p>
                Ainda não existem setores cadastrados no sistema ou nenhum atende à busca.
                Clique em "Adicionar Setor" para realizar o primeiro cadastro.
              </p>
            </div>
          ) : (
            <table className="tabela-dados">
              <thead>
                <tr>
                  <th>Nome do Setor</th>
                  <th>Descrição</th>
                  <th>Administrador Responsável</th>
                  <th className="coluna-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {setoresFiltrados.map((setor) => (
                  <tr key={setor.id}>
                    <td>{setor.nome}</td>
                    <td>{setor.descricao || 'Sem descrição'}</td>
                    {/* Traduz o UUID recebido do back no nome do admin */}
                    <td>{obterNomeAdmin(setor.administradorId)}</td>
                    <td className="coluna-acoes">
                      <div className="acoes-container">
                        <button className="btn-editar" onClick={() => handleEditar(setor)}>
                          Editar
                        </button>
                        <button className="btn-excluir" onClick={() => handleExcluir(setor.id)}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* MODAL DE CADASTRO / EDIÇÃO */}
      {modalAberto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{formData.id ? 'Editar Setor' : 'Adicionar Novo Setor'}</h3>
            
            <form onSubmit={handleSalvar}>
              <div className="form-group">
                <label>Nome do Setor *</label>
                <input
                  type="text"
                  maxLength={100}
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Recursos Humanos"
                />
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  maxLength={255}
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Breve descrição sobre as atividades do setor..."
                />
              </div>

              <div className="form-group">
                <label>Administrador Responsável *</label>
                <select
                  required
                  value={formData.administradorId}
                  onChange={(e) => setFormData({ ...formData, administradorId: e.target.value })}
                >
                  <option value="">Selecione um administrador...</option>
                  {administradores.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-acoes">
                <button type="button" className="btn-cancelar" onClick={fecharModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-salvar">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}