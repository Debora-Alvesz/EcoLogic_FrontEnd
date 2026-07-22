import { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../../../shared/services/api';

const anoMesAtual = () => {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
};

const calcularConsumoMes = (consumos, setorId) => {
  const prefixo = anoMesAtual();
  return consumos.reduce((acc, consumo) => {
    if (consumo.setorId === setorId && (consumo.dataRetirada || '').startsWith(prefixo)) {
      acc[consumo.produtoId] = (acc[consumo.produtoId] || 0) + consumo.quantidade;
    }
    return acc;
  }, {});
};

const calcularTendencia = (consumos, produtoId, setorId) => {
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  const mesAtual = hoje.getMonth() + 1;
  const mesAnt = mesAtual === 1 ? 12 : mesAtual - 1;
  const anoAnt = mesAtual === 1 ? anoAtual - 1 : anoAtual;

  const prefixoAtual = `${anoAtual}-${String(mesAtual).padStart(2, '0')}`;
  const prefixoAnt = `${anoAnt}-${String(mesAnt).padStart(2, '0')}`;

  let totalAtual = 0;
  let totalAnterior = 0;

  consumos.forEach((c) => {
    if (c.produtoId !== produtoId || c.setorId !== setorId) return;
    if (c.dataRetirada?.startsWith(prefixoAtual)) totalAtual += c.quantidade;
    if (c.dataRetirada?.startsWith(prefixoAnt)) totalAnterior += c.quantidade;
  });

  if (totalAnterior === 0) return { texto: 'novo', status: 'estavel' };

  const variacao = ((totalAtual - totalAnterior) / totalAnterior) * 100;
  const texto = `${variacao > 0 ? '+' : ''}${Math.round(variacao)}%`;

  if (variacao > 5) return { texto, status: 'alta' };
  if (variacao < -5) return { texto, status: 'baixa' };
  return { texto: `${Math.round(variacao)}%`, status: 'estavel' };
};

export function useSetorModal(setor) {
  const [produtos, setProdutos] = useState([]);
  const [consumos, setConsumos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState('');
  
  const [quantidades, setQuantidades] = useState({});
  const [justificativas, setJustificativas] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [enviando, setEnviando] = useState({});

  useEffect(() => {
    if (!setor?.id) return;

    let cancelado = false;
    setLoading(true);
    setErro(null);
    setBusca('');
    setQuantidades({});
    setJustificativas({});
    setFeedbacks({});
    setEnviando({});

    const carregarDados = async () => {
      try {
        const [resProdutos, resConsumos] = await Promise.all([
          api.get('/produtos'),
          api.get('/consumos'),
        ]);

        if (!cancelado) {
          setProdutos(resProdutos.data);
          setConsumos(resConsumos.data);
        }
      } catch (err) {
        if (!cancelado) {
          setErro('Erro ao carregar dados. Verifique a conexão com o servidor.');
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    carregarDados();
    return () => { cancelado = true; };
  }, [setor?.id]);

  const consumoMesPorProduto = useMemo(
    () => calcularConsumoMes(consumos, setor?.id),
    [consumos, setor?.id]
  );

  const produtosEnriquecidos = useMemo(() => {
    return produtos.map((p) => {
      const consumidoMes = consumoMesPorProduto[p.id] ?? 0;
      const tendencia = calcularTendencia(consumos, p.id, setor?.id);

      return {
        ...p,
        consumidoMes,
        metaMes: Math.max(consumidoMes + 10, 20),
        tendencia: tendencia.texto,
        status: tendencia.status,
        unidade: p.unidadeDeMedida || 'un',
      };
    });
  }, [produtos, consumoMesPorProduto, consumos, setor?.id]);

  const maisConsumido = useMemo(() => {
    if (!produtosEnriquecidos.length) return null;
    return produtosEnriquecidos.reduce((prev, curr) =>
      curr.consumidoMes > prev.consumidoMes ? curr : prev
    );
  }, [produtosEnriquecidos]);

  const produtosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return produtosEnriquecidos;
    return produtosEnriquecidos.filter((p) => p.nome.toLowerCase().includes(termo));
  }, [produtosEnriquecidos, busca]);

  const handleQuantidadeChange = useCallback((produtoId, valor) => {
    setQuantidades((prev) => ({ ...prev, [produtoId]: valor }));
  }, []);

  const handleJustificativaChange = useCallback((produtoId, valor) => {
    setJustificativas((prev) => ({ ...prev, [produtoId]: valor }));
  }, []);

  const exibirFeedback = useCallback((produtoId, tipo, msg) => {
    setFeedbacks((prev) => ({ ...prev, [produtoId]: { tipo, msg } }));
    setTimeout(() => {
      setFeedbacks((prev) => {
        const copia = { ...prev };
        delete copia[produtoId];
        return copia;
      });
    }, 4000);
  }, []);

  const handleRegistrarConsumo = useCallback(
    async (produtoId) => {
      const quantidade = Number(quantidades[produtoId]);
      const justificativa = (justificativas[produtoId] || '').trim();
      const produto = produtosEnriquecidos.find((p) => p.id === produtoId);

      if (!produto) return;
      if (!quantidade || quantidade < 1) return exibirFeedback(produtoId, 'erro', '⚠️ Informe uma quantidade válida.');
      if (!justificativa) return exibirFeedback(produtoId, 'erro', '⚠️ A justificativa é obrigatória.');
      if (!setor?.id) return exibirFeedback(produtoId, 'erro', '⚠️ Setor não identificado.');

      setEnviando((prev) => ({ ...prev, [produtoId]: true }));

      try {
        const response = await api.post('/consumos', {
          quantidade,
          justificativa,
          produtoId,
          setorId: setor.id,
        });
        
        const dados = response.data;

        setConsumos((prev) => [...prev, dados]);
        
        // Desconta do estoque localmente
        setProdutos((prev) => prev.map((p) => 
          p.id === produtoId ? { ...p, quantidade: p.quantidade - quantidade } : p
        ));

        setQuantidades((prev) => ({ ...prev, [produtoId]: '' }));
        setJustificativas((prev) => ({ ...prev, [produtoId]: '' }));
        exibirFeedback(produtoId, 'sucesso', `✅ ${dados.quantidade} ${produto.unidade} de "${produto.nome}" registradas!`);
        
      } catch (err) {
        const body = err.response?.data;
        const mensagem = body?.mensagem || body?.message || 'Erro ao registrar consumo.';
        const erros = Array.isArray(body?.erros) ? body.erros.join(' | ') : '';
        exibirFeedback(produtoId, 'erro', `❌ ${erros ? `${mensagem}: ${erros}` : mensagem}`);
      } finally {
        setEnviando((prev) => ({ ...prev, [produtoId]: false }));
      }
    },
    [produtosEnriquecidos, quantidades, justificativas, setor, exibirFeedback]
  );

  return {
    produtos: produtosEnriquecidos,
    loading,
    erro,
    busca,
    setBusca,
    quantidades,
    justificativas,
    feedbacks,
    enviando,
    maisConsumido,
    produtosFiltrados,
    handleQuantidadeChange,
    handleJustificativaChange,
    handleRegistrarConsumo,
  };
}