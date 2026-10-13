import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdminUser, AdminSession } from '../types/auth';

const AUTH_STORAGE_KEY = '@vidya_admin_auth_session';

export const DEMO_ADMIN: AdminUser = {
  id: 'admin-001-vidya',
  email: 'admin@vidya.edu.in',
  fullName: 'Dr. Ramesh Sharma',
  role: 'ADMIN',
  department: 'Academic Director · AP SCERT Division',
  lastLogin: 'Active Session',
};

/**
 * Returns the current active administrator profile directly (no login required)
 */
export const getStoredSession = async (): Promise<AdminUser> => {
  return DEMO_ADMIN;
};

/**
 * Direct login bypass
 */
export const loginAdmin = async (email?: string, password?: string): Promise<AdminUser> => {
  return DEMO_ADMIN;
};

/**
 * Reset local session or cache
 */
export const logoutAdmin = async (): Promise<void> => {
  await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
};
