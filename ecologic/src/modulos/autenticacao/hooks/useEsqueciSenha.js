import { useState } from 'react'

const ESQUECI_SENHA_URL = 'http://localhost:8080/api/v1/usuarios/esqueci-senha'

export function useEsqueciSenha() {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  const solicitarRedefinicao = async (email) => {
    setLoading(true)
    setErro('')
    setSucesso(false)

    try {
      const response = await fetch(ESQUECI_SENHA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.mensagem || 'Não foi possível solicitar a redefinição de senha')
      }

      setSucesso(true)
    } catch (error) {
      const mensagem = error.message || 'Erro ao solicitar redefinição de senha'
      setErro(mensagem)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { solicitarRedefinicao, loading, erro, sucesso }
}