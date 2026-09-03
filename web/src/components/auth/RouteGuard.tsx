import React from 'react';
import { Navigate } from 'react-router-dom';

interface RouteGuardProps {
  allowedRoles: string[];
  children: React.ReactElement;
}

const decodeJwtClaims = (token: string) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
};

export const RouteGuard: React.FC<RouteGuardProps> = ({ allowedRoles, children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = decodeJwtClaims(token);
    
    // Check expiration
    if (user.exp && Date.now() >= user.exp * 1000) {
      console.warn(`[Zero-Trust UI] Token expired.`);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user.role)) {
      console.warn(`[Zero-Trust UI] Intento de acceso no autorizado a ruta protegida. Requerido: ${allowedRoles.join(',')}, Actual: ${user.role}`);
      return <Navigate to={user.role === 'PT' || user.role === 'NUTRITIONIST' ? '/trainer' : '/dashboard'} replace />;
    }
    return children;
  } catch (error) {
    console.error(`[Zero-Trust UI] Failed to parse token:`, error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
};
