import React from "react";
import { useDashboardData } from "../hooks/useDashboardData.js";
import "../styles/Dashboard.css";
import {
  AlertTriangle,
  ShieldAlert,
  Users,
  Building,
  DollarSign,
  UserCheck,
  PackageX,
  BarChart3
} from "lucide-react";

function Dashboard() {
  const { financialWaste, anomalies, sectors, administradores, topSectors, topAdmins, lowStockProducts, setorModa, estatisticasSetores, loading, error } = useDashboardData();

  // Função auxiliar para renderizar o selo/badge do Quartil de cada setor
  const renderBadgeQuartil = (setor) => {
    if (!estatisticasSetores) return null;

    let bg = '#f7fafc';
    let color = '#4a5568';
    let border = '#cbd5e0';
    let texto = 'Intervalo Interquartil (Dentro da média)';

    if (setor.bruto > estatisticasSetores.limiteSuperior) {
      bg = '#fff5f5'; color = '#c53030'; border = '#feb2b2';
      texto = 'Alerta: Custo Extremo (Outlier)';
    } else if (setor.bruto > estatisticasSetores.q3) {
      bg = '#fffff0'; color = '#b7791f'; border = '#f6e05e';
      texto = '4º Quartil (Gasto Elevado)';
    } else if (setor.bruto <= estatisticasSetores.q1) {
      bg = '#f0fff4'; color = '#276749'; border = '#9ae6b4';
      texto = '1º Quartil (Econômico)';
    }

    return (
      <span style={{
        display: 'inline-block',
        background: bg,
        color: color,
        border: `1px solid ${border}`,
        borderRadius: '4px',
        padding: '2px 8px',
        fontSize: '11px',
        fontWeight: 600,
        marginLeft: '8px',
        whiteSpace: 'nowrap'
      }}>
        {texto}
      </span>
    );
  };

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
                  <span className="dashboard-item-name" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="dashboard-position-tag">#{idx + 1}</span>
                    {setor.nome}
                    {renderBadgeQuartil(setor)}
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
                    <p>{adm.cargo} • <strong>{adm.registros || adm.totalRegistros || 0} lançamentos</strong></p>
                  </div>
                  <span className="dashboard-badge-gasto">{adm.gasto}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Painel de Análise de Frequência (Moda Estatística) */}
      <div className="dashboard-grid-footer" style={{ gridTemplateColumns: '1fr' }}>
        <div className="card-dashboard-standard" style={{ borderLeft: '4px solid #7c3aed' }}>
          <div className="dashboard-section-header">
            <h3 className="dashboard-ranking-title">
              <BarChart3 size={18} style={{ color: "#7c3aed" }} />
              Análise de Frequência (Moda)
            </h3>
            <p className="dashboard-ranking-subtitle">Setor com maior volume de requisições no sistema</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            {/* Card Setor Moda */}
            <div style={{
              background: '#f5f3ff',
              border: '1px solid #c4b5fd',
              borderRadius: '8px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <p style={{ color: '#6d28d9', fontSize: '13px', fontWeight: 600, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Setor Mais Frequente</p>
              <p style={{ color: '#4c1d95', fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
                {setorModa.setorModa}
              </p>
            </div>

            {/* Card Frequência */}
            <div style={{
              background: '#eff6ff',
              border: '1px solid #93c5fd',
              borderRadius: '8px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <p style={{ color: '#1d4ed8', fontSize: '13px', fontWeight: 600, margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total de Requisições</p>
              <p style={{ color: '#1e40af', fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
                {setorModa.frequencia} pedidos
              </p>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #7c3aed', marginTop: '20px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#4a5568', lineHeight: '1.6' }}>
              {setorModa.frequencia > 0
                ? `O setor que mais realiza requisições no sistema é a ${setorModa.setorModa}, representando a Moda estatística dos nossos registros, com ${setorModa.frequencia} pedidos no total.`
                : "Nenhum pedido foi registrado no sistema até o momento. Os dados de frequência serão exibidos assim que os setores começarem a realizar requisições."
              }
            </p>
          </div>
        </div>
      </div>

      {/* Rodapé: Estoque Baixo e Detalhes Rápidos */}
      <div className="dashboard-grid-footer">
        
        {/* Produtos com Estoque Baixo */}
        <div className="chart-container">
          <div className="dashboard-section-header">
            <h3 className="dashboard-ranking-title">
              <PackageX size={18} style={{ color: "#d92d20" }} />
              Produtos com Estoque Baixo
            </h3>
            <p className="dashboard-ranking-subtitle">Itens com menos de 3 unidades disponíveis no almoxarifado</p>
          </div>

          <div className="dashboard-admin-list" style={{ marginTop: "16px" }}>
            {lowStockProducts.length === 0 ? (
              <p className="dashboard-ranking-subtitle" style={{ textAlign: "center", padding: "40px 0" }}>
                Nenhum produto com estoque crítico no momento.
              </p>
            ) : (
              lowStockProducts.map((produto, i) => (
                <div key={i} className="dashboard-admin-row">
                  <div className="dashboard-admin-meta">
                    <h4>{produto.nome}</h4>
                    <p>Estoque atual</p>
                  </div>
                  <span className="delta-tag-red">
                    <AlertTriangle size={14} /> {produto.estoque} {produto.unidade}
                  </span>
                </div>
              ))
            )}
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