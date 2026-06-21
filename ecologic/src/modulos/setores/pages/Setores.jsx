import React, { useState } from 'react';
import '../styles/setores.css';

export default function Setores() {
  const [setores, setSetores] = useState([]);

  const [busca, setBusca] = useState('');

  const handleEditar = (id) => {
    console.log(`Editar setor com id: ${id}`);
  }

  const handleExcluir = (id) => {
    console.log(`Excluir setor com id: ${id}`);
  }

  const setoresFiltrados = setores.filter(setor =>
    setor.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="conteudo-pagina">
        {/* Cabeçalho do Módulo */}
        <div className="header-modulo">
            <div>
                <h2>Setores</h2>
                <p>Gerencie o cadastro de setores</p>
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

            <button className="btn-adicionar">
                + Adicionar Setor
            </button>
        </div>
        
        {/* Tabela de Setores */}
        <div className="container-tabela">
            {setoresFiltrados.length === 0 ? (
                <div className="mensagem-vazia">
                    <div className="icone-vazio">🏢</div>

                    <h3>Nenhum setor cadastrado</h3>
                    <p>
                        Ainda não existem setores cadastrados no sistema.
                        Clique em "Adicionar Setor" para realizar o primeiro cadastro.
                    </p>
                </div>
            ) : (
                <table className="tabela-dados">
                    <thead>
                        <tr>
                            <th>Nome do Setor</th>
                            <th>Responsável</th>
                            <th className="coluna-acoes">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {setoresFiltrados.map((setor) => (
                        <tr key={setor.id}>
                            <td>{setor.nome}</td>
                            <td>{setor.responsavel}</td>
                            <td className="coluna-acoes">
                                <div className="acoes-container">
                                    <button 
                                        className="btn-editar" 
                                        onClick={() => handleEditar(setor.id)}
                                    >
                                    Editar
                                    </button>
                                    <button 
                                        className="btn-excluir" 
                                        onClick={() => handleExcluir(setor.id)}
                                    >
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
    </div>
  );
}