import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favoriteRoutinePhases: string[];
  favoriteNutritionPhases: string[];
  toggleRoutineFavorite: (id: string) => void;
  toggleNutritionFavorite: (id: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      // Valores por defecto (Top Comercial)
      favoriteRoutinePhases: ['ADAPTACION', 'HIPERTROFIA', 'AEROBICO_BASE', 'RECOMPOSICION', 'DEFICIT'],
      favoriteNutritionPhases: ['AYUNO_INTERMITENTE', 'RESET_CONDUCTUAL'],
      
      toggleRoutineFavorite: (id) => set((state) => ({
        favoriteRoutinePhases: state.favoriteRoutinePhases.includes(id)
          ? state.favoriteRoutinePhases.filter(favId => favId !== id)
          : [...state.favoriteRoutinePhases, id]
      })),
      
      toggleNutritionFavorite: (id) => set((state) => ({
        favoriteNutritionPhases: state.favoriteNutritionPhases.includes(id)
          ? state.favoriteNutritionPhases.filter(favId => favId !== id)
          : [...state.favoriteNutritionPhases, id]
      })),
    }),
    {
      name: 'trainer-favorites-storage',
    }
  )
);
