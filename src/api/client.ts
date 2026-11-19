
import { ApiResponse } from '../types';

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://suraksha-safety-1.onrender.com/api'
).replace(/\/+$/, '');

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

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAccessToken();

    const headers = new Headers(options.headers);

    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
    }

    headers.set('Accept', 'application/json');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const responseText = await response.text();

      let data: any = null;

      if (responseText.trim()) {
        try {
          data = JSON.parse(responseText);
        } catch {
          const preview = responseText
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 180);

          console.error('Non-JSON API response:', {
            url,
            status: response.status,
            contentType: response.headers.get('content-type'),
            response: preview,
          });

          return {
            success: false,
            message:
              `Server returned an invalid response (${response.status}). ` +
              'Check your backend URL and API deployment. ' +
              `Response: ${preview || 'Empty response'}`,
            error: 'INVALID_API_RESPONSE',
          };
        }
      }

      if (!response.ok) {
        if (
          (response.status === 401 || response.status === 403) &&
          endpoint !== '/auth/login' &&
          endpoint !== '/auth/register'
        ) {
          this.clearTokens();
        }

        return {
          success: false,
          message:
            data?.message ||
            `Request failed with status ${response.status}`,
          error: data?.message || `HTTP_${response.status}`,
        };
      }

      if (!data || typeof data !== 'object') {
        return {
          success: false,
          message: 'The server returned an empty or invalid response.',
          error: 'INVALID_RESPONSE',
        };
      }

      return data as ApiResponse<T>;
    } catch (error) {
      console.error('API request failed:', error);

      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Network connection failed. Check your internet and backend server.',
        error: 'NETWORK_ERROR',
      };
    }
  }

  get<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  put<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  patch<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
