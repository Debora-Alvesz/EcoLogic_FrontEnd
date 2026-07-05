import React, { useState } from 'react';
import '../styles/setores-adm.css';
import { useSetoresAdm } from '../hooks/useSetoresAdm';
import SetorModal from '../components/SetorModal';

export default function SetoresAdm() {
  const { setorVinculado, loading, handleVisualizarDetalhes } = useSetoresAdm();
  const [isModalAberto, setIsModalAberto] = useState(false);
  const [setorSelecionado, setSetorSelecionado] = useState(null);

  return (
    <>
    <div className="conteudo-pagina">
      {/* Cabeçalho do Módulo */}
      <div className="header-modulo">
        <div>
          <h2>Meu Setor</h2>
          <p>Consulte as informações do setor sob sua administração</p>
        </div>
      </div>

      {/* Container Principal */}
      <div className="container-adm">
        {loading ? (
          /* Estado: Carregando dados da API */
          <p className="loading-texto">Buscando suas informações de vínculo...</p>
        ) : !setorVinculado ? (
          /* Estado: Nenhum Setor Vinculado ainda */
          <div className="mensagem-vazia-adm">
            <div className="icone-vazio-adm">🏢</div>
            <h3>Nenhum setor vinculado</h3>
            <p>
              Você ainda não foi associado a nenhum setor no sistema. 
              Por favor, aguarde o Diretor realizar o seu vínculo para acessar os dados.
            </p>
          </div>
        ) : (
          /* Estado: Setor Vinculado Encontrado */
          <div className="card-setor-vinculado">
            <div className="card-header-setor">
              <div className="info-principal">
                <span className="badge-status">Setor Designado</span>
                <h3>{setorVinculado.nome}</h3>
                <p>Responsável: <strong>{setorVinculado.responsavel}</strong></p>
              </div>
              
              <button 
                className="btn-visualizar" 
                onClick={() => {
                  setSetorSelecionado(setorVinculado);
                  setIsModalAberto(true);
                }}
              >
                Acessar Painel
              </button>
            </div>
            
            <div className="card-body-setor">
              <div className="info-metrica">
                <span className="metrica-label">Código Identificador</span>
                <span className="metrica-valor">#{setorVinculado.id}</span>
              </div>
              <div className="info-metrica">
                <span className="metrica-label">Nível de Acesso</span>
                <span className="metrica-valor tag-admin">Administrador de Setor</span>
              </div>
              {setorVinculado.descricao && (
                <div className="info-metrica">
                  <span className="metrica-label">Descrição</span>
                  <span className="metrica-valor">{setorVinculado.descricao}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
    </div>
    {isModalAberto && (
      <SetorModal
        isOpen={isModalAberto}
        onClose={() => setIsModalAberto(false)}
        setor={setorSelecionado}
      />
    )}
    </>
  );
}