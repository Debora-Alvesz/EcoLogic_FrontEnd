import { useState } from 'react'
import { getUserRoleFromToken, useAuth } from '../../../shared/contexts/AuthContext'

const LOGIN_URL = 'http://localhost:8080/api/auth/login'

export function useLogin() {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const { setUserRole } = useAuth()

  const login = async (email, senha) => {
    setLoading(true)
    setErro('')

    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.mensagem || 'Falha no login')
      }

      const data = await response.json()

      if (!data.token) {
        throw new Error('Token nao recebido pelo servidor')
      }

      localStorage.setItem('token', data.token)
      const roleFromToken = getUserRoleFromToken(data.token)
      if (roleFromToken) {
        localStorage.setItem('userRole', roleFromToken)
        setUserRole(roleFromToken)
      }
      setToken(data.token)

      return data.token
    } catch (error) {
      const mensagem = error.message || 'Falha no login'
      setErro(mensagem)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken('')
  }

  return { login, logout, loading, erro, token }
}
