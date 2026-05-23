import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rr_user')); } catch { return null; }
  });

  const login = (token, userData) => {
    localStorage.setItem('rr_token', token);
    localStorage.setItem('rr_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('rr_token');
    localStorage.removeItem('rr_user');
    setUser(null);
  };

  // New: Update user data (e.g., after profile picture upload)
  const updateUser = (updatedUserData) => {
    localStorage.setItem('rr_user', JSON.stringify(updatedUserData));
    setUser(updatedUserData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);