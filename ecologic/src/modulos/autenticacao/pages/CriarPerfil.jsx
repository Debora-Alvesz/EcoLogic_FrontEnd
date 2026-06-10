import { useState } from 'react'
import { useCriarPerfil } from '../hooks/useCriarPerfil'
import '../styles/criar-perfil.css'

function CriarPerfil() {
  const [tipoUsuario, setTipoUsuario] = useState('')
  
  // Trazendo a lógica de requisição do seu hook
  const { cadastrarUsuario, loading, erro } = useCriarPerfil()

  const handleCriarPerfil = async (event) => {
    event.preventDefault()

    const formData = new FormData(event.target)
    const dados = Object.fromEntries(formData)

    // Validações simples
    if (dados.senha !== dados.confirmarSenha) {
      alert("As senhas não coincidem!")
      return
    }
    if (!dados.termos) {
      alert("Você precisa confirmar que os dados pertencem a um usuario autorizado.")
      return
    }

    try {
      await cadastrarUsuario(dados, tipoUsuario)
      alert("Perfil criado com sucesso!")
      // Se quiser redirecionar para o login após o sucesso, descomente a linha abaixo:
      // window.location.href = '/login'
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main className="criar-perfil-page">
      <section className="criar-perfil-shell">
        <aside className="criar-perfil-sidebar" aria-label="Resumo EcoLogic">
          <div className="criar-perfil-brand">
            <span className="criar-perfil-logo" aria-hidden="true">
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

          <div className="criar-perfil-copy">
            <span className="criar-perfil-eyebrow">Novo acesso</span>
            <h1>Crie seu perfil institucional.</h1>
            <p>
              Cadastre usuarios para operar os modulos do EcoLogic conforme o
              cargo e a funcao dentro da escola.
            </p>
          </div>

          <div className="criar-perfil-metric">
            <span>Perfil</span>
            <strong>Administrador ou Diretor</strong>
          </div>
        </aside>

        <section className="criar-perfil-card" aria-label="Formulario de cadastro">
          <div className="criar-perfil-header">
            <span className="criar-perfil-form-kicker">Cadastro</span>
            <h2>Criar perfil</h2>
            <p>
              Preencha os dados do usuario. Cargo e titulacao serao usados de
              acordo com o tipo selecionado.
            </p>
          </div>

          {/* Adicionando a chamada do onSubmit aqui */}
          <form className="criar-perfil-form" onSubmit={handleCriarPerfil}>
            <div className="criar-perfil-grid">
              <label htmlFor="nome">
                Nome completo
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  placeholder="Ex.: Carlos Almeida"
                  autoComplete="name"
                  required
                />
              </label>

              <label htmlFor="email">
                Email
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="usuario@escola.com"
                  autoComplete="email"
                  required
                />
              </label>
            </div>

            <div className="criar-perfil-grid">
              <label htmlFor="senha">
                Senha
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  placeholder="Crie uma senha"
                  autoComplete="new-password"
                  required
                />
              </label>

              <label htmlFor="confirmar-senha">
                Confirmar senha
                <input
                  id="confirmar-senha"
                  name="confirmarSenha"
                  type="password"
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  required
                />
              </label>
            </div>

            <label htmlFor="tipo">
              Tipo de usuario
              <select
                id="tipo"
                name="tipo"
                value={tipoUsuario}
                onChange={(event) => setTipoUsuario(event.target.value)}
                required
              >
                <option value="" disabled>
                  Selecione o tipo
                </option>
                <option value="ADMINISTRADOR">Administrador</option>
                <option value="DIRETOR">Diretor</option>
              </select>
            </label>

            {tipoUsuario === 'ADMINISTRADOR' && (
              <label htmlFor="cargo">
                Cargo
                <input
                  id="cargo"
                  name="cargo"
                  type="text"
                  required
                />
              </label>
            )}

            {tipoUsuario === 'DIRETOR' && (
              <label htmlFor="titulacao">
                Titulação
                <input
                  id="titulacao"
                  name="titulacao"
                  type="text"
                  required
                />
              </label>
            )}

            <label className="criar-perfil-checkbox" htmlFor="termos">
              <input id="termos" name="termos" type="checkbox" />
              Confirmo que os dados pertencem a um usuario autorizado.
            </label>

            {/* Mostrando mensagem de erro se o back-end reclamar de algo */}
            {erro && <p style={{ color: '#d93025', fontSize: '14px' }}>{erro}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Criando...' : 'Criar perfil'}
            </button>
          </form>

          <p className="criar-perfil-login">
            Ja possui cadastro? <a href="/login">Entrar</a>
          </p>
        </section>
      </section>
    </main>
  )
}

export default CriarPerfil