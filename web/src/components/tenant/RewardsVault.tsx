import React from 'react';
import { Plus, Edit2, Trash2, Box } from 'lucide-react';
import { useRewardsCatalog } from '../../hooks/useMonetization';

interface RewardConfig {
    id: string;
    title: string;
    description: string;
    costPoints: int;
    stock: int | null;
    isActive: boolean;
}

export const RewardsVault: React.FC = () => {
    const { data: response, isLoading } = useRewardsCatalog();
    const rewards = response?.data.available_rewards || [];
    const meta = response?.meta;

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Box size={24} className="text-emerald-400" />
                        Bóveda de Recompensas
                    </h2>
                    <p className="text-sm text-zinc-400">
                        Configura qué premios pueden canjear tus atletas con sus Vital Points.
                    </p>
                    {meta?.is_degraded && (
                        <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100/10 text-amber-500 border border-amber-500/20">
                            Modo Degradado: {meta.reason}
                        </div>
                    )}
                </div>
                <button className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors">
                    <Plus size={18} />
                    Crear Premio
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="text-zinc-500">Cargando catálogo...</div>
                ) : rewards.map(reward => (
                    <div key={reward.id} className="bg-zinc-800/50 border border-zinc-700 p-5 rounded-2xl flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-white text-lg">{reward.name}</h3>
                            <div className="flex gap-2">
                                <button className="text-zinc-400 hover:text-white transition-colors"><Edit2 size={16} /></button>
                                <button className="text-zinc-400 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <p className="text-zinc-400 text-sm flex-grow mb-4">{reward.description}</p>

                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-zinc-700/50">
                            <span className="text-emerald-400 font-bold font-mono text-lg">
                                {reward.vital_points_cost} VP
                            </span>
                            <span className="text-xs font-semibold text-zinc-500 bg-zinc-800 px-2 py-1 rounded-md">
                                {reward.available_stock === null ? 'INDEFINIDO' : `STOCK: ${reward.available_stock}`}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
