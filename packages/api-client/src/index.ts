import type {
  AdminAuthResponse,
  AdminForgotPasswordInput,
  AdminLoginInput,
  AdminRegisterInput,
  AdminResetPasswordInput,
  AdminUser,
  AdminVerifyEmailInput,
} from '@vidya/auth';

export interface ApiClientOptions {
  baseUrl: string;
  authToken?: string | null;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private authToken: string | null = null;

  constructor(private readonly options: ApiClientOptions) {
    this.authToken = options.authToken ?? null;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.options.baseUrl}${path}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = data?.error || data?.message || `Request failed with status ${res.status}`;
      throw new ApiError(message, res.status, data);
    }
    return data as T;
  }

  async post<T>(path: string, body?: any): Promise<T> {
    const res = await fetch(`${this.options.baseUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const message = data?.error || data?.message || `Request failed with status ${res.status}`;
      throw new ApiError(message, res.status, data);
    }
    return data as T;
  }

  // Admin Auth API endpoints
  async adminLogin(body: AdminLoginInput): Promise<AdminAuthResponse> {
    const result = await this.post<AdminAuthResponse>('/api/admin/auth/login', body);
    if (result.accessToken) {
      this.setAuthToken(result.accessToken);
    }
    return result;
  }

  async adminRegister(body: AdminRegisterInput): Promise<{ message: string }> {
    return this.post<{ message: string }>('/api/admin/auth/register', body);
  }

  async adminVerifyEmail(body: AdminVerifyEmailInput): Promise<{ message: string }> {
    return this.post<{ message: string }>('/api/admin/auth/verify-email', body);
  }

  async adminForgotPassword(body: AdminForgotPasswordInput): Promise<{ message: string }> {
    return this.post<{ message: string }>('/api/admin/auth/forgot-password', body);
  }

  async adminResetPassword(body: AdminResetPasswordInput): Promise<{ message: string }> {
    return this.post<{ message: string }>('/api/admin/auth/reset-password', body);
  }

  async adminMe(): Promise<AdminUser> {
    return this.get<AdminUser>('/api/admin/auth/me');
  }
}
