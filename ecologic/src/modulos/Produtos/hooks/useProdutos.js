import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../shared/services/api';

// Hook para gerenciar produtos (GET, POST, PUT, DELETE)
export function useProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const [isModalAberto, setIsModalAberto] = useState(false);
  const [modoModal, setModoModal] = useState('cadastrar');
  const [formProduto, setFormProduto] = useState({
    id: null,
    nome: '',
    categoria: 'ALIMENTO',
    quantidade: 0,
    custoUnitario: '',
  });

  const fetchProdutos = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const resp = await api.get('/produtos');
      setProdutos(resp.data || []);
    } catch (err) {
      console.error('[useProdutos] Erro ao buscar produtos', err);
      setErro(err.response?.data?.mensagem || err.message || 'Erro ao buscar produtos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProdutos(); }, [fetchProdutos]);

  const abrirModalCadastro = () => {
    setModoModal('cadastrar');
    setFormProduto({ id: null, nome: '', categoria: 'ALIMENTO', quantidade: 0, custoUnitario: '' });
    setIsModalAberto(true);
  };

  const abrirModalEdicao = (produto) => {
    setModoModal('editar');
    setFormProduto({
      id: produto.id,
      nome: produto.nome,
      categoria: produto.categoria,
      quantidade: produto.quantidade ?? 0,
      custoUnitario: produto.custoUnitario?.toString() ?? '',
    });
    setIsModalAberto(true);
  };

  const fecharModal = () => {
    setIsModalAberto(false);
  };

  const validarProduto = (p) => {
    if (!p.nome || !p.nome.trim()) return 'Nome é obrigatório.';
    if (!p.categoria || !p.categoria.trim()) return 'Categoria é obrigatória.';
    const custo = parseFloat(String(p.custoUnitario).replace(',', '.'));
    if (Number.isNaN(custo) || custo <= 0) return 'Custo unitário deve ser número maior que 0.';
    const qtd = parseInt(String(p.quantidade), 10);
    if (Number.isNaN(qtd) || qtd < 0) return 'Quantidade deve ser número inteiro >= 0.';
    return null;
  };

  const handleSalvarProduto = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const errMsg = validarProduto(formProduto);
    if (errMsg) {
      setErro(errMsg);
      return;
    }

    const payload = {
      nome: formProduto.nome.trim(),
      categoria: formProduto.categoria,
      custoUnitario: parseFloat(String(formProduto.custoUnitario).replace(',', '.')),
      quantidade: parseInt(String(formProduto.quantidade), 10),
    };

    try {
      setLoading(true);
      setErro(null);

      if (modoModal === 'cadastrar') {
        const resp = await api.post('/produtos', payload, { headers: { 'Content-Type': 'application/json' } });
        setProdutos((prev) => [resp.data, ...prev]);
      } else {
        const resp = await api.put(`/produtos/${formProduto.id}`, payload, { headers: { 'Content-Type': 'application/json' } });
        setProdutos((prev) => prev.map((p) => (p.id === resp.data.id ? resp.data : p)));
      }

      setIsModalAberto(false);
    } catch (err) {
      const status = err.response?.status;
      const body = err.response?.data || {};
      const mensagem = body.mensagem || body.message || err.message || 'Erro ao salvar produto.';
      if (status === 400) setErro(mensagem);
      else if (status === 409) setErro(mensagem);
      else setErro('Erro no servidor. Tente novamente.');
      console.error('[useProdutos] erro salvar', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirProduto = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      setLoading(true);
      await api.delete(`/produtos/${id}`);
      setProdutos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('[useProdutos] erro excluir', err);
      setErro(err.response?.data?.mensagem || 'Erro ao excluir produto.');
    } finally {
      setLoading(false);
    }
  };

  return {
    produtos,
    loading,
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
    fetchProdutos,
  };
}
