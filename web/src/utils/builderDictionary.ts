export type Discipline = 'STRENGTH' | 'YOGA' | 'CROSSFIT' | 'CLINICAL' | 'ENDURANCE';

export interface BuilderLabels {
  program: string;
  phase: string;
  week: string;
  day: string;
  createPhase: string;
  createDay: string;
}

export const getBuilderLabels = (discipline: Discipline): BuilderLabels => {
  switch (discipline) {
    case 'YOGA':
      return {
        program: 'Programa',
        phase: 'Módulo',
        week: 'Semana',
        day: 'Clase',
        createPhase: 'Añadir Módulo',
        createDay: 'Añadir Clase'
      };
    case 'CROSSFIT':
      return {
        program: 'Programa',
        phase: 'Módulo',
        week: 'Semana',
        day: 'WOD',
        createPhase: 'Añadir Módulo',
        createDay: 'Añadir WOD'
      };
    case 'ENDURANCE':
      return {
        program: 'Ciclo',
        phase: 'Bloque',
        week: 'Semana',
        day: 'Sesión',
        createPhase: 'Añadir Bloque',
        createDay: 'Añadir Sesión'
      };
    case 'CLINICAL':
      return {
        program: 'Tratamiento',
        phase: 'Fase',
        week: 'Semana',
        day: 'Sesión',
        createPhase: 'Añadir Fase',
        createDay: 'Añadir Sesión'
      };
    case 'STRENGTH':
    default:
      return {
        program: 'Macrociclo',
        phase: 'Mesociclo',
        week: 'Microciclo',
        day: 'Día',
        createPhase: 'Añadir Mesociclo',
        createDay: 'Añadir Día'
      };
  }
};
