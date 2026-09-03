import { useState } from 'react';
import { useOnboardingPTStore } from '../stores/useOnboardingPTStore';
import { usePlanBuilderStore, type WorkoutDay, type RoutineBlock, type RoutineExercise } from '../stores/usePlanBuilderStore';
import { ARCHETYPE_TEMPLATES } from '../data/templates.constants';
import { clinicalFirewall } from '../utils/clinicalFirewall';
import { applyClinicalDefaults, validateClinicalDosage, type ExperienceLevel } from '../utils/clinicalDosageEngine';
import { v4 as uuidv4 } from 'uuid';

export const useAutoTemplateEngine = () => {
  const onboardingData = useOnboardingPTStore(state => state);
  const { adaptTemplate } = usePlanBuilderStore();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStepText, setGenerationStepText] = useState('');
  const [swapsOccurred, setSwapsOccurred] = useState<{ original: string, rationale: string }[]>([]);
  const [dosageWarnings, setDosageWarnings] = useState<string[]>([]);

  // Adaptador Asimétrico (Compresión de días)
  const mapArchetype = () => {
    const goals = onboardingData.goalTags || [];
    const days = onboardingData.training?.days_per_week || 3;

    let selectedTemplateId = 'fat_loss_3'; // Default fallback

    if (goals.includes('hypertrophy') || goals.includes('Hipertrofia')) {
      if (days >= 4) selectedTemplateId = 'strength_4';
      else selectedTemplateId = 'hypertrophy_3';
    } else if (goals.includes('strength_gain') || goals.includes('Fuerza')) {
      selectedTemplateId = 'strength_4';
    }

    const template = ARCHETYPE_TEMPLATES[selectedTemplateId];
    if (!template) return ARCHETYPE_TEMPLATES['hypertrophy_3'];

    // Compresión Asimétrica si pide 2 días pero el template es de 3 o 4
    if (days === 2 && template.days.length > 2) {
      return {
        ...template,
        days: [
          { ...template.days[0], title: 'Día 1 - Tren Superior / Énfasis 1' },
          { ...template.days[1], title: 'Día 2 - Tren Inferior / Énfasis 2' }
        ]
      };
    }

    return template;
  };

  const generateTemplate = async () => {
    setIsGenerating(true);
    setSwapsOccurred([]);
    setDosageWarnings([]);

    const archetype = mapArchetype();
    const experienceLevel: ExperienceLevel = (onboardingData.training?.experience_level as ExperienceLevel) || 'INTERMEDIATE';

    // 1. Labor Illusion - Inicio
    setGenerationStepText(`Cruzando perfil biométrico de ${onboardingData.identity?.first_name || 'Atleta'}...`);
    await new Promise(resolve => setTimeout(resolve, 600));

    // 2. Labor Illusion - Matriz
    if (onboardingData.training?.days_per_week === 2 && ARCHETYPE_TEMPLATES[archetype.id].days.length > 2) {
      setGenerationStepText(`Comprimiendo matriz de ${archetype.name} a un esquema optimizado de 2 días...`);
    } else {
      setGenerationStepText(`Aplicando matriz de ${archetype.name} y evaluando restricciones...`);
    }
    await new Promise(resolve => setTimeout(resolve, 800));

    // 3. Labor Illusion - Firewall Clínico + Motor 80/20
    const hasInjuries = onboardingData.injuries && onboardingData.injuries.length > 0;
    if (hasInjuries) {
      setGenerationStepText(`Analizando restricciones biomecánicas para historial de ${onboardingData.injuries[0]}...`);
    } else {
      setGenerationStepText('Sincronizando umbral de fatiga del SNC y calibrando dosificación...');
    }

    const newDays: WorkoutDay[] = archetype.days.map(dayTemplate => {
      const dayId = uuidv4();
      
      const blockExercises: RoutineExercise[] = dayTemplate.exercises.map(exTemplate => {
        // Pipeline 1: Firewall Biomecánico (Swaps de seguridad)
        let validatedEx = clinicalFirewall.validate(exTemplate, onboardingData.injuries || []);
        
        if (validatedEx.isSwapped) {
          setSwapsOccurred(prev => [...prev, {
            original: validatedEx.originalExerciseName || 'Ejercicio Base',
            rationale: validatedEx.clinicalRationale || ''
          }]);
        }

        // Pipeline 2: Motor 80/20 (RPE Defaults + Hard Cap de Sets)
        validatedEx = applyClinicalDefaults(validatedEx, experienceLevel);

        return {
          id: uuidv4(),
          type: 'EXERCISE',
          ...validatedEx
        };
      });

      const mainBlock: RoutineBlock = {
        id: uuidv4(),
        type: 'BLOCK',
        name: 'Bloque Primario (Base Inteligente)',
        isCollapsed: false,
        items: blockExercises
      };

      return {
        id: dayId,
        name: dayTemplate.title,
        isCollapsed: false,
        items: [mainBlock]
      };
    });

    // 4. Validación Post-Generación (Dosimetría Clínica)
    setGenerationStepText('Verificando compliance de dosificación clínica...');
    await new Promise(resolve => setTimeout(resolve, 400));

    const dosageResult = validateClinicalDosage(newDays, experienceLevel);
    if (!dosageResult.isValid) {
      setDosageWarnings(dosageResult.violations.map(v => v.message));
    }

    // 5. Inyección Atómica
    adaptTemplate(newDays);
    setIsGenerating(false);
  };

  return {
    generateTemplate,
    isGenerating,
    generationStepText,
    swapsOccurred,
    dosageWarnings
  };
};
