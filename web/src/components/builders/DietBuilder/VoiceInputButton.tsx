
import React, { useState } from 'react';
import { Mic, Loader2, X } from 'lucide-react';
import { useBuilderStore } from '../../../stores/builderStore';
import { LOCAL_FOODS } from './localFoods';
import { useTheme } from '../../../context/ThemeContext';

interface VoiceInputProps {
    activeDay: string;
}

export const VoiceInputButton: React.FC<VoiceInputProps> = ({ activeDay }) => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const { addFoodToMeal, activeDiet } = useBuilderStore();
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    const handleVoiceStart = () => {
        setIsListening(true);
        setTranscript("Listening...");

        // SIMULATION: In a real app, this would use Web Speech API or backend Whisper
        setTimeout(() => {
            setTranscript("Simulating: 'Agregar 2 huevos al desayuno'...");

            setTimeout(() => {
                const command = "2 huevos"; // Mock parsed intent
                processCommand(command);
                setIsListening(false);
            }, 1500);
        }, 1000);
    };

    const processCommand = (text: string) => {
        // MICRO-NLP (Regex based for demo)
        const lowerText = text.toLowerCase();
        let foundFood = LOCAL_FOODS.find(f => lowerText.includes(f.name.toLowerCase().split(' ')[0].toLowerCase()));

        // Fallback for demo
        if (!foundFood && lowerText.includes('huevos')) foundFood = LOCAL_FOODS.find(f => f.name.includes('Huevos'));

        if (foundFood) {
            // Determine meal (default to first meal of day or 'desayuno')
            const dayMeals = activeDiet.days[activeDay] || [];
            const targetMeal = dayMeals.find(m => m.name.toLowerCase().includes('desayuno')) || dayMeals[0];

            if (targetMeal) {
                // Determine quantity (mock)
                const quantityRaw = text.match(/\d+/);
                const quantity = quantityRaw ? parseInt(quantityRaw[0]) : foundFood.portion;

                addFoodToMeal(activeDay, targetMeal.id, {
                    ...foundFood,
                    portion: quantity
                });
                alert(`Voice Assistant: Added ${quantity} ${foundFood.unit} of ${foundFood.name} to ${targetMeal.name}`);
            }
        } else {
            alert("Voice Assistant: Could not understand food item.");
        }
    };

    return (
        <>
            <button
                onClick={handleVoiceStart}
                className={`fixed bottom-8 right-8 p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 z-50 flex items-center gap-2 ${isClinical
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-indigo-500 text-black hover:bg-[#b0d600]'}`}
            >
                {isListening ? <Loader2 size={24} className="animate-spin" /> : <Mic size={24} />}
                <span className="font-bold hidden md:inline ml-2">AI Input</span>
            </button>

            {/* Listening Overlay */}
            {isListening && (
                <div className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm z-40 flex items-center justify-center animate-in fade-in duration-200">
                    <div className={`p-8 rounded-3xl flex flex-col items-center gap-6 shadow-2xl max-w-sm w-full mx-4 ${isClinical
                        ? 'bg-white'
                        : 'bg-zinc-900 border border-white/10'}`}>

                        <div className={`p-6 rounded-full animate-pulse ${isClinical ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/20 text-indigo-400'}`}>
                            <Mic size={48} />
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className={`text-xl font-bold ${isClinical ? 'text-slate-800' : 'text-white'}`}>Listening...</h3>
                            <p className={`font-mono text-sm ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>{transcript}</p>
                        </div>

                        <button
                            onClick={() => setIsListening(false)}
                            className={`p-2 rounded-full hover:bg-zinc-950/5 transition-colors ${isClinical ? 'text-slate-400' : 'text-zinc-400'}`}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
