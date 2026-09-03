import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, FileSpreadsheet, Download, CheckCircle2, AlertCircle, ChefHat, Sparkles, Plus } from 'lucide-react';
import { downloadRecipeCsvTemplate } from '../../../utils/recipeCsvTemplate';
import { useNutritionStore, type Recipe, type RecipeIngredient } from '../../../stores/useNutritionStore';

interface BulkRecipeImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ParsedRecipePreview {
  name: string;
  servings: number;
  prepTimeMin: number;
  tags: string[];
  culinaryTip?: string;
  ingredients: RecipeIngredient[];
  totalMacros: {
    protein: number;
    carbs: number;
    fats: number;
    calories: number;
  };
}

export const BulkRecipeImportModal: React.FC<BulkRecipeImportModalProps> = ({ isOpen, onClose }) => {
  const addRecipe = useNutritionStore((s) => s.addRecipe);
  const [parsedRecipes, setParsedRecipes] = useState<ParsedRecipePreview[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processCsvFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processCsvFile(file);
  };

  const processCsvFile = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setErrorMsg('Por favor, selecciona un archivo en formato .csv');
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

        if (lines.length < 2) {
          setErrorMsg('El archivo está vacío o solo contiene encabezados.');
          setIsProcessing(false);
          return;
        }

        // Header check (opcional)
        const dataLines = lines.slice(1);
        const recipesMap: Record<string, ParsedRecipePreview> = {};

        dataLines.forEach((line) => {
          // Parse CSV with quoted strings support
          const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
          if (cols.length < 5) return;

          const [
            recName,
            servingsStr,
            prepTimeStr,
            tagsStr,
            ingName,
            amountStr,
            protStr,
            carbsStr,
            fatStr,
            calsStr,
            tipStr
          ] = cols;

          if (!recName || !ingName) return;

          const amount = parseFloat(amountStr) || 100;
          const prot100 = parseFloat(protStr) || 0;
          const carbs100 = parseFloat(carbsStr) || 0;
          const fat100 = parseFloat(fatStr) || 0;
          const cals100 = parseFloat(calsStr) || (prot100 * 4 + carbs100 * 4 + fat100 * 9);

          const ingProt = Number(((prot100 * amount) / 100).toFixed(1));
          const ingCarbs = Number(((carbs100 * amount) / 100).toFixed(1));
          const ingFat = Number(((fat100 * amount) / 100).toFixed(1));
          const ingCals = Number(((cals100 * amount) / 100).toFixed(1));

          const ingredient: RecipeIngredient = {
            saraId: `csv_sara_${Math.random().toString(36).substring(2, 8)}`,
            name: ingName,
            amount,
            unit: 'g',
            macros: {
              protein: ingProt,
              carbs: ingCarbs,
              fats: ingFat,
              calories: ingCals
            }
          };

          if (!recipesMap[recName]) {
            const tags = tagsStr
              ? tagsStr.split(';').map((t) => t.trim()).filter(Boolean)
              : ['Importada 📋'];

            recipesMap[recName] = {
              name: recName,
              servings: parseInt(servingsStr) || 1,
              prepTimeMin: parseInt(prepTimeStr) || 15,
              tags,
              culinaryTip: tipStr || undefined,
              ingredients: [ingredient],
              totalMacros: {
                protein: ingProt,
                carbs: ingCarbs,
                fats: ingFat,
                calories: ingCals
              }
            };
          } else {
            recipesMap[recName].ingredients.push(ingredient);
            recipesMap[recName].totalMacros.protein = Number((recipesMap[recName].totalMacros.protein + ingProt).toFixed(1));
            recipesMap[recName].totalMacros.carbs = Number((recipesMap[recName].totalMacros.carbs + ingCarbs).toFixed(1));
            recipesMap[recName].totalMacros.fats = Number((recipesMap[recName].totalMacros.fats + ingFat).toFixed(1));
            recipesMap[recName].totalMacros.calories = Number((recipesMap[recName].totalMacros.calories + ingCals).toFixed(1));
          }
        });

        const list = Object.values(recipesMap);
        if (list.length === 0) {
          setErrorMsg('No se pudieron reconocer recetas válidas en el formato de la planilla.');
        } else {
          setParsedRecipes(list);
        }
      } catch (err: any) {
        setErrorMsg('Error al procesar el archivo CSV: ' + (err.message || 'Verifica el formato'));
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    let count = 0;
    parsedRecipes.forEach((pr) => {
      addRecipe({
        name: pr.name,
        servings: pr.servings,
        prepTimeMin: pr.prepTimeMin,
        tags: pr.tags,
        ingredients: pr.ingredients,
        totalMacros: pr.totalMacros
      });
      count++;
    });

    setImportedCount(count);
    setTimeout(() => {
      onClose();
      setParsedRecipes([]);
      setFileName(null);
      setImportedCount(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-indigo-50/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 font-montserrat flex items-center gap-2">
                Carga Masiva de Recetas
                <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold uppercase tracking-wider">
                  Smart Ready
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Importa múltiples recetas y sus ingredientes desde un archivo CSV.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Banner de descarga de plantilla */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-indigo-900">¿No tienes la plantilla oficial?</h4>
                <p className="text-[11px] text-indigo-700/80">Descárgala con ejemplos listos para rellenar en Excel.</p>
              </div>
            </div>
            <button
              onClick={downloadRecipeCsvTemplate}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> Descargar Plantilla (.CSV)
            </button>
          </div>

          {/* Dropzone */}
          {parsedRecipes.length === 0 && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-3xl p-8 text-center transition-all bg-slate-50/50 hover:bg-indigo-50/20 flex flex-col items-center justify-center cursor-pointer group"
            >
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="recipe-csv-file-input"
              />
              <label htmlFor="recipe-csv-file-input" className="cursor-pointer flex flex-col items-center w-full">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  Arrastra tu archivo CSV o haz clic para explorar
                </h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Asegúrate de que siga las columnas de la plantilla oficial para calcular automáticamente las macros.
                </p>
              </label>
            </div>
          )}

          {/* Mensajes de error */}
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Preview de Recetas Parsedas */}
          {parsedRecipes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {parsedRecipes.length} Recetas Listas para Importar
                </span>
                <button
                  onClick={() => {
                    setParsedRecipes([]);
                    setFileName(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold underline"
                >
                  Cambiar archivo
                </button>
              </div>

              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                {parsedRecipes.map((r, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-sm transition-all flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-black text-slate-800 font-montserrat">{r.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-slate-500 font-medium">
                            ⏱️ {r.prepTimeMin} min • 🍽️ {r.servings} porción • {r.ingredients.length} ingredientes
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-600 font-montserrat">
                          {r.totalMacros.calories} kcal
                        </span>
                        <p className="text-[10px] text-slate-400 font-bold">
                          {r.totalMacros.protein}g P • {r.totalMacros.carbs}g C • {r.totalMacros.fats}g G
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 border-t border-slate-100 pt-2">
                      {r.ingredients.map((ing, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold"
                        >
                          {ing.name} ({ing.amount}g)
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>

          {parsedRecipes.length > 0 && (
            <button
              onClick={handleConfirmImport}
              disabled={importedCount !== null}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              {importedCount !== null ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> ¡{importedCount} Recetas Importadas!
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Confirmar e Importar {parsedRecipes.length} Recetas
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
