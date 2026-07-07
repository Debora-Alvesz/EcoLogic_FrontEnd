import { useState, useMemo, useEffect } from 'react';
import { toast } from 'react-toastify';

const API_BASE_URL = 'http://localhost:8080/api/v1/setores';
// OBS: Ajuste esta URL abaixo para o endpoint real onde você busca os usuários/administradores do sistema
const API_ADMINS_URL = 'http://localhost:8080/api/v1/usuarios/tipo/administradores'; 

export function useSetores() {
  const [setores, setSetores] = useState([]);
  const [administradores, setAdministradores] = useState([]); // Lista para o Select
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados do Modal e Formulário
  const [modalAberto, setModalAberto] = useState(false);
  const [setorEditandoId, setSetorEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    administradorId: ''
  });

  // 1. Buscar setores e administradores do Back-end
  const carregarDados = async () => {
    setLoading(true);
    try {
      const resSetores = await fetch(API_BASE_URL);
      if (resSetores.ok) {
        const dadosSetores = await resSetores.json();
        setSetores(dadosSetores);
      }

      // Busca a lista de administradores para preencher o Select do formulário
      const resAdmins = await fetch(API_ADMINS_URL);
      if (resAdmins.ok) {
        const dadosAdmins = await resAdmins.json();
        setAdministradores(dadosAdmins); 
        // Espera-se que retorne uma lista de objetos com { id: "UUID", nome: "Nome" }
      }
    } catch (error) {
      console.error("Erro ao carregar dados do servidor:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // 2. Controladores do Modal
  const abrirModalCriar = () => {
    setSetorEditandoId(null);
    setFormData({ nome: '', descricao: '', administradorId: '' });
    setModalAberto(true);
  };

  const handleEditar = (setor) => {
    setSetorEditandoId(setor.id);
    setFormData({
      nome: setor.nome,
      descricao: setor.descricao || '',
      administradorId: setor.administradorId
    });
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setSetorEditandoId(null);
  };

  // 3. Salvar (Criar ou Atualizar) - Envia o SetorRequestDto
  const handleSalvar = async (e) => {
    e.preventDefault();

    const url = setorEditandoId ? `${API_BASE_URL}/${setorEditandoId}` : API_BASE_URL;
    const metodo = setorEditandoId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // Bate com o SetorRequestDto
      });

      if (response.ok) {
        fecharModal();
        carregarDados(); // Recarrega a tabela atualizada
      } else {
        const erro = await response.json();
        toast.error(`Erro: ${erro.message || 'Falha ao salvar setor'}`);
      }
    } catch (error) {
      console.error("Erro ao conectar com o servidor:", error);
      toast.error("Erro ao conectar com o servidor.");
    }
  };

  // 4. Excluir Setor
  const handleExcluir = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este setor?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (response.status === 204) {
        carregarDados(); // Recarrega a listagem
      } else {
        toast.error("Erro ao excluir o setor.");
      }
    } catch (error) {
      console.error("Erro ao deletar setor:", error);
      toast.error("Erro ao deletar setor.");
    }
  };

  // 5. Filtro em tempo real no Front-end
  const setoresFiltrados = useMemo(() => {
    return setores.filter((setor) =>
      setor.nome.toLowerCase().includes(busca.toLowerCase())
    );
  }, [setores, busca]);

  // Função auxiliar para descobrir o nome do Administrador na listagem usando o UUID
  const obterNomeAdmin = (uuid) => {
    const admin = administradores.find(a => a.id === uuid);
    return admin ? admin.nome : "Carregando ou Não atribuído...";
  };

  return {
    busca,
    setBusca,
    setoresFiltrados,
    loading,
    modalAberto,
    formData,
    setFormData,
    administradores,
    abrirModalCriar,
    handleEditar,
    handleExcluir,
    handleSalvar,
    fecharModal,
    obterNomeAdmin
  };
}
