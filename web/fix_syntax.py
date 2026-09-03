import re

path = 'D:/Musica Descargada/Bienestar APP/web/src/components/onboarding/PanoramicBuilder.tsx'
with open(path, 'r', encoding='utf-8') as f:
    code = f.read()

# Fix the missing closure for `{phases.length > 0 && (`
target = """                  {activeMainTab === 'mapa' && (
                    <div className="mt-4 animate-in fade-in duration-300">
                      <InteractiveHeatmap activePhaseId={activePhaseId} />
                    </div>
                  )}
                </div>
                </div>
              )}"""

replacement = """                  {activeMainTab === 'mapa' && (
                    <div className="mt-4 animate-in fade-in duration-300">
                      <InteractiveHeatmap activePhaseId={activePhaseId} />
                    </div>
                  )}
                    </>
                  )}
                </div>
                </div>
              )}"""

if target in code:
    code = code.replace(target, replacement)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)
    print("Fixed syntax")
else:
    print("Target not found")
