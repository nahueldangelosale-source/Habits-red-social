import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// Inicializamos leyendo el localStorage directo para que haga match con el script Anti-FOUC
const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') return 'dark';
    if (stored === 'light') return 'light';
  }
  return 'light'; // Default is always light
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'light' ? 'dark' : 'light';
    
    // Update DOM
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Update raw localStorage for the FOUC script
    localStorage.setItem('theme', newTheme);
    
    return { theme: newTheme };
  }),
  
  setTheme: (theme: Theme) => set(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
    return { theme };
  }),
}));
