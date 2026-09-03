import React from 'react';

interface ClinicalLayoutProps {
  children: React.ReactNode;
}

/**
 * Bounded Context: Nutritionist
 * OKLCH Dichotomy: Clinical Mode (Anti-Fatigue)
 */
export const NutritionistClinicalLayout: React.FC<ClinicalLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-clinical-bg text-zinc-900 transition-colors duration-500">
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};
