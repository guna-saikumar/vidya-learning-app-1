export type UserRole = 'STUDENT' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  department?: string | null;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN';
  department?: string | null;
  emailVerifiedAt?: Date | string | null;
}

export const hasRole = (user: AuthUser | null | undefined, role: UserRole): boolean =>
  !!user && user.role === role;

export const isAdmin = (user: { role?: string } | null | undefined): boolean =>
  !!user && user.role === 'ADMIN';

export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminRegisterInput {
  name: string;
  email: string;
  password: string;
  department?: string;
}

export interface AdminVerifyEmailInput {
  email: string;
  otp: string;
}

export interface AdminForgotPasswordInput {
  email: string;
}

export interface AdminResetPasswordInput {
  email: string;
  otp: string;
  newPassword: string;
}

export interface AdminAuthResponse {
  accessToken: string;
  user: AdminUser;
}
