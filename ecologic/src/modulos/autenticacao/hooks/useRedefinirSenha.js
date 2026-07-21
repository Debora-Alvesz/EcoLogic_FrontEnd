import { useState } from 'react'

const REDEFINIR_SENHA_URL = 'http://localhost:8080/api/v1/usuarios/redefinir-senha'

export function useRedefinirSenha() {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  const redefinirSenha = async (token, novaSenha) => {
    setLoading(true)
    setErro('')
    setSucesso(false)

    try {
      const response = await fetch(REDEFINIR_SENHA_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, novaSenha }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.mensagem || 'Não foi possível redefinir a senha')
      }

      setSucesso(true)
    } catch (error) {
      const mensagem = error.message || 'Erro ao redefinir senha'
      setErro(mensagem)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { redefinirSenha, loading, erro, sucesso }
}