import { useState, useEffect } from 'react'
import { useRedefinirSenha } from '../hooks/useRedefinirSenha'
import '../styles/redefinir-senha.css'

function RedefinirSenha({ onNavigate }) {
  const [token, setToken] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erroValidacao, setErroValidacao] = useState('')
  const { redefinirSenha, loading, erro, sucesso } = useRedefinirSenha()

  // Le o token diretamente da URL (?token=xxx) assim que a tela carrega
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setToken(params.get('token') || '')
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErroValidacao('')

    if (!token) {
      setErroValidacao('Link inválido ou incompleto. Solicite uma nova redefinição de senha.')
      return
    }

    if (novaSenha !== confirmarSenha) {
      setErroValidacao('As senhas não coincidem.')
      return
    }

    try {
      await redefinirSenha(token, novaSenha)
    } catch (error) {
      console.error(error)
    }
  }

  const irParaLogin = (event) => {
    event.preventDefault()
    if (onNavigate) {
      onNavigate('login')
    } else {
      window.location.href = '/'
    }
  }

  return (
    <main className="redefinir-senha-page">
      <section className="redefinir-senha-form-panel" aria-label="Redefinição de senha">
        <div className="redefinir-senha-form-card">
          <span className="redefinir-senha-form-kicker">Nova senha</span>
          <h2>Redefinir senha</h2>
          <p className="redefinir-senha-form-subtitle">
            Escolha uma nova senha para acessar sua conta.
          </p>

          {!token && (
            <p className="redefinir-senha-message redefinir-senha-message-error">
              Link inválido ou expirado. Solicite uma nova redefinição de senha.
            </p>
          )}

          <form className="redefinir-senha-form" onSubmit={handleSubmit}>
            <label htmlFor="redefinir-senha-nova">
              Nova senha
              <input
                id="redefinir-senha-nova"
                name="novaSenha"
                type="password"
                placeholder="Digite a nova senha"
                autoComplete="new-password"
                value={novaSenha}
                onChange={(event) => setNovaSenha(event.target.value)}
                required
                minLength={6}
              />
            </label>

            <label htmlFor="redefinir-senha-confirmar">
              Confirmar nova senha
              <input
                id="redefinir-senha-confirmar"
                name="confirmarSenha"
                type="password"
                placeholder="Repita a nova senha"
                autoComplete="new-password"
                value={confirmarSenha}
                onChange={(event) => setConfirmarSenha(event.target.value)}
                required
                minLength={6}
              />
            </label>

            {erroValidacao && (
              <p className="redefinir-senha-message redefinir-senha-message-error">{erroValidacao}</p>
            )}
            {erro && (
              <p className="redefinir-senha-message redefinir-senha-message-error">{erro}</p>
            )}
            {sucesso && (
              <p className="redefinir-senha-message redefinir-senha-message-success">
                Senha redefinida com sucesso! Você ja pode fazer login.
              </p>
            )}

            <button type="submit" disabled={loading || !token}>
              {loading ? 'Salvando...' : 'Redefinir senha'}
            </button>
          </form>

          <p className="redefinir-senha-voltar">
            <a href="/login" onClick={irParaLogin}>Voltar para o login</a>
          </p>
        </div>
      </section>
    </main>
  )
}

export default RedefinirSenha