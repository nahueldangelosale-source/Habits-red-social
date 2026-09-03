export interface ExerciseNode {
    id: string;
    name: string;
    officialName: string;
    movementPattern: string;
    description: string; // e.g., "3 sets x 12 reps"
    [key: string]: any;
}

export interface DayNode {
    name: string;
    exercises: ExerciseNode[];
    isDeload?: boolean;
}

export type ProgressionPreset = 'LINEAR' | 'UNDULATING' | 'DUP' | 'BLOCK';

export interface ProgressionSettings {
    rpeIncrement: number; // e.g. 0.5 per week
    volumeIncrement: number; // e.g. 1 set per week
    deloadFrequency: number; // e.g. 3 (every 3rd week)
    applyToVolume?: boolean; // whether to apply volume increment or not
}

export const defaultProgressionSettings: ProgressionSettings = {
    rpeIncrement: 0.5,
    volumeIncrement: 0, // Por defecto no subir series
    deloadFrequency: 3,
    applyToVolume: false
};

const CORE_PATTERNS = [
    'RODILLA', 'CADERA', 'EMPUJE_V', 'EMPUJE_H', 'TRACCION_V', 'TRACCION_H', 'KNEE_DOM_BILATERAL'
];

export function applyPresetProgression(week1Days: DayNode[], totalWeeks: number, preset: ProgressionPreset, customSettings?: ProgressionSettings): DayNode[] {
    const settings = customSettings || defaultProgressionSettings;
    
    switch (preset) {
        case 'LINEAR':
            return applyLinearProgression(week1Days, totalWeeks, settings);
        case 'UNDULATING':
            return applyUndulatingProgression(week1Days, totalWeeks, settings);
        case 'DUP':
            return applyDUPProgression(week1Days, totalWeeks, settings);
        case 'BLOCK':
            return applyBlockProgression(week1Days, totalWeeks, settings);
        default:
            return applyLinearProgression(week1Days, totalWeeks, settings);
    }
}

function cloneWeek(days: DayNode[], weekNum: number): DayNode[] {
    return days.map(d => ({
        ...d,
        name: `S${weekNum} - ${d.name.replace(/^S\d+\s*-\s*/, '')}`,
        exercises: d.exercises.map(ex => ({
            ...ex,
            id: Math.random().toString(36).substr(2, 9)
        }))
    }));
}

function updateExerciseIntensity(ex: ExerciseNode, rpeVal: number | string, volumeMod: number = 0) {
    let desc = ex.description || "";
    
    // RPE Update
    if (typeof rpeVal === 'number') {
        const rpeAdd = `@ RPE ${rpeVal}`;
        if (desc.includes('@ RPE')) {
            desc = desc.replace(/@ RPE \d+(\.\d+)?/i, rpeAdd);
        } else {
            desc = `${desc} ${rpeAdd}`;
        }
    } else if (typeof rpeVal === 'string') {
        const rpeAdd = `@ RPE ${rpeVal}`;
        if (desc.includes('@ RPE')) {
            desc = desc.replace(/@ RPE [^\s]+/i, rpeAdd);
        } else {
            desc = `${desc} ${rpeAdd}`;
        }
    }

    // Volume Update
    if (volumeMod !== 0) {
        const setsMatch = desc.match(/(\d+)\s*sets/i);
        if (setsMatch) {
            const currentSets = parseInt(setsMatch[1]);
            const newSets = Math.max(1, currentSets + volumeMod);
            desc = desc.replace(new RegExp(`${currentSets}\\s*sets`, 'i'), `${newSets} sets`);
        } else if (volumeMod > 0) {
            desc = `${desc} (+${volumeMod} Serie)`;
        }
    }

    ex.description = desc;
}

function applyDeload(day: DayNode) {
    day.isDeload = true;
    day.exercises.forEach(ex => {
        let desc = ex.description || "";
        const setsMatch = desc.match(/(\d+)\s*sets/i);

        if (setsMatch) {
            const currentSets = parseInt(setsMatch[1]);
            const nextSets = Math.max(1, Math.floor(currentSets / 2));
            desc = desc.replace(new RegExp(`${currentSets}\\s*sets`, 'i'), `${nextSets} sets`);
        }

        if (desc.includes('@ RPE')) {
            desc = desc.replace(/@ RPE \d+(\.\d+)?/i, '@ RPE 6 (Deload)');
        } else {
            desc = `${desc} @ RPE 6 (Deload)`;
        }

        ex.description = desc;
    });
}

