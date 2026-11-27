import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pt_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('pt_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then((me) => {
        setUser(me);
        localStorage.setItem('pt_user', JSON.stringify(me));
      })
      .catch(() => {
        localStorage.removeItem('pt_token');
        localStorage.removeItem('pt_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persistSession = (authResponse) => {
    if (authResponse?.token) {
      localStorage.setItem('pt_token', authResponse.token);
    }
    const userData = {
      userId: authResponse.userId,
      username: authResponse.username,
      email: authResponse.email,
      role: authResponse.role,
      fullName: authResponse.fullName,
      studentId: authResponse.studentId,
    };
    localStorage.setItem('pt_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const login = async (identifier, password) => {
    const res = await authService.login({ identifier, password });
    return persistSession(res);
  };

  const register = async (payload) => {
    const res = await authService.register(payload);
    return persistSession(res);
  };

  const logout = async () => {
    await authService.logout();
    localStorage.removeItem('pt_token');
    localStorage.removeItem('pt_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === 'ADMIN',
        isStudent: user?.role === 'STUDENT',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
