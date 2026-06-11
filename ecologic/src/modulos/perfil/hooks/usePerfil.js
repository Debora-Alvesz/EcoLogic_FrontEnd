import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:8080/api/v1/usuarios/id';

const decodificarPayloadToken = (token) => {
  const payload = token.split('.')[1];

  if (!payload) {
    throw new Error('Token invalido.');
  }

  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  );

  return JSON.parse(jsonPayload);
};

const obterUsuarioIdDoToken = (token) => {
  const payload = decodificarPayloadToken(token);
  const usuarioId = payload.id || payload.usuarioId || payload.userId || payload.sub;

  if (!usuarioId) {
    throw new Error('Id do usuario nao encontrado no token.');
  }

  return usuarioId;
};

const usePerfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('Usuario nao autenticado. Token nao encontrado.');
        }

        const usuarioId = obterUsuarioIdDoToken(token);

        const response = await fetch(`${API_URL}/${usuarioId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.mensagem || 'Erro ao buscar dados do perfil.');
        }

        const data = await response.json();
        setUsuario(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, []);

  return { usuario, loading, error };
};

export default usePerfil;
