
import { useState } from 'react';
import { api } from '../../../shared/services/api';

export const useCriarPerfil = () => {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const cadastrarUsuario = async (dadosFormulario, tipoUsuario) => {
    setLoading(true);
    setErro(null);

    try {
      let resposta;

      if (tipoUsuario === 'ADMINISTRADOR') {
        // Envia o payload batendo com o UsuarioAdministradorRequestDTO
        resposta = await api.post('/api/v1/usuarios/administradores', {
          nome: dadosFormulario.nome,
          email: dadosFormulario.email,
          senha: dadosFormulario.senha,
          cargo: dadosFormulario.cargo,
        });
      } else if (tipoUsuario === 'DIRETOR') {
        // Envia o payload batendo com o UsuarioDiretorRequestDTO
        resposta = await api.post('/api/v1/usuarios/diretores', {
          nome: dadosFormulario.nome,
          email: dadosFormulario.email,
          senha: dadosFormulario.senha,
          titulacao: dadosFormulario.titulacao,
        });
      }

      return resposta.data; // Sucesso! Retorna os dados para a tela
    } catch (error) {
      // Captura o erro do backend (ex: email já existe)
      const mensagemErro = error.response?.data?.message || 'Ocorreu um erro ao tentar criar o perfil.';
      setErro(mensagemErro);
      throw error; 
    } finally {
      setLoading(false);
    }
  };

  return { cadastrarUsuario, loading, erro };
};