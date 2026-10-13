import React, { createContext, useContext, useState } from 'react';
import { AdminUser } from '../types/auth';
import { DEMO_ADMIN } from '../services/authService';

interface AdminAuthContextType {
  user: AdminUser;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: DEMO_ADMIN,
  loading: false,
  login: async () => {},
  logout: async () => {},
});

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useState<AdminUser>(DEMO_ADMIN);

  const login = async () => {};
  const logout = async () => {};

  return (
    <AdminAuthContext.Provider value={{ user, loading: false, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
