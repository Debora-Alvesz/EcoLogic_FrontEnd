import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // O estado 'userRole' armazenará o tipo de usuário: 'administrador', 'diretor', etc.
  // Inicializa lendo do localStorage para manter a sessão ao recarregar a página
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || null);

  // Sincroniza o estado com o localStorage toda vez que ele for atualizado
  useEffect(() => {
    if (userRole) {
      localStorage.setItem('userRole', userRole);
    } else {
      localStorage.removeItem('userRole');
    }
  }, [userRole]);

  // Função utilitária para verificar se é admin
  const safeRole = userRole ? userRole.toUpperCase() : '';
  const isAdmin = safeRole === 'ADMINISTRADOR' || safeRole === 'ADMIN';
  
  // Função utilitária para verificar se é diretor
  const isDiretor = safeRole === 'DIRETOR';

  // Função para limpar o estado (útil no logout)
  const clearAuth = () => {
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ userRole, setUserRole, isAdmin, isDiretor, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso do contexto em outros componentes
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
