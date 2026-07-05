import React from 'react';
import '../styles/setor-modal.css';
import { useSetorModal } from '../hooks/useSetorModal';

// ─────────────────────────────────────────────────────────────────────────────
// Ícone SVG: Lupa
// ─────────────────────────────────────────────────────────────────────────────
function IconeLupa() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Ícone SVG: Seta (confirmar)
// ─────────────────────────────────────────────────────────────────────────────
function IconeSeta() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Ícone SVG: Spinner de carregamento
// ─────────────────────────────────────────────────────────────────────────────
function IconeSpinnerBtn() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
        <animateTransform attributeName="transform" type="rotate"
          from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
      </path>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componente: Badge de Tendência
// ─────────────────────────────────────────────────────────────────────────────
function BadgeTendencia({ status, tendencia }) {
  const icones = { alta: '↑', baixa: '↓', estavel: '→' };
  return (
    <span className={`setor-modal-badge-tendencia ${status}`}>
      <span>{icones[status] ?? '→'}</span>
      {tendencia}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componente: Card Destaque (Seção 1 — item mais consumido)
// ─────────────────────────────────────────────────────────────────────────────
function CardDestaque({ produto }) {
  if (!produto) return null;

  const porcentagem = Math.min(
    Math.round((produto.consumidoMes / produto.metaMes) * 100),
    100
  );

  const custoFormatado = produto.custoUnitario?.toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL',
  });

  return (
    <div className="setor-modal-destaque-card">
      <div className="setor-modal-destaque-top">
        <div className="setor-modal-destaque-info">
          <div className="setor-modal-icon-wrap">{produto.icone}</div>
          <div>
            <p className="setor-modal-destaque-nome">{produto.nome}</p>
            <p className="setor-modal-destaque-sub">
              Custo unitário: {custoFormatado} · Acumulado do mês corrente
            </p>
          </div>
        </div>
        <BadgeTendencia status={produto.status} tendencia={produto.tendencia} />
      </div>

      {/* Número gigante */}
      <div>
        <span className="setor-modal-num-gigante">
          {produto.consumidoMes}
          <span className="setor-modal-num-unidade">{produto.unidade}</span>
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="setor-modal-progresso-wrap">
        <div className="setor-modal-progresso-header">
          <span>Este mês</span>
          <span>
            {produto.consumidoMes} / {produto.metaMes} {produto.unidade} ({porcentagem}%)
          </span>
        </div>
        <div className="setor-modal-progresso-track">
          <div
            className={`setor-modal-progresso-fill ${produto.status}`}
            style={{ width: `${porcentagem}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componente: Card de Ação Rápida (Seção 2)
// ─────────────────────────────────────────────────────────────────────────────
function CardAcaoRapida({
  produto,
  quantidade,
  justificativa,
  feedback,
  enviando,
  onQuantidadeChange,
  onJustificativaChange,
  onConfirmar,
}) {
  const custoFormatado = produto.custoUnitario?.toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL',
  });

  const custoTotal =
    quantidade && Number(quantidade) > 0
      ? (Number(quantidade) * produto.custoUnitario).toLocaleString('pt-BR', {
          style: 'currency', currency: 'BRL',
        })
      : null;

  return (
    <div className={`setor-modal-card ${enviando ? 'setor-modal-card--enviando' : ''}`}>
      {/* Cabeçalho */}
      <div className="setor-modal-card-header">
        <div className="setor-modal-card-icon-wrap">{produto.icone}</div>
        <span className="setor-modal-card-label">Registrar Saída</span>
      </div>

      {/* Nome e custo */}
      <div>
        <p className="setor-modal-card-nome">{produto.nome}</p>
        <p className="setor-modal-card-custo">
          Unitário: {custoFormatado}
          {custoTotal && (
            <span className="setor-modal-card-custo-total"> · Total: {custoTotal}</span>
          )}
        </p>
      </div>

      {/* Input: Quantidade */}
      <div className="setor-modal-card-action">
        <input
          id={`qty-input-${produto.id}`}
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          pattern="\d*"
          placeholder="Qtd."
          className="setor-modal-qty-input"
          value={quantidade || ''}
          onChange={(e) => onQuantidadeChange(produto.id, e.target.value)}
          disabled={enviando}
          aria-label={`Quantidade para ${produto.nome}`}
        />
        <button
          id={`confirm-btn-${produto.id}`}
          className="setor-modal-confirm-btn"
          onClick={() => onConfirmar(produto.id)}
          title="Confirmar registro de saída"
          aria-label={`Confirmar saída de ${produto.nome}`}
          disabled={enviando}
        >
          {enviando ? <IconeSpinnerBtn /> : <IconeSeta />}
        </button>
      </div>

      {/* Input: Justificativa (obrigatória pela API) */}
      <input
        id={`just-input-${produto.id}`}
        type="text"
        maxLength={255}
        placeholder="Justificativa (obrigatória)..."
        className="setor-modal-just-input"
        value={justificativa || ''}
        onChange={(e) => onJustificativaChange(produto.id, e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onConfirmar(produto.id)}
        disabled={enviando}
        aria-label={`Justificativa para ${produto.nome}`}
      />

      {/* Feedback visual inline */}
      {feedback && (
        <div className={`setor-modal-feedback ${feedback.tipo}`}>
          {feedback.msg}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componente: Estado de Erro global
// ─────────────────────────────────────────────────────────────────────────────
function ErroCarregamento({ mensagem, onRetry }) {
  return (
    <div className="setor-modal-erro">
      <div className="setor-modal-erro-icon">⚠️</div>
      <p className="setor-modal-erro-msg">{mensagem}</p>
      <button className="setor-modal-retry-btn" onClick={onRetry}>
        Tentar novamente
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente Principal: SetorModal
//
// Props:
//   isOpen  {boolean}                   — controla visibilidade
//   onClose {function}                  — callback de fechamento
//   setor   {{ id: number, nome: string }} — objeto do setor selecionado
// ─────────────────────────────────────────────────────────────────────────────
export function SetorModal({ isOpen, onClose, setor }) {
  // Passa o objeto setor completo para o hook (precisa do setor.id para a API)
  const {
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
  } = useSetorModal(isOpen ? setor : null);

  // Fecha com Escape
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Trava o scroll do body
  React.useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const nomeSetor = setor?.nome ?? 'Setor';

  return (
    <div
      className="setor-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Controle de Suprimentos — ${nomeSetor}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="setor-modal-container">

        {/* ── Cabeçalho ─────────────────────────────────────────── */}
        <header className="setor-modal-header">
          <div className="setor-modal-header-info">
            <span className="setor-modal-badge">📊 Mini-Dashboard</span>
            <h2 className="setor-modal-title">
              Controle de Suprimentos — {nomeSetor}
            </h2>
            <p className="setor-modal-subtitle">
              Registro de saídas e monitoramento de consumo mensal em tempo real
            </p>
          </div>
          <button
            id="setor-modal-close"
            className="setor-modal-close-btn"
            onClick={onClose}
            aria-label="Fechar modal"
            title="Fechar (Esc)"
          >
            ✕
          </button>
        </header>

        {/* ── Barra de Busca ─────────────────────────────────────── */}
        <div className="setor-modal-search-wrap">
          <div className="setor-modal-search-inner">
            <span className="setor-modal-search-icon"><IconeLupa /></span>
            <input
              id="setor-modal-search"
              type="text"
              className="setor-modal-search-input"
              placeholder="Buscar produto por nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              aria-label="Buscar produto"
            />
          </div>
        </div>

        {/* ── Corpo ──────────────────────────────────────────────── */}
        <main className="setor-modal-body">

          {/* Loading */}
          {loading && (
            <div className="setor-modal-loading">
              <div className="setor-modal-spinner" />
              <p>Carregando dados de <strong>{nomeSetor}</strong>...</p>
            </div>
          )}

          {/* Erro global */}
          {!loading && erro && (
            <ErroCarregamento
              mensagem={erro}
              onRetry={() => window.location.reload()}
            />
          )}

          {/* Conteúdo principal */}
          {!loading && !erro && (
            <>
              {/* ── Seção 1: Destaque ─────────────────────────────── */}
              {maisConsumido && maisConsumido.consumidoMes > 0 && (
                <section aria-labelledby="secao-destaque-label">
                  <p id="secao-destaque-label" className="setor-modal-section-label">
                    ⭐ Item Mais Consumido no Mês
                  </p>
                  <CardDestaque produto={maisConsumido} />
                </section>
              )}

              {/* Estado quando não há nenhum consumo ainda no mês */}
              {maisConsumido && maisConsumido.consumidoMes === 0 && !busca && (
                <div className="setor-modal-empty">
                  <div className="setor-modal-empty-icon">📭</div>
                  <p>Nenhum consumo registrado para <strong>{nomeSetor}</strong> neste mês.</p>
                </div>
              )}

              {/* ── Seção 2: Ações Rápidas ────────────────────────── */}
              <section aria-labelledby="secao-acoes-label">
                <p id="secao-acoes-label" className="setor-modal-section-label">
                  ⚡ Ações Rápidas
                </p>

                {produtosFiltrados.length === 0 ? (
                  <div className="setor-modal-empty">
                    <div className="setor-modal-empty-icon">🔍</div>
                    <p>Nenhum produto encontrado{busca ? ` para "${busca}"` : ''}.</p>
                  </div>
                ) : (
                  <div className="setor-modal-grid">
                    {produtosFiltrados.map((produto) => (
                      <CardAcaoRapida
                        key={produto.id}
                        produto={produto}
                        quantidade={quantidades[produto.id]}
                        justificativa={justificativas[produto.id]}
                        feedback={feedbacks[produto.id]}
                        enviando={!!enviando[produto.id]}
                        onQuantidadeChange={handleQuantidadeChange}
                        onJustificativaChange={handleJustificativaChange}
                        onConfirmar={handleRegistrarConsumo}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default SetorModal;
