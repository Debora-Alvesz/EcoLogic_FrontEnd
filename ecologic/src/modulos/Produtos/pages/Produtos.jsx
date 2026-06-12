import React, { useState, useEffect } from 'react';
import '../styles/produto.css'; // 1. Importa o arquivo de estilos CSS externo

export default function Produtos() {
  // --- ESTADOS DA APLICAÇÃO ---
  const [produtos, setProdutos] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // --- ESTADOS DO MODAL (CADASTRAR / EDITAR) ---
  const [isModalAberto, setIsModalAberto] = useState(false);
  const [modoModal, setModoModal] = useState('cadastrar'); 

  // Ajustado com os campos reais do seu JSON (custoUnitario e unidadeDeMedida)
  const [formProduto, setFormProduto] = useState({ 
    id: null, 
    nome: '', 
    categoria: 'ALIMENTO', 
    custoUnitario: '', 
    unidadeDeMedida: '' 
  });

  const API_URL = 'http://localhost:8080/produtos'; 

  // --- FUNÇÃO: BUSCAR PRODUTOS DO BACK-END ---
  const buscarProdutos = async () => {
    try {
      setCarregando(true);
      const resposta = await fetch(API_URL);
      if (!resposta.ok) throw new Error('Erro ao carregar lista de produtos.');
      
      const dados = await resposta.json();
      setProdutos(dados);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarProdutos();
  }, []);

  // --- FUNÇÃO: RETORNA AS CORES DO ENUM DO JAVA ---
  const getEstiloBadge = (categoria) => {
    const configs = {
      ALIMENTO: { bg: '#e6f4ea', texto: '#137333', label: 'Alimento' },
      LIMPEZA: { bg: '#e8f0fe', texto: '#1a73e8', label: 'Limpeza' },
      ELETRONICO: { bg: '#f3e8ff', texto: '#6b21a8', label: 'Eletrônico' },
      HIGIENE: { bg: '#e0f2fe', texto: '#0369a1', label: 'Higiene' },
      ESCRITORIO: { bg: '#fef3c7', texto: '#b45309', label: 'Escritório' },
      OUTROS: { bg: '#f1f5f9', texto: '#475569', label: 'Outros' }
    };
    return configs[categoria?.toUpperCase()] || configs.OUTROS;
  };

  // --- FUNÇÃO: ABRIR MODAL PARA NOVO PRODUTO ---
  const abrirModalCadastro = () => {
    setModoModal('cadastrar');
    setFormProduto({ id: null, nome: '', categoria: 'ALIMENTO', custoUnitario: '', unidadeDeMedida: '' });
    setIsModalAberto(true);
  };

  // --- FUNÇÃO: ABRIR MODAL PARA EDITAR PRODUTO EXISTENTE ---
  const abrirModalEdicao = (produto) => {
    setModoModal('editar');
    setFormProduto({
      id: produto.id,
      nome: produto.nome,
      categoria: produto.categoria,
      custoUnitario: produto.custoUnitario,
      unidadeDeMedida: produto.unidadeDeMedida
    });
    setIsModalAberto(true);
  };

  // --- FUNÇÃO: SALVAR (CADASTRAR OU EDITAR) NO BACK-END ---
  const handleSalvarProduto = async (e) => {
    e.preventDefault(); 
    
    const metodo = modoModal === 'cadastrar' ? 'POST' : 'PUT';
    const urlFinal = modoModal === 'cadastrar' ? API_URL : `${API_URL}/${formProduto.id}`;

    try {
      const resposta = await fetch(urlFinal, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formProduto.nome,
          categoria: formProduto.categoria,
          custoUnitario: parseFloat(formProduto.custoUnitario), 
          unidadeDeMedida: formProduto.unidadeDeMedida 
        })
      });

      if (!resposta.ok) throw new Error('Não foi possível salvar o produto.');
      
      setIsModalAberto(false);
      buscarProdutos(); 
    } catch (err) {
      alert(err.message);
    }
  };

  // --- FUNÇÃO: EXCLUIR PRODUTO DO BACK-END ---
  const handleExcluirProduto = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir o produto "${nome}"?`)) {
      try {
        const resposta = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!resposta.ok) throw new Error('Não foi possível excluir o produto.');
        
        buscarProdutos(); 
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // --- FILTRAGEM EM TEMPO REAL NO FRONT-END ---
  const produtosFiltrados = produtos.filter(prod => {
    const bateBusca = prod.nome?.toLowerCase().includes(termoBusca.toLowerCase());
    const bateCategoria = categoriaFiltro === 'TODAS' || prod.categoria === categoriaFiltro;
    return bateBusca && bateCategoria;
  });

  return (
    <div className="produtos-container">
      
      {/* Cabeçalho */}
      <header className="produtos-header">
        <h1 className="produtos-title">Produtos</h1>
        <p className="produtos-subtitle">Gerencie o cadastro de produtos integrados ao banco de dados</p>
      </header>

      {/* Barra de Ferramentas */}
      <div className="produtos-toolbar">
        <div className="produtos-filter-group">
          <input 
            type="text" 
            placeholder="Buscar produto pelo nome..." 
            className="produtos-input"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
          />
          <select 
            className="produtos-select"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
          >
            <option value="TODAS">Todas as categorias</option>
            <option value="ALIMENTO">Alimento</option>
            <option value="LIMPEZA">Limpeza</option>
            <option value="ELETRONICO">Eletrônico</option>
            <option value="HIGIENE">Higiene</option>
            <option value="ESCRITORIO">Escritório</option>
            <option value="OUTROS">Outros</option>
          </select>
        </div>

        <button className="produtos-btn-principal" onClick={abrirModalCadastro}>
          + Adicionar Produto
        </button>
      </div>

      {/* Tabela de Exibição */}
      <div className="produtos-table-container">
        <table className="produtos-table">
          <thead>
            <tr className="produtos-thead-row">
              <th className="produtos-th">Nome do Produto</th>
              <th className="produtos-th">Categoria</th>
              <th className="produtos-th">Custo Unitário</th>
              <th className="produtos-th">Medida</th>
              <th className="produtos-th text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr><td colSpan="5" className="produtos-empty-cell">Carregando produtos...</td></tr>
            )}

            {erro && (
              <tr><td colSpan="5" className="produtos-empty-cell" style={{color: 'red'}}>{erro}</td></tr>
            )}

            {!carregando && !erro && produtosFiltrados.length === 0 && (
              <tr><td colSpan="5" className="produtos-empty-cell">Nenhum produto encontrado.</td></tr>
            )}

            {!carregando && !erro && produtosFiltrados.map((produto) => {
              const badge = getEstiloBadge(produto.categoria);
              return (
                <tr key={produto.id} className="produtos-tr-row">
                  <td className="produtos-td"><strong>{produto.nome}</strong></td>
                  
                  <td className="produtos-td">
                    {/* Mantido o style inline APENAS para as cores dinâmicas do Enum */}
                    <span 
                      className="produtos-badge-categoria" 
                      style={{ backgroundColor: badge.bg, color: badge.texto }}
                    >
                      {badge.label}
                    </span>
                  </td>

                  <td className="produtos-td">R$ {produto.custoUnitario?.toFixed(2)}</td>
                  <td className="produtos-td">{produto.unidadeDeMedida}</td>
                  
                  <td className="produtos-td text-right">
                    <button className="produtos-btn-editar" onClick={() => abrirModalEdicao(produto)}>Editar</button>
                    <button className="produtos-btn-excluir" onClick={() => handleExcluirProduto(produto.id, produto.nome)}>Excluir</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      {isModalAberto && (
        <div className="produtos-modal-overlay">
          <div className="produtos-modal-content">
            <h2 className="produtos-modal-title">
              {modoModal === 'cadastrar' ? 'Cadastrar Novo Produto' : 'Editar Produto'}
            </h2>
            
            <form onSubmit={handleSalvarProduto} className="produtos-form">
              <div className="produtos-form-group">
                <label className="produtos-label">Nome do Produto</label>
                <input 
                  required 
                  className="produtos-input" 
                  value={formProduto.nome} 
                  onChange={e => setFormProduto({...formProduto, nome: e.target.value})} 
                />
              </div>

              <div className="produtos-form-group">
                <label className="produtos-label">Categoria</label>
                <select 
                  className="produtos-select" 
                  value={formProduto.categoria} 
                  onChange={e => setFormProduto({...formProduto, categoria: e.target.value})}
                >
                  <option value="ALIMENTO">Alimento</option>
                  <option value="LIMPEZA">Limpeza</option>
                  <option value="ELETRONICO">Eletrônico</option>
                  <option value="HIGIENE">Higiene</option>
                  <option value="ESCRITORIO">Escritório</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>

              <div className="produtos-form-group-row">
                <div className="produtos-form-group">
                  <label className="produtos-label">Custo Unitário (R$)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    className="produtos-input" 
                    value={formProduto.custoUnitario} 
                    onChange={e => setFormProduto({...formProduto, custoUnitario: e.target.value})} 
                  />
                </div>
                <div className="produtos-form-group">
                  <label className="produtos-label">Unidade (ex: kg, un, L)</label>
                  <input 
                    required 
                    className="produtos-input" 
                    value={formProduto.unidadeDeMedida} 
                    onChange={e => setFormProduto({...formProduto, unidadeDeMedida: e.target.value})} 
                  />
                </div>
              </div>

              <div className="produtos-modal-footer">
                <button type="button" className="produtos-btn-cancelar" onClick={() => setIsModalAberto(false)}>Cancelar</button>
                <button type="submit" className="produtos-btn-principal">Salvar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}