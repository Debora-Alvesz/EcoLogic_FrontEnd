import React, { useEffect, useState } from "react";
import "../styles/relatorios.css"; 
import { useRelatorios } from "../hooks/useRelatorios";

export default function Relatorios() {
  const {
    relatorios,
    setores,
    relatorioSelecionado,
    loading,
    loadingConsumo,
    erro,
    buscarRelatorios,
    buscarSetores,
    gerarRelatorio,
    abrirDetalhes,
    fecharDetalhes,
    formatarData,
    formatarDataHora,
    formatarMoeda,
  } = useRelatorios();

  // Estados dos Modais
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalDetalhes, setMostrarModalDetalhes] = useState(relatorioSelecionado !== null);

  // Estados do Formulário (Novo Relatório)
  const [formData, setFormData] = useState({
    tipo: "GERAL",
    inicio: "",
    fim: "",
    setor: "",
  });

  const [erroForm, setErroForm] = useState("");
  const [carregandoSubmit, setCarregandoSubmit] = useState(false);

  useEffect(() => {
    buscarRelatorios();
    buscarSetores();
  }, [buscarRelatorios, buscarSetores]);

  useEffect(() => {
    setMostrarModalDetalhes(relatorioSelecionado !== null);
  }, [relatorioSelecionado]);

  // Envia os dados para gerar um novo relatório no back-end
  async function handleSubmit(e) {
    e.preventDefault();
    setCarregandoSubmit(true);
    setErroForm("");

    try {
      // Monta o objeto de acordo com o contrato da API
      const dadosRelatorio = {
        tipoRelatorio: formData.tipo,
        periodoInicio: formData.inicio ? `${formData.inicio}T00:00:00` : null,
        periodoFim: formData.fim ? `${formData.fim}T23:59:59` : null,
        setorId: formData.tipo === "POR_SETOR" && formData.setor ? Number(formData.setor) : null,
      };

      await gerarRelatorio(dadosRelatorio);

      // Limpa o formulário após o sucesso
      setFormData({
        tipo: "GERAL",
        inicio: "",
        fim: "",
        setor: "",
      });

      setMostrarModal(false);
    } catch (error) {
      setErroForm(
        error.message ||
        error.response?.data?.message ||
        "Verifique se preencheu todos os campos corretamente."
      );
    } finally {
      setCarregandoSubmit(false);
    }
  }

  // Manipula mudanças no formulário
  function handleFormChange(field, value) {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Limpa o setor se mudar de tipo
      if (field === "tipo" && value !== "POR_SETOR") {
        newData.setor = "";
      }
      return newData;
    });
  }

  return (
    <div className="relatorios-container">
      {/* EXIBIR ERRO GLOBAL */}
      {erro && (
        <div className="erro-banner">
          <p>{erro}</p>
        </div>
      )}

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
                  <strong>Gerado em:</strong> {formatarDataHora(relatorio.dataGeracao)}
                </p>

                {relatorio.nomeSetor && (
                  <p>
                    <strong>Setor:</strong> {relatorio.nomeSetor}
                  </p>
                )}

                <div className="relatorio-resumo">
                  <p>
                    <strong>Total de Itens:</strong> {relatorio.totalQuantidade}
                  </p>
                  <p>
                    <strong>Custo Total:</strong> {formatarMoeda(relatorio.custoTotal)}
                  </p>
                </div>
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
            
            {erroForm && <div className="erro-form">{erroForm}</div>}

            <form onSubmit={handleSubmit}>
              <select 
                value={formData.tipo} 
                onChange={(e) => handleFormChange("tipo", e.target.value)}
              >
                <option value="GERAL">Geral</option>
                <option value="POR_SETOR">Por Setor</option>
              </select>

              <div className="datas-group">
                <input 
                  type="date" 
                  value={formData.inicio} 
                  onChange={(e) => handleFormChange("inicio", e.target.value)} 
                  required 
                />
                <input 
                  type="date" 
                  value={formData.fim} 
                  onChange={(e) => handleFormChange("fim", e.target.value)} 
                  required 
                />
              </div>

              {formData.tipo === "POR_SETOR" && (
                <select 
                  value={formData.setor} 
                  onChange={(e) => handleFormChange("setor", e.target.value)} 
                  required
                >
                  <option value="">Selecione um setor...</option>
                  {setores.map((s) => (
                    <option key={s.id} value={s.id}>{s.nome}</option>
                  ))}
                </select>
              )}

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancelar" 
                  onClick={() => {
                    setMostrarModal(false);
                    setErroForm("");
                  }}
                  disabled={carregandoSubmit}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-confirmar"
                  disabled={carregandoSubmit}
                >
                  {carregandoSubmit ? "Gerando..." : "Gerar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DETALHES COM CONSUMOS DO RELATÓRIO */}
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
              <p>
                <strong>Período:</strong> {formatarData(relatorioSelecionado.periodoInicio)} até {formatarData(relatorioSelecionado.periodoFim)}
              </p>
              
              {relatorioSelecionado.nomeSetor && (
                <p>
                  <strong>Setor:</strong> {relatorioSelecionado.nomeSetor}
                </p>
              )}

              {relatorioSelecionado.administradorNome && (
                <p>
                  <strong>Administrador:</strong> {relatorioSelecionado.administradorNome}
                </p>
              )}

              <div className="detalhes-resumo">
                <p>
                  <strong>Total de Itens:</strong> {relatorioSelecionado.totalQuantidade}
                </p>
                <p>
                  <strong>Custo Total:</strong> {formatarMoeda(relatorioSelecionado.custoTotal)}
                </p>
              </div>
            </div>

            <div className="tabela-consumo-container">
              <h3>Consumos Detalhados do Período</h3>

              {loadingConsumo ? (
                <p className="loading-text">Carregando detalhes...</p>
              ) : (
                <table className="tabela-consumo">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Produto</th>
                      <th>Quantidade</th>
                      <th>Setor</th>
                      <th>Justificativa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!relatorioSelecionado.consumos || relatorioSelecionado.consumos.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                          Nenhum consumo registrado para este período/setor.
                        </td>
                      </tr>
                    ) : (
                      relatorioSelecionado.consumos.map((consumo) => (
                        <tr key={consumo.id}>
                          <td>{formatarData(consumo.dataRetirada)}</td>
                          <td>{consumo.nomeProduto}</td>
                          <td>{consumo.quantidade}</td>
                          <td>{consumo.nomeSetor}</td>
                          <td>{consumo.justificativa || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-confirmar" 
                onClick={() => fecharDetalhes()}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}