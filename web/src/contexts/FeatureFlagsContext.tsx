import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FeatureFlags {
  compassionEngine: boolean;
  magicImportV2: boolean;
  pricingFreedomB2b: boolean;
  checkoutV2Enabled: boolean;
}

const defaultFlags: FeatureFlags = {
  compassionEngine: false,
  magicImportV2: true,
  pricingFreedomB2b: false, // Mantener oculto por defecto
  checkoutV2Enabled: false
};

const FeatureFlagsContext = createContext<FeatureFlags>(defaultFlags);

export const FeatureFlagsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);

  useEffect(() => {
    // Obtenemos los flags del backend al montar el contexto (ej. tras el login)
    const fetchFlags = async () => {
      try {
        const response = await fetch('/api/v1/config/flags');
        if (response.ok) {
          const data = await response.json();
          setFlags({
            compassionEngine: data.compassionEngine ?? false,
            magicImportV2: data.magicImportV2 ?? true,
            pricingFreedomB2b: data.pricingFreedomB2b ?? false,
            checkoutV2Enabled: data.checkoutV2Enabled ?? false
          });
        }
      } catch (error) {
        console.warn('Failed to fetch feature flags, falling back to defaults', error);
      }
    };

    fetchFlags();
  }, []);

  return (
    <FeatureFlagsContext.Provider value={flags}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = () => useContext(FeatureFlagsContext);
