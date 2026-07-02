import { createContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      setUser(parsed);
      apiService.setToken(parsed.token);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await apiService.login({ email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    apiService.setToken(data.token);
    return data;
  };

  const register = async (userData) => {
    const data = await apiService.register(userData);
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    apiService.setToken(data.token);
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    apiService.setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
