import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Info, Database, ChevronRight, ChevronLeft, Folder, FileText, Apple, LayoutTemplate, MoreVertical, GripVertical, Plus, Clock, Users, Trash2, Copy, ChefHat, FileSpreadsheet } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { useTemplateLibraryStore as useStoreForTemplates } from '../../../stores/useTemplateLibraryStore';
import { useNutritionStore } from '../../../stores/useNutritionStore';
import type { Recipe } from '../../../stores/useNutritionStore';
import { RecipeCreatorModal } from './RecipeCreatorModal';
import { BulkRecipeImportModal } from './BulkRecipeImportModal';

import { searchSaraFoods } from '../../../utils/saraSearchEngine';

export const useSaraLibrary = (searchTerm: string, sortBy: string = 'relevance', filterGroup: string | null = null) => {
  return useQuery({
    queryKey: ['sara-foods-v4', searchTerm, sortBy, filterGroup],
    queryFn: () => searchSaraFoods(searchTerm, sortBy, filterGroup),
    staleTime: 1000 * 60 * 5,
    retry: 1
  });
};

const DraggableFoodItem = ({ item }: { item: any }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sara-${item.id_sara}`,
    data: {
      type: 'SARA_ITEM',
      item: {
        id: item.id_sara,
        name: item.alimento,
        category: item.grupo || 'SARA Oficial',
        protein_g: item.protcnt,
        available_carbs_g: item.choavldf,
        total_fat_g: item.fat,
        energy_kcal: item.enerc_kcal
      },
    }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3 rounded-lg border border-slate-200 bg-white shadow-sm mb-2 cursor-grab flex items-center justify-between hover:border-blue-400 transition-colors ${
        isDragging ? 'opacity-50 ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex items-center gap-2 flex-1 truncate pr-2">
        <div className="text-slate-300 cursor-grab hover:text-slate-500 transition-colors">
          <GripVertical size={16} />
        </div>
        <div className="flex-1 truncate">
          <h4 className="text-sm font-semibold text-slate-800 font-montserrat truncate" title={item.alimento}>{item.alimento}</h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-[10px] text-slate-500 font-lato truncate">{item.grupo || 'SARA Oficial'}</p>
            <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">por 100g</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 text-[10px] font-lato font-bold shrink-0">
        <span className="bg-rose-50 text-rose-700 px-1.5 py-1 rounded shadow-sm">P: {item.protcnt}</span>
        <span className="bg-amber-50 text-amber-700 px-1.5 py-1 rounded shadow-sm">C: {item.choavldf}</span>
      </div>
    </div>
  );
};

// ─── Recetas Tab ────────────────────────────────────────────────────────────

const DraggableRecipeItem = ({ recipe }: { recipe: Recipe }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `recipe-${recipe.id}`,
    data: {
      type: 'RECIPE_ITEM',
      recipe,
    }
  });

  const deleteRecipe = useNutritionStore(s => s.deleteRecipe);
  const duplicateRecipe = useNutritionStore(s => s.duplicateRecipe);

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3 rounded-xl border border-slate-200 bg-white shadow-sm mb-2 cursor-grab hover:border-emerald-400 transition-all ${
        isDragging ? 'opacity-50 ring-2 ring-emerald-500' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="text-slate-300 cursor-grab hover:text-slate-500 transition-colors mt-0.5">
          <GripVertical size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-800 font-montserrat truncate">{recipe.name}</h4>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Users size={9} /> {recipe.servings} porc.
            </span>
            <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Clock size={9} /> {recipe.prepTimeMin} min
            </span>
          </div>
          <div className="flex gap-1.5 mt-1.5 text-[10px] font-lato font-bold">
            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">P: {recipe.totalMacros.protein.toFixed(0)}g</span>
            <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">C: {recipe.totalMacros.carbs.toFixed(0)}g</span>
            <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded">G: {recipe.totalMacros.fats.toFixed(0)}g</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); duplicateRecipe(recipe.id); }}
            className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
            title="Duplicar receta"
          >
            <Copy size={12} />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); deleteRecipe(recipe.id); }}
            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Eliminar receta"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

const RecetasTabContent: React.FC<{ searchTerm: string }> = ({ searchTerm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const recipes = useNutritionStore(s => s.recipes);
  const addRecipe = useNutritionStore(s => s.addRecipe);

  const normalizeStr = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredRecipes = searchTerm
    ? recipes.filter(r =>
        normalizeStr(r.name).includes(normalizeStr(searchTerm)) ||
        r.tags.some(t => normalizeStr(t).includes(normalizeStr(searchTerm)))
      )
    : recipes;

  const handleOpenCreate = () => {
    setEditingRecipe(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={handleOpenCreate}
          className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-emerald-200"
        >
          <Plus size={15} /> Crear Receta
        </button>
        <button
          onClick={() => setIsBulkModalOpen(true)}
          className="py-2.5 px-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-indigo-200 shadow-sm"
          title="Importar recetas en masa desde CSV / Excel"
        >
          <FileSpreadsheet size={15} /> Cargar CSV
        </button>
      </div>

      {filteredRecipes.length > 0 ? (
        <>
          <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider px-1">
            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'receta guardada' : 'recetas guardadas'}
          </p>
          {filteredRecipes.map(recipe => (
            <DraggableRecipeItem key={recipe.id} recipe={recipe} />
          ))}
          <p className="text-[10px] text-slate-400 text-center pt-2 font-lato">
            💡 Arrastra una receta al lienzo para agregarla a una comida.
          </p>
        </>
      ) : recipes.length > 0 && searchTerm ? (
        <div className="text-center text-slate-500 mt-8">
          <Search className="mx-auto mb-2 text-slate-400 opacity-50" size={24} />
          <p className="text-sm">No encontramos recetas con "{searchTerm}"</p>
        </div>
      ) : (
        <div className="text-center text-slate-500 mt-8">
          <ChefHat className="mx-auto mb-2 text-slate-300 opacity-50" size={32} />
          <p className="text-sm font-bold text-slate-600 mb-1">Todavía no tenés recetas</p>
          <p className="text-xs text-slate-400 leading-relaxed px-4">
            Creá tu primera receta buscando ingredientes de la base SARA o importá una planilla en CSV.
          </p>
        </div>
      )}

      <RecipeCreatorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(recipe) => {
          addRecipe(recipe);
          setIsModalOpen(false);
        }}
        editingRecipe={editingRecipe}
      />

      <BulkRecipeImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />
    </div>
  );
};

export const SmartLibraryPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'alimentos' | 'plantillas' | 'recetas'>('alimentos');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'protein' | 'carbs' | 'calories'>('relevance');
  const [filterGroup, setFilterGroup] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);
  const { data: foods, isLoading, isError } = useSaraLibrary(searchTerm, sortBy, filterGroup);
  const folders = useStoreForTemplates(state => state.folders);

  // Filter folders based on search term if in plantillas tab
  const displayFolders = activeTab === 'plantillas' && searchTerm
    ? folders.map(f => ({
        ...f,
        templates: f.templates.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
      })).filter(f => f.templates.length > 0 || f.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : folders;

  if (isCollapsed) {
    return (
      <div className="w-12 h-full bg-white border-l border-slate-200 flex flex-col items-center py-4 transition-all duration-300">
        <button onClick={() => setIsCollapsed(false)} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors group relative" title="Ver Biblioteca">
          <ChevronLeft size={18} />
          <span className="absolute right-full mr-2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">Ver Biblioteca</span>
        </button>
        <div className="mt-8 transform -rotate-90 origin-center whitespace-nowrap opacity-30 text-xs font-bold uppercase tracking-widest text-slate-600">
          Biblioteca
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-slate-50 border-l border-slate-200 flex flex-col transition-all duration-300">
      <div className="p-4 border-b border-slate-200 bg-white space-y-3.5 shadow-sm z-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-800 font-montserrat flex items-center gap-2">
              Recursos
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">Arrastra alimentos o recetas hacia tu plan.</p>
          </div>
          <button onClick={() => setIsCollapsed(true)} className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors" title="Ocultar panel">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Tabs de Recursos */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
          <button 
            onClick={() => setActiveTab('alimentos')}
            className={`flex-1 py-2 px-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'alimentos' 
                ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100 ring-1 ring-emerald-500/10' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <Database size={13} /> Alimentos
          </button>
          <button 
            onClick={() => setActiveTab('recetas')}
            className={`flex-1 py-2 px-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'recetas' 
                ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100 ring-1 ring-emerald-500/10' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 font-black'
            }`}
          >
            <ChefHat size={14} className="text-emerald-500" /> Recetas
          </button>
          <button 
            onClick={() => setActiveTab('plantillas')}
            className={`flex-1 py-2 px-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'plantillas' 
                ? 'bg-white text-indigo-600 shadow-sm border border-indigo-100 ring-1 ring-indigo-500/10' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <LayoutTemplate size={13} /> Plantillas
          </button>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
          <input
            type="text"
            placeholder={activeTab === 'alimentos' ? "Buscar alimentos..." : activeTab === 'recetas' ? "Buscar mis recetas..." : "Buscar plantillas..."}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-lato transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Filtros Simétricos y Profesionales (Sin barras de scroll) */}
        {activeTab === 'alimentos' && (
          <div className="flex flex-col gap-2.5 pt-0.5">
            {/* Categorías Rápidas en Cuadrícula Simétrica 4x2 */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 px-0.5">
                <span className="uppercase tracking-wider">Categoría</span>
                {filterGroup && (
                  <button 
                    onClick={() => setFilterGroup(null)}
                    className="text-emerald-600 hover:underline text-[9px] font-bold"
                  >
                    Restablecer
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-1">
                <button
                  onClick={() => setFilterGroup(null)}
                  className={`py-1.5 px-1 text-[10px] font-bold rounded-lg transition-all text-center truncate ${
                    !filterGroup
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  Todos
                </button>
                {[
                  { label: 'Carnes', term: 'Carne' },
                  { label: 'Vegetales', term: 'Vegetal' },
                  { label: 'Pescados', term: 'Pescado' },
                  { label: 'Lácteos', term: 'Leche' },
                  { label: 'Frutas', term: 'Fruta' },
                  { label: 'Cereales', term: 'Cereal' },
                  { label: 'Huevos', term: 'Huevo' }
                ].map(cat => (
                  <button
                    key={cat.label}
                    onClick={() => setFilterGroup(cat.term === filterGroup ? null : cat.term)}
                    className={`py-1.5 px-1 text-[10px] font-bold rounded-lg transition-all text-center truncate ${
                      filterGroup === cat.term
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Ordenar Resultados - Cuadrícula Simétrica de 4 Columnas */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider px-0.5">
                Ordenar por
              </span>
              <div className="grid grid-cols-4 gap-1">
                <button 
                  onClick={() => setSortBy('relevance')}
                  className={`py-1.5 px-1 text-[10px] font-bold rounded-lg transition-all text-center truncate ${
                    sortBy === 'relevance'
                      ? 'bg-slate-800 text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                  title="Ordenar por relevancia y coincidencias"
                >
                  Relevante
                </button>
                <button 
                  onClick={() => setSortBy('protein')}
                  className={`py-1.5 px-1 text-[10px] font-bold rounded-lg transition-all text-center truncate ${
                    sortBy === 'protein' 
                      ? 'bg-rose-500 text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                  title="Mayor contenido de proteína por 100g"
                >
                  + Proteína
                </button>
                <button 
                  onClick={() => setSortBy('carbs')}
                  className={`py-1.5 px-1 text-[10px] font-bold rounded-lg transition-all text-center truncate ${
                    sortBy === 'carbs' 
                      ? 'bg-amber-500 text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                  title="Menor contenido de carbohidratos"
                >
                  - Carbos
                </button>
                <button 
                  onClick={() => setSortBy('calories')}
                  className={`py-1.5 px-1 text-[10px] font-bold rounded-lg transition-all text-center truncate ${
                    sortBy === 'calories' 
                      ? 'bg-sky-500 text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                  title="Menor aporte calórico"
                >
                  - Calorías
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'alimentos' ? (
          // ALIMENTOS SARA TAB
          isError ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4">
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-3">
                <Database className="text-amber-400 w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1 font-montserrat text-sm">Esperando Ingesta</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-lato">
                La base nutricional se está sincronizando. Mientras tanto, puedes crear alimentos manualmente o usar tus plantillas.
              </p>
            </div>
          ) : isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-16 bg-slate-200 rounded-lg"></div>
              <div className="h-16 bg-slate-200 rounded-lg"></div>
              <div className="h-16 bg-slate-200 rounded-lg"></div>
            </div>
          ) : foods && foods.length > 0 ? (
            foods.map((food: any) => (
              <DraggableFoodItem key={food.id_sara} item={food} />
            ))
          ) : (
            <div className="text-center text-slate-500 mt-10">
              <Info className="mx-auto mb-2 text-slate-400 opacity-50" size={24} />
              <p className="text-sm">No se encontraron resultados para "{searchTerm}"</p>
            </div>
          )
        ) : activeTab === 'recetas' ? (
          <RecetasTabContent searchTerm={searchTerm} />
        ) : (
          <div className="space-y-2">
            {displayFolders.map(folder => (
              <div key={folder.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div 
                  onClick={() => setExpandedFolder(expandedFolder === folder.id ? null : folder.id)}
                  className="group p-3 hover:bg-emerald-50/30 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <Folder size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 font-montserrat">{folder.name}</h4>
                      <p className="text-xs text-slate-500 font-lato">{folder.templates.length} plantillas</p>
                    </div>
                  </div>
                  <MoreVertical size={16} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                {/* Templates list when expanded */}
                {expandedFolder === folder.id && folder.templates.length > 0 && (
                  <div className="px-3 pb-3 pt-1 border-t border-slate-100 bg-slate-50/50">
                    <div className="space-y-1.5 mt-2">
                      {folder.templates.map(template => {
                        const isNutrition = template.taxonomyId === 'nutrition' || template.tags?.includes('nutricion');
                        return (
                        <div key={template.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 cursor-grab transition-all">
                          {isNutrition ? <Apple size={14} className="text-emerald-500" /> : <FileText size={14} className="text-blue-500" />}
                          <span className="text-xs font-bold text-slate-700 font-montserrat truncate flex-1">{template.name}</span>
                          <div className="flex flex-col gap-1 items-end shrink-0">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${isNutrition ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                              {isNutrition ? 'Nutrición' : 'Entrenamiento'}
                            </span>
                            {template.tags?.filter(t => !['nutricion', 'entrenamiento', 'demo', 'fuerza'].includes(t.toLowerCase())).slice(0,1).map(tag => (
                               <span key={tag} className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase border ${isNutrition ? 'bg-emerald-50/50 text-emerald-600/80 border-emerald-100/50' : 'bg-blue-50/50 text-blue-600/80 border-blue-100/50'}`}>
                                   {tag}
                               </span>
                            ))}
                          </div>
                        </div>
                      )})}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <button className="w-full mt-4 py-3 border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 rounded-xl text-sm font-bold text-slate-600 hover:text-emerald-700 transition-all flex items-center justify-center gap-2">
              <Folder size={16} /> Nueva Carpeta
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
