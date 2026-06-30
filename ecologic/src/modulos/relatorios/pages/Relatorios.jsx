import React, { useEffect, useState } from "react";
import "../styles/relatorios.css"; 
import { api } from "../../../shared/services/api"; // Ajuste conforme sua estrutura

export default function Relatorios() {
  const [relatorios, setRelatorios] = useState([]);
  const [setores, setSetores] = useState([]);
  const [consumos, setConsumos] = useState([]); // Armazena os consumos reais do banco
  const [loading, setLoading] = useState(true);
  const [loadingConsumo, setLoadingConsumo] = useState(false);

  // Estados dos Modais
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalDetalhes, setMostrarModalDetalhes] = useState(false);
  const [relatorioSelecionado, setRelatorioSelecionado] = useState(null);

  // Estados do Formulário (Novo Relatório)
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("GERAL");
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [setor, setSetor] = useState("");

  useEffect(() => {
    buscarRelatorios();
    buscarSetores();
  }, []);

  // Busca a lista de relatórios (capas) gerados
  async function buscarRelatorios() {
    try {
      const response = await api.get("/relatorios");
      setRelatorios(response.data);
    } catch (error) {
      console.error("Erro ao buscar relatórios:", error);
    } finally {
      setLoading(false);
    }
  }

  // Busca os setores para popular o select do formulário
  async function buscarSetores() {
    try {
      const response = await api.get("/api/v1/setores");
      setSetores(response.data);
    } catch (error) {
      console.error("Erro ao buscar setores:", error);
    }
  }

  // Formata as datas vindas do Java (LocalDateTime/LocalDate) para o padrão brasileiro
  function formatarData(data) {
    if (!data) return "";
    return new Date(data).toLocaleDateString("pt-BR");
  }

  // Abre o modal de detalhes e busca os consumos REAIS do banco de dados
  async function abrirDetalhes(relatorio) {
    setRelatorioSelecionado(relatorio);
    setMostrarModalDetalhes(true);
    setLoadingConsumo(true);
    setConsumos([]); // Limpa a tabela anterior enquanto carrega

    try {
      // Faz o GET na rota exata do seu ConsumoController Java
      const response = await api.get("/consumos");
      
      // Se o relatório for POR_SETOR, filtramos os dados aqui no Front-end 
      // comparando o nome do setor do consumo com o nome do setor do relatório
      if (relatorio.tipoRelatorio === "POR_SETOR" && relatorio.setor) {
        const consumosFiltrados = response.data.filter(
          (c) => c.setor && c.setor.nome === relatorio.setor.nome
        );
        setConsumos(consumosFiltrados);
      } else {
        // Se for GERAL, mostra todos os consumos que vieram do banco
        setConsumos(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar consumos do banco:", error);
    } finally {
      setLoadingConsumo(false);
    }
  }

// Envia os dados para gerar um novo relatório no back-end
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      // Montando o objeto exatamente igual ao seu RelatorioRequestDto do Java
      const dadosRelatorio = {
        tipoRelatorio: tipo, // Envia "GERAL" ou "POR_SETOR"
        // Transforma o input de data simples em LocalDateTime adicionando a hora exigida pelo Java
        periodoInicio: inicio ? `${inicio}T00:00:00` : null, 
        periodoFim: fim ? `${fim}T23:59:59` : null,
        // Se for POR_SETOR, envia o número puro no campo setorId. Se for GERAL, envia null
        setorId: tipo === "POR_SETOR" && setor ? Number(setor) : null
      };

      // Dispara o POST na rota correta
      await api.post("/relatorios", dadosRelatorio);

      // Limpa o formulário após o sucesso
      setTitulo("");
      setTipo("GERAL");
      setInicio("");
      setFim("");
      setSetor("");

      setMostrarModal(false);
      buscarRelatorios(); // Atualiza a lista na tela com o novo bloquinho azul!
    } catch (error) {
      console.error("Erro detalhado retornado pela API:", error.response?.data || error.message);
      
      // Captura mensagens de validação do Jakarta se houver
      const mensagemErro = error.response?.data?.message || "Verifique se preencheu todos os campos corretamente.";
      alert("Não foi possível gerar o relatório. Motivo: " + mensagemErro);
    }
  }

  return (
    <div className="relatorios-container">
      
      {/* CABEÇALHO DA TELA */}
      <div className="relatorios-header">
        <div>
          <h1>Relatórios</h1>
          <p>Visualize relatórios consolidados do sistema</p>
        </div>

        <button className="btn-gerar" onClick={() => setMostrarModal(true)}>
          + Gerar Relatório
        </button>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      {loading ? (
        <p className="loading-text">Carregando relatórios...</p>
      ) : relatorios.length === 0 ? (
        /* CARD VAZIO CENTRALIZADO */
        <div className="relatorios-card">
          <h2>Relatórios</h2>
          <p>Em breve: relatórios consolidados de consumo.</p>
        </div>
      ) : (
        /* LISTA DE BLOQUINHOS AZUIS */
        <div className="relatorios-lista">
          {relatorios.map((relatorio) => (
            <div key={relatorio.id} className="relatorio-item">
              
              <div className="relatorio-info">
                <h3>{relatorio.titulo}</h3>
                <div className="relatorio-topo-direita">
                  <span className={`tag ${relatorio.tipoRelatorio.toLowerCase()}`}>
                    {relatorio.tipoRelatorio === "POR_SETOR" ? "Por Setor" : "Geral"}
                  </span>
                  <button className="btn-visualizar" onClick={() => abrirDetalhes(relatorio)}>
                    Visualizar
                  </button>
                </div>
              </div>

              <div className="relatorio-detalhes">
                <p>
                  <strong>Período:</strong> {formatarData(relatorio.periodoInicio)} até {formatarData(relatorio.periodoFim)}
                </p>

                <p>
                  <strong>Gerado em:</strong> {formatarData(relatorio.dataGeracao)}
                </p>

                {relatorio.setor && (
                  <p>
                    <strong>Setor:</strong> {relatorio.setor.nome}
                  </p>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL 1: FORMULÁRIO DE CADASTRO */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Novo Relatório</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Título do Relatório"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
              />

              <select 
                value={tipo} 
                onChange={(e) => {
                  setTipo(e.target.value);
                  if (e.target.value !== "POR_SETOR") setSetor("");
                }}
              >
                <option value="GERAL">Geral</option>
                <option value="POR_SETOR">Por Setor</option>
              </select>

              <div className="datas-group">
                <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} required />
                <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} required />
              </div>

              {tipo === "POR_SETOR" && (
                <select value={setor} onChange={(e) => setSetor(e.target.value)} required>
                  <option value="">Selecione um setor...</option>
                  {setores.map((s) => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>
              )}

              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={() => setMostrarModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-confirmar">Gerar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DETALHES COM A TABELA DO BANCO DE DADOS */}
      {mostrarModalDetalhes && relatorioSelecionado && (
        <div className="modal-overlay">
          <div className="modal modal-largo">
            <div className="modal-detalhes-header">
              <h2>{relatorioSelecionado.titulo}</h2>
              <span className={`tag ${relatorioSelecionado.tipoRelatorio.toLowerCase()}`}>
                {relatorioSelecionado.tipoRelatorio === "POR_SETOR" ? "Por Setor" : "Geral"}
              </span>
            </div>

            <div className="meta-dados-detalhes">
              <p><strong>Período avaliado:</strong> {formatarData(relatorioSelecionado.periodoInicio)} até {formatarData(relatorioSelecionado.periodoFim)}</p>
              {relatorioSelecionado.setor && <p><strong>Setor:</strong> {relatorioSelecionado.setor.nome}</p>}
            </div>

            <div className="tabela-consumo-container">
              <h3>Dados de Consumo Coletados do Banco</h3>
              
              {loadingConsumo ? (
                <p className="loading-text">Buscando consumos reais no banco de dados...</p>
              ) : (
                <table className="tabela-consumo">
                  <thead>
                    <tr>
                      <th>Data do Registro</th>
                      <th>Descrição</th>
                      <th>Quantidade</th>
                      <th>Valor/Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {consumos.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                          Nenhum registro de consumo encontrado para este período/setor no banco.
                        </td>
                      </tr>
                    ) : (
                      consumos.map((c) => (
                        <tr key={c.id}>
                          <td>{formatarData(c.dataRegistro || c.data)}</td>
                          <td>{c.descricao || "Consumo registrado"}</td>
                          <td>{c.quantidade || 0}</td>
                          <td>{c.valorKwh || c.tipoFonte || "Ativo"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-confirmar" onClick={() => setMostrarModalDetalhes(false)}>
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}