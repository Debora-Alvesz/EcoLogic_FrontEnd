import { useState } from 'react'
import { useLogin } from '../hooks/useLogin'
import '../styles/login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [sucesso, setSucesso] = useState('')
  const { login, loading, erro } = useLogin()

  const handleLogin = async (event) => {
    event.preventDefault()
    setSucesso('')

    try {
      await login(email, senha)
      setSucesso('Login realizado com sucesso.')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel" aria-label="Apresentacao EcoLogic">
        <div className="login-brand">
          <span className="login-logo" aria-hidden="true">
            <svg viewBox="0 0 24 24" role="presentation">
              <path d="M19.6 4.4c-5.7.4-10 2.1-12.9 5C3.9 12.2 3 16 4.8 19.2c3.2 1.8 7 .9 9.8-1.9 2.9-2.9 4.6-7.2 5-12.9Z" />
              <path d="M7.6 16.4c2.2-3.2 4.8-5.2 8.4-6.4" />
            </svg>
          </span>
          <div>
            <strong>EcoLogic</strong>
            <small>Auditoria Sustentavel</small>
          </div>
        </div>

        <div className="login-copy">
          <span className="login-eyebrow">Acesso seguro</span>
          <h1>Entre para acompanhar sua escola.</h1>
          <p>
            Monitore consumo, desperdicio e metas sustentaveis em um painel
            claro para tomada de decisao.
          </p>
        </div>

        <div className="login-status-card">
          <span className="login-status-dot" aria-hidden="true"></span>
          Sistema preparado para usuarios administradores e diretores.
        </div>
      </section>

      <section className="login-form-panel" aria-label="Formulario de login">
        <div className="login-form-card">
          <span className="login-form-kicker">Bem-vindo de volta</span>
          <h2>Login</h2>
          <p className="login-form-subtitle">
            Informe suas credenciais para acessar o EcoLogic.
          </p>

          <form className="login-form" onSubmit={handleLogin}>
            <label htmlFor="login-email">
              Email
              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="seuemail@escola.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label htmlFor="login-senha">
              Senha
              <input
                id="login-senha"
                name="senha"
                type="password"
                placeholder="Digite sua senha"
                autoComplete="current-password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
              />
            </label>

            <div className="login-form-row">
              <label className="login-checkbox" htmlFor="lembrar-login">
                <input id="lembrar-login" name="lembrar" type="checkbox" />
                Lembrar acesso
              </label>
              <a href="/recuperar-senha">Esqueci minha senha</a>
            </div>

            {erro && <p className="login-message login-message-error">{erro}</p>}
            {sucesso && (
              <p className="login-message login-message-success">{sucesso}</p>
            )}

            <button type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p className="login-create-account">
            Ainda nao tem perfil? <a href="/criar-perfil">Criar perfil</a>
          </p>
        </div>
      </section>
    </main>
  )
}

export default Login
