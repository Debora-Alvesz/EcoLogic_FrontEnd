import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const getUserRoleFromToken = (token) => {
  if (!token) return null;

  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;

    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const decodedPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );

    const payload = JSON.parse(decodedPayload);
    const candidateValues = [
      payload.tipo,
      payload.tipoUsuario,
      payload.role,
      payload.userType,
      payload.type,
      payload.roles,
      payload.authorities,
    ];

    for (const value of candidateValues) {
      if (Array.isArray(value) && value.length > 0) {
        const firstValue = value[0];
        if (typeof firstValue === 'string') {
          const normalized = firstValue.toUpperCase();
          if (normalized.includes('ADMIN')) return 'ADMINISTRADOR';
          if (normalized.includes('DIRETOR')) return 'DIRETOR';
          return firstValue;
        }
      }

      if (typeof value === 'string') {
        const normalized = value.toUpperCase();
        if (normalized.includes('ADMIN')) return 'ADMINISTRADOR';
        if (normalized.includes('DIRETOR')) return 'DIRETOR';
        return value;
      }
    }
  } catch {
    return null;
  }

  return null;
};

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(() => {
    const persistedRole = localStorage.getItem('userRole');
    if (persistedRole) return persistedRole;

    const token = localStorage.getItem('token');
    return getUserRoleFromToken(token);
  });

  useEffect(() => {
    if (userRole) {
      localStorage.setItem('userRole', userRole);
    } else {
      localStorage.removeItem('userRole');
    }
  }, [userRole]);

  useEffect(() => {
    const persistedRole = localStorage.getItem('userRole');
    if (persistedRole) {
      setUserRole(persistedRole);
      return;
    }

    const token = localStorage.getItem('token');
    const roleFromToken = getUserRoleFromToken(token);
    if (roleFromToken) {
      setUserRole(roleFromToken);
    }
  }, []);

  const safeRole = userRole ? userRole.toUpperCase() : '';
  const isAdmin = safeRole === 'ADMINISTRADOR' || safeRole === 'ADMIN';
  const isDiretor = safeRole === 'DIRETOR';

  const clearAuth = () => {
    setUserRole(null);
    localStorage.removeItem('userRole');
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
