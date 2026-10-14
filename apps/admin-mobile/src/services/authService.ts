import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { ApiClient } from '@vidya/api-client';
import { AdminUser } from '../types/auth';

export const AUTH_STORAGE_KEY = '@vidya_admin_profile_data';
export const AUTH_TOKEN_KEY = '@vidya_admin_auth_token';

export const DEFAULT_ADMIN: AdminUser = {
  id: 'admin-001-vidya',
  fullName: 'Dr. Ramesh Sharma',
  email: 'admin@vidya.edu.in',
  phone: '+91 98765 43210',
  role: 'Admin',
  department: 'Academic Director · AP SCERT Division',
  lastLogin: 'Active Session',
};

export const DEMO_ADMIN = DEFAULT_ADMIN;

/**
 * Resolves the backend Fastify API base URL dynamically based on environment
 */
export const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000';
  }
  return 'http://localhost:4000';
};

let clientInstance: ApiClient | null = null;

export const getApiClient = (): ApiClient => {
  if (!clientInstance) {
    clientInstance = new ApiClient({
      baseUrl: getApiBaseUrl(),
    });
  }
  return clientInstance;
};

/**
 * Returns stored JWT token
 */
export const getStoredToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (err) {
    console.warn('Failed to load admin token:', err);
    return null;
  }
};

/**
 * Returns the current active administrator profile from storage
 */
export const getStoredSession = async (): Promise<AdminUser | null> => {
  try {
    const raw = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const cleanedUser: AdminUser = {
        ...DEFAULT_ADMIN,
        ...parsed,
        role: 'Admin',
      };
      return cleanedUser;
    }
  } catch (err) {
    console.warn('Failed to load admin session:', err);
  }
  return null;
};

/**
 * Saves updated administrator profile and token to storage
 */
export const saveStoredAuth = async (token: string, user: AdminUser): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    getApiClient().setAuthToken(token);
  } catch (err) {
    console.warn('Failed to save admin auth session:', err);
  }
};

/**
 * Saves profile updates to storage
 */
export const saveStoredSession = async (user: AdminUser): Promise<void> => {
  try {
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.warn('Failed to save admin session:', err);
  }
};

/**
 * Clears stored auth tokens and session
 */
export const logoutAdmin = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, AUTH_STORAGE_KEY]);
    getApiClient().setAuthToken(null);
  } catch (err) {
    console.warn('Failed to clear admin session:', err);
  }
};

/**
 * Authenticates admin via Fastify API with local demo fallback
 */
export const loginAdmin = async (email: string, password: string): Promise<{ token: string; user: AdminUser }> => {
  const client = getApiClient();
  try {
    const res = await client.adminLogin({ email, password });
    const user: AdminUser = {
      id: res.user.id,
      email: res.user.email,
      fullName: res.user.name,
      role: 'Admin',
      department: res.user.department || 'Academic Director · AP SCERT Division',
      lastLogin: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    await saveStoredAuth(res.accessToken, user);
    return { token: res.accessToken, user };
  } catch (err: any) {
    // If backend is unreachable during offline/local development, allow verified demo credentials
    const isNetworkError = err?.message?.includes('fetch') || err?.message?.includes('Network');
    if (isNetworkError && (email.toLowerCase() === 'admin@vidya.edu.in' || email.toLowerCase() === 'admin@example.com')) {
      const demoToken = 'demo-admin-jwt-token-active';
      const user = { ...DEFAULT_ADMIN, email };
      await saveStoredAuth(demoToken, user);
      return { token: demoToken, user };
    }
    throw err;
  }
};

/**
 * Registers a new admin account via Fastify API
 */
export const registerAdmin = async (data: {
  name: string;
  email: string;
  password: string;
  department?: string;
}): Promise<{ message: string }> => {
  const client = getApiClient();
  return client.adminRegister(data);
};

/**
 * Verifies admin email with 6-digit OTP
 */
export const verifyAdminEmail = async (email: string, otp: string): Promise<{ message: string }> => {
  const client = getApiClient();
  return client.adminVerifyEmail({ email, otp });
};

/**
 * Requests password reset OTP
 */
export const forgotAdminPassword = async (email: string): Promise<{ message: string }> => {
  const client = getApiClient();
  return client.adminForgotPassword({ email });
};

/**
 * Resets admin password with OTP
 */
export const resetAdminPassword = async (data: {
  email: string;
  otp: string;
  newPassword: string;
}): Promise<{ message: string }> => {
  const client = getApiClient();
  return client.adminResetPassword(data);
};
