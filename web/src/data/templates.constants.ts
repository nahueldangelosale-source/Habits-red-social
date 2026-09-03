import type { RoutineExercise } from '../stores/usePlanBuilderStore';

export interface ArchetypeTemplate {
  id: string;
  name: string;
  days: {
    title: string;
    exercises: Omit<RoutineExercise, 'id' | 'type'>[];
  }[];
}

// Estos exercise IDs asumen la base de datos de EXERCISES_DATABASE
export const ARCHETYPE_TEMPLATES: Record<string, ArchetypeTemplate> = {
  // Hipertrofia 3 Días (Push / Pull / Legs)
  'hypertrophy_3': {
    id: 'hypertrophy_3',
    name: 'Hipertrofia - Push/Pull/Legs (3 Días)',
    days: [
      {
        title: 'Día 1 - Push',
        exercises: [
          { exercise: { ID_Ejercicio: 'PRESS_001', Nombre_Oficial: 'Press de Banca Plano con Barra', Alias_Buscador: '', Patron_Movimiento: 'Empuje Horizontal', Lateralidad: 'Bilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Pectoral Mayor', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Barra', Nivel_Habilidad: '3', Nivel_Impacto_Articular: 'Medio' }, sets: '4', reps: '8-10', weight: 'Auto', rpe: '8', videoUrl: '', progression: '+2.5kg' },
          { exercise: { ID_Ejercicio: 'PRESS_002', Nombre_Oficial: 'Press Militar con Barra', Alias_Buscador: '', Patron_Movimiento: 'Empuje Vertical', Lateralidad: 'Bilateral', Carga_Axial: 'SÍ', Musculo_Agonista: 'Deltoides Anterior', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Barra', Nivel_Habilidad: '3', Nivel_Impacto_Articular: 'Alto' }, sets: '3', reps: '10-12', weight: 'Auto', rpe: '8', videoUrl: '', progression: '' },
          { exercise: { ID_Ejercicio: 'PRESS_005', Nombre_Oficial: 'Fondos en Paralelas', Alias_Buscador: '', Patron_Movimiento: 'Empuje Vertical', Lateralidad: 'Bilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Tríceps', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Peso Corporal', Nivel_Habilidad: '3', Nivel_Impacto_Articular: 'Alto' }, sets: '3', reps: 'Al fallo', weight: 'Auto', rpe: '9', videoUrl: '', progression: '' }
        ]
      },
      {
        title: 'Día 2 - Pull',
        exercises: [
          { exercise: { ID_Ejercicio: 'PULL_001', Nombre_Oficial: 'Dominadas Pronas', Alias_Buscador: '', Patron_Movimiento: 'Tracción Vertical', Lateralidad: 'Bilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Dorsal Ancho', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Peso Corporal', Nivel_Habilidad: '4', Nivel_Impacto_Articular: 'Bajo' }, sets: '4', reps: '8-10', weight: 'Auto', rpe: '8', videoUrl: '', progression: '' },
          { exercise: { ID_Ejercicio: 'PULL_003', Nombre_Oficial: 'Remo con Barra', Alias_Buscador: '', Patron_Movimiento: 'Tracción Horizontal', Lateralidad: 'Bilateral', Carga_Axial: 'SÍ', Musculo_Agonista: 'Dorsal Ancho', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Barra', Nivel_Habilidad: '4', Nivel_Impacto_Articular: 'Alto' }, sets: '4', reps: '10-12', weight: 'Auto', rpe: '8', videoUrl: '', progression: '+2.5kg' },
          { exercise: { ID_Ejercicio: 'PULL_007', Nombre_Oficial: 'Curl de Bíceps con Barra', Alias_Buscador: '', Patron_Movimiento: 'Flexión de Codo', Lateralidad: 'Bilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Bíceps', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Barra', Nivel_Habilidad: '2', Nivel_Impacto_Articular: 'Bajo' }, sets: '3', reps: '12-15', weight: 'Auto', rpe: '8.5', videoUrl: '', progression: '' }
        ]
      },
      {
        title: 'Día 3 - Legs',
        exercises: [
          { exercise: { ID_Ejercicio: 'SQUAT_001', Nombre_Oficial: 'Sentadilla Trasera con Barra', Alias_Buscador: '', Patron_Movimiento: 'Dominante de Rodilla', Lateralidad: 'Bilateral', Carga_Axial: 'SÍ', Musculo_Agonista: 'Cuádriceps', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Barra', Nivel_Habilidad: '4', Nivel_Impacto_Articular: 'Medio' }, sets: '4', reps: '6-8', weight: 'Auto', rpe: '8.5', videoUrl: '', progression: '+5kg' },
          { exercise: { ID_Ejercicio: 'PULL_004', Nombre_Oficial: 'Peso Muerto Rumano', Alias_Buscador: '', Patron_Movimiento: 'Dominante de Cadera', Lateralidad: 'Bilateral', Carga_Axial: 'SÍ', Musculo_Agonista: 'Isquiosurales', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Barra', Nivel_Habilidad: '4', Nivel_Impacto_Articular: 'Alto' }, sets: '4', reps: '8-10', weight: 'Auto', rpe: '8', videoUrl: '', progression: '' },
          { exercise: { ID_Ejercicio: 'SQUAT_004', Nombre_Oficial: 'Prensa de Piernas', Alias_Buscador: '', Patron_Movimiento: 'Dominante de Rodilla', Lateralidad: 'Bilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Cuádriceps', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Máquina', Nivel_Habilidad: '1', Nivel_Impacto_Articular: 'Bajo' }, sets: '3', reps: '12-15', weight: 'Auto', rpe: '9', videoUrl: '', progression: '' }
        ]
      }
    ]
  },
  
  // Fuerza Base 4 Días (Upper / Lower / Upper / Lower)
  'strength_4': {
    id: 'strength_4',
    name: 'Fuerza Base - Upper/Lower (4 Días)',
    days: [
      {
        title: 'Día 1 - Fuerza Upper',
        exercises: [
          { exercise: { ID_Ejercicio: 'PRESS_001', Nombre_Oficial: 'Press de Banca Plano con Barra', Alias_Buscador: '', Patron_Movimiento: 'Empuje Horizontal', Lateralidad: 'Bilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Pectoral Mayor', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Barra', Nivel_Habilidad: '3', Nivel_Impacto_Articular: 'Medio' }, sets: '5', reps: '5', weight: 'Auto', rpe: '8.5', videoUrl: '', progression: '+2.5kg' },
          { exercise: { ID_Ejercicio: 'PULL_003', Nombre_Oficial: 'Remo con Barra', Alias_Buscador: '', Patron_Movimiento: 'Tracción Horizontal', Lateralidad: 'Bilateral', Carga_Axial: 'SÍ', Musculo_Agonista: 'Dorsal Ancho', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Barra', Nivel_Habilidad: '4', Nivel_Impacto_Articular: 'Alto' }, sets: '5', reps: '5', weight: 'Auto', rpe: '8.5', videoUrl: '', progression: '+2.5kg' }
        ]
      },
      {
        title: 'Día 2 - Fuerza Lower',
        exercises: [
          { exercise: { ID_Ejercicio: 'SQUAT_001', Nombre_Oficial: 'Sentadilla Trasera con Barra', Alias_Buscador: '', Patron_Movimiento: 'Dominante de Rodilla', Lateralidad: 'Bilateral', Carga_Axial: 'SÍ', Musculo_Agonista: 'Cuádriceps', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Barra', Nivel_Habilidad: '4', Nivel_Impacto_Articular: 'Medio' }, sets: '5', reps: '5', weight: 'Auto', rpe: '8.5', videoUrl: '', progression: '+5kg' },
          { exercise: { ID_Ejercicio: 'PULL_004', Nombre_Oficial: 'Peso Muerto Rumano', Alias_Buscador: '', Patron_Movimiento: 'Dominante de Cadera', Lateralidad: 'Bilateral', Carga_Axial: 'SÍ', Musculo_Agonista: 'Isquiosurales', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Barra', Nivel_Habilidad: '4', Nivel_Impacto_Articular: 'Alto' }, sets: '3', reps: '8', weight: 'Auto', rpe: '8', videoUrl: '', progression: '' }
        ]
      },
      {
        title: 'Día 3 - Hipertrofia Upper',
        exercises: [
          { exercise: { ID_Ejercicio: 'PRESS_002', Nombre_Oficial: 'Press Militar con Barra', Alias_Buscador: '', Patron_Movimiento: 'Empuje Vertical', Lateralidad: 'Bilateral', Carga_Axial: 'SÍ', Musculo_Agonista: 'Deltoides Anterior', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Barra', Nivel_Habilidad: '3', Nivel_Impacto_Articular: 'Alto' }, sets: '4', reps: '8-10', weight: 'Auto', rpe: '8', videoUrl: '', progression: '' },
          { exercise: { ID_Ejercicio: 'PULL_001', Nombre_Oficial: 'Dominadas Pronas', Alias_Buscador: '', Patron_Movimiento: 'Tracción Vertical', Lateralidad: 'Bilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Dorsal Ancho', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Peso Corporal', Nivel_Habilidad: '4', Nivel_Impacto_Articular: 'Bajo' }, sets: '4', reps: '8-10', weight: 'Auto', rpe: '8', videoUrl: '', progression: '' }
        ]
      },
      {
        title: 'Día 4 - Hipertrofia Lower',
        exercises: [
          { exercise: { ID_Ejercicio: 'SQUAT_004', Nombre_Oficial: 'Prensa de Piernas', Alias_Buscador: '', Patron_Movimiento: 'Dominante de Rodilla', Lateralidad: 'Bilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Cuádriceps', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Máquina', Nivel_Habilidad: '1', Nivel_Impacto_Articular: 'Bajo' }, sets: '4', reps: '10-12', weight: 'Auto', rpe: '8', videoUrl: '', progression: '' },
          { exercise: { ID_Ejercicio: 'SQUAT_008', Nombre_Oficial: 'Zancadas con Mancuernas', Alias_Buscador: '', Patron_Movimiento: 'Dominante de Rodilla', Lateralidad: 'Unilateral', Carga_Axial: 'SÍ', Musculo_Agonista: 'Cuádriceps', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Mancuernas', Nivel_Habilidad: '3', Nivel_Impacto_Articular: 'Medio' }, sets: '3', reps: '12', weight: 'Auto', rpe: '8', videoUrl: '', progression: '' }
        ]
      }
    ]
  },

  // Acondicionamiento 3 Días (Full Body Metabólico)
  'fat_loss_3': {
    id: 'fat_loss_3',
    name: 'Acondicionamiento Metabólico (3 Días)',
    days: [
      {
        title: 'Día 1 - Full Body A',
        exercises: [
          { exercise: { ID_Ejercicio: 'SQUAT_003', Nombre_Oficial: 'Sentadilla Copa', Alias_Buscador: '', Patron_Movimiento: 'Dominante de Rodilla', Lateralidad: 'Bilateral', Carga_Axial: 'SÍ', Musculo_Agonista: 'Cuádriceps', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Mancuernas', Nivel_Habilidad: '2', Nivel_Impacto_Articular: 'Bajo' }, sets: '4', reps: '15', weight: 'Auto', rpe: '8', videoUrl: '', progression: '' },
          { exercise: { ID_Ejercicio: 'PRESS_003', Nombre_Oficial: 'Press de Banca Inclinado con Mancuernas', Alias_Buscador: '', Patron_Movimiento: 'Empuje Horizontal', Lateralidad: 'Unilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Pectoral Mayor', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Mancuernas', Nivel_Habilidad: '2', Nivel_Impacto_Articular: 'Medio' }, sets: '4', reps: '12-15', weight: 'Auto', rpe: '8', videoUrl: '', progression: '' },
          { exercise: { ID_Ejercicio: 'PULL_002', Nombre_Oficial: 'Jalón al Pecho', Alias_Buscador: '', Patron_Movimiento: 'Tracción Vertical', Lateralidad: 'Bilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Dorsal Ancho', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Máquina', Nivel_Habilidad: '1', Nivel_Impacto_Articular: 'Bajo' }, sets: '4', reps: '15', weight: 'Auto', rpe: '8', videoUrl: '', progression: '' }
        ]
      },
      {
        title: 'Día 2 - Full Body B',
        exercises: [
          { exercise: { ID_Ejercicio: 'PULL_004', Nombre_Oficial: 'Peso Muerto Rumano', Alias_Buscador: '', Patron_Movimiento: 'Dominante de Cadera', Lateralidad: 'Bilateral', Carga_Axial: 'SÍ', Musculo_Agonista: 'Isquiosurales', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Barra', Nivel_Habilidad: '4', Nivel_Impacto_Articular: 'Alto' }, sets: '4', reps: '12-15', weight: 'Auto', rpe: '8', videoUrl: '', progression: '' },
          { exercise: { ID_Ejercicio: 'PRESS_004', Nombre_Oficial: 'Press Militar con Mancuernas', Alias_Buscador: '', Patron_Movimiento: 'Empuje Vertical', Lateralidad: 'Unilateral', Carga_Axial: 'SÍ', Musculo_Agonista: 'Deltoides Anterior', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Mancuernas', Nivel_Habilidad: '2', Nivel_Impacto_Articular: 'Medio' }, sets: '4', reps: '12-15', weight: 'Auto', rpe: '8', videoUrl: '', progression: '' },
          { exercise: { ID_Ejercicio: 'PULL_005', Nombre_Oficial: 'Remo en Máquina', Alias_Buscador: '', Patron_Movimiento: 'Tracción Horizontal', Lateralidad: 'Bilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Dorsal Ancho', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Máquina', Nivel_Habilidad: '1', Nivel_Impacto_Articular: 'Bajo' }, sets: '4', reps: '15', weight: 'Auto', rpe: '8', videoUrl: '', progression: '' }
        ]
      },
      {
        title: 'Día 3 - Circuito C',
        exercises: [
          { exercise: { ID_Ejercicio: 'SQUAT_008', Nombre_Oficial: 'Zancadas con Mancuernas', Alias_Buscador: '', Patron_Movimiento: 'Dominante de Rodilla', Lateralidad: 'Unilateral', Carga_Axial: 'SÍ', Musculo_Agonista: 'Cuádriceps', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Mancuernas', Nivel_Habilidad: '3', Nivel_Impacto_Articular: 'Medio' }, sets: '4', reps: '12 por lado', weight: 'Auto', rpe: '8', videoUrl: '', progression: '' },
          { exercise: { ID_Ejercicio: 'PRESS_005', Nombre_Oficial: 'Fondos en Paralelas', Alias_Buscador: '', Patron_Movimiento: 'Empuje Vertical', Lateralidad: 'Bilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Tríceps', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Peso Corporal', Nivel_Habilidad: '3', Nivel_Impacto_Articular: 'Alto' }, sets: '4', reps: 'Al fallo', weight: 'Auto', rpe: '9', videoUrl: '', progression: '' },
          { exercise: { ID_Ejercicio: 'PULL_007', Nombre_Oficial: 'Curl de Bíceps con Barra', Alias_Buscador: '', Patron_Movimiento: 'Flexión de Codo', Lateralidad: 'Bilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Bíceps', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Barra', Nivel_Habilidad: '2', Nivel_Impacto_Articular: 'Bajo' }, sets: '4', reps: '15', weight: 'Auto', rpe: '8', videoUrl: '', progression: '' }
        ]
      }
    ]
  },

  // Recomposición Corporal 3 Días (Full Body A/B/C)
  'recomp_3': {
    id: 'recomp_3',
    name: 'Recomposición Corporal (3 Días)',
    days: [
      {
        title: 'Día A - Dominancia Rodilla / Empuje Horiz.',
        exercises: [
          { exercise: { ID_Ejercicio: 'SQUAT_001', Nombre_Oficial: 'Sentadilla Trasera con Barra', Alias_Buscador: '', Patron_Movimiento: 'Dominante de Rodilla', Lateralidad: 'Bilateral', Carga_Axial: 'SÍ', Musculo_Agonista: 'Cuádriceps', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Barra', Nivel_Habilidad: '4', Nivel_Impacto_Articular: 'Medio' }, sets: '3', reps: '5-8', weight: 'Auto', rpe: '8', videoUrl: '', progression: '+5kg' },
          { exercise: { ID_Ejercicio: 'PRESS_001', Nombre_Oficial: 'Press de Banca Plano con Barra', Alias_Buscador: '', Patron_Movimiento: 'Empuje Horizontal', Lateralidad: 'Bilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Pectoral Mayor', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Barra', Nivel_Habilidad: '3', Nivel_Impacto_Articular: 'Medio' }, sets: '3', reps: '6-10', weight: 'Auto', rpe: '8', videoUrl: '', progression: '+2.5kg' },
          { exercise: { ID_Ejercicio: 'PULL_003', Nombre_Oficial: 'Remo con Barra', Alias_Buscador: '', Patron_Movimiento: 'Tracción Horizontal', Lateralidad: 'Bilateral', Carga_Axial: 'SÍ', Musculo_Agonista: 'Dorsal Ancho', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Barra', Nivel_Habilidad: '4', Nivel_Impacto_Articular: 'Alto' }, sets: '3', reps: '8-12', weight: 'Auto', rpe: '8-9', videoUrl: '', progression: '+2.5kg' },
          { exercise: { ID_Ejercicio: 'PULL_004', Nombre_Oficial: 'Peso Muerto Rumano', Alias_Buscador: '', Patron_Movimiento: 'Dominante de Cadera', Lateralidad: 'Bilateral', Carga_Axial: 'SÍ', Musculo_Agonista: 'Isquiosurales', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Barra', Nivel_Habilidad: '4', Nivel_Impacto_Articular: 'Alto' }, sets: '2', reps: '10-15', weight: 'Auto', rpe: '8', videoUrl: '', progression: '' }
        ]
      },
      {
        title: 'Día B - Dominancia Cadera / Empuje Vert.',
        exercises: [
          { exercise: { ID_Ejercicio: 'PULL_004', Nombre_Oficial: 'Peso Muerto Rumano', Alias_Buscador: '', Patron_Movimiento: 'Dominante de Cadera', Lateralidad: 'Bilateral', Carga_Axial: 'SÍ', Musculo_Agonista: 'Isquiosurales', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Barra', Nivel_Habilidad: '4', Nivel_Impacto_Articular: 'Alto' }, sets: '3', reps: '5-8', weight: 'Auto', rpe: '7-8', videoUrl: '', progression: '+5kg' },
          { exercise: { ID_Ejercicio: 'PRESS_002', Nombre_Oficial: 'Press Militar con Barra', Alias_Buscador: '', Patron_Movimiento: 'Empuje Vertical', Lateralidad: 'Bilateral', Carga_Axial: 'SÍ', Musculo_Agonista: 'Deltoides Anterior', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Barra', Nivel_Habilidad: '3', Nivel_Impacto_Articular: 'Alto' }, sets: '3', reps: '6-10', weight: 'Auto', rpe: '8-9', videoUrl: '', progression: '+2.5kg' },
          { exercise: { ID_Ejercicio: 'PULL_001', Nombre_Oficial: 'Dominadas Pronas', Alias_Buscador: '', Patron_Movimiento: 'Tracción Vertical', Lateralidad: 'Bilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Dorsal Ancho', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Peso Corporal', Nivel_Habilidad: '4', Nivel_Impacto_Articular: 'Bajo' }, sets: '3', reps: '8-12', weight: 'Auto', rpe: '8-9', videoUrl: '', progression: '' },
          { exercise: { ID_Ejercicio: 'PRESS_003', Nombre_Oficial: 'Press de Banca Inclinado con Mancuernas', Alias_Buscador: '', Patron_Movimiento: 'Empuje Horizontal', Lateralidad: 'Unilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Pectoral Mayor', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Mancuernas', Nivel_Habilidad: '2', Nivel_Impacto_Articular: 'Medio' }, sets: '2', reps: '10-15', weight: 'Auto', rpe: '8', videoUrl: '', progression: '' }
        ]
      },
      {
        title: 'Día C - Consolidación / Hipertrofia Metabólica',
        exercises: [
          { exercise: { ID_Ejercicio: 'SQUAT_004', Nombre_Oficial: 'Prensa de Piernas', Alias_Buscador: '', Patron_Movimiento: 'Dominante de Rodilla', Lateralidad: 'Bilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Cuádriceps', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Máquina', Nivel_Habilidad: '1', Nivel_Impacto_Articular: 'Bajo' }, sets: '3', reps: '8-12', weight: 'Auto', rpe: '8', videoUrl: '', progression: '+5kg' },
          { exercise: { ID_Ejercicio: 'PULL_005', Nombre_Oficial: 'Remo en Máquina', Alias_Buscador: '', Patron_Movimiento: 'Tracción Horizontal', Lateralidad: 'Bilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Dorsal Ancho', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Máquina', Nivel_Habilidad: '1', Nivel_Impacto_Articular: 'Bajo' }, sets: '3', reps: '10-15', weight: 'Auto', rpe: '9', videoUrl: '', progression: '' },
          { exercise: { ID_Ejercicio: 'PRESS_004', Nombre_Oficial: 'Press Militar con Mancuernas', Alias_Buscador: '', Patron_Movimiento: 'Empuje Vertical', Lateralidad: 'Unilateral', Carga_Axial: 'SÍ', Musculo_Agonista: 'Deltoides Anterior', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Mancuernas', Nivel_Habilidad: '2', Nivel_Impacto_Articular: 'Medio' }, sets: '3', reps: '8-12', weight: 'Auto', rpe: '8-9', videoUrl: '', progression: '' },
          { exercise: { ID_Ejercicio: 'SQUAT_008', Nombre_Oficial: 'Zancadas con Mancuernas', Alias_Buscador: '', Patron_Movimiento: 'Dominante de Rodilla', Lateralidad: 'Unilateral', Carga_Axial: 'SÍ', Musculo_Agonista: 'Cuádriceps', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Mancuernas', Nivel_Habilidad: '3', Nivel_Impacto_Articular: 'Medio' }, sets: '2', reps: '10-12 por pierna', weight: 'Auto', rpe: '8', videoUrl: '', progression: '' }
        ]
      }
    ]
  },

  // Bienestar y Adherencia (Máquinas / Dosis Mínima Viable)
  'wellness_3': {
    id: 'wellness_3',
    name: 'Bienestar y Adherencia (3 Días - Máquinas)',
    days: [
      {
        title: 'Día A / B / C - Full Body Wellness',
        exercises: [
          { exercise: { ID_Ejercicio: 'SQUAT_004', Nombre_Oficial: 'Prensa de Piernas', Alias_Buscador: '', Patron_Movimiento: 'Dominante de Rodilla', Lateralidad: 'Bilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Cuádriceps', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Máquina', Nivel_Habilidad: '1', Nivel_Impacto_Articular: 'Bajo' }, sets: '2', reps: '8-12', weight: 'Auto', rpe: '7-8', videoUrl: '', progression: '' },
          { exercise: { ID_Ejercicio: 'PULL_002', Nombre_Oficial: 'Jalón al Pecho', Alias_Buscador: '', Patron_Movimiento: 'Tracción Vertical', Lateralidad: 'Bilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Dorsal Ancho', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Máquina', Nivel_Habilidad: '1', Nivel_Impacto_Articular: 'Bajo' }, sets: '2', reps: '8-12', weight: 'Auto', rpe: '7-8', videoUrl: '', progression: '' },
          { exercise: { ID_Ejercicio: 'HPUSH_007', Nombre_Oficial: 'Press de Pecho en Máquina', Alias_Buscador: 'Machine Chest Press, Press máquina', Patron_Movimiento: 'Empuje Horizontal', Lateralidad: 'Bilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Pectoral Mayor', Musculos_Sinergistas: 'Tríceps, Deltoides Anterior', Equipamiento_Requerido: 'Máquina', Nivel_Habilidad: '1', Nivel_Impacto_Articular: 'Bajo' }, sets: '2', reps: '8-12', weight: 'Auto', rpe: '7-8', videoUrl: '', progression: '' },
          { exercise: { ID_Ejercicio: 'ISO_003', Nombre_Oficial: 'Curl de Isquiosurales Sentado', Alias_Buscador: 'Seated Leg Curl, Curl femoral sentado', Patron_Movimiento: 'Aislamiento', Lateralidad: 'Bilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Isquiosurales', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Máquina', Nivel_Habilidad: '1', Nivel_Impacto_Articular: 'Bajo' }, sets: '1', reps: '10-15', weight: 'Auto', rpe: '7-8', videoUrl: '', progression: '' },
          { exercise: { ID_Ejercicio: 'PULL_005', Nombre_Oficial: 'Remo en Máquina', Alias_Buscador: '', Patron_Movimiento: 'Tracción Horizontal', Lateralidad: 'Bilateral', Carga_Axial: 'NO', Musculo_Agonista: 'Dorsal Ancho', Musculos_Sinergistas: '', Equipamiento_Requerido: 'Máquina', Nivel_Habilidad: '1', Nivel_Impacto_Articular: 'Bajo' }, sets: '1', reps: '8-12', weight: 'Auto', rpe: '7-8', videoUrl: '', progression: '' }
        ]
      }
    ]
  }
};

export const SMART_BLOCKS = {
  MCGILL_BIG_3: {
    id: 'block-mcgill-big-3',
    type: 'BLOCK' as const,
    name: 'McGill Big 3 (Higiene Espinal)',
    description: 'Protocolo de estabilización isométrica para prevención de hernias y dolor lumbar.',
    blockType: 'CIRCUITO_CORE',
    rounds: 3,
    items: [
      {
        id: 'ex-mcgill-1',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'PREHAB_001',
          Nombre_Oficial: 'Flexión Abdominal de McGill',
          Alias_Buscador: 'McGill curl-up',
          Patron_Movimiento: 'Core Antiextensión',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Recto Abdominal',
          Musculos_Sinergistas: 'Oblicuos, Transverso',
          Equipamiento_Requerido: 'Colchoneta',
          Nivel_Habilidad: '1',
          Nivel_Impacto_Articular: 'Nulo'
        },
        sets: '3',
        reps: '5-3-1',
        weight: 'Corporal',
        rpe: 'Hold 10s',
        videoUrl: '',
        progression: ''
      },
      {
        id: 'ex-mcgill-2',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'PREHAB_002',
          Nombre_Oficial: 'Plancha Lateral Corta (McGill)',
          Alias_Buscador: 'Side plank from knees',
          Patron_Movimiento: 'Core Antiflexión',
          Lateralidad: 'Unilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Cuadrado Lumbar',
          Musculos_Sinergistas: 'Oblicuos, Glúteo Medio',
          Equipamiento_Requerido: 'Colchoneta',
          Nivel_Habilidad: '1',
          Nivel_Impacto_Articular: 'Muy Bajo'
        },
        sets: '3',
        reps: '4-3-2',
        weight: 'Corporal',
        rpe: 'Hold 10s',
        videoUrl: '',
        progression: ''
      },
      {
        id: 'ex-mcgill-3',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'PREHAB_003',
          Nombre_Oficial: 'Perro de Muestra (Bird-Dog)',
          Alias_Buscador: 'Bird-dog',
          Patron_Movimiento: 'Core Antirotación',
          Lateralidad: 'Unilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Multífidos / Glúteo Mayor',
          Musculos_Sinergistas: 'Core, Deltoides Posterior',
          Equipamiento_Requerido: 'Colchoneta',
          Nivel_Habilidad: '2',
          Nivel_Impacto_Articular: 'Nulo'
        },
        sets: '3',
        reps: '5-4-3',
        weight: 'Corporal',
        rpe: 'Hold 10s',
        videoUrl: '',
        progression: ''
      }
    ]
  },

  BISERIE_ANTAGONISTA_TORSO: {
    id: 'block-ant-torso-1',
    type: 'BLOCK' as const,
    name: 'Biserie Antagonista: Press Plano + Remo Pecho Apoyado',
    description: 'Emparejamiento A1/A2 con inhibición recíproca y cero fatiga espinal lumbar.',
    blockType: 'BISERIE',
    rounds: 3,
    restBetweenExercises: 30,
    restBetweenRounds: 90,
    items: [
      {
        id: 'ex-ant-1',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'CHEST_001',
          Nombre_Oficial: 'Press de Banca con Barra',
          Alias_Buscador: 'Barbell bench press',
          Patron_Movimiento: 'Empuje Horizontal',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Pectoral Mayor',
          Musculos_Sinergistas: 'Tríceps, Deltoides Anterior',
          Equipamiento_Requerido: 'Barra Olímpica + Banco Plano',
          Nivel_Habilidad: '3',
          Nivel_Impacto_Articular: 'Medio'
        },
        sets: '3',
        reps: '8-10',
        weight: 'Auto',
        rpe: '8 (RIR 2)',
        videoUrl: '',
        progression: 'Tempo 3-0-1-0'
      },
      {
        id: 'ex-ant-2',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'BACK_004',
          Nombre_Oficial: 'Remo con Mancuernas en Banco Inclinado',
          Alias_Buscador: 'Chest-supported row, Seal row',
          Patron_Movimiento: 'Tracción Horizontal',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Dorsal Ancho',
          Musculos_Sinergistas: 'Romboides, Bíceps',
          Equipamiento_Requerido: 'Mancuernas + Banco Inclinado',
          Nivel_Habilidad: '2',
          Nivel_Impacto_Articular: 'Bajo'
        },
        sets: '3',
        reps: '10-12',
        weight: 'Auto',
        rpe: '8 (RIR 2)',
        videoUrl: '',
        progression: 'Tempo 2-0-1-1'
      }
    ]
  },

  COMPLEJO_PAPE_INFERIOR: {
    id: 'block-pape-lower-1',
    type: 'BLOCK' as const,
    name: 'Complejo PAPE Tren Inferior: Sentadilla Pesada + Salto al Cajón',
    description: 'Potenciación Post-Activación para reclutar unidades motoras de alto umbral (Tipo IIx).',
    blockType: 'PAP_CONTRAST',
    rounds: 3,
    restBetweenExercises: 300,
    restBetweenRounds: 180,
    items: [
      {
        id: 'ex-pape-1',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'SQUAT_001',
          Nombre_Oficial: 'Sentadilla Trasera con Barra',
          Alias_Buscador: 'Back squat pesada',
          Patron_Movimiento: 'Dominante de Rodilla',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'SÍ',
          Musculo_Agonista: 'Cuádriceps',
          Musculos_Sinergistas: 'Glúteo Mayor, Core',
          Equipamiento_Requerido: 'Barra Olímpica + Rack',
          Nivel_Habilidad: '4',
          Nivel_Impacto_Articular: 'Medio'
        },
        sets: '3',
        reps: '3',
        weight: '>85% 1RM',
        rpe: '9 (RIR 1)',
        videoUrl: '',
        progression: 'Tempo 2-0-X-1'
      },
      {
        id: 'ex-pape-2',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'PLIO_002',
          Nombre_Oficial: 'Salto al Cajón Alto (Box Jump)',
          Alias_Buscador: 'Box jump, salto reactivo',
          Patron_Movimiento: 'Pliometría',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'SÍ',
          Musculo_Agonista: 'Glúteo Mayor / Cuádriceps',
          Musculos_Sinergistas: 'Isquios, Gemelos',
          Equipamiento_Requerido: 'Cajón Pliométrico',
          Nivel_Habilidad: '3',
          Nivel_Impacto_Articular: 'Bajo'
        },
        sets: '3',
        reps: '4',
        weight: 'Corporal',
        rpe: 'Máxima Explosión',
        videoUrl: '',
        progression: 'PAPE Neural'
      }
    ]
  },

  CIRCUITO_CORE_360: {
    id: 'block-core-360-1',
    type: 'BLOCK' as const,
    name: 'Circuito Core 360° Anti-Movimiento',
    description: 'Estabilidad espinal en 4 planos: Anti-extensión, Anti-rotación, Anti-flexión lateral y Cadena Posterior.',
    blockType: 'CIRCUITO_CORE',
    rounds: 3,
    restBetweenExercises: 15,
    restBetweenRounds: 60,
    items: [
      {
        id: 'ex-c360-1',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'PREHAB_003',
          Nombre_Oficial: 'Perro de Muestra (Bird-Dog)',
          Alias_Buscador: 'Bird-dog',
          Patron_Movimiento: 'Core Antirotación',
          Lateralidad: 'Unilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Multífidos / Glúteo',
          Musculos_Sinergistas: 'Core',
          Equipamiento_Requerido: 'Colchoneta',
          Nivel_Habilidad: '2',
          Nivel_Impacto_Articular: 'Nulo'
        },
        sets: '3',
        reps: '6/lado',
        weight: 'Corporal',
        rpe: 'Pausa 5s',
        videoUrl: '',
        progression: ''
      },
      {
        id: 'ex-c360-2',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'PREHAB_006',
          Nombre_Oficial: 'Insecto Muerto (Deadbug)',
          Alias_Buscador: 'Deadbug',
          Patron_Movimiento: 'Core Antiextensión',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Transverso Abdominal',
          Musculos_Sinergistas: 'Recto Abdominal',
          Equipamiento_Requerido: 'Colchoneta',
          Nivel_Habilidad: '1',
          Nivel_Impacto_Articular: 'Nulo'
        },
        sets: '3',
        reps: '10/lado',
        weight: 'Corporal',
        rpe: 'Tempo 2-0-2-0',
        videoUrl: '',
        progression: ''
      },
      {
        id: 'ex-c360-3',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'PREHAB_002',
          Nombre_Oficial: 'Plancha Lateral Corta (McGill)',
          Alias_Buscador: 'Side plank',
          Patron_Movimiento: 'Core Antiflexión',
          Lateralidad: 'Unilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Cuadrado Lumbar',
          Musculos_Sinergistas: 'Oblicuos',
          Equipamiento_Requerido: 'Colchoneta',
          Nivel_Habilidad: '1',
          Nivel_Impacto_Articular: 'Muy Bajo'
        },
        sets: '3',
        reps: '30s/lado',
        weight: 'Corporal',
        rpe: 'Isométrico',
        videoUrl: '',
        progression: ''
      }
    ]
  },

  METABOLISMO_TABATA: {
    id: 'block-tabata-1',
    type: 'BLOCK' as const,
    name: 'Tabata 4 Min: Kettlebell Swing + Battle Ropes',
    description: 'Protocolo SIT/HIIT de 8 rondas (20s ON / 10s OFF) con cero riesgo de colapso espinal.',
    blockType: 'TABATA',
    rounds: 8,
    workTime: 20,
    restTime: 10,
    items: [
      {
        id: 'ex-tab-1',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'MOV_001',
          Nombre_Oficial: 'Kettlebell Swing Estilo Ruso',
          Alias_Buscador: 'KB swing, balanceo con kettlebell',
          Patron_Movimiento: 'Bisagra de Cadera (Hinge)',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Glúteo Mayor / Isquios',
          Musculos_Sinergistas: 'Core, Dorsales',
          Equipamiento_Requerido: 'Kettlebell',
          Nivel_Habilidad: '2',
          Nivel_Impacto_Articular: 'Bajo'
        },
        sets: '4',
        reps: 'MAX en 20s',
        weight: '16-24 kg',
        rpe: '10 (RIR 0)',
        videoUrl: '',
        progression: 'Rondas 1, 3, 5, 7'
      },
      {
        id: 'ex-tab-2',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'CARDIO_002',
          Nombre_Oficial: 'Battle Ropes (Cuerdas de Batalla)',
          Alias_Buscador: 'Cuerdas de batalla, battle ropes',
          Patron_Movimiento: 'Acondicionamiento Metabólico',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Hombros / Core',
          Musculos_Sinergistas: 'Brazos, Espalda',
          Equipamiento_Requerido: 'Cuerdas de Batalla',
          Nivel_Habilidad: '1',
          Nivel_Impacto_Articular: 'Nulo'
        },
        sets: '4',
        reps: 'MAX en 20s',
        weight: 'Corporal',
        rpe: '10 (RIR 0)',
        videoUrl: '',
        progression: 'Rondas 2, 4, 6, 8'
      }
    ]
  },

  EMOM_POTENCIA_VELOCIDAD: {
    id: 'block-emom-1',
    type: 'BLOCK' as const,
    name: 'EMOM 10 Min: Trap Bar Jumps + Push Press',
    description: 'Trabajo cada minuto (15s trabajo / 45s descanso) para resíntesis de fosfocreatina (PCr) y máxima potencia.',
    blockType: 'EMOM',
    rounds: 10,
    workTime: 15,
    restTime: 45,
    items: [
      {
        id: 'ex-emom-1',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'PLIO_001',
          Nombre_Oficial: 'Salto con Barra Hexagonal (Trap Bar Jumps)',
          Alias_Buscador: 'Trap bar jumps @ 30% 1RM',
          Patron_Movimiento: 'Pliometría',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'SÍ',
          Musculo_Agonista: 'Cuádriceps / Glúteos',
          Musculos_Sinergistas: 'Gemelos, Core',
          Equipamiento_Requerido: 'Barra Hexagonal',
          Nivel_Habilidad: '3',
          Nivel_Impacto_Articular: 'Medio'
        },
        sets: '5',
        reps: '3',
        weight: '30% 1RM',
        rpe: 'Máxima Velocidad',
        videoUrl: '',
        progression: 'Minutos Impares (1, 3, 5, 7, 9)'
      },
      {
        id: 'ex-emom-2',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'PLIO_003',
          Nombre_Oficial: 'Push Press con Mancuernas',
          Alias_Buscador: 'Push press mancuernas @ 60%',
          Patron_Movimiento: 'Empuje Vertical',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'SÍ',
          Musculo_Agonista: 'Deltoides',
          Musculos_Sinergistas: 'Tríceps, Cuádriceps',
          Equipamiento_Requerido: 'Mancuernas',
          Nivel_Habilidad: '2',
          Nivel_Impacto_Articular: 'Bajo'
        },
        sets: '5',
        reps: '5',
        weight: '60% 1RM',
        rpe: 'Explosivo',
        videoUrl: '',
        progression: 'Minutos Pares (2, 4, 6, 8, 10)'
      }
    ]
  },

  TRIADA_AMRAP_AEROBICA: {
    id: 'block-amrap-1',
    type: 'BLOCK' as const,
    name: 'Tríada AMRAP 12 Min: Flujo Aeróbico Continuo',
    description: 'Shunting hemodinámico continuo (Goblet Squat + Push-ups + Core) para gasto cardíaco sostenido.',
    blockType: 'AMRAP',
    rounds: 1,
    workTime: 720,
    restTime: 0,
    items: [
      {
        id: 'ex-amrap-1',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'SQUAT_003',
          Nombre_Oficial: 'Sentadilla Copa (Goblet Squat)',
          Alias_Buscador: 'Goblet squat mancuerna',
          Patron_Movimiento: 'Dominante de Rodilla',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'SÍ',
          Musculo_Agonista: 'Cuádriceps',
          Musculos_Sinergistas: 'Glúteo, Core Anterior',
          Equipamiento_Requerido: 'Mancuerna / Kettlebell',
          Nivel_Habilidad: '2',
          Nivel_Impacto_Articular: 'Bajo'
        },
        sets: '1',
        reps: '12',
        weight: 'Moderado',
        rpe: '7 (RIR 3)',
        videoUrl: '',
        progression: 'Vector Inferior'
      },
      {
        id: 'ex-amrap-2',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'RAMP_004',
          Nombre_Oficial: 'Flexiones de Brazos (Push-ups)',
          Alias_Buscador: 'Push-ups, flexiones',
          Patron_Movimiento: 'Empuje Horizontal',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Pectoral Mayor',
          Musculos_Sinergistas: 'Tríceps, Core',
          Equipamiento_Requerido: 'Peso Corporal',
          Nivel_Habilidad: '2',
          Nivel_Impacto_Articular: 'Bajo'
        },
        sets: '1',
        reps: '10',
        weight: 'Corporal',
        rpe: '8 (RIR 2)',
        videoUrl: '',
        progression: 'Vector Superior'
      },
      {
        id: 'ex-amrap-3',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'PREHAB_006',
          Nombre_Oficial: 'Giros Rusos Controlados (Russian Twists)',
          Alias_Buscador: 'Russian twists',
          Patron_Movimiento: 'Core Antirotación',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Oblicuos',
          Musculos_Sinergistas: 'Recto Abdominal',
          Equipamiento_Requerido: 'Colchoneta',
          Nivel_Habilidad: '2',
          Nivel_Impacto_Articular: 'Nulo'
        },
        sets: '1',
        reps: '15/lado',
        weight: 'Corporal',
        rpe: '7 (RIR 3)',
        videoUrl: '',
        progression: 'Vector Core'
      }
    ]
  },

  COMPLEJO_MINIBAND_WENNING: {
    id: 'block-wenning-primer',
    type: 'BLOCK' as const,
    name: 'Complejo Miniband Wenning (Glúteo & Hombro Primer)',
    description: '100 repeticiones acumuladas (4x25) para hiperemia tisular y activación sinovial sin fatiga central.',
    blockType: 'STANDARD',
    rounds: 4,
    restBetweenExercises: 0,
    restBetweenRounds: 20,
    items: [
      {
        id: 'ex-wen-1',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'RAMP_003',
          Nombre_Oficial: 'Caminata Lateral con Miniband',
          Alias_Buscador: 'Monster walks laterales',
          Patron_Movimiento: 'Locomoción/Transporte',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Glúteo Medio',
          Musculos_Sinergistas: 'Glúteo Menor, TFL',
          Equipamiento_Requerido: 'Miniband',
          Nivel_Habilidad: '1',
          Nivel_Impacto_Articular: 'Bajo'
        },
        sets: '4',
        reps: '15/lado',
        weight: 'Miniband Ligera',
        rpe: 'Control 1-1-1-1',
        videoUrl: '',
        progression: 'Estabilizador Pélvico'
      },
      {
        id: 'ex-wen-2',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'RAMP_001',
          Nombre_Oficial: 'Puente de Glúteo con Banda',
          Alias_Buscador: 'Banded hip bridge',
          Patron_Movimiento: 'Bisagra de Cadera (Hinge)',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Glúteo Mayor',
          Musculos_Sinergistas: 'Core, Isquios',
          Equipamiento_Requerido: 'Miniband',
          Nivel_Habilidad: '1',
          Nivel_Impacto_Articular: 'Muy Bajo'
        },
        sets: '4',
        reps: '25',
        weight: 'Miniband Ligera',
        rpe: 'Pausa 1s arriba',
        videoUrl: '',
        progression: 'Extensión Pélvica'
      },
      {
        id: 'ex-wen-3',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'RAMP_002',
          Nombre_Oficial: 'Separación con Banda (Band Pull-Aparts)',
          Alias_Buscador: 'Band pull-aparts',
          Patron_Movimiento: 'Tracción Horizontal',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Deltoides Posterior',
          Musculos_Sinergistas: 'Romboides, Manguito',
          Equipamiento_Requerido: 'Banda Elástica',
          Nivel_Habilidad: '1',
          Nivel_Impacto_Articular: 'Muy Bajo'
        },
        sets: '4',
        reps: '25',
        weight: 'Banda Ligera',
        rpe: 'Continuo',
        videoUrl: '',
        progression: 'Estabilización Escapular'
      }
    ]
  },

  // ── 5 PROTOCOLOS RAMP / CALENTAMIENTO PRECONFIGURADOS ──
  RAMP_TORSO_EMPUJE: {
    id: 'block-ramp-push',
    type: 'BLOCK' as const,
    name: '🔥 Calentamiento RAMP: Torso / Empuje (Press & Hombros)',
    description: 'Protocolo completo de 4 fases: Primers Wenning de tríceps/pectoral (4x25) + Wall Slides + Shoulder CARs + Plyo Push-ups (PAPE).',
    blockType: 'STANDARD',
    rounds: 1,
    restBetweenExercises: 15,
    restBetweenRounds: 0,
    items: [
      {
        id: 'ex-rp-1',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'WENNING_004',
          Nombre_Oficial: 'Triceps Band Pushdown (Wenning Primer)',
          Alias_Buscador: 'Pushdown tríceps banda',
          Patron_Movimiento: 'Aislamiento',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Tríceps Braquial',
          Musculos_Sinergistas: 'Core Anterior',
          Equipamiento_Requerido: 'Banda Elástica',
          Nivel_Habilidad: '1',
          Nivel_Impacto_Articular: 'Bajo'
        },
        sets: '4',
        reps: '25',
        weight: 'Banda Ligera',
        rpe: 'Hiperemia',
        videoUrl: '',
        progression: 'Lubricación Codo'
      },
      {
        id: 'ex-rp-2',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'RAMP_006',
          Nombre_Oficial: 'Serratus Wall Slides con Banda',
          Alias_Buscador: 'Wall slides serrato',
          Patron_Movimiento: 'Movilidad',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Serrato Anterior',
          Musculos_Sinergistas: 'Trapecio Inferior',
          Equipamiento_Requerido: 'Pared, Miniband',
          Nivel_Habilidad: '2',
          Nivel_Impacto_Articular: 'Nulo'
        },
        sets: '2',
        reps: '12',
        weight: 'Miniband',
        rpe: 'Control',
        videoUrl: '',
        progression: 'Rotación Superior Escapular'
      },
      {
        id: 'ex-rp-3',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'FRC_002',
          Nombre_Oficial: 'Rotaciones Articulares Controladas de Hombro (Shoulder CARs)',
          Alias_Buscador: 'Shoulder CARs',
          Patron_Movimiento: 'Movilidad',
          Lateralidad: 'Unilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Cápsula Glenohumeral',
          Musculos_Sinergistas: 'Manguito Rotador',
          Equipamiento_Requerido: 'Ninguno',
          Nivel_Habilidad: '2',
          Nivel_Impacto_Articular: 'Nulo'
        },
        sets: '2',
        reps: '3/lado',
        weight: 'Corporal',
        rpe: 'Irradiación 40%',
        videoUrl: '',
        progression: 'Higiene Capsular'
      },
      {
        id: 'ex-rp-4',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'PAPE_002',
          Nombre_Oficial: 'Plyometric Push-ups (PAPE)',
          Alias_Buscador: 'Plyo push ups',
          Patron_Movimiento: 'Pliometría',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Pectoral Mayor',
          Musculos_Sinergistas: 'Tríceps Braquial',
          Equipamiento_Requerido: 'Ninguno',
          Nivel_Habilidad: '3',
          Nivel_Impacto_Articular: 'Medio'
        },
        sets: '3',
        reps: '4',
        weight: 'Corporal',
        rpe: 'Explosivo',
        videoUrl: '',
        progression: 'Potenciación SNC'
      }
    ]
  },

  RAMP_PIERNA_RODILLA: {
    id: 'block-ramp-squat',
    type: 'BLOCK' as const,
    name: '🔥 Calentamiento RAMP: Pierna / Sentadilla (Dominante Rodilla)',
    description: 'Protocolo específico: Goblet Squat Wenning (4x25) + Bird-Dog Bracing McGill + Hip CARs + Jump Squats Balísticos (PAPE).',
    blockType: 'STANDARD',
    rounds: 1,
    restBetweenExercises: 15,
    restBetweenRounds: 0,
    items: [
      {
        id: 'ex-rk-1',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'WENNING_002',
          Nombre_Oficial: 'Wenning Goblet Squat Ligero (High Volume Primer)',
          Alias_Buscador: 'Goblet squat 25 reps',
          Patron_Movimiento: 'Dominante de Rodilla',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'Baja',
          Musculo_Agonista: 'Cuádriceps',
          Musculos_Sinergistas: 'Glúteo Mayor',
          Equipamiento_Requerido: 'Kettlebell / Mancuerna Ligera',
          Nivel_Habilidad: '1',
          Nivel_Impacto_Articular: 'Bajo'
        },
        sets: '4',
        reps: '25',
        weight: '10-12 kg',
        rpe: 'Hiperemia',
        videoUrl: '',
        progression: 'Tixotropía Patelar'
      },
      {
        id: 'ex-rk-2',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'PREHAB_003',
          Nombre_Oficial: 'Perro de Muestra (Bird-Dog)',
          Alias_Buscador: 'Bird dog',
          Patron_Movimiento: 'Core Antiextensión',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Multífidos',
          Musculos_Sinergistas: 'Glúteo Mayor',
          Equipamiento_Requerido: 'Colchoneta',
          Nivel_Habilidad: '1',
          Nivel_Impacto_Articular: 'Nulo'
        },
        sets: '2',
        reps: '5/lado',
        weight: 'Corporal',
        rpe: 'Hold 8s',
        videoUrl: '',
        progression: 'Estabilidad Espinal'
      },
      {
        id: 'ex-rk-3',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'FRC_001',
          Nombre_Oficial: 'Rotaciones Articulares Controladas de Cadera (Hip CARs)',
          Alias_Buscador: 'Hip CARs',
          Patron_Movimiento: 'Movilidad',
          Lateralidad: 'Unilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Cápsula de Cadera',
          Musculos_Sinergistas: 'Glúteo Medio',
          Equipamiento_Requerido: 'Colchoneta',
          Nivel_Habilidad: '2',
          Nivel_Impacto_Articular: 'Nulo'
        },
        sets: '2',
        reps: '4/lado',
        weight: 'Corporal',
        rpe: 'Lento',
        videoUrl: '',
        progression: 'Centrado Articular'
      },
      {
        id: 'ex-rk-4',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'PAPE_001',
          Nombre_Oficial: 'Vertical Jump Squat (PAPE Primer)',
          Alias_Buscador: 'Jump squat explosivo',
          Patron_Movimiento: 'Pliometría',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'Media',
          Musculo_Agonista: 'Cuádriceps',
          Musculos_Sinergistas: 'Glúteo Mayor',
          Equipamiento_Requerido: 'Ninguno',
          Nivel_Habilidad: '2',
          Nivel_Impacto_Articular: 'Medio'
        },
        sets: '3',
        reps: '5',
        weight: 'Corporal',
        rpe: 'Explosivo',
        videoUrl: '',
        progression: 'Potenciación Triple Extensión'
      }
    ]
  },

  RAMP_PIERNA_CADERA: {
    id: 'block-ramp-deadlift',
    type: 'BLOCK' as const,
    name: '🔥 Calentamiento RAMP: Cadena Posterior (Peso Muerto & Hip Thrust)',
    description: 'Protocolo de bisagra: KB Swings Wenning (4x25) + McGill Side Bridge + Cossack Flow & Scorpion + Broad Jumps (PAPE).',
    blockType: 'STANDARD',
    rounds: 1,
    restBetweenExercises: 15,
    restBetweenRounds: 0,
    items: [
      {
        id: 'ex-rd-1',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'WENNING_001',
          Nombre_Oficial: 'Wenning Kettlebell Swings (Primer 4x25)',
          Alias_Buscador: 'KB Swing ligero',
          Patron_Movimiento: 'Bisagra de Cadera (Hinge)',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'Baja',
          Musculo_Agonista: 'Glúteo Mayor',
          Musculos_Sinergistas: 'Isquiosurales',
          Equipamiento_Requerido: 'Kettlebell Ligera',
          Nivel_Habilidad: '2',
          Nivel_Impacto_Articular: 'Bajo'
        },
        sets: '4',
        reps: '25',
        weight: '12-16 kg',
        rpe: 'Rítmico',
        videoUrl: '',
        progression: 'Hiperemia Cadena Posterior'
      },
      {
        id: 'ex-rd-2',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'PREHAB_002',
          Nombre_Oficial: 'Plancha Lateral Corta McGill',
          Alias_Buscador: 'Side bridge',
          Patron_Movimiento: 'Core Antiextensión',
          Lateralidad: 'Unilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Cuadrado Lumbar',
          Musculos_Sinergistas: 'Oblicuos',
          Equipamiento_Requerido: 'Colchoneta',
          Nivel_Habilidad: '1',
          Nivel_Impacto_Articular: 'Nulo'
        },
        sets: '2',
        reps: '3x10s/lado',
        weight: 'Corporal',
        rpe: 'Isométrico',
        videoUrl: '',
        progression: 'Estabilidad Lumbo-Pélvica'
      },
      {
        id: 'ex-rd-3',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'MOV_003',
          Nombre_Oficial: 'Cossack Squat Flow',
          Alias_Buscador: 'Sentadilla cosaca dinámica',
          Patron_Movimiento: 'Movilidad',
          Lateralidad: 'Unilateral',
          Carga_Axial: 'Baja',
          Musculo_Agonista: 'Aductores',
          Musculos_Sinergistas: 'Glúteo',
          Equipamiento_Requerido: 'Ninguno',
          Nivel_Habilidad: '3',
          Nivel_Impacto_Articular: 'Moderado'
        },
        sets: '2',
        reps: '5/lado',
        weight: 'Corporal',
        rpe: 'Fluido',
        videoUrl: '',
        progression: 'Apertura Inguinal'
      },
      {
        id: 'ex-rd-4',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'PLIO_002',
          Nombre_Oficial: 'Salto Horizontal de Potencia (Broad Jump)',
          Alias_Buscador: 'Broad jump',
          Patron_Movimiento: 'Pliometría',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'Media',
          Musculo_Agonista: 'Glúteos',
          Musculos_Sinergistas: 'Isquiosurales',
          Equipamiento_Requerido: 'Ninguno',
          Nivel_Habilidad: '3',
          Nivel_Impacto_Articular: 'Medio'
        },
        sets: '3',
        reps: '3',
        weight: 'Corporal',
        rpe: 'Explosivo',
        videoUrl: '',
        progression: 'Potenciación Cadena Posterior'
      }
    ]
  },

  // ── CIRCUITOS Y COMPLEJOS CIENTÍFICOS DE ALTA DENSIDAD (TEMA 7) ──
  COMPLEJO_BARRA_JAVOREK: {
    id: 'block-complex-barbell',
    type: 'BLOCK' as const,
    name: '🏋️ Complejo de Barra "The Great Destroyer" (Dan John / Javorek)',
    description: '30 reps continuas sin soltar la barra: RDL (6) + Remo Pendlay (6) + Power Clean (6) + Front Squat (6) + Push Press (6).',
    blockType: 'STANDARD',
    rounds: 4,
    restBetweenExercises: 0,
    restBetweenRounds: 90,
    items: [
      {
        id: 'ex-cb-1',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'DEAD_003',
          Nombre_Oficial: 'Peso Muerto Rumano con Barra',
          Alias_Buscador: 'Barbell RDL',
          Patron_Movimiento: 'Bisagra de Cadera (Hinge)',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'SÍ',
          Musculo_Agonista: 'Isquiosurales',
          Musculos_Sinergistas: 'Glúteos, Erectores',
          Equipamiento_Requerido: 'Barra Olímpica',
          Nivel_Habilidad: '3',
          Nivel_Impacto_Articular: 'Medio'
        },
        sets: '4',
        reps: '6',
        weight: 'Carga Constante',
        rpe: 'Sin soltar',
        videoUrl: '',
        progression: 'Fase 1: Bisagra'
      },
      {
        id: 'ex-cb-2',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'BACK_003',
          Nombre_Oficial: 'Remo con Barra Pendlay',
          Alias_Buscador: 'Pendlay row',
          Patron_Movimiento: 'Tracción Horizontal',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'SÍ',
          Musculo_Agonista: 'Dorsal Ancho',
          Musculos_Sinergistas: 'Romboides, Trapecios',
          Equipamiento_Requerido: 'Barra Olímpica',
          Nivel_Habilidad: '3',
          Nivel_Impacto_Articular: 'Medio'
        },
        sets: '4',
        reps: '6',
        weight: 'Carga Constante',
        rpe: 'Sin soltar',
        videoUrl: '',
        progression: 'Fase 2: Tracción'
      },
      {
        id: 'ex-cb-3',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'OLY_001',
          Nombre_Oficial: 'Cargada de Fuerza (Power Clean)',
          Alias_Buscador: 'Power clean',
          Patron_Movimiento: 'Pliometría',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'SÍ',
          Musculo_Agonista: 'Glúteos y Trapecios',
          Musculos_Sinergistas: 'Isquios, Cuádriceps',
          Equipamiento_Requerido: 'Barra Olímpica',
          Nivel_Habilidad: '4',
          Nivel_Impacto_Articular: 'Medio'
        },
        sets: '4',
        reps: '6',
        weight: 'Carga Constante',
        rpe: 'Sin soltar',
        videoUrl: '',
        progression: 'Fase 3: Potencia'
      },
      {
        id: 'ex-cb-4',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'SQUAT_002',
          Nombre_Oficial: 'Sentadilla Frontal con Barra',
          Alias_Buscador: 'Front squat',
          Patron_Movimiento: 'Dominante de Rodilla',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'SÍ',
          Musculo_Agonista: 'Cuádriceps',
          Musculos_Sinergistas: 'Core Anterior',
          Equipamiento_Requerido: 'Barra Olímpica',
          Nivel_Habilidad: '4',
          Nivel_Impacto_Articular: 'Medio'
        },
        sets: '4',
        reps: '6',
        weight: 'Carga Constante',
        rpe: 'Sin soltar',
        videoUrl: '',
        progression: 'Fase 4: Rodilla'
      },
      {
        id: 'ex-cb-5',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'SHO_001',
          Nombre_Oficial: 'Press Militar con Barra',
          Alias_Buscador: 'Overhead press',
          Patron_Movimiento: 'Empuje Vertical',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'SÍ',
          Musculo_Agonista: 'Deltoides',
          Musculos_Sinergistas: 'Tríceps',
          Equipamiento_Requerido: 'Barra Olímpica',
          Nivel_Habilidad: '3',
          Nivel_Impacto_Articular: 'Medio'
        },
        sets: '4',
        reps: '6',
        weight: 'Carga Constante',
        rpe: 'Sin soltar',
        videoUrl: '',
        progression: 'Fase 5: Empuje'
      }
    ]
  },

  COMPLEJO_DB_ARMOR: {
    id: 'block-db-armor',
    type: 'BLOCK' as const,
    name: '🛡️ Complejo Mancuernas "Armor Building" (Dan John)',
    description: 'Secuencia ininterrumpida por ronda: 2 Cleans con Mancuernas + 1 Press Estricto + 3 Sentadillas Frontales.',
    blockType: 'EMOM',
    rounds: 10,
    intervalTime: 60,
    items: [
      {
        id: 'ex-arm-1',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'OLY_001',
          Nombre_Oficial: 'Clean con Mancuernas',
          Alias_Buscador: 'Dumbbell clean',
          Patron_Movimiento: 'Pliometría',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'Baja',
          Musculo_Agonista: 'Cadena Posterior',
          Musculos_Sinergistas: 'Trapecios',
          Equipamiento_Requerido: 'Mancuernas',
          Nivel_Habilidad: '2',
          Nivel_Impacto_Articular: 'Bajo'
        },
        sets: '10',
        reps: '2',
        weight: 'Moderado',
        rpe: 'Explosivo',
        videoUrl: '',
        progression: 'Potencia'
      },
      {
        id: 'ex-arm-2',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'SHO_002',
          Nombre_Oficial: 'Press de Hombros con Mancuernas',
          Alias_Buscador: 'Dumbbell press',
          Patron_Movimiento: 'Empuje Vertical',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'Baja',
          Musculo_Agonista: 'Deltoides',
          Musculos_Sinergistas: 'Tríceps',
          Equipamiento_Requerido: 'Mancuernas',
          Nivel_Habilidad: '2',
          Nivel_Impacto_Articular: 'Bajo'
        },
        sets: '10',
        reps: '1',
        weight: 'Moderado',
        rpe: 'Estricto',
        videoUrl: '',
        progression: 'Empuje'
      },
      {
        id: 'ex-arm-3',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'SQUAT_003',
          Nombre_Oficial: 'Sentadilla Frontal con Mancuernas',
          Alias_Buscador: 'Dumbbell front squat',
          Patron_Movimiento: 'Dominante de Rodilla',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'Baja',
          Musculo_Agonista: 'Cuádriceps',
          Musculos_Sinergistas: 'Glúteos',
          Equipamiento_Requerido: 'Mancuernas',
          Nivel_Habilidad: '2',
          Nivel_Impacto_Articular: 'Bajo'
        },
        sets: '10',
        reps: '3',
        weight: 'Moderado',
        rpe: 'Profundo',
        videoUrl: '',
        progression: 'Sentadilla'
      }
    ]
  },

  TRISERIE_POLIQUIN_ANTAGONISTA: {
    id: 'block-triserie-poliquin',
    type: 'BLOCK' as const,
    name: '⚡ Triserie Antagonista Hipertrófica (Charles Poliquin)',
    description: 'A1 Press Plano (8-10) + A2 Remo Pecho Apoyado (8-10) + A3 Sentadilla Búlgara (10/lado). Inervación recíproca y alto lactato.',
    blockType: 'STANDARD',
    rounds: 4,
    restBetweenExercises: 10,
    restBetweenRounds: 90,
    items: [
      {
        id: 'ex-pol-1',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'CHEST_001',
          Nombre_Oficial: 'Press de Banca Plano con Barra',
          Alias_Buscador: 'Bench press',
          Patron_Movimiento: 'Empuje Horizontal',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Pectoral Mayor',
          Musculos_Sinergistas: 'Tríceps',
          Equipamiento_Requerido: 'Barra',
          Nivel_Habilidad: '3',
          Nivel_Impacto_Articular: 'Medio'
        },
        sets: '4',
        reps: '8-10',
        weight: '75% 1RM',
        rpe: '8 (RIR 2)',
        videoUrl: '',
        progression: 'A1: Empuje'
      },
      {
        id: 'ex-pol-2',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'BACK_004',
          Nombre_Oficial: 'Remo en Banco Inclinado con Mancuernas',
          Alias_Buscador: 'Chest supported row',
          Patron_Movimiento: 'Tracción Horizontal',
          Lateralidad: 'Bilateral',
          Carga_Axial: 'NO',
          Musculo_Agonista: 'Dorsal Ancho',
          Musculos_Sinergistas: 'Romboides',
          Equipamiento_Requerido: 'Mancuernas',
          Nivel_Habilidad: '2',
          Nivel_Impacto_Articular: 'Bajo'
        },
        sets: '4',
        reps: '8-10',
        weight: 'Moderado',
        rpe: '8 (RIR 2)',
        videoUrl: '',
        progression: 'A2: Tracción'
      },
      {
        id: 'ex-pol-3',
        type: 'EXERCISE' as const,
        exercise: {
          ID_Ejercicio: 'LUNGE_002',
          Nombre_Oficial: 'Sentadilla Búlgara con Mancuernas',
          Alias_Buscador: 'Bulgarian split squat',
          Patron_Movimiento: 'Dominante de Rodilla',
          Lateralidad: 'Unilateral',
          Carga_Axial: 'Baja',
          Musculo_Agonista: 'Cuádriceps',
          Musculos_Sinergistas: 'Glúteo Mayor',
          Equipamiento_Requerido: 'Mancuernas',
          Nivel_Habilidad: '3',
          Nivel_Impacto_Articular: 'Bajo'
        },
        sets: '4',
        reps: '10/pierna',
        weight: 'Moderado',
        rpe: '9 (RIR 1)',
        videoUrl: '',
        progression: 'A3: Pierna Unilateral'
      }
    ]
  }
};

