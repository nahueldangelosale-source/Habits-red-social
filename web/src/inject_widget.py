import re

with open('web/src/components/CommandCenter.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

start_str = '{/* 3. Atletas Recientes (Quick Access) */}'
end_str = '''                            ))
                        )}
                    </div>
                </div>'''

parts = content.split(start_str)
if len(parts) == 2:
    pre_atletas = parts[0]
    rest = parts[1]
    
    rest_parts = rest.split(end_str)
    if len(rest_parts) == 2:
        atletas_content = rest_parts[0] + end_str
        post_atletas = rest_parts[1]
        
        new_atletas_wrapper = '''{/* Grid for Atletas and Actividad Reciente */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    {/* 3. Atletas Recientes (Quick Access) */}
''' + atletas_content + '''
                </div>
                
                {/* 4. Actividad Reciente */}
                <div className="lg:col-span-1">
                    <div className={`rounded-3xl border shadow-sm overflow-hidden h-full flex flex-col ${
                        isClinical ? 'bg-white border-slate-200' : 'bg-zinc-900 border-zinc-800'
                    }`}>
                        <div className={`px-6 py-5 border-b flex justify-between items-center ${
                            isClinical ? 'border-slate-100 bg-slate-50/50' : 'border-zinc-800 bg-zinc-900'
                        }`}>
                            <h3 className={`text-base font-bold ${isClinical ? 'text-slate-900' : 'text-white'}`}>Actividad Reciente</h3>
                            <Zap size={16} className={isClinical ? 'text-indigo-500' : 'text-indigo-400'} />
                        </div>
                        <div className={`divide-y flex-1 overflow-y-auto ${isClinical ? 'divide-slate-100' : 'divide-zinc-800'}`}>
                            {[
                                { name: 'Mariano C.', action: 'finalizó su sesión de Fuerza', rpe: 8.5, time: 'Hace 10 min', color: 'text-amber-600', bg: 'bg-amber-100', icon: 'zap' },
                                { name: 'Julieta M.', action: 'completó Validation Tinder', rpe: None, time: 'Hace 45 min', color: 'text-indigo-600', bg: 'bg-indigo-100', icon: 'video' },
                                { name: 'Carlos T.', action: 'finalizó su sesión de Hipertrofia', rpe: 6, time: 'Hace 2 horas', color: 'text-emerald-600', bg: 'bg-emerald-100', icon: 'zap' },
                            ].map((event, idx) => (
                                <div key={idx} className={`p-4 transition-colors ${
                                    isClinical ? 'hover:bg-slate-50' : 'hover:bg-zinc-800/30'
                                }`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <p className={`text-sm font-bold ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                                            {event.name} <span className="font-normal text-zinc-500">{event.action}</span>
                                        </p>
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap ml-2">{event.time}</span>
                                    </div>
                                    {event.rpe && (
                                        <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                                            isClinical ? event.bg + ' ' + event.color : event.bg.replace('100', '500/20') + ' text-amber-400'
                                        }`}>
                                            RPE: {event.rpe}/10
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className={`p-4 border-t text-center mt-auto ${isClinical ? 'border-slate-100 bg-slate-50/30' : 'border-zinc-800 bg-zinc-900/30'}`}>
                            <button className={`text-xs font-bold uppercase tracking-widest ${isClinical ? 'text-slate-400 hover:text-slate-600' : 'text-zinc-500 hover:text-zinc-300'}`}>
                                Ver Historial Completo
                            </button>
                        </div>
                    </div>
                </div>
            </div>'''
        
        final_content = pre_atletas + new_atletas_wrapper + post_atletas
        
        with open('web/src/components/CommandCenter.tsx', 'w', encoding='utf-8') as f:
            f.write(final_content)
        print("Successfully added Actividad Reciente widget.")
    else:
        print("Error: end_str not found or multiple times.")
else:
    print("Error: start_str not found or multiple times.")
