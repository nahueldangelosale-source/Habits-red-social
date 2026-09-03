
import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, Play, BarChart2, Award } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { AdaptSwitch } from './behavioral/AdaptSwitch';

export const MindGym: React.FC = () => {
    const { mode } = useTheme();

    // Theme configurations
    const theme = mode === 'CLINICAL' ? {
        bg: '#F5F5F7',
        card: '#FFFFFF',
        text: '#1D1D1F',
        accent: '#88B04B',
        accentText: '#FFFFFF',
        subtext: '#86868B'
    } : {
        bg: '#09090b',
        card: '#1C1C1E',
        text: '#FFFFFF',
        accent: '#6366f1',
        accentText: '#09090b',
        subtext: '#8E8E93'
    };

    const challenges = [
        { id: 1, title: 'Focus Flow', category: 'Attention', duration: '5 min', level: 'Easy' },
        { id: 2, title: 'Memory Matrix', category: 'Memory', duration: '10 min', level: 'Medium' },
        { id: 3, title: 'Speed Solve', category: 'Processing', duration: '3 min', level: 'Hard' },
    ];

    return (
        <div className="min-h-screen p-8 transition-colors duration-500" style={{ backgroundColor: theme.bg, color: theme.text }}>

            {/* Header */}
            <div className="mb-10 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <Brain size={40} style={{ color: theme.accent }} />
                        Mind Gym
                    </h1>
                    <p className="text-sm uppercase tracking-widest font-medium" style={{ color: theme.subtext }}>
                        Cognitive Performance Training
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <div className="text-xs font-bold uppercase" style={{ color: theme.subtext }}>Brain Score</div>
                        <div className="text-3xl font-mono font-bold" style={{ color: theme.accent }}>842</div>
                    </div>
                </div>
            </div>

            {/* VAK & Entropy Control Widget */}
            <div className="mb-8 flex justify-end">
                <AdaptSwitch />
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* Hero Card - Daily Workout */}
                <div className="col-span-12 md:col-span-8 p-8 rounded-3xl relative overflow-hidden" style={{ backgroundColor: theme.card }}>
                    <div className="relative z-10">
                        <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4" style={{ backgroundColor: theme.accent, color: theme.accentText }}>
                            DAILY RECOMMENDED
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Neuroplasticity Primer</h2>
                        <p className="max-w-md mb-8" style={{ color: theme.subtext }}>
                            A scientifically designed sequence to prime your brain for high-performance tasks. Focuses on working memory and pattern recognition.
                        </p>
                        <button className="px-8 py-4 rounded-xl font-bold flex items-center gap-2 transform transition hover:scale-105" style={{ backgroundColor: theme.accent, color: theme.accentText }}>
                            <Play size={20} fill="currentColor" />
                            Start Session
                        </button>
                    </div>
                    {/* Abstract Decoration */}
                    <div className="absolute right-0 top-0 w-64 h-64 opacity-10">
                        <Brain size={256} />
                    </div>
                </div>

                {/* Stat Card */}
                <div className="col-span-12 md:col-span-4 p-8 rounded-3xl flex flex-col justify-between" style={{ backgroundColor: theme.card }}>
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <BarChart2 size={20} /> Performance
                    </h3>
                    <div className="flex-1 flex items-center justify-center">
                        <div className="relative w-40 h-40 rounded-full border-8 flex items-center justify-center" style={{ borderColor: theme.bg }}>
                            <span className="text-2xl font-bold">+12%</span>
                            <span className="text-xs absolute bottom-8">vs last week</span>
                        </div>
                    </div>
                </div>

                {/* Challenge List */}
                <div className="col-span-12">
                    <h3 className="text-xl font-bold mb-6">Available Challenges</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {challenges.map(c => (
                            <motion.div
                                key={c.id}
                                whileHover={{ y: -5 }}
                                className="p-6 rounded-2xl cursor-pointer transition-shadow hover:shadow-lg"
                                style={{ backgroundColor: theme.card }}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                                        <Zap size={24} style={{ color: theme.accent }} />
                                    </div>
                                    <span className="text-xs font-bold px-2 py-1 rounded border" style={{ borderColor: theme.subtext, color: theme.subtext }}>
                                        {c.level}
                                    </span>
                                </div>
                                <h4 className="font-bold text-lg mb-1">{c.title}</h4>
                                <p className="text-sm mb-4" style={{ color: theme.subtext }}>{c.category}</p>
                                <div className="flex items-center text-xs font-mono gap-2" style={{ color: theme.subtext }}>
                                    <ClockIcon /> {c.duration}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

const ClockIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
);
