import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { TemplateLibrary } from './library/TemplateLibrary';

export const LibraryDashboard: React.FC = () => {
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    return (
        <main className={`min-h-screen p-4 md:p-6 font-sans transition-colors duration-500 ${
            isClinical ? 'bg-slate-50 text-slate-800' : 'bg-[#06080e] text-white'
        }`}>
            <div className="w-full max-w-7xl mx-auto">
                <TemplateLibrary />
            </div>
        </main>
    );
};
