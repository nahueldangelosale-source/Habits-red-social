import React from 'react';
import { ProfessionalAgenda } from '../components/calendar/ProfessionalAgenda';
import { useTheme } from '../context/ThemeContext';

export const SmartCalendarPage: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    return (
        <main className={`min-h-screen p-4 md:p-6 transition-colors duration-500 ${
            isClinical ? 'bg-slate-50 text-slate-800' : 'bg-zinc-950 text-white'
        }`}>
            <ProfessionalAgenda />
        </main>
    );
};