export function applyLinearProgression(week1Days: DayNode[], totalWeeks: number, settings: ProgressionSettings = defaultProgressionSettings): DayNode[] {
    const allDays: DayNode[] = [];
    for (let w = 1; w <= totalWeeks; w++) {
        const week = cloneWeek(week1Days, w);
        
        if (w > 1 && w % settings.deloadFrequency === 0) {
            week.forEach(applyDeload);
        } else {
            // RPE increases according to settings, volume increases according to settings
            const progressionWeeks = w - Math.floor(w / settings.deloadFrequency) - 1; // Effective weeks of progression
            const rpeIncrease = progressionWeeks * settings.rpeIncrement; 
            const volumeIncrease = settings.applyToVolume ? progressionWeeks * settings.volumeIncrement : 0;
            
            week.forEach(day => {
                day.exercises.forEach(ex => {
                    updateExerciseIntensity(ex, 7 + rpeIncrease, volumeIncrease);
                });
            });
        }
        allDays.push(...week);
    }
    return allDays;
}

export function applyUndulatingProgression(week1Days: DayNode[], totalWeeks: number, settings: ProgressionSettings = defaultProgressionSettings): DayNode[] {
    const allDays: DayNode[] = [];
    const wave = [
        { rpe: 8.5, name: 'Heavy' },
        { rpe: 6.5, name: 'Light' },
        { rpe: 7.5, name: 'Medium' }
    ];
    for (let w = 1; w <= totalWeeks; w++) {
        const week = cloneWeek(week1Days, w);
        if (w > 1 && w % settings.deloadFrequency === 0) {
            week.forEach(applyDeload);
        } else {
            const phase = wave[(w - 1) % 3];
            week.forEach(day => {
                day.exercises.forEach(ex => {
                    updateExerciseIntensity(ex, phase.rpe);
                });
            });
        }
        allDays.push(...week);
    }
    return allDays;
}

export function applyBlockProgression(week1Days: DayNode[], totalWeeks: number, settings: ProgressionSettings = defaultProgressionSettings): DayNode[] {
    const allDays: DayNode[] = [];
    // Bloques: Volumen primero, Intensidad despues
    for (let w = 1; w <= totalWeeks; w++) {
        const week = cloneWeek(week1Days, w);
        if (w > 1 && w % settings.deloadFrequency === 0) {
            week.forEach(applyDeload);
        } else {
            const isIntensityBlock = w > (totalWeeks / 2);
            const progressionWeeks = w - Math.floor(w / settings.deloadFrequency) - 1;
            const rpeIncrease = progressionWeeks * settings.rpeIncrement;
            
            week.forEach(day => {
                day.exercises.forEach(ex => {
                    if (isIntensityBlock) {
                        updateExerciseIntensity(ex, 8 + rpeIncrease, -1);
                    } else {
                        updateExerciseIntensity(ex, 6 + rpeIncrease, 1);
                    }
                });
            });
        }
        allDays.push(...week);
    }
    return allDays;
}

export function applyDUPProgression(week1Days: DayNode[], totalWeeks: number, settings: ProgressionSettings = defaultProgressionSettings): DayNode[] {
    const allDays: DayNode[] = [];
    // Rotación diaria: Strength, Hypertrophy, Power
    const dailyFocus = [
        { rpe: 9, vol: -1 }, // Fuerza: Menos reps/series, RPE alto
        { rpe: 8, vol: 0 },  // Hipertrofia: Base
        { rpe: 7, vol: -1 }  // Potencia: Menos RPE, foco velocidad
    ];
    
    for (let w = 1; w <= totalWeeks; w++) {
        const week = cloneWeek(week1Days, w);
        if (w > 1 && w % settings.deloadFrequency === 0) {
            week.forEach(applyDeload);
        } else {
            const progressionWeeks = w - Math.floor(w / settings.deloadFrequency) - 1;
            const weekRpeBump = progressionWeeks * settings.rpeIncrement;
            
            week.forEach((day, index) => {
                const focus = dailyFocus[index % dailyFocus.length];
                day.exercises.forEach(ex => {
                    if (CORE_PATTERNS.includes(ex.movementPattern?.toUpperCase() || "")) {
                        updateExerciseIntensity(ex, focus.rpe + weekRpeBump, focus.vol);
                    } else {
                        updateExerciseIntensity(ex, 7 + weekRpeBump);
                    }
                });
            });
        }
        allDays.push(...week);
    }
    return allDays;
}
