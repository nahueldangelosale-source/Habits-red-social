import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, FileText, Link, X, CheckCircle2, ArrowRight, UploadCloud, Folder } from 'lucide-react';
import toast from 'react-hot-toast';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (doc: {
    name: string;
    type: 'PDF' | 'DOCX' | 'LINK';
    categoryFolder: string;
    url?: string;
    notes?: string;
    sizeMb?: number;
  }) => void;
  folders: { id: string; name: string }[];
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  folders
}) => {
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<'PDF' | 'DOCX' | 'LINK'>('PDF');
  const [selectedFolder, setSelectedFolder] = useState(folders[0]?.id || 'folder-doc-habitos');
  const [externalUrl, setExternalUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState<number>(2.4);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const sizeMb = Number((file.size / (1024 * 1024)).toFixed(1)) || 0.5;
      setFileSize(sizeMb);
      if (!docName.trim()) {
        setDocName(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) {
      toast.error('Por favor ingresá un nombre para el documento');
      return;
    }

    const folderId = selectedFolder || folders[0]?.id || 'folder-doc-habitos';

    onUploadSuccess({
      name: docName.trim(),
      type: docType,
      categoryFolder: folderId,
      url: externalUrl || (fileName ? `https://bienestar.app/docs/${fileName}` : undefined),
      notes: notes.trim() || undefined,
      sizeMb: fileSize
    });

    toast.success('Documento subido a tu biblioteca con éxito', { icon: '📄' });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-white/95 dark:bg-zinc-950 rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-2xl p-6 text-slate-900 dark:text-white space-y-5 relative"
        >
          {/* Top Specular Rim */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                <FileUp size={18} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Gestor de Recursos
                </span>
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  Añadir Documento o Guía
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Tipo de Documento */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDocType('PDF')}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  docType === 'PDF'
                    ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-300 shadow-xs'
                    : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                <FileText size={14} /> PDF
              </button>
              <button
                type="button"
                onClick={() => setDocType('DOCX')}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  docType === 'DOCX'
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300 shadow-xs'
                    : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                <FileText size={14} /> Word (.docx)
              </button>
              <button
                type="button"
                onClick={() => setDocType('LINK')}
                className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all ${
                  docType === 'LINK'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                }`}
              >
                <Link size={14} /> Drive / Link
              </button>
            </div>

            {/* Selector de Archivo Local si es PDF o DOCX */}
            {docType !== 'LINK' && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={docType === 'PDF' ? '.pdf' : '.docx,.doc'}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-indigo-500/50 bg-slate-50/50 dark:bg-zinc-900/30 p-4 rounded-2xl text-center cursor-pointer transition-colors space-y-1.5"
                >
                  <UploadCloud size={24} className="mx-auto text-indigo-600 dark:text-indigo-400" />
                  <p className="font-bold text-slate-700 dark:text-zinc-200">
                    {fileName || 'Hacé clic para seleccionar tu archivo'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {fileName ? `${fileSize} MB • Listo para subir` : 'Formatos soportados: PDF, DOCX (Máx. 25MB)'}
                  </p>
                </div>
              </div>
            )}

            {/* Nombre del Documento */}
            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Nombre de la Guía o Documento:
              </label>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="Ej: Guía de Hábitos y Sueño 2026"
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 text-xs font-medium"
                required
              />
            </div>

            {/* Carpeta Destino */}
            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Guardar en Carpeta:
              </label>
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500 text-xs font-medium"
              >
                {folders.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* Enlace Externo si es LINK */}
            {docType === 'LINK' && (
              <div>
                <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                  Enlace (Google Drive, Notion, PDF Online):
                </label>
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 text-xs font-medium"
                  required
                />
              </div>
            )}

            {/* Notas Internas */}
            <div>
              <label className="font-bold text-slate-700 dark:text-zinc-300 block mb-1">
                Indicaciones o Notas (Opcional):
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Explicación para el alumno al consultar este documento..."
                rows={2}
                className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 text-xs font-medium resize-none"
              />
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                <span>Guardar Documento</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
