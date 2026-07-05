import { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../../../shared/services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Mapeamento de categoria → ícone emoji (os produtos da API não têm ícone)
// ─────────────────────────────────────────────────────────────────────────────
const ICONE_POR_CATEGORIA = {
  ALIMENTO:   '🍽️',
  LIMPEZA:    '🧴',
  ELETRONICO: '💻',
  HIGIENE:    '🪥',
  ESCRITORIO: '📦',
  OUTROS:     '🗂️',
};

const iconeParaCategoria = (categoria) =>
  ICONE_POR_CATEGORIA[(categoria || '').toUpperCase()] ?? '📦';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de data: calcula consumo do mês atual a partir da lista de consumos
// ─────────────────────────────────────────────────────────────────────────────
const anoMesAtual = () => {
  const hoje = new Date();
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Soma as quantidades consumidas no mês corrente para cada produto,
 * filtrando pelo setorId recebido.
 *
 * @param {Array}  consumos  - lista de consumos da API (GET /consumos)
 * @param {number} setorId   - id do setor selecionado
 * @returns {Object}         - ex: { "uuid-produto": 12, ... }
 */
const calcularConsumoMes = (consumos, setorId) => {
  const prefixo = anoMesAtual(); // "2026-07"

  return consumos.reduce((acc, consumo) => {
    const pertenceAoSetor = consumo.setorId === setorId;
    const nesteMes = (consumo.dataRetirada || '').startsWith(prefixo);

    if (pertenceAoSetor && nesteMes) {
      acc[consumo.produtoId] = (acc[consumo.produtoId] || 0) + consumo.quantidade;
    }
    return acc;
  }, {});
};

/**
 * Calcula tendência comparando mês atual com o mês anterior.
 * Retorna objeto { texto: "+15%", status: "alta" | "baixa" | "estavel" }
 */
const calcularTendencia = (consumos, produtoId, setorId) => {
  const hoje      = new Date();
  const anoAtual  = hoje.getFullYear();
  const mesAtual  = hoje.getMonth() + 1; // 1-12
  const mesAnt    = mesAtual === 1 ? 12 : mesAtual - 1;
  const anoAnt    = mesAtual === 1 ? anoAtual - 1 : anoAtual;

  const prefixoAtual = `${anoAtual}-${String(mesAtual).padStart(2, '0')}`;
  const prefixoAnt   = `${anoAnt}-${String(mesAnt).padStart(2, '0')}`;

  let totalAtual = 0;
  let totalAnterior = 0;

  consumos.forEach((c) => {
    if (c.produtoId !== produtoId || c.setorId !== setorId) return;
    if (c.dataRetirada?.startsWith(prefixoAtual)) totalAtual   += c.quantidade;
    if (c.dataRetirada?.startsWith(prefixoAnt))  totalAnterior += c.quantidade;
  });

  if (totalAnterior === 0) return { texto: 'novo', status: 'estavel' };

  const variacao = ((totalAtual - totalAnterior) / totalAnterior) * 100;
  const sinal    = variacao > 0 ? '+' : '';
  const texto    = `${sinal}${Math.round(variacao)}%`;

  if (variacao > 5)  return { texto, status: 'alta' };
  if (variacao < -5) return { texto, status: 'baixa' };
  return { texto: `${Math.round(variacao)}%`, status: 'estavel' };
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook principal
// Parâmetros:
//   setor {Object | null} — objeto completo do setor: { id: number, nome: string }
// ─────────────────────────────────────────────────────────────────────────────
export function useSetorModal(setor) {
  const [produtos,  setProdutos]  = useState([]);
  const [consumos,  setConsumos]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [erro,      setErro]      = useState(null);
  const [busca,     setBusca]     = useState('');
  const [quantidades,  setQuantidades]  = useState({});   // { produtoId: string }
  const [justificativas, setJustificativas] = useState({}); // { produtoId: string }
  const [feedbacks,    setFeedbacks]    = useState({});   // { produtoId: { tipo, msg } }
  const [enviando,     setEnviando]     = useState({});   // { produtoId: boolean }

  // ── 1. Carrega produtos + consumos ao abrir modal ────────────────────────
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
        // Executa as duas chamadas em paralelo para ganhar performance
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
          const msg =
            err.response?.data?.mensagem ||
            err.response?.data?.message ||
            'Erro ao carregar dados. Verifique a conexão com o servidor.';
          setErro(msg);
          console.error('[useSetorModal] Erro ao carregar dados:', err);
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    carregarDados();

    // Cleanup: evita atualizar estado em componente desmontado
    return () => { cancelado = true; };
  }, [setor?.id]);

  // ── 2. Consumo mensal por produto (calculado a partir dos consumos reais) ─
  const consumoMesPorProduto = useMemo(
    () => calcularConsumoMes(consumos, setor?.id),
    [consumos, setor?.id]
  );

  // ── 3. Produtos enriquecidos com dados calculados de consumo ─────────────
  const produtosEnriquecidos = useMemo(() => {
    return produtos.map((p) => {
      const consumidoMes = consumoMesPorProduto[p.id] ?? 0;
      const tendencia    = calcularTendencia(consumos, p.id, setor?.id);

      return {
        ...p,
        icone:        iconeParaCategoria(p.categoria),
        consumidoMes,
        // Meta mensal: estimativa simples baseada no histórico (120% do mês ant.)
        // Pode ser substituída por um endpoint real de metas quando existir
        metaMes:      Math.max(consumidoMes + 10, 20),
        tendencia:    tendencia.texto,
        status:       tendencia.status,
        unidade:      p.unidadeDeMedida || 'un',
      };
    });
  }, [produtos, consumoMesPorProduto, consumos, setor?.id]);

  // ── 4. Item mais consumido no mês (Seção Destaque) ───────────────────────
  const maisConsumido = useMemo(() => {
    if (!produtosEnriquecidos.length) return null;
    return produtosEnriquecidos.reduce((prev, curr) =>
      curr.consumidoMes > prev.consumidoMes ? curr : prev
    );
  }, [produtosEnriquecidos]);

  // ── 5. Produtos filtrados pela busca ─────────────────────────────────────
  const produtosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return produtosEnriquecidos;
    return produtosEnriquecidos.filter((p) =>
      p.nome.toLowerCase().includes(termo)
    );
  }, [produtosEnriquecidos, busca]);

  // ── 6. Helpers de estado dos inputs ──────────────────────────────────────
  const handleQuantidadeChange = useCallback((produtoId, valor) => {
    setQuantidades((prev) => ({ ...prev, [produtoId]: valor }));
  }, []);

  const handleJustificativaChange = useCallback((produtoId, valor) => {
    setJustificativas((prev) => ({ ...prev, [produtoId]: valor }));
  }, []);

  // ── 7. Exibe feedback visual inline no card (sem alert()) ─────────────────
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

  // ── 8. Função principal: POST /consumos ───────────────────────────────────
  const handleRegistrarConsumo = useCallback(
    async (produtoId) => {
      const quantidade    = Number(quantidades[produtoId]);
      const justificativa = (justificativas[produtoId] || '').trim();
      const produto       = produtosEnriquecidos.find((p) => p.id === produtoId);

      // ── Validação local antes de chamar a API ─────────────────────────────
      if (!produto) return;

      if (!quantidade || quantidade < 1) {
        exibirFeedback(produtoId, 'erro', '⚠️ Informe uma quantidade válida (mínimo 1).');
        return;
      }

      if (!justificativa) {
        exibirFeedback(produtoId, 'erro', '⚠️ A justificativa é obrigatória.');
        return;
      }

      if (!setor?.id) {
        exibirFeedback(produtoId, 'erro', '⚠️ Setor não identificado.');
        return;
      }

      // ── Monta o payload conforme o contrato da API ────────────────────────
      const payload = {
        quantidade:    quantidade,
        justificativa: justificativa,
        produtoId:     produtoId,   // UUID (string)
        setorId:       setor.id,    // Long (number)
      };

      setEnviando((prev) => ({ ...prev, [produtoId]: true }));

      try {
        const response = await api.post('/consumos', payload);
        const dados    = response.data; // ConsumoResponseDto

        console.log(
          `[API /consumos] ✅ Consumo registrado com sucesso:\n`,
          `  ID registro : ${dados.id}\n`,
          `  Produto     : ${dados.nomeProduto}\n`,
          `  Setor       : ${dados.nomeSetor}\n`,
          `  Quantidade  : ${dados.quantidade}\n`,
          `  Data        : ${dados.dataRetirada}`
        );

        // ── Atualiza lista de consumos localmente (sem novo GET) ───────────
        setConsumos((prev) => [...prev, dados]);

        // ── Limpa os inputs do card e exibe sucesso ────────────────────────
        setQuantidades((prev)    => ({ ...prev, [produtoId]: '' }));
        setJustificativas((prev) => ({ ...prev, [produtoId]: '' }));
        exibirFeedback(
          produtoId,
          'sucesso',
          `✅ ${dados.quantidade} ${produto.unidade} de "${dados.nomeProduto}" registradas!`
        );
      } catch (err) {
        // ── Trata erros 400 (validação) e 409 (negócio, ex: estoque insuficiente) ──
        const status   = err.response?.status;
        const body     = err.response?.data;
        const mensagem = body?.mensagem || body?.message || 'Erro ao registrar consumo.';
        const erros    = Array.isArray(body?.erros) ? body.erros.join(' | ') : '';

        const textoErro = erros ? `${mensagem}: ${erros}` : mensagem;

        console.error(`[API /consumos] ❌ Erro ${status}:`, body);
        exibirFeedback(produtoId, 'erro', `❌ ${textoErro}`);
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
