import React, { useMemo, useState, useEffect } from 'react';
import { Plus, Loader2, Edit2, Trash2, PackagePlus } from 'lucide-react';
import api from '../../../shared/services/api'; // Sua instância do Axios configurada
import '../styles/produto.css'; // Mantenha seus estilos ou os do exemplo

// Paleta de cores para os dots das categorias
const CORES = ['#12b886', '#4c9eff', '#f0616a', '#f5a623', '#a78bfa', '#38bdf8'];

// Formata um valor numérico para Moeda (R$)
const fmtMoeda = (v) => 
  (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function ProdutosPage() {
  // --- ESTADOS DE DADOS ---
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // --- ESTADOS DE FILTRO ---
  const [filtroCategoriaId, setFiltroCategoriaId] = useState(null);
  const [busca, setBusca] = useState('');

  // --- ESTADOS DOS MODAIS ---
  const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);

  const [modalCategoriaAberto, setModalCategoriaAberto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState(null);

  const [modalEstoqueAberto, setModalEstoqueAberto] = useState(false);
  const [produtoEstoque, setProdutoEstoque] = useState(null);

  // --- CARREGAMENTO INICIAL ---
  const carregarDadosDoSistema = async () => {
    setCarregando(true);
    try {
      const [resProdutos, resCategorias] = await Promise.all([
        api.get('/produtos'),
        api.get('/categorias')
      ]);
      setProdutos(resProdutos.data);
      setCategorias(resCategorias.data);
    } catch (error) {
      console.error("Erro ao carregar dados do Eco Logic:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDadosDoSistema();
  }, []);

  // Atribui uma cor fixa/calculada para cada categoria
  const corPorCategoriaId = useMemo(() => {
    const mapa = {};
    categorias.forEach((cat, index) => {
      mapa[cat.id] = CORES[index % CORES.length];
    });
    return mapa;
  }, [categorias]);

  // --- FILTRAGEM DE PRODUTOS ---
  const produtosFiltrados = useMemo(() => {
    return produtos
      .filter((p) => (filtroCategoriaId ? p.categoriaId === filtroCategoriaId : true))
      .filter((p) => p.nome?.toLowerCase().includes(busca.toLowerCase()));
  }, [produtos, filtroCategoriaId, busca]);

  // --- CÁLCULO DOS CARDS RESUMO ---
  const totais = useMemo(() => {
    const totalTipos = produtos.length;
    const totalItens = produtos.reduce((acc, p) => acc + (p.quantidade || 0), 0);
    const valorTotal = produtos.reduce((acc, p) => acc + ((p.custoUnitario || 0) * (p.quantidade || 0)), 0);
    return { totalTipos, totalItens, valorTotal };
  }, [produtos]);

  // --- AÇÕES DE PRODUTO ---
  const abrirModalProduto = (p = null) => {
    setProdutoEditando(p);
    setModalProdutoAberto(true);
  };

  const salvarProduto = async (payload) => {
    try {
      if (produtoEditando) {
        await api.put(`/produtos/${produtoEditando.id}`, payload);
      } else {
        await api.post('/produtos', payload);
      }
      carregarDadosDoSistema();
      setModalProdutoAberto(false);
    } catch (error) {
      alert(error.response?.data?.message || "Erro ao salvar produto.");
    }
  };

  const excluirProduto = async (id) => {
    if (!window.confirm("Deseja realmente excluir este produto?")) return;
    try {
      await api.delete(`/produtos/${id}`);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      alert("Erro ao excluir o produto.");
    }
  };

  // --- AÇÕES DE ESTOQUE ---
  const abrirModalEstoque = (p) => {
    setProdutoEstoque(p);
    setModalEstoqueAberto(true);
  };

  const adicionarEstoque = async (qtdAdicionar) => {
    try {
      const novaQtd = (produtoEstoque.quantidade || 0) + Number(qtdAdicionar);
      await api.put(`/produtos/${produtoEstoque.id}`, {
        nome: produtoEstoque.nome,
        custoUnitario: produtoEstoque.custoUnitario,
        quantidade: novaQtd,
        categoriaId: produtoEstoque.categoriaId
      });
      carregarDadosDoSistema();
      setModalEstoqueAberto(false);
    } catch (error) {
      alert("Erro ao atualizar estoque.");
    }
  };

  // --- AÇÕES DE CATEGORIA ---
  const abrirModalCategoria = (c = null) => {
    setCategoriaEditando(c);
    setModalCategoriaAberto(true);
  };

  const salvarCategoria = async (dados) => {
    try {
      if (categoriaEditando) {
        await api.put(`/categorias/${categoriaEditando.id}`, dados);
      } else {
        await api.post('/categorias', dados);
      }
      carregarDadosDoSistema();
      setModalCategoriaAberto(false);
    } catch (error) {
      alert(error.response?.data?.message || "Erro ao salvar categoria.");
    }
  };

  const excluirCategoria = async (id) => {
    if (!window.confirm("Deseja excluir esta categoria?")) return;
    try {
      await api.delete(`/categorias/${id}`);
      setCategorias((prev) => prev.filter((c) => c.id !== id));
      if (filtroCategoriaId === id) setFiltroCategoriaId(null);
    } catch (error) {
      alert(error.response?.data || "Não é possível remover categorias vinculadas a produtos.");
    }
  };

  // --- LOADING ---
  if (carregando) {
    return (
      <div className="loading-state" style={{ display: 'flex', height: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={32} style={{ color: 'var(--primary, #12b886)', marginBottom: 12 }} />
        <span style={{ fontSize: 14, color: '#666' }}>Carregando Eco Logic...</span>
      </div>
    );
  }

  return (
    <div className="wrap">
      {/* CABEÇALHO */}
      <header className="top">
        <div>
          <h1>Produtos</h1>
          <p>Gerencie seu inventário e organize por categorias.</p>
        </div>
        <button className="btn-primary" onClick={() => abrirModalProduto(null)}>
          <Plus size={16} strokeWidth={2.5} /> Novo Produto
        </button>
      </header>

      {/* CARDS RESUMO */}
      <section className="summary">
        <div className="summary-card">
          <div className="row">
            <span className="label">Tipos de Produtos</span>
            <span className="icon-badge">📦</span>
          </div>
          <p className="value figure">{totais.totalTipos}</p>
        </div>
        <div className="summary-card">
          <div className="row">
            <span className="label">Total em Estoque</span>
            <span className="icon-badge">📊</span>
          </div>
          <p className="value figure">{totais.totalItens} un</p>
        </div>
        <div className="summary-card">
          <div className="row">
            <span className="label">Valor Total Estimado</span>
            <span className="icon-badge">💰</span>
          </div>
          <p className="value figure" style={{ color: '#12b886' }}>{fmtMoeda(totais.valorTotal)}</p>
        </div>
      </section>

      {/* GRID PRINCIPAL */}
      <div className="layout">
        {/* ASIDE: CATEGORIAS */}
        <aside>
          <div className="row">
            <h2>▤ Categorias</h2>
            <button className="icon-btn" onClick={() => abrirModalCategoria(null)} aria-label="Nova categoria">＋</button>
          </div>

          <div id="catList">
            <div 
              className={`cat-item ${filtroCategoriaId === null ? 'active' : ''}`}
              onClick={() => setFiltroCategoriaId(null)}
            >
              <span className="left">
                <span className="dot" style={{ background: '#888' }}></span>
                <span className="name">Todas</span>
              </span>
            </div>

            {categorias.map((cat) => (
              <div 
                key={cat.id} 
                className={`cat-item ${filtroCategoriaId === cat.id ? 'active' : ''}`}
              >
                <span className="left" onClick={() => setFiltroCategoriaId(cat.id)}>
                  <span className="dot" style={{ background: corPorCategoriaId[cat.id] || '#12b886' }}></span>
                  <span className="name">{cat.nome}</span>
                </span>
                <span className="actions">
                  <button title="Editar" onClick={(e) => { e.stopPropagation(); abrirModalCategoria(cat); }}>✎</button>
                  <button title="Excluir" className="del" onClick={(e) => { e.stopPropagation(); excluirCategoria(cat.id); }}>🗑</button>
                </span>
              </div>
            ))}
          </div>
        </aside>

        {/* TABELA DE PRODUTOS */}
        <section className="panel">
          <div className="panel-head">
            <h2 className="heading" style={{ fontSize: '14px' }}>Lista de Produtos</h2>
            <div className="search">
              <span>🔍</span>
              <input 
                value={busca} 
                onChange={(e) => setBusca(e.target.value)} 
                placeholder="Buscar por produto..." 
              />
            </div>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Nome do Produto</th>
                  <th>Categoria</th>
                  <th className="right">Custo Unitário</th>
                  <th className="right">Estoque</th>
                  <th className="right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.nome}</td>
                    <td>
                      <span className="badge">
                        <span className="dot" style={{ background: corPorCategoriaId[p.categoriaId] || '#12b886' }}></span>
                        {p.categoriaNome || 'Sem Categoria'}
                      </span>
                    </td>
                    <td className="right figure">{fmtMoeda(p.custoUnitario)}</td>
                    <td className="right figure" style={{ fontWeight: 600 }}>{p.quantidade ?? 0}</td>
                    <td className="right">
                      <span className="row-actions">
                        <button title="+ Estoque" onClick={() => abrirModalEstoque(p)}>➕</button>
                        <button title="Editar" onClick={() => abrirModalProduto(p)}>✎</button>
                        <button title="Excluir" className="del" onClick={() => excluirProduto(p.id)}>🗑</button>
                      </span>
                    </td>
                  </tr>
                ))}

                {produtosFiltrados.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty">Nenhum produto encontrado neste filtro.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* MODAL PRODUTO */}
      {modalProdutoAberto && (
        <ProdutoModal 
          produto={produtoEditando}
          categorias={categorias}
          onFechar={() => setModalProdutoAberto(false)}
          onSalvar={salvarProduto}
        />
      )}

      {/* MODAL CATEGORIA */}
      {modalCategoriaAberto && (
        <CategoriaModal 
          categoria={categoriaEditando}
          onFechar={() => setModalCategoriaAberto(false)}
          onSalvar={salvarCategoria}
        />
      )}

      {/* MODAL ESTOQUE */}
      {modalEstoqueAberto && produtoEstoque && (
        <EstoqueModal 
          produto={produtoEstoque}
          onFechar={() => setModalEstoqueAberto(false)}
          onSalvar={adicionarEstoque}
        />
      )}
    </div>
  );
}

/* ==========================================================================
   MODAL: PRODUTO (CADASTRAR / EDITAR)
   ========================================================================== */
function ProdutoModal({ produto, categorias, onFechar, onSalvar }) {
  const [nome, setNome] = useState(produto?.nome ?? '');
  const [custoUnitario, setCustoUnitario] = useState(produto?.custoUnitario ?? '');
  const [quantidade, setQuantidade] = useState(produto?.quantidade ?? '');
  const [categoriaId, setCategoriaId] = useState(produto?.categoriaId ?? (categorias[0]?.id || ''));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nome.trim() || !categoriaId) return;

    onSalvar({
      nome: nome.trim(),
      custoUnitario: parseFloat(custoUnitario),
      quantidade: parseInt(quantidade) || 0,
      categoriaId
    });
  };

  return (
    <div className="overlay open" onClick={onFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{produto ? 'Editar Produto' : 'Novo Produto'}</h3>
          <button type="button" onClick={onFechar}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nome do Produto</label>
            <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Caderno Reciclado" required autoFocus />
          </div>

          <div className="field">
            <label>Categoria</label>
            <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} required>
              <option value="" disabled>Selecione uma categoria...</option>
              {categorias.map(c => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Custo Unitário (R$)</label>
              <input type="number" step="0.01" min="0" value={custoUnitario} onChange={e => setCustoUnitario(e.target.value)} placeholder="0,00" required />
            </div>
            <div className="field">
              <label>Quantidade Inicial</label>
              <input type="number" min="0" step="1" value={quantidade} onChange={e => setQuantidade(e.target.value)} placeholder="0" required />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onFechar}>Cancelar</button>
            <button type="submit" className="btn-primary">Salvar Produto</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ==========================================================================
   MODAL: CATEGORIA
   ========================================================================== */
function CategoriaModal({ categoria, onFechar, onSalvar }) {
  const [nome, setNome] = useState(categoria?.nome ?? '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nome.trim()) return;
    onSalvar({ nome: nome.trim() });
  };

  return (
    <div className="overlay open" onClick={onFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{categoria ? 'Editar Categoria' : 'Nova Categoria'}</h3>
          <button type="button" onClick={onFechar}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Nome da Categoria</label>
            <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Embalagens, Papelaria..." required autoFocus />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onFechar}>Cancelar</button>
            <button type="submit" className="btn-primary">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ==========================================================================
   MODAL: ADICIONAR ESTOQUE
   ========================================================================== */
function EstoqueModal({ produto, onFechar, onSalvar }) {
  const [qtd, setQtd] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!qtd || parseInt(qtd) <= 0) return;
    onSalvar(parseInt(qtd));
  };

  return (
    <div className="overlay open" onClick={onFechar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Adicionar Estoque</h3>
          <button type="button" onClick={onFechar}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <p style={{ fontSize: '14px', marginBottom: '12px' }}>
            Produto: <strong>{produto.nome}</strong> | Estoque atual: <strong>{produto.quantidade ?? 0}</strong>
          </p>
          <div className="field">
            <label>Quantidade a adicionar</label>
            <input type="number" min="1" step="1" value={qtd} onChange={e => setQtd(e.target.value)} placeholder="Ex: 10" required autoFocus />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onFechar}>Cancelar</button>
            <button type="submit" className="btn-primary">Confirmar</button>
          </div>
        </form>
      </div>
    </div>
  );
}