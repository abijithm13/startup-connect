import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [userData, setUserData] = useState(() => {
    const stored = localStorage.getItem('userData');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (tokenVal, roleVal, data) => {
    localStorage.setItem('token', tokenVal);
    localStorage.setItem('role', roleVal);
    localStorage.setItem('userData', JSON.stringify(data));
    setToken(tokenVal);
    setRole(roleVal);
    setUserData(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userData');
    setToken(null);
    setRole(null);
    setUserData(null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, role, userData, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}
