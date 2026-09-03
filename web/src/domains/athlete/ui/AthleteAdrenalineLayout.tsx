import React from 'react';

interface AdrenalineLayoutProps {
  children: React.ReactNode;
}

/**
 * Bounded Context: Athlete
 * OKLCH Dichotomy: Adrenaline Mode (Anti Black-Smearing)
 */
export const AthleteAdrenalineLayout: React.FC<AdrenalineLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-adrenaline-bg text-zinc-100 transition-colors duration-500">
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};
