import { useState } from 'react'
import { useEsqueciSenha } from '../hooks/useEsqueciSenha'
import '../styles/esqueci-senha.css'

function EsqueciSenha({ onNavigate }) {
  const [email, setEmail] = useState('')
  const { solicitarRedefinicao, loading, erro, sucesso } = useEsqueciSenha()

  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      await solicitarRedefinicao(email)
    } catch (error) {
      console.error(error)
    }
  }

  const voltarParaLogin = (event) => {
    event.preventDefault()
    if (onNavigate) {
      onNavigate('login')
    } else {
      window.location.href = '/'
    }
  }

  return (
    <main className="esqueci-senha-page">
      <section className="esqueci-senha-form-panel" aria-label="Recuperação de senha">
        <div className="esqueci-senha-form-card">
          <span className="esqueci-senha-form-kicker">Recuperação de acesso</span>
          <h2>Esqueci minha senha</h2>
          <p className="esqueci-senha-form-subtitle">
            Informe o e-mail cadastrado. Se ele existir em nossa base, você
            recebera um link para criar uma nova senha.
          </p>

          <form className="esqueci-senha-form" onSubmit={handleSubmit}>
            <label htmlFor="esqueci-senha-email">
              Email
              <input
                id="esqueci-senha-email"
                name="email"
                type="email"
                placeholder="seuemail@escola.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            {erro && (
              <p className="esqueci-senha-message esqueci-senha-message-error">{erro}</p>
            )}
            {sucesso && (
              <p className="esqueci-senha-message esqueci-senha-message-success">
                Se o e-mail estiver cadastrado, você recebera um link de
                redefinição em instantes. Verifique também a caixa de spam.
              </p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar link de redefinição'}
            </button>
          </form>

          <p className="esqueci-senha-voltar">
            Lembrou a senha? <a href="/login" onClick={voltarParaLogin}>Voltar para o login</a>
          </p>
        </div>
      </section>
    </main>
  )
}

export default EsqueciSenha