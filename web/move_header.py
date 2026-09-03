import re

path = 'D:/Musica Descargada/Bienestar APP/web/src/components/onboarding/PlanBuilderCockpit.tsx'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

# The target block to replace is:
target_start = "{/* Header & Periodization Setup */}"
target_end = "          )}\n\n          {/* Onboarding Dimming Overlay */}"

start_idx = code.find(target_start)
end_idx = code.find(target_end)

if start_idx == -1 or end_idx == -1:
    print("Could not find the block to replace")
    exit(1)

# Extract the block to remove it
header_block = code[start_idx:end_idx + len("          )}\n")]

# Define the variable to inject before the return statement (or right before where we need it)
# We can just put it right before the "return (" or at the top of the render block.
# Actually, since it uses `phases.length` and `cycleName`, it must be inside the component.
# Let's just put it right where the old block was! But wait, we can't put a `const` inside the JSX return.
# Oh, it's inside `return ( <div className="..."> ...`
# Let's just pass the JSX inline! Yes!

inline_jsx = """          {/* Header & Periodization Setup is now inside PanoramicBuilder */}"""

# We also need to change the PanoramicBuilder call:
pano_target = "{activeTab === 'routine' && <PanoramicBuilder onOpenForm={() => setIsFormModalOpen(true)} />}"
pano_replace = """{activeTab === 'routine' && <PanoramicBuilder 
              onOpenForm={() => setIsFormModalOpen(true)} 
              headerContent={
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full transition-all pb-4">
                  <div className="flex-1 w-full max-w-lg">
                    <div className={`group flex flex-col w-full border-b transition-colors pb-1 cursor-text ${phases.length > 0 ? 'border-transparent hover:border-slate-200 focus-within:border-indigo-500' : 'border-transparent focus-within:border-indigo-400'}`}>
                      <div className="flex items-center gap-3">
                        <input 
                          type="text" 
                          placeholder="Añadir Título del Plan..."
                          value={cycleName}
                          onChange={(e) => {
                            setCycleName(e.target.value);
                            setCycleTaxonomyId(null);
                          }}
                          className={`text-slate-900 bg-transparent outline-none placeholder:text-slate-400 transition-all duration-300 focus:w-full font-montserrat ${phases.length > 0 ? 'w-full text-xl md:text-3xl font-black' : 'w-48 text-lg font-bold text-slate-500 focus:text-slate-800 focus:text-xl'}`}
                        />
                        <Edit3 className={`w-5 h-5 transition-opacity ${phases.length > 0 ? 'text-slate-300 opacity-0 group-hover:opacity-100' : 'text-slate-400 opacity-50 group-hover:opacity-100'}`} />
                      </div>
                    </div>
                  </div>

                  <div className="relative flex items-center gap-3">
                    <button 
                      onClick={() => setIsFormModalOpen(true)}
                      className="w-full md:w-auto bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-3 border border-indigo-200 shadow-sm group text-sm"
                      title="Abrir Ficha del Atleta (Ctrl + F)"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" /> 
                        <span>Ficha del Atleta</span>
                      </div>
                      <div className="hidden sm:flex items-center gap-0.5 bg-white/60 text-indigo-500 px-1.5 py-0.5 rounded text-[9px] font-black tracking-widest border border-indigo-200 shadow-sm group-hover:bg-white transition-colors">
                        <kbd>CTRL</kbd><span className="opacity-50">+</span><kbd>F</kbd>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => document.getElementById('smart-vault-panel')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full md:w-auto bg-white hover:bg-slate-50 text-slate-700 font-bold py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-200 shadow-sm whitespace-nowrap text-sm"
                    >
                      <UploadCloud className="w-4 h-4 text-indigo-500" /> Cargar Plantilla
                    </button>
                    
                    <button 
                      onClick={() => setIsSignatureModalOpen(true)}
                      className="w-full md:w-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 border border-emerald-200 shadow-sm whitespace-nowrap text-sm"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Guardar Plantilla
                    </button>
                  </div>
                </div>
              }
            />}"""

code = code.replace(header_block, inline_jsx)
if pano_target in code:
    code = code.replace(pano_target, pano_replace)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("PlanBuilderCockpit modified successfully")
else:
    print("Could not find PanoramicBuilder instantiation")
