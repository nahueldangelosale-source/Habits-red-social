import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    UserPlus,
    MoreVertical,
    Mail,
    Phone,
    Shield,
    Activity,
    CheckCircle,
    XCircle,
    Stethoscope,
    Dumbbell
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Professional {
    id: string;
    name: string;
    email: string;
    role: 'NUTRITIONIST' | 'TRAINER' | 'ADMIN';
    status: 'ACTIVE' | 'INACTIVE';
    patientsCount: number;
    lastActive: string;
    avatar: string;
}

import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export const ProfessionalsManager: React.FC = () => {
    const { mode } = useTheme();
    const [showAddModal, setShowAddModal] = useState(false);

    const { data: professionals = [], isLoading, isError } = useQuery({
        queryKey: ['professionals'],
        queryFn: async () => {
            const response = await api.get('/api/v1/professionals/');
            return response.data.map((p: any) => ({
                id: p.id,
                name: `${p.first_name} ${p.last_name}`,
                email: p.email,
                role: p.role,
                status: 'ACTIVE',
                patientsCount: 0,
                lastActive: 'Online',
                avatar: p.first_name[0] + p.last_name[0]
            })) as Professional[];
        }
    });

    const isClinical = mode === 'CLINICAL';
    const bgClass = isClinical ? 'bg-slate-50 text-slate-800' : 'bg-zinc-950 text-white';
    const cardClass = isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800';

    return (
        <div className={`min-h-screen p-8 transition-colors duration-1000 ${bgClass}`}>

            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Users size={32} className={isClinical ? 'text-emerald-600' : 'text-indigo-400'} />
                        Equipo Profesional
                    </h1>
                    <p className={`text-sm mt-1 ${isClinical ? 'text-slate-500' : 'opacity-60'}`}>Gestión de staff, roles y permisos de acceso.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className={`px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg ${isClinical ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/10' : 'bg-indigo-500 text-black hover:bg-indigo-400 shadow-indigo-500/10'}`}
                >
                    <UserPlus size={20} />
                    Nuevo Profesional
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    icon={Stethoscope}
                    label="Nutricionistas"
                    value={professionals.filter(p => p.role === 'NUTRITIONIST').length}
                    color={isClinical ? 'text-emerald-600' : 'text-indigo-400'}
                    bg={isClinical ? 'bg-emerald-50' : 'bg-indigo-500/10'}
                    cardClass={cardClass}
                />
                <StatCard
                    icon={Dumbbell}
                    label="Entrenadores"
                    value={professionals.filter(p => p.role === 'TRAINER').length}
                    color={isClinical ? 'text-blue-600' : 'text-blue-400'}
                    bg={isClinical ? 'bg-blue-50' : 'bg-blue-500/10'}
                    cardClass={cardClass}
                />
                <StatCard
                    icon={Shield}
                    label="Admins"
                    value={professionals.filter(p => p.role === 'ADMIN').length}
                    color={isClinical ? 'text-purple-600' : 'text-purple-400'}
                    bg={isClinical ? 'bg-purple-50' : 'bg-purple-500/10'}
                    cardClass={cardClass}
                />
            </div>

            {/* Staff List */}
            <div className={`rounded-2xl border overflow-hidden ${cardClass}`}>
                <table className="w-full">
                    <thead className={`text-xs font-bold uppercase tracking-wider border-b ${isClinical ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}>
                        <tr>
                            <th className="px-6 py-4 text-left">Profesional</th>
                            <th className="px-6 py-4 text-left">Rol</th>
                            <th className="px-6 py-4 text-left">Estado</th>
                            <th className="px-6 py-4 text-left">Pacientes</th>
                            <th className="px-6 py-4 text-left">Última Actividad</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${isClinical ? 'divide-slate-100' : 'divide-zinc-800'}`}>
                        {isLoading && (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center">
                                    <div className="animate-pulse flex space-x-4">
                                        <div className="flex-1 space-y-4 py-1">
                                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                            <div className="space-y-2">
                                                <div className="h-4 bg-slate-200 rounded"></div>
                                                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {isError && (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 text-center text-red-500">
                                    Error al cargar profesionales.
                                </td>
                            </tr>
                        )}
                        {!isLoading && !isError && professionals.map(prof => (
                            <tr key={prof.id} className={`transition ${isClinical ? 'hover:bg-slate-50' : 'hover:bg-white/5'}`}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isClinical ? 'bg-slate-200 text-slate-700' : 'bg-zinc-800 text-white'}`}>
                                            {prof.avatar}
                                        </div>
                                        <div>
                                            <div className={`font-bold ${isClinical ? 'text-slate-900' : 'text-white'}`}>{prof.name}</div>
                                            <div className={`text-xs ${isClinical ? 'text-slate-500' : 'opacity-60'}`}>{prof.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold border ${getRoleBadge(prof.role, isClinical)}`}>
                                        {getRoleIcon(prof.role)}
                                        {prof.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${prof.status === 'ACTIVE' ? (isClinical ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/20 text-emerald-400') : (isClinical ? 'bg-slate-100 text-slate-500' : 'bg-zinc-800 text-zinc-400')}`}>
                                        {prof.status === 'ACTIVE' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                        {prof.status}
                                    </span>
                                </td>
                                <td className={`px-6 py-4 text-sm font-mono ${isClinical ? 'text-slate-700' : 'text-white'}`}>
                                    {prof.patientsCount}
                                </td>
                                <td className={`px-6 py-4 text-sm ${isClinical ? 'text-slate-500' : 'opacity-60'}`}>
                                    {prof.lastActive}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className={`p-2 rounded-lg transition ${isClinical ? 'hover:bg-slate-100' : 'hover:bg-zinc-800'}`}>
                                        <MoreVertical size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color, bg, cardClass }: any) => (
    <div className={`p-6 rounded-2xl flex items-center gap-4 shadow-sm border ${cardClass}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${color}`}>
            <Icon size={24} />
        </div>
        <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs uppercase tracking-wider opacity-60">{label}</div>
        </div>
    </div>
);

const getRoleBadge = (role: string, isClinical: boolean) => {
    switch (role) {
        case 'NUTRITIONIST': return isClinical ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
        case 'TRAINER': return isClinical ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'ADMIN': return isClinical ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        default: return isClinical ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
}

const getRoleIcon = (role: string) => {
    switch (role) {
        case 'NUTRITIONIST': return <Stethoscope size={12} />;
        case 'TRAINER': return <Dumbbell size={12} />;
        case 'ADMIN': return <Shield size={12} />;
        default: return <Users size={12} />;
    }
}
