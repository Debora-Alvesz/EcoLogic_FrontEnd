import React from 'react';
import '../styles/produto.css'; // 1. Importa o arquivo de estilos CSS externo
import { useProdutos } from '../hooks/useProdutos';

export default function Produtos() {
  // --- ESTADOS DA APLICAÇÃO ---
  const {
    produtos,
    loading: carregando,
    erro,
    isModalAberto,
    modoModal,
    formProduto,
    setFormProduto,
    abrirModalCadastro,
    abrirModalEdicao,
    fecharModal,
    handleSalvarProduto,
    handleExcluirProduto,
    isModalAdicionarAberto,
    produtoSelecionado,
    quantidadeAdicionar,
    setQuantidadeAdicionar,
    abrirModalAdicionarQuantidade,
    fecharModalAdicionarQuantidade,
    handleAdicionarQuantidade,
  } = useProdutos();
  const [termoBusca, setTermoBusca] = React.useState('');
  const [categoriaFiltro, setCategoriaFiltro] = React.useState('TODAS');

  // O hook `useProdutos` já carrega a lista ao montar

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
  // salvar / editar é feito pelo hook `handleSalvarProduto`

  // --- FUNÇÃO: EXCLUIR PRODUTO DO BACK-END ---
  // exclusão feita por hook

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
              <th className="produtos-th">Quantidade</th>
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
                  <td className="produtos-td">{produto.quantidade ?? 0}</td>
                  
                  <td className="produtos-td text-right">
                    <button className="produtos-btn-editar" onClick={() => abrirModalEdicao(produto)}>Editar</button>
                    <button className="produtos-btn-adicionar" onClick={() => abrirModalAdicionarQuantidade(produto)}>+ Estoque</button>
                    <button className="produtos-btn-excluir" onClick={() => handleExcluirProduto(produto.id)}>Excluir</button>
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
                  <label className="produtos-label">Quantidade inicial</label>
                  <input 
                    required 
                    type="number"
                    min="0"
                    step="1"
                    className="produtos-input" 
                    value={formProduto.quantidade} 
                    onChange={e => setFormProduto({...formProduto, quantidade: e.target.value})} 
                  />
                </div>
              </div>

              <div className="produtos-modal-footer">
                <button type="button" className="produtos-btn-cancelar" onClick={() => fecharModal()}>Cancelar</button>
                <button type="submit" className="produtos-btn-principal">Salvar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PARA ADICIONAR ESTOQUE */}
      {isModalAdicionarAberto && produtoSelecionado && (
        <div className="produtos-modal-overlay">
          <div className="produtos-modal-content">
            <h2 className="produtos-modal-title">
              Adicionar Estoque - {produtoSelecionado.nome}
            </h2>
            
            <div className="produtos-info-estoque">
              <p><strong>Quantidade atual:</strong> {produtoSelecionado.quantidade ?? 0}</p>
            </div>

            <form onSubmit={handleAdicionarQuantidade} className="produtos-form">
              <div className="produtos-form-group">
                <label className="produtos-label">Quantidade a Adicionar</label>
                <input 
                  type="number"
                  min="1"
                  step="1"
                  required 
                  className="produtos-input" 
                  value={quantidadeAdicionar}
                  onChange={e => setQuantidadeAdicionar(e.target.value)} 
                  autoFocus
                />
              </div>

              <div className="produtos-form-group">
                <p><strong>Nova quantidade:</strong> {(produtoSelecionado.quantidade ?? 0) + (parseInt(quantidadeAdicionar) || 0)}</p>
              </div>

              <div className="produtos-modal-footer">
                <button type="button" className="produtos-btn-cancelar" onClick={() => fecharModalAdicionarQuantidade()}>Cancelar</button>
                <button type="submit" className="produtos-btn-principal">Confirmar Adição</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}