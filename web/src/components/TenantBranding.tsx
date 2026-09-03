import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Palette, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';
import { getContrastYIQ } from '../utils/colors';
import { useTheme } from '../context/ThemeContext';

interface BrandingConfig {
    logo_url: string | null;
    primary_color: string;
}

export const TenantBranding: React.FC = () => {
    const [config, setConfig] = useState<BrandingConfig>({
        logo_url: null,
        primary_color: '#6366f1'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const { mode } = useTheme();
    const isClinical = mode === 'CLINICAL';

    // Fetch current branding on mount
    useEffect(() => {
        const fetchBranding = async () => {
            try {
                // api.get directly returns the parsed JSON
                const data: any = await api.get('/v1/tenants/branding');
                setConfig({
                    logo_url: data.logo_url,
                    primary_color: data.primary_color || '#6366f1'
                });
            } catch (err) {
                console.error("Failed to load branding:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBranding();
    }, []);

    // Handle Color Change
    const handleColorSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            await api.patch('/v1/tenants/branding', { primary_color: config.primary_color });
            setMessage({ type: 'success', text: 'Color corporativo actualizado exitosamente.' });

            // Refech to sync UI
            const data: any = await api.get('/v1/tenants/branding');
            setConfig({ ...config, primary_color: data.primary_color });

        } catch (err: any) {
            setMessage({ type: 'error', text: err.data?.detail || 'Error al guardar el color.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    // Handle Logo Upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsSaving(true);
        setUploadProgress(10);
        setMessage(null);

        try {
            // Raw fetch to bypass api.post's JSON.stringify forcing for FormData
            const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE_URL}/api/v1/tenants/branding/logo`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.detail || 'Error al subir la imagen');
            }

            const data = await res.json();
            setConfig(prev => ({ ...prev, logo_url: data.logo_url }));
            setMessage({ type: 'success', text: 'Logo subido y emitiendo desde CDN.' });

        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Error de red.' });
        } finally {
            setIsSaving(false);
            setUploadProgress(0);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const textColor = getContrastYIQ(config.primary_color);

    if (isLoading) {
        return <div className={`p-8 text-center animate-pulse ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Cargando motor de marca blanca...</div>;
    }

    return (
        <div className={`p-8 mx-auto min-h-screen transition-colors duration-1000 ${isClinical ? 'bg-slate-50 text-slate-900' : 'bg-transparent text-white'}`}>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className={`text-3xl font-black tracking-tight flex items-center gap-3 ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                        <Palette className={isClinical ? 'text-emerald-600' : 'text-indigo-400'} />
                        Motor de Marca Blanca
                    </h1>
                    <p className={`mt-2 ${isClinical ? 'text-slate-500' : 'text-zinc-400'}`}>Personaliza la PWA clínica que ven tus atletas y pacientes (B2C).</p>
                </div>

                {/* Notification Banner */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className={`p-4 mb-6 rounded-xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-red-500/10 border-red-500/20 text-red-600'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        {message.text}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* LOGO UPLOAD SECTION */}
                    <div className={`border rounded-2xl p-6 backdrop-blur-xl ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/50 border-white/5'}`}>
                        <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                            <Upload size={18} className={isClinical ? 'text-slate-400' : 'text-zinc-400'} /> Logo del Gimnasio
                        </h2>

                        <div className={`mb-6 flex justify-center p-6 rounded-xl border min-h-[160px] relative items-center ${isClinical ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/50 border-white/5'}`}>
                            {config.logo_url ? (
                                <img src={config.logo_url} alt="Tenant Logo" className="max-h-24 object-contain" />
                            ) : (
                                <div className={`text-sm font-medium flex gap-2 items-center ${isClinical ? 'text-slate-500' : 'text-zinc-600'}`}>
                                    <AlertCircle size={16} /> Ningún logo configurado
                                </div>
                            )}
                        </div>

                        <div className="relative">
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/svg+xml"
                                onChange={handleFileUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                disabled={isSaving}
                            />
                            <button className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${isClinical ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}>
                                {uploadProgress > 0 ? `Subiendo... ${uploadProgress}%` : 'Subir Nueva Imagen'}
                            </button>
                        </div>
                        <p className={`text-[10px] mt-3 text-center ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Recomendado: Archivo PNG transparente. Emisión rápida vía CDN autorizada.</p>
                    </div>

                    {/* COLOR PICKER & UI SAFETY PREVIEW */}
                    <div className={`border rounded-2xl p-6 backdrop-blur-xl ${isClinical ? 'bg-white border-slate-200 shadow-sm' : 'bg-zinc-900/50 border-white/5'}`}>
                        <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                            <Palette size={18} className={isClinical ? 'text-slate-400' : 'text-zinc-400'} /> Color Corporativo
                        </h2>

                        <div className="flex items-center gap-4 mb-6">
                            <input
                                type="color"
                                value={config.primary_color}
                                onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                                className="w-16 h-16 rounded-xl cursor-pointer bg-transparent border-0 p-0"
                            />
                            <div className="flex-1">
                                <label className={`block text-xs uppercase font-bold mb-1 ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Valor Hexadecimal</label>
                                <input
                                    type="text"
                                    value={config.primary_color}
                                    onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                                    className={`w-full border rounded-lg px-3 py-2 font-mono uppercase focus:outline-none ${isClinical ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500' : 'bg-zinc-950/50 border-white/10 text-white focus:border-indigo-500'}`}
                                    placeholder="#HEXVAL"
                                />
                            </div>
                        </div>

                        {/* LIVE PREVIEW WITH UI SAFETY */}
                        <div className={`rounded-xl border p-6 mb-6 ${isClinical ? 'bg-slate-50 border-slate-200' : 'bg-zinc-950/50 border-white/5'}`}>
                            <h3 className={`text-xs font-bold uppercase mb-4 text-center ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>Preview Atleta (B2C)</h3>

                            <div className="max-w-[200px] mx-auto space-y-3">
                                {/* Simulando un botón de PWA de Atleta */}
                                <button
                                    className="w-full py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                                    style={{
                                        backgroundColor: config.primary_color,
                                        color: textColor
                                    }}
                                >
                                    <CheckCircle2 size={18} />
                                    Completado
                                </button>
                            </div>
                            <p className={`text-[10px] mt-4 text-center ${isClinical ? 'text-slate-500' : 'text-zinc-500'}`}>
                                El Engine aplica contraste inteligente (YIQ). Texto será {textColor === '#09090b' ? 'Negro' : 'Blanco'}.
                            </p>
                        </div>

                        <button
                            onClick={handleColorSave}
                            disabled={isSaving}
                            className={`w-full py-3 px-4 rounded-xl font-black flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${isClinical ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-indigo-500 hover:bg-indigo-400 text-black'}`}
                        >
                            {isSaving ? 'Guardando...' : <><Save size={18} /> Aplicar Color</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
