import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '../../api/client';
import toast from 'react-hot-toast';

interface EdgeVideoUploaderProps {
    onUploadSuccess: (videoUrl: string) => void;
}

export const EdgeVideoUploader: React.FC<EdgeVideoUploaderProps> = ({ onUploadSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const MAX_SIZE_MB = 50;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    const VALID_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        if (!VALID_TYPES.includes(selected.type)) {
            toast.error('Formato no válido. Usa MP4, WebM o MOV.');
            return;
        }

        if (selected.size > MAX_SIZE_BYTES) {
            toast.error(`El archivo excede los ${MAX_SIZE_MB}MB permitidos.`);
            return;
        }

        setFile(selected);
        setStatus('idle');
        setProgress(0);
    };

    const uploadToS3 = async () => {
        if (!file) return;

        setStatus('uploading');
        setProgress(0);

        try {
            // 1. Obtener Presigned POST del Backend
            const { url, fields } = await api.post('/api/v1/storage/video-url', {
                file_name: file.name,
                content_type: file.type
            });

            // 2. Preparar FormData para S3
            const formData = new FormData();
            Object.keys(fields).forEach(key => {
                formData.append(key, fields[key]);
            });
            formData.append('file', file);

            // 3. Subir vía XMLHttpRequest para tracking de progreso (Edge Upload)
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded / event.total) * 100);
                        setProgress(percentComplete);
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        setStatus('success');
                        const finalUrl = `${url}/${fields.key}`;
                        toast.success('Video subido exitosamente');
                        onUploadSuccess(finalUrl);
                        resolve(finalUrl);
                    } else {
                        setStatus('error');
                        setErrorMsg(`Error S3: ${xhr.statusText}`);
                        toast.error('Error al subir a S3');
                        reject(new Error(xhr.statusText));
                    }
                });

                xhr.addEventListener('error', () => {
                    setStatus('error');
                    setErrorMsg('Error de conexión con S3');
                    toast.error('Error de red');
                    reject(new Error('Network error'));
                });

                xhr.open('POST', url, true);
                xhr.send(formData);
            });

        } catch (error: any) {
            setStatus('error');
            setErrorMsg(error.message || 'Error al solicitar firma S3');
            toast.error('Error de servidor');
        }
    };

    return (
        <div className="p-4 border rounded-xl bg-white border-slate-200">
            <h4 className="text-sm font-bold text-slate-800 mb-2">Video Demostrativo</h4>
            
            {!file ? (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                >
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600 font-medium">Click para subir video</p>
                    <p className="text-xs text-slate-400 mt-1">MP4, MOV, WebM (Máx 50MB)</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 bg-slate-200 rounded flex items-center justify-center shrink-0">
                                <video className="w-full h-full object-cover rounded" src={URL.createObjectURL(file)} />
                            </div>
                            <div className="truncate">
                                <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                                <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        {status === 'idle' && (
                            <button onClick={() => setFile(null)} className="text-xs text-red-500 hover:underline">
                                Cambiar
                            </button>
                        )}
                    </div>

                    {status === 'idle' && (
                        <button 
                            onClick={uploadToS3}
                            className="w-full py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors"
                        >
                            Subir Video
                        </button>
                    )}

                    {status === 'uploading' && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-bold text-slate-600">
                                <span>Subiendo directo a Edge...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div 
                                    className="bg-emerald-500 h-full transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-2 rounded-lg text-sm font-medium">
                            <CheckCircle className="w-4 h-4" /> Video asegurado en S3.
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded-lg text-sm font-medium">
                            <AlertTriangle className="w-4 h-4" /> {errorMsg}
                        </div>
                    )}
                </div>
            )}
            
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="video/mp4,video/quicktime,video/webm" 
                className="hidden" 
            />
        </div>
    );
};
