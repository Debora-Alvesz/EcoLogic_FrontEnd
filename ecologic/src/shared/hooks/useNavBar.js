import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:8080/api/v1/usuarios/id';

// Função auxiliar para decodificar o payload do JWT
const decodificarPayloadToken = (token) => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return null;
  }
};

const obterUsuarioIdDoToken = (token) => {
  const payload = decodificarPayloadToken(token);
  if (!payload) return null;
  return payload.id || payload.usuarioId || payload.userId || payload.sub;
};

export const useNavbar = () => {
  // Dados de fallback simulando o usuário "Carlos" do print
  const [usuario, setUsuario] = useState({
    nome: 'Carlos',
    cargo: 'Diretor Escolar',
    tipo: 'DIRETOR',
    iniciais: 'CD'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        const usuarioId = obterUsuarioIdDoToken(token);
        if (!usuarioId) {
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/${usuarioId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          // Calcula iniciais do nome do usuário
          const nomes = data.nome ? data.nome.trim().split(' ') : [];
          let iniciais = 'US';
          if (nomes.length > 1) {
            iniciais = (nomes[0][0] + nomes[nomes.length - 1][0]).toUpperCase();
          } else if (nomes.length === 1) {
            iniciais = nomes[0].substring(0, 2).toUpperCase();
          }

          // Define a função exibida na NavBar com base no tipo
          const funcao = data.tipo === 'ADMINISTRADOR' 
            ? data.cargo || data.atributoEspecifico || 'Administrador' 
            : data.titulacao || data.atributoEspecifico || 'Diretor';

          setUsuario({
            nome: data.nome || 'Usuário',
            cargo: funcao,
            tipo: data.tipo || 'DIRETOR',
            iniciais: iniciais
          });
        }
      } catch (err) {
        console.warn('Não foi possível carregar dados do perfil real da API, mantendo simulação:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, []);

  return { usuario, loading };
};

export default useNavbar;
