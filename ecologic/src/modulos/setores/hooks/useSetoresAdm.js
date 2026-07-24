import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8080/api/v1/setores';

export function useSetoresAdm() {
  const [setoresVinculados, setSetoresVinculados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarSetorDoAdmin = async () => {
      setLoading(true);
      try {
        // 1. Pegar o token salvo pelo hook useLogin
        const token = localStorage.getItem('token');

        if (!token) {
          console.warn("Nenhum token encontrado. Usuário não está logado.");
          setSetoresVinculados([]);
          setLoading(false);
          return;
        }

        // 2. Extrair o ID do administrador de dentro do Token JWT
        // Um token JWT tem 3 partes separadas por ponto. A 2ª parte é o payload.
        const payloadBase64 = token.split('.')[1];
        const payloadString = atob(payloadBase64); // Decodifica o Base64
        const tokenPayload = JSON.parse(payloadString);

       
        const idAdministradorLogado = tokenPayload.id || tokenPayload.userId || tokenPayload.sub;

        // 3. Buscar todos os setores no backend (Enviando o Token de Autorização)
        const response = await fetch(API_BASE_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Libera a requisição no Spring Security
          }
        });
        
        if (response.ok) {
          const setores = await response.json();
          
          // 4. Filtrar os setores batendo o UUID do setor com o UUID decodificado do Token
          const setoresDoAdmin = setores.filter(
            (setor) => setor.administradorId === idAdministradorLogado
          );

          if (setoresDoAdmin.length > 0) {
            const responsavel = tokenPayload.nome || tokenPayload.name || 'Administrador Logado';
            setSetoresVinculados(
              setoresDoAdmin.map(setor => ({
                ...setor,
                responsavel
              }))
            );
          } else {
            setSetoresVinculados([]);
          }
        } else {
          console.error("Erro na API. Status code:", response.status);
          setSetoresVinculados([]);
        }
      } catch (error) {
        console.error("Erro ao processar as informações do administrador:", error);
        setSetoresVinculados([]);
      } finally {
        setLoading(false);
      }
    };

    carregarSetorDoAdmin();
  }, []);

  const handleVisualizarDetalhes = (id) => {
    console.log(`Redirecionando para o painel de métricas do setor ID: ${id}`);
    // Exemplo: navigate(`/setores/painel/${id}`);
  };

  return {
    setoresVinculados,
    loading,
    handleVisualizarDetalhes,
  };
}