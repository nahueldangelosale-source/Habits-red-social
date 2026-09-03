import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTemplateLibraryStore } from '../../stores/useTemplateLibraryStore';
import { usePlanBuilderStore } from '../../stores/usePlanBuilderStore';
import { useTemplateSync } from '../../hooks/useTemplateSync';
import type { 
  LibraryItem, TemplateFolder, LibraryItemLevel, LibraryCategory 
} from '../../stores/useTemplateLibraryStore';
import { 
  Folder, FileText, Trash2, Copy, Search, 
  UserPlus, Plus, LayoutGrid, List, ChevronRight, 
  MoreVertical, ArrowLeft, Clock, Shield, Apple, Dumbbell,
  Sparkles, ExternalLink, Info, CheckCircle2, Cloud,
  Share2, DownloadCloud, FileUp, Salad, ChefHat, BookOpen,
  HelpCircle, Link as LinkIcon, Download, Edit3, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TemplatePreview } from './TemplatePreview';
import { AssignTemplateFlow } from './AssignTemplateFlow';
import { LibraryWelcomeWizardModal } from './LibraryWelcomeWizardModal';
import { ShareTemplateModal } from './ShareTemplateModal';
import { ImportTemplateModal } from './ImportTemplateModal';
import { UploadDocumentModal } from './UploadDocumentModal';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export interface TemplateLibraryProps {
  onSwitchToRoutine?: () => void;
  onSwitchToNutrition?: () => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({ onSwitchToRoutine, onSwitchToNutrition }) => {
  const navigate = useNavigate();
  const rawFolders = useTemplateLibraryStore(state => state.folders);
  const activeCategory = useTemplateLibraryStore(state => state.activeCategory || 'TRAINING');
  const setActiveCategory = useTemplateLibraryStore(state => state.setActiveCategory);
  const searchQuery = useTemplateLibraryStore(state => state.searchQuery);
  const setSearchQuery = useTemplateLibraryStore(state => state.setSearchQuery);
  const createFolder = useTemplateLibraryStore(state => state.createFolder);
  const deleteFolder = useTemplateLibraryStore(state => state.deleteFolder);
  const deleteTemplate = useTemplateLibraryStore(state => state.deleteTemplate);
  const duplicateTemplate = useTemplateLibraryStore(state => state.duplicateTemplate);
  const createDocumentItem = useTemplateLibraryStore(state => state.createDocumentItem);
  const importTemplateByCode = useTemplateLibraryStore(state => state.importTemplateByCode);
  const syncFromBackend = useTemplateLibraryStore(state => state.syncFromBackend);
  const isSynced = useTemplateLibraryStore(state => state.isSynced);

  // Auto-sync backend templates into local catalog
  const { templates: backendTemplates } = useTemplateSync();

  useEffect(() => {
    if (backendTemplates && backendTemplates.length > 0) {
      syncFromBackend(backendTemplates);
    }
  }, [backendTemplates, syncFromBackend]);

  const [activeLevel, setActiveLevel] = useState<LibraryItemLevel | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  
  const [selectedTemplate, setSelectedTemplate] = useState<LibraryItem | null>(null);
  const [assigningTemplate, setAssigningTemplate] = useState<LibraryItem | null>(null);
  const [sharingItem, setSharingItem] = useState<LibraryItem | null>(null);
  
  // Modales
  const [isWelcomeWizardOpen, setIsWelcomeWizardOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);

  // Auto-abrir wizard en primer ingreso
  useEffect(() => {
    if (localStorage.getItem('library_welcome_wizard_seen') !== 'true') {
      setIsWelcomeWizardOpen(true);
    }
  }, []);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderIcon, setNewFolderIcon] = useState('📁');
  const [showAddFolderInput, setShowAddFolderInput] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);

  // Close create menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setIsCreateOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim(), activeCategory, newFolderIcon);
      setNewFolderName('');
      setNewFolderIcon('📁');
      setShowAddFolderInput(false);
      toast.success('Carpeta creada', { icon: newFolderIcon || '📁' });
    }
  };

  const handleCreateRoutine = () => {
    usePlanBuilderStore.getState().reset();
    setIsCreateOpen(false);
    if (onSwitchToRoutine) onSwitchToRoutine();
    else navigate('/plan-builder');
  };

  const handleCreateNutrition = () => {
    setIsCreateOpen(false);
    if (onSwitchToNutrition) onSwitchToNutrition();
    else navigate('/naas-builder');
  };

  const handleEditTemplate = (item: LibraryItem) => {
    if (item.type === 'PROGRAM' || item.type === 'BLOCK' || item.category === 'TRAINING') {
      const folder = rawFolders.find(f => f.templates.some(t => t.id === item.id)) || rawFolders[0];
      usePlanBuilderStore.getState().loadTemplateForEditing(folder?.id || 'folder-hipertrofia', item);
      setSelectedTemplate(null);
      toast.success(`Plantilla "${item.name}" cargada con trazabilidad completa`, { icon: '🏋️' });
      navigate('/plan-builder');
    } else if (item.type === 'MEAL_PLAN' || item.category === 'NUTRITION') {
      setSelectedTemplate(null);
      toast.success(`Plan Nutricional "${item.name}" listo para editar`, { icon: '🥗' });
      navigate('/naas-builder');
    } else {
      setSelectedTemplate(null);
      toast.success(`Detalle de "${item.name}"`, { icon: '📝' });
    }
  };

  // Filtered Folders based on Category, Search and Level
  const categoryFolders = useMemo(() => {
    return rawFolders.filter(folder => {
      // Default to TRAINING if category is missing
      const cat = folder.category || 'TRAINING';
      return cat === activeCategory;
    });
  }, [rawFolders, activeCategory]);

  const filteredFolders = useMemo(() => {
    let list = categoryFolders;

    if (activeLevel !== 'ALL') {
      list = list.map(folder => ({
        ...folder,
        templates: folder.templates.filter(t => t.type === activeLevel)
      })).filter(folder => folder.templates.length > 0);
    }

    if (!searchQuery.trim()) return list;
    const query = searchQuery.toLowerCase();
    return list.map((folder) => {
      const filteredTemplates = folder.templates.filter(
        (template) =>
          template.name.toLowerCase().includes(query) ||
          template.tags.some((tag) => tag.toLowerCase().includes(query))
      );
      return {
        ...folder,
        templates: filteredTemplates
      };
    }).filter((folder) => folder.templates.length > 0);
  }, [categoryFolders, searchQuery, activeLevel]);

  const activeFolder = currentFolderId ? rawFolders.find(f => f.id === currentFolderId) : null;

  return (
    <div className="bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-5 md:p-8 shadow-sm text-slate-800 dark:text-zinc-100 min-h-[650px] flex flex-col font-sans transition-all">
      
      {/* 1. PESTAÑAS MAESTRAS UNIFICADAS (4 CATEGORÍAS) */}
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-zinc-800 pb-4 mb-5 gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-zinc-900 rounded-2xl border border-slate-200/80 dark:border-zinc-800">
          {[
            { id: 'TRAINING', label: 'Entrenamientos', icon: '🏋️' },
            { id: 'NUTRITION', label: 'Nutrición & Dietas', icon: '🥗' },
            { id: 'RECIPES', label: 'Recetarios Saludables', icon: '🍳' },
            { id: 'DOCUMENTS', label: 'Documentos & Guías', icon: '📄' }
          ].map(tab => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveCategory(tab.id as LibraryCategory);
                  setCurrentFolderId(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-white dark:bg-zinc-800 text-indigo-600 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Acciones Globales: Guía de Uso & Importar Código */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs flex items-center gap-1.5 border border-slate-200 dark:border-zinc-800 transition-colors"
          >
            <DownloadCloud size={14} className="text-indigo-500" />
            <span>Importar Código</span>
          </button>

          <button
            onClick={() => setIsWelcomeWizardOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1.5 border border-indigo-200/80 dark:border-indigo-500/20 transition-colors"
          >
            <HelpCircle size={14} />
            <span>Guía Rápida</span>
          </button>
        </div>
      </div>

      {/* 2. HEADER DRIVE: BREADCRUMBS & BOTÓN CREAR */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base font-bold text-slate-700 dark:text-zinc-200 flex-wrap">
            <button 
              onClick={() => setCurrentFolderId(null)}
              className="hover:bg-slate-100 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-2"
            >
              <Folder size={18} className="text-indigo-600 dark:text-indigo-400" />
              <span>
                {activeCategory === 'TRAINING' && 'Entrenamientos'}
                {activeCategory === 'NUTRITION' && 'Planes Nutricionales'}
                {activeCategory === 'RECIPES' && 'Recetarios Saludables'}
                {activeCategory === 'DOCUMENTS' && 'Documentos & Guías'}
              </span>
            </button>
            {activeFolder && (
              <>
                <ChevronRight size={16} className="text-slate-400" />
                <span className="text-slate-900 dark:text-white bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
                  <span>{activeFolder.icon || '📁'}</span>
                  <span>{activeFolder.name}</span>
                </span>
              </>
            )}
            {isSynced && (
              <span className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                <Cloud size={11} /> Sincronizado
              </span>
            )}
          </div>
          
          <div className="relative" ref={createMenuRef}>
            <button 
              onClick={() => setIsCreateOpen(!isCreateOpen)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 text-xs"
            >
              <Plus size={16} />
              <span>Añadir / Crear</span>
            </button>
            
            {/* Drive-like Create Dropdown */}
            <AnimatePresence>
              {isCreateOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 top-12 mt-1 w-64 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden z-30 p-2 space-y-1"
                >
                  <button 
                    onClick={() => {
                      setShowAddFolderInput(true);
                      setIsCreateOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl flex items-center gap-2.5 transition-colors"
                  >
                    <Folder size={16} className="text-slate-400" />
                    <span>Nueva carpeta temática</span>
                  </button>
                  <div className="h-px bg-slate-100 dark:bg-zinc-800 my-1" />
                  
                  <button 
                    onClick={handleCreateRoutine}
                    className="w-full text-left p-2 text-xs text-slate-700 dark:text-zinc-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-xl flex items-center gap-3 transition-colors"
                  >
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400">
                      <Dumbbell size={15} />
                    </div>
                    <div>
                      <p className="font-bold">Plan de Entrenamiento</p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400">Mesociclos y Periodos</p>
                    </div>
                  </button>

                  <button 
                    onClick={handleCreateNutrition}
                    className="w-full text-left p-2 text-xs text-slate-700 dark:text-zinc-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl flex items-center gap-3 transition-colors"
                  >
                    <div className="bg-emerald-100 dark:bg-emerald-900/50 p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400">
                      <Salad size={15} />
                    </div>
                    <div>
                      <p className="font-bold">Plan Nutricional</p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400">Pautas por Fases y Macros</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => {
                      setIsUploadDocModalOpen(true);
                      setIsCreateOpen(false);
                    }}
                    className="w-full text-left p-2 text-xs text-slate-700 dark:text-zinc-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl flex items-center gap-3 transition-colors"
                  >
                    <div className="bg-amber-100 dark:bg-amber-900/50 p-1.5 rounded-lg text-amber-600 dark:text-amber-400">
                      <FileUp size={15} />
                    </div>
                    <div>
                      <p className="font-bold">Subir Documento o Guía</p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400">PDF, Word o Drive</p>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Input de Nueva Carpeta con Selector de Emojis */}
        <AnimatePresence>
          {showAddFolderInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col sm:flex-row gap-2 bg-slate-50 dark:bg-zinc-900 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800"
            >
              <div className="flex items-center gap-2">
                <select
                  value={newFolderIcon}
                  onChange={(e) => setNewFolderIcon(e.target.value)}
                  className="bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none"
                >
                  <option value="📁">📁 Carpeta</option>
                  <option value="🔥">🔥 Fuego / Hipertrofia</option>
                  <option value="⚡">⚡ Fuerza / Rayo</option>
                  <option value="🍑">🍑 Glúteos</option>
                  <option value="🤸">🤸 Calistenia</option>
                  <option value="🌱">🌱 Principiantes</option>
                  <option value="🥗">🥗 Nutrición</option>
                  <option value="🍳">🍳 Recetas</option>
                  <option value="📄">📄 Guías</option>
                  <option value="💊">💊 Suplementos</option>
                  <option value="🧘">🧘 Movilidad</option>
                </select>

                <input
                  type="text"
                  autoFocus
                  placeholder="Nombre de la carpeta temática..."
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  className="flex-1 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateFolder}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                >
                  Crear Carpeta
                </button>
                <button
                  onClick={() => setShowAddFolderInput(false)}
                  className="bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-400 font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barra de Búsqueda y Filtros de Nivel */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar plantillas, recetas o guías..."
              className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-colors ${viewMode === 'grid' ? 'bg-indigo-500/10 text-indigo-500' : 'text-slate-400 hover:text-slate-600'}`}
              title="Vista en Cuadrícula"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-colors ${viewMode === 'list' ? 'bg-indigo-500/10 text-indigo-500' : 'text-slate-400 hover:text-slate-600'}`}
              title="Vista en Lista"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. LISTADO DE CARPETAS & ITEMS (VISTA EN PROFUNDIDAD) */}
      <div className="flex-1 space-y-6">
        {/* NIVEL RAÍZ (CARPETAS) */}
        {!currentFolderId ? (
          <div className="space-y-6">
            {viewMode === 'grid' ? (
              /* MODO CUADRÍCULA DE CARPETAS */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredFolders.map(folder => {
                  const planCount = folder.templates.length;
                  return (
                    <div
                      key={folder.id}
                      onClick={() => setCurrentFolderId(folder.id)}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 hover:border-indigo-500/40 hover:bg-slate-100/80 dark:hover:bg-zinc-900 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-xl shadow-2xs shrink-0">
                          {folder.icon || '📁'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {folder.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium mt-0.5">
                            {planCount === 1 ? '1 plan' : `${planCount} planes`}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  );
                })}
              </div>
            ) : (
              /* MODO LISTA EN DETALLE DE CARPETAS */
              <div className="border border-slate-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xs divide-y divide-slate-100 dark:divide-zinc-800">
                <div className="bg-slate-50/80 dark:bg-zinc-900/80 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 grid grid-cols-12 gap-2">
                  <div className="col-span-6 sm:col-span-7">Carpeta Temática</div>
                  <div className="col-span-3 sm:col-span-3">Categoría</div>
                  <div className="col-span-3 sm:col-span-2 text-right">Planes</div>
                </div>
                {filteredFolders.map(folder => {
                  const planCount = folder.templates.length;
                  return (
                    <div
                      key={folder.id}
                      onClick={() => setCurrentFolderId(folder.id)}
                      className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors group"
                    >
                      <div className="grid grid-cols-12 gap-2 flex-1 items-center">
                        <div className="col-span-6 sm:col-span-7 flex items-center gap-3 min-w-0">
                          <span className="text-lg">{folder.icon || '📁'}</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-indigo-600 transition-colors">
                            {folder.name}
                          </span>
                        </div>
                        <div className="col-span-3 sm:col-span-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                            {folder.category || activeCategory}
                          </span>
                        </div>
                        <div className="col-span-3 sm:col-span-2 text-right">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {planCount === 1 ? '1 plan' : `${planCount} planes`}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all ml-3 shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}

            {filteredFolders.length === 0 && (
              <div className="p-12 text-center text-slate-400 dark:text-zinc-500 space-y-2">
                <Folder size={36} className="mx-auto opacity-40" />
                <p className="text-xs font-medium">No se encontraron carpetas o planes en esta sección.</p>
              </div>
            )}
          </div>
        ) : (
          /* NIVEL DENTRO DE UNA CARPETA */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentFolderId(null)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
              >
                <ArrowLeft size={14} /> Volver a todas las carpetas
              </button>
              <span className="text-xs text-slate-500 font-bold">
                {activeFolder?.templates.length === 1 ? '1 plan en esta carpeta' : `${activeFolder?.templates.length || 0} planes en esta carpeta`}
              </span>
            </div>

            {activeFolder?.templates && activeFolder.templates.length > 0 ? (
              viewMode === 'grid' ? (
                /* CUADRÍCULA DENTRO DE CARPETA */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeFolder.templates.map(item => {
                    const isNutri = item.type === 'MEAL_PLAN' || item.category === 'NUTRITION';
                    const isRec = item.type === 'RECIPE' || item.category === 'RECIPES';
                    const isDoc = item.type === 'DOCUMENT' || item.category === 'DOCUMENTS';

                    return (
                      <div
                        key={item.id}
                        className="p-4.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-3.5 shadow-2xs"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{item.icon || (isDoc ? '📄' : isRec ? '🍳' : isNutri ? '🥗' : '🏋️')}</span>
                              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200/80 dark:border-indigo-800/40">
                                {isDoc ? 'DOCUMENTO' : isRec ? 'RECETARIO' : isNutri ? 'NUTRICIÓN' : 'ENTRENAMIENTO'}
                              </span>
                            </div>

                            <button
                              onClick={() => setSharingItem(item)}
                              className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                              title="Compartir con Colega"
                            >
                              <Share2 size={14} />
                            </button>
                          </div>

                          <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                            {item.name}
                          </h4>

                          {/* Quick summary line */}
                          {isNutri && item.nutritionData && (
                            <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                              <Flame size={12} /> {item.nutritionData.kcal} kcal • {item.nutritionData.protein}g PRO • {item.nutritionData.meals.length} comidas
                            </p>
                          )}

                          {isRec && item.recipeData && (
                            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                              <ChefHat size={12} /> {item.recipeData.prepTimeMin} min • {item.recipeData.kcal} kcal • {item.recipeData.protein}g PRO
                            </p>
                          )}

                          {isDoc && item.documentData && (
                            <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
                              <LinkIcon size={11} className="text-indigo-500" /> {item.documentData.fileType} • {item.documentData.sizeMb || 2.4} MB
                            </p>
                          )}

                          {!isNutri && !isRec && !isDoc && item.phases && (
                            <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
                              <Dumbbell size={12} /> {item.phases.length} Fase(s) • {(item.phases[0]?.days || []).length} Días de entrenamiento
                            </p>
                          )}

                          {item.internalNotes && (
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 mt-1">
                              {item.internalNotes}
                            </p>
                          )}
                        </div>

                        {/* Acciones de la Ficha */}
                        <div className="pt-2.5 border-t border-slate-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setSelectedTemplate(item)}
                            className="text-[11px] font-bold text-slate-600 dark:text-zinc-300 hover:text-indigo-600 transition-colors"
                          >
                            Ver Detalle
                          </button>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleEditTemplate(item)}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                              title="Editar Plantilla"
                            >
                              <Edit3 size={13} />
                            </button>

                            <button
                              onClick={() => {
                                duplicateTemplate(activeFolder.id, item.id);
                                toast.success('Plan duplicado en tu biblioteca', { icon: '📋' });
                              }}
                              className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
                              title="Duplicar"
                            >
                              <Copy size={13} />
                            </button>

                            <button
                              onClick={() => setAssigningTemplate(item)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                            >
                              <UserPlus size={13} />
                              <span>Asignar</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* LISTA DETALLADA DENTRO DE CARPETA */
                <div className="border border-slate-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xs divide-y divide-slate-100 dark:divide-zinc-800">
                  <div className="bg-slate-50/80 dark:bg-zinc-900/80 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 grid grid-cols-12 gap-2">
                    <div className="col-span-5">Nombre del Plan</div>
                    <div className="col-span-3">Resumen / Carga</div>
                    <div className="col-span-2 text-center">Asignaciones</div>
                    <div className="col-span-2 text-right">Acciones</div>
                  </div>
                  {activeFolder.templates.map(item => {
                    const isNutri = item.type === 'MEAL_PLAN' || item.category === 'NUTRITION';
                    const isRec = item.type === 'RECIPE' || item.category === 'RECIPES';
                    const isDoc = item.type === 'DOCUMENT' || item.category === 'DOCUMENTS';

                    return (
                      <div
                        key={item.id}
                        className="px-4 py-3.5 grid grid-cols-12 gap-2 items-center hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors"
                      >
                        <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                          <span className="text-base">{item.icon || (isDoc ? '📄' : isRec ? '🍳' : isNutri ? '🥗' : '🏋️')}</span>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 truncate">
                              {item.tags.join(', ')}
                            </p>
                          </div>
                        </div>

                        <div className="col-span-3 text-xs">
                          {isNutri && item.nutritionData ? (
                            <span className="font-bold text-emerald-600">{item.nutritionData.kcal} kcal • {item.nutritionData.meals.length} comidas</span>
                          ) : isRec && item.recipeData ? (
                            <span className="font-bold text-amber-600">{item.recipeData.prepTimeMin} min • {item.recipeData.kcal} kcal</span>
                          ) : isDoc && item.documentData ? (
                            <span className="font-mono text-slate-500">{item.documentData.fileType} • {item.documentData.sizeMb || 2.4} MB</span>
                          ) : (
                            <span className="font-bold text-indigo-600">{(item.phases[0]?.days || []).length} Días de entrenamiento</span>
                          )}
                        </div>

                        <div className="col-span-2 text-center text-xs font-bold text-slate-600 dark:text-zinc-300">
                          {item.assignmentCount || 0}
                        </div>

                        <div className="col-span-2 flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedTemplate(item)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                            title="Ver Detalle"
                          >
                            <Search size={14} />
                          </button>
                          <button
                            onClick={() => handleEditTemplate(item)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                            title="Editar Plantilla"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => setAssigningTemplate(item)}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs"
                            title="Asignar"
                          >
                            Asignar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="p-12 text-center text-slate-400 dark:text-zinc-500 space-y-3 bg-slate-50/50 dark:bg-zinc-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                <p className="text-xs">Esta carpeta todavía no tiene planes.</p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  + Añadir Primer Plan
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALES AUXILIARES */}
      {/* 1. Wizard de Bienvenida e Instrucciones */}
      <LibraryWelcomeWizardModal
        isOpen={isWelcomeWizardOpen}
        onClose={() => setIsWelcomeWizardOpen(false)}
      />

      {/* 2. Modal de Compartir Recurso con Colega */}
      {sharingItem && (
        <ShareTemplateModal
          isOpen={Boolean(sharingItem)}
          onClose={() => setSharingItem(null)}
          itemName={sharingItem.name}
          itemType={sharingItem.type}
        />
      )}

      {/* 3. Modal de Importación de Código de Colega */}
      <ImportTemplateModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={(code) => {
          importTemplateByCode(code);
        }}
      />

      {/* 4. Modal de Subida de Documentos */}
      <UploadDocumentModal
        isOpen={isUploadDocModalOpen}
        onClose={() => setIsUploadDocModalOpen(false)}
        folders={rawFolders.filter(f => f.category === 'DOCUMENTS' || f.category === activeCategory).map(f => ({ id: f.id, name: f.name }))}
        onUploadSuccess={(doc) => {
          createDocumentItem(doc.categoryFolder, {
            name: doc.name,
            fileType: doc.type,
            url: doc.url,
            notes: doc.notes,
            sizeMb: doc.sizeMb
          });
        }}
      />

      {/* 5. Modal de Vista Previa */}
      {selectedTemplate && (
        <TemplatePreview
          isOpen={Boolean(selectedTemplate)}
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onEditTemplate={() => handleEditTemplate(selectedTemplate)}
          onAssign={() => {
            setAssigningTemplate(selectedTemplate);
            setSelectedTemplate(null);
          }}
        />
      )}

      {/* 6. Modal de Asignación con Smart Fork */}
      {assigningTemplate && (
        <AssignTemplateFlow
          isOpen={Boolean(assigningTemplate)}
          template={assigningTemplate}
          onClose={() => setAssigningTemplate(null)}
        />
      )}
    </div>
  );
};
