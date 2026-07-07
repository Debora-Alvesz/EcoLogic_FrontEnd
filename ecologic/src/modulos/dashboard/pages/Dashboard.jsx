import React from "react";
import { useDashboardData } from "../hooks/useDashboardData.js";
import "../styles/Dashboard.css";
import {
  AlertTriangle,
  ShieldAlert,
  Users,
  Building,
  DollarSign,
  UserCheck
} from "lucide-react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

function Dashboard() {
  const { financialWaste, anomalies, sectors, heatmap, administradores, topSectors, topAdmins, loading, error } = useDashboardData();

  if (loading) {
    return (
      <div className="dashboard-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p className="dashboard-subtitle">Consolidando relatórios gerenciais para a Diretoria...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p className="dashboard-subtitle text-red-critical">Erro de integração com a API: {error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      
      {/* Cabeçalho */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Painel Executivo da Diretoria</h1>
          <p className="dashboard-subtitle">Auditoria macro, custos integrados e controle de equipes alocadas.</p>
        </div>
        <div className="dashboard-badge-mode">
          <span className="dashboard-badge-dot" />
          Modo Diretor Ativo
        </div>
      </div>

      {/* Grid de 3 Cards Principais */}
      <div className="dashboard-grid-cards">
        
        {/* Card 1: Gasto Geral */}
        <div className="card-dashboard-standard border-blue">
          <div className="dashboard-card-header">
            <div>
              <h3 className="dashboard-card-label">Custo Total em Consumo</h3>
              <p className="dashboard-card-sublabel">Fluxo Global</p>
            </div>
            <div className="dashboard-card-icon-wrapper bg-blue-light">
              <DollarSign size={18} strokeWidth={2.5} />
            </div>
          </div>
          <p className="dashboard-card-value">{financialWaste.valor}</p>
          <p className="dashboard-card-footer-text">Soma volumétrica total de saídas do almoxarifado.</p>
        </div>

        {/* Card 2: Alertas e Desperdício */}
        <div className="card-waste-finance">
          <div className="dashboard-card-header">
            <div>
              <h3 className="dashboard-card-label">Gasto Crítico (Anomalias)</h3>
              <p className="dashboard-card-sublabel">Retiradas excessivas</p>
            </div>
            <div className="dashboard-card-icon-wrapper bg-red-light">
              <ShieldAlert size={18} strokeWidth={2.25} />
            </div>
          </div>
          <p className="dashboard-card-value text-red-critical">{financialWaste.porcentagem}</p>
          <div>
            <span className="delta-tag-red">
              <AlertTriangle size={14} /> {anomalies.total} saídas suspeitas detectadas
            </span>
          </div>
        </div>

        {/* Card 3: Administradores */}
        <div className="card-dashboard-standard">
          <div className="dashboard-card-header">
            <div>
              <h3 className="dashboard-card-label">Administradores Alocados</h3>
              <p className="dashboard-card-sublabel">Corpo Técnico Ativo</p>
            </div>
            <div className="dashboard-card-icon-wrapper bg-emerald-light">
              <Users size={18} strokeWidth={2.25} />
            </div>
          </div>
          <p className="dashboard-card-value">{administradores.length}</p>
          <p className="dashboard-card-footer-text" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <UserCheck size={14} style={{ color: "#087443" }} /> Operadores ativos no sistema.
          </p>
        </div>

      </div>

      {/* Grid Central: Rankings de Gastos */}
      <div className="dashboard-grid-rankings">
        
        {/* Bloco Setores */}
        <div className="card-dashboard-standard">
          <div className="dashboard-section-header">
            <h3 className="dashboard-ranking-title">
              <Building size={18} style={{ color: "#0066cc" }} />
              Gastos Consolidados por Setor
            </h3>
            <p className="dashboard-ranking-subtitle">Ordenado pelo impacto monetário real de cada departamento</p>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column" }}>
            {topSectors.map((setor, idx) => (
              <div key={idx} className="dashboard-ranking-item">
                <div className="dashboard-item-info">
                  <span className="dashboard-item-name">
                    <span className="dashboard-position-tag">#{idx + 1}</span>
                    {setor.nome}
                  </span>
                  <span className="dashboard-item-value">{setor.gasto}</span>
                </div>
                <div className="dashboard-progress-bg">
                  <div className="dashboard-progress-bar" style={{ width: `${sectors[idx]?.valor || 0}%`, backgroundColor: sectors[idx]?.cor || '#0066cc' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bloco Administradores */}
        <div className="card-dashboard-standard">
          <div className="dashboard-section-header">
            <h3 className="dashboard-ranking-title">
              <Users size={18} style={{ color: "#7c3aed" }} />
              Responsabilidade por Registro (Administradores)
            </h3>
            <p className="dashboard-ranking-subtitle">Ranking de movimentação financeira por operador do sistema</p>
          </div>

<div className="dashboard-admin-list">
  {topAdmins.length === 0 ? (
    <p className="dashboard-ranking-subtitle" style={{ textAlign: "center", padding: "40px 0" }}>
      Nenhum lançamento efetuado por administradores ainda.
    </p>
  ) : (
    topAdmins.map((adm, i) => (
      <div key={i} className="dashboard-admin-row">
        <div className="dashboard-admin-meta">
          <h4>{adm.nome}</h4>
          {/* Mudamos aqui para ler adm.registros ou garantir o valor direto */}
          <p>{adm.cargo} • <strong>{adm.registros || adm.totalRegistros || 0} lançamentos</strong></p>
        </div>
        <span className="dashboard-badge-gasto">{adm.gasto}</span>
      </div>
    ))
  )}
</div>
        </div>

      </div>

      {/* Rodapé: Gráfico Semanal e Detalhes Rápidos */}
      <div className="dashboard-grid-footer">
        
        {/* Gráfico Semanal */}
        <div className="chart-container">
          <div className="dashboard-section-header">
            <h3 className="dashboard-ranking-title">
              <span style={{ color: "#d92d20" }}>◆</span> Distribuição Semanal de Desperdício (R$)
            </h3>
            <p className="dashboard-ranking-subtitle">Custos associados estritamente a anomalias de retiradas nos últimos 7 dias</p>
          </div>
          
          <div style={{ width: "100%", height: "250px", marginTop: "16px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={heatmap} barCategoryGap="35%">
                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: "#667085", fontSize: 12, fontWeight: 500 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#98a2b3", fontSize: 11 }} tickFormatter={(v) => `R$${v}`} width={45} />
                <Tooltip cursor={{ fill: "#f9fafb" }} formatter={(value) => [`R$ ${value},00`, "Prejuízo Estimado"]} contentStyle={{ borderRadius: 8, border: "1px solid #eaecf0", fontSize: 13, boxShadow: "0px 4px 6px -2px rgba(16, 24, 40, 0.03)" }} />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {heatmap.map((entry, idx) => (
                    <Cell key={idx} fill={entry.alerta ? "#d92d20" : "#0066cc"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gerenciamento de Equipe Cadastrada */}
        <div className="card-dashboard-standard">
          <div className="dashboard-section-header">
            <h3 className="dashboard-ranking-title">Equipe Cadastrada</h3>
            <p className="dashboard-ranking-subtitle">Listagem de credenciais administrativas</p>
          </div>
          <div className="dashboard-admin-list">
            {administradores.map((user, i) => (
              <div key={i} className="dashboard-admin-row">
                <div className="dashboard-admin-meta" style={{ maxWidth: "150px" }}>
                  <h4 style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.nome}</h4>
                  <p style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</p>
                </div>
                <span className="dashboard-badge-role">
                  {user.cargo || "Admin"}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;