import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

interface TenantBranding {
  primary_color: string;
  secondary_color: string;
  logo_url?: string;
}

interface TenantBrandingContextType {
  branding: TenantBranding | null;
  isLoading: boolean;
}

const TenantBrandingContext = createContext<TenantBrandingContextType>({
  branding: null,
  isLoading: true,
});

export const applyTenantTheme = (primary: string, secondary: string) => {
  const root = document.documentElement;
  root.style.setProperty('--color-tenant-primary', primary);
  root.style.setProperty('--color-tenant-secondary', secondary);
};

export const TenantBrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // In a real scenario, this would hit a /api/v1/tenants/me/branding endpoint
  // We'll mock the fetch for now but use the real apply function
  const { data: branding, isLoading } = useQuery({
    queryKey: ['tenantBranding'],
    queryFn: async () => {
      // Simulate API call for now or use actual endpoint if it exists
      // const res = await api.get('/api/v1/tenants/me/branding');
      // return res.data;
      return {
        primary_color: "#0f172a",
        secondary_color: "#3b82f6",
        logo_url: null
      };
    }
  });

  useEffect(() => {
    if (branding) {
      applyTenantTheme(branding.primary_color, branding.secondary_color);
    }
  }, [branding]);

  return (
    <TenantBrandingContext.Provider value={{ branding: branding || null, isLoading }}>
      {children}
    </TenantBrandingContext.Provider>
  );
};

export const useTenantBranding = () => useContext(TenantBrandingContext);
