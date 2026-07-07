import { useState, useCallback } from "react";
import { api } from "../../../shared/services/api";

export function useRelatorios() {
  const [relatorios, setRelatorios] = useState([]);
  const [setores, setSetores] = useState([]);
  const [relatorioSelecionado, setRelatorioSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingConsumo, setLoadingConsumo] = useState(false);
  const [erro, setErro] = useState(null);

  /**
   * Busca a lista de todos os relatórios
   */
  const buscarRelatorios = useCallback(async () => {
    try {
      setLoading(true);
      setErro(null);
      const response = await api.get("/relatorios");
      setRelatorios(response.data || []);
    } catch (error) {
      const mensagem = error.response?.data?.message || "Erro ao buscar relatórios";
      setErro(mensagem);
      console.error("Erro ao buscar relatórios:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Busca a lista de setores para o formulário
   */
  const buscarSetores = useCallback(async () => {
    try {
      const response = await api.get("/api/v1/setores");
      setSetores(response.data || []);
    } catch (error) {
      console.error("Erro ao buscar setores:", error);
      setErro("Erro ao buscar setores");
    }
  }, []);

  /**
   * Gera um novo relatório
   * @param {Object} dados - {tipoRelatorio, periodoInicio, periodoFim, setorId}
   */
  const gerarRelatorio = useCallback(async (dados) => {
    try {
      setErro(null);
      
      // Validação de período
      if (new Date(dados.periodoFim) < new Date(dados.periodoInicio)) {
        throw new Error("A data final não pode ser anterior à data inicial");
      }

      // Validação de setor para relatório por setor
      if (dados.tipoRelatorio === "POR_SETOR" && !dados.setorId) {
        throw new Error("Setor é obrigatório para relatório por setor");
      }

      const payload = {
        tipoRelatorio: dados.tipoRelatorio,
        periodoInicio: dados.periodoInicio,
        periodoFim: dados.periodoFim,
        setorId: dados.tipoRelatorio === "POR_SETOR" ? dados.setorId : null,
      };

      const response = await api.post("/relatorios", payload);
      
      // Atualiza a lista de relatórios após sucesso
      await buscarRelatorios();
      
      return response.data;
    } catch (error) {
      const mensagem = error.response?.data?.message || error.message || "Erro ao gerar relatório";
      setErro(mensagem);
      throw error;
    }
  }, [buscarRelatorios]);

  /**
   * Abre o modal de detalhes carregando o relatório completo com consumos
   * @param {Object} relatorio - relatório a ser visualizado
   */
  const abrirDetalhes = useCallback(async (relatorio) => {
    try {
      setLoadingConsumo(true);
      setErro(null);

      // Busca o relatório completo (vem com todos os consumos inclusos)
      const response = await api.get(`/relatorios/${relatorio.id}`);
      setRelatorioSelecionado(response.data);
    } catch (error) {
      const mensagem = error.response?.data?.message || "Erro ao buscar detalhes do relatório";
      setErro(mensagem);
      console.error("Erro ao buscar detalhes:", error);
    } finally {
      setLoadingConsumo(false);
    }
  }, []);

  /**
   * Fecha o modal de detalhes
   */
  const fecharDetalhes = useCallback(() => {
    setRelatorioSelecionado(null);
    setErro(null);
  }, []);

  /**
   * Deleta um relatório
   * @param {string} relatorioId - ID do relatório a deletar
   */
  const deletarRelatorio = useCallback(async (relatorioId) => {
    try {
      setErro(null);
      await api.delete(`/relatorios/${relatorioId}`);
      await buscarRelatorios();
      return true;
    } catch (error) {
      const mensagem = error.response?.data?.message || "Erro ao deletar relatório";
      setErro(mensagem);
      throw error;
    }
  }, [buscarRelatorios]);

  /**
   * Atualiza um relatório existente
   * @param {string} relatorioId - ID do relatório
   * @param {Object} dados - dados atualizados
   */
  const atualizarRelatorio = useCallback(async (relatorioId, dados) => {
    try {
      setErro(null);
      const payload = {
        tipoRelatorio: dados.tipoRelatorio,
        periodoInicio: dados.periodoInicio,
        periodoFim: dados.periodoFim,
        setorId: dados.tipoRelatorio === "POR_SETOR" ? dados.setorId : null,
      };

      const response = await api.put(`/relatorios/${relatorioId}`, payload);
      await buscarRelatorios();
      return response.data;
    } catch (error) {
      const mensagem = error.response?.data?.message || "Erro ao atualizar relatório";
      setErro(mensagem);
      throw error;
    }
  }, [buscarRelatorios]);

  /**
   * Formata datas no padrão brasileiro
   * @param {string} data - data em formato ISO ou Unix
   */
  const formatarData = useCallback((data) => {
    if (!data) return "";
    return new Date(data).toLocaleDateString("pt-BR");
  }, []);

  /**
   * Formata data e hora no padrão brasileiro
   * @param {string} data - data em formato ISO
   */
  const formatarDataHora = useCallback((data) => {
    if (!data) return "";
    return new Date(data).toLocaleString("pt-BR");
  }, []);

  /**
   * Formata valor monetário em reais
   * @param {number} valor - valor a formatar
   */
  const formatarMoeda = useCallback((valor) => {
    if (valor === null || valor === undefined) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  }, []);

  return {
    // Estado
    relatorios,
    setores,
    relatorioSelecionado,
    loading,
    loadingConsumo,
    erro,

    // Funções
    buscarRelatorios,
    buscarSetores,
    gerarRelatorio,
    abrirDetalhes,
    fecharDetalhes,
    deletarRelatorio,
    atualizarRelatorio,
    formatarData,
    formatarDataHora,
    formatarMoeda,
  };
}
