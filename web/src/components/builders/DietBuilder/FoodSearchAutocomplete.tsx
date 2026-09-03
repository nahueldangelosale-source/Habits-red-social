
import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, MapPin } from 'lucide-react';
import type { FoodItem } from '../../../stores/builderStore';
import { LOCAL_FOODS } from './localFoods';
import { useTheme } from '../../../context/ThemeContext';

interface FoodSearchProps {
    onSelect: (food: FoodItem) => void;
    onClose: () => void;
    mealId: string;
}

export const FoodSearchAutocomplete: React.FC<FoodSearchProps> = ({ onSelect, onClose, mealId: _mealId }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<FoodItem[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    // Auto-focus on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
        // Show initial local favorites
        setResults(LOCAL_FOODS.slice(0, 5));
    }, []);

    // Search Logic (Client-side simple fuzzy)
    useEffect(() => {
        if (!query.trim()) {
            setResults(LOCAL_FOODS.slice(0, 5));
            return;
        }

        const filtered = LOCAL_FOODS.filter(food =>
            food.name.toLowerCase().includes(query.toLowerCase()) ||
            food.tags.some(t => t.includes(query.toLowerCase()))
        );
        setResults(filtered.slice(0, 8));
        setSelectedIndex(0);
    }, [query]);

    // Keyboard Navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (results[selectedIndex]) {
                onSelect(results[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <div className={`w-full rounded-xl overflow-hidden border shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${isClinical
            ? 'bg-white border-slate-200 shadow-slate-200'
            : 'bg-[#18181b] border-white/10 shadow-black/50'}`}>

            {/* Input Header */}
            <div className={`flex items-center gap-3 p-3 border-b ${isClinical ? 'border-slate-100' : 'border-white/5'}`}>
                <Search size={18} className={isClinical ? 'text-slate-400' : 'text-zinc-400'} />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search foods (e.g. 'Milanesa', 'Palta')..."
                    className={`flex-1 bg-transparent outline-none text-sm font-medium ${isClinical
                        ? 'text-slate-800 placeholder:text-slate-400'
                        : 'text-white placeholder:text-zinc-500'}`}
                />
                <div className={`px-2 py-1 rounded text-[10px] font-mono border ${isClinical
                    ? 'bg-slate-100 border-slate-200 text-slate-500'
                    : 'bg-white/5 border-white/10 text-zinc-400'}`}>
                    ESC
                </div>
            </div>

            {/* Results List */}
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {results.length === 0 ? (
                    <div className="p-8 text-center opacity-50">
                        <p className="text-sm">No foods found.</p>
                        <button className="mt-2 text-xs underline text-indigo-500">Create Custom Food</button>
                    </div>
                ) : (
                    results.map((food, index) => (
                        <div
                            key={food.id}
                            onClick={() => onSelect(food)}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${index === selectedIndex
                                ? (isClinical ? 'bg-slate-50' : 'bg-white/5')
                                : 'bg-transparent'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${isClinical ? 'bg-white border border-slate-100 shadow-sm' : 'bg-zinc-900 border border-white/5'
                                    }`}>
                                    {food.category === 'protein' ? '🥩' :
                                        food.category === 'carb' ? '🍚' :
                                            food.category === 'veggie' ? '🥦' :
                                                food.category === 'fat' ? '🥑' : '🍎'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm font-medium ${isClinical ? 'text-slate-800' : 'text-zinc-200'}`}>
                                            {food.name}
                                        </span>
                                        {food.isLocal && (
                                            <span className={`flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider ${isClinical ? 'bg-sky-50 text-sky-600' : 'bg-sky-500/20 text-sky-400'
                                                }`}>
                                                <MapPin size={8} /> Local
                                            </span>
                                        )}
                                    </div>
                                    <div className={`text-xs ${isClinical ? 'text-slate-400' : 'text-zinc-400'}`}>
                                        {food.portion} {food.unit} • <span className={isClinical ? "text-emerald-600 font-bold" : "text-indigo-400"}>{food.calories} kcal</span>
                                    </div>
                                </div>
                            </div>

                            <button className={`p-1.5 rounded-lg transition-all ${index === selectedIndex
                                ? (isClinical ? 'bg-indigo-100 text-indigo-600 opacity-100' : 'bg-indigo-500 text-black opacity-100')
                                : 'opacity-0'
                                }`}>
                                <Plus size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
