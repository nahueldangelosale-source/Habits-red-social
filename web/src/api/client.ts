import { useBillingStore } from '../stores/billingStore';
import { conflictEmitter } from './conflictEmitter';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// Type definitions for custom API errors
export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

/**
 * Interceptor global de red para el Frontend.
 * Construye el escudo cliente capturando de manera atómica:
 * - 402 Payment Required: Gatilla el Glassmorphic Soft-Lock vía useBillingStore.
 * - 422 Unprocessable Entity: Alerta sobre mismatch en el contrato de Pydantic v2.
 */
export async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const targetUrl = url.startsWith('http') 
    ? url 
    : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

  let token = localStorage.getItem('token');
  
  // No auto-injecting demo tokens anymore. This broke the real auth flow.

  const headers = new Headers(options.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(targetUrl, {
    ...options,
    headers,
  });
  
  if (response.status === 402) {
    // Bloqueo FinOps (The Glass Wall)
    console.warn("FINOPS_BLOCK: The current tenant has a past_due subscription. Activating Glassmorphic Soft-Lock.");
    useBillingStore.getState().setPastDue(true);
    throw new ApiError(402, "FINOPS_BLOCK: Payment required");
  }
  
  if (response.status === 422) {
    // Error Estricto de Contrato (Pydantic Schema Mismatch)
    const errorData = await response.json();
    console.error("SCHEMA_MISMATCH: Error de contrato con el Backend (Pydantic v2):", errorData);
    throw new ApiError(422, "SCHEMA_MISMATCH: Invalid data format", errorData);
  }

  if (response.status === 401 || response.status === 403) {
    // Evitar loop infinito si el refresh mismo falla
    if (targetUrl.includes('/api/v1/auth-b2c/refresh')) {
      throw new ApiError(response.status, "UNAUTHORIZED");
    }
    
    // Intentar refresh de forma síncrona/secuencial
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/api/v1/auth-b2c/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include' // Enviar HttpOnly cookie
      });
      
      if (!refreshResponse.ok) {
        throw new Error("Refresh failed");
      }
      
      const refreshData = await refreshResponse.json();
      localStorage.setItem('token', refreshData.access_token);
      
      // Reintentar request original
      const newHeaders = new Headers(options.headers || {});
      newHeaders.set('Authorization', `Bearer ${refreshData.access_token}`);
      
      const retryResponse = await fetch(targetUrl, { ...options, headers: newHeaders });
      
      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => null);
        throw new ApiError(retryResponse.status, "API_ERROR", errorData);
      }
      
      if (retryResponse.status === 204) return null as unknown as T;
      return retryResponse.json();
      
    } catch (error) {
      console.warn("Session expired or refresh failed");
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Dispatch event so AuthContext can cleanly log out without hard reloads
      window.dispatchEvent(new Event('auth:unauthorized'));
      
      throw new ApiError(401, "UNAUTHORIZED");
    }
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    if (response.status === 409 && errorData?.detail?.conflict_session) {
      conflictEmitter.emit(errorData.detail);
    }

    throw new ApiError(response.status, "API_ERROR", errorData);
  }
  
  // Si no hay contenido (ej. DELETE 204), retornamos null casteado.
  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json();
}

// Retro-compatibility with the 'api' object pattern
export const api = {
    get: <T>(url: string) => apiRequest<T>(url, { method: 'GET', credentials: 'include' }),
    post: <T>(url: string, body?: any) => apiRequest<T>(url, { 
        method: 'POST', 
        body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
        credentials: 'include'
    }),
    put: <T>(url: string, body?: any) => apiRequest<T>(url, { 
        method: 'PUT', 
        body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
        credentials: 'include'
    }),
    patch: <T>(url: string, body?: any) => apiRequest<T>(url, { 
        method: 'PATCH', 
        body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
        credentials: 'include'
    }),
    delete: <T>(url: string) => apiRequest<T>(url, { method: 'DELETE', credentials: 'include' })
};
