import { ApiResponse } from '../types';

const API_BASE_URL = '/api';

class ApiClient {
  private getAccessToken(): string | null {
    return localStorage.getItem('suraksha_access_token');
  }

  private setTokens(access: string, refresh?: string): void {
    localStorage.setItem('suraksha_access_token', access);
    if (refresh) {
      localStorage.setItem('suraksha_refresh_token', refresh);
    }
  }

  public clearTokens(): void {
    localStorage.removeItem('suraksha_access_token');
    localStorage.removeItem('suraksha_refresh_token');
    localStorage.removeItem('suraksha_user');
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // If token expired, clear tokens
          if (endpoint !== '/auth/login' && endpoint !== '/auth/register') {
            this.clearTokens();
          }
        }
        return {
          success: false,
          message: data.message || `Request failed with status ${response.status}`,
          error: data.message,
        };
      }

      return data;
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network connection failed. Please check your connectivity.',
        error: err.message,
      };
    }
  }

  get<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
