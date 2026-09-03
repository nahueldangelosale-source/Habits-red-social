import re

with open('web/src/components/CommandCenter.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Tab Bar Container
content = content.replace(
    'className="flex p-1 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl w-max mx-auto"',
    'className={`flex p-1 rounded-2xl w-max mx-auto border transition-colors ${isClinical ? \\'bg-white/80 border-slate-200 backdrop-blur-md shadow-sm\\' : \\'bg-zinc-900 border-zinc-800 shadow-xl\\'}`}'
)

# 2. Update OVERVIEW button
content = content.replace(
    '''activeTab === 'OVERVIEW' 
                                  ? 'bg-zinc-800 text-white shadow-md' 
                                  : 'text-zinc-500 hover:text-zinc-300' '''.strip(),
    '''activeTab === 'OVERVIEW' ? (isClinical ? 'bg-slate-100 text-slate-900 shadow-sm' : 'bg-zinc-800 text-white shadow-md') : (isClinical ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-50' : 'text-zinc-500 hover:text-zinc-300')'''
)

# 3. Update RADAR button
content = content.replace(
    '''activeTab === 'RADAR' 
                                  ? 'bg-zinc-800 text-white shadow-md' 
                                  : 'text-zinc-500 hover:text-zinc-300' '''.strip(),
    '''activeTab === 'RADAR' ? (isClinical ? 'bg-slate-100 text-slate-900 shadow-sm' : 'bg-zinc-800 text-white shadow-md') : (isClinical ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-50' : 'text-zinc-500 hover:text-zinc-300')'''
)

# 4. Update VALIDATION_SWIPE button
content = content.replace(
    '''activeTab === 'VALIDATION_SWIPE' 
                                  ? 'bg-zinc-800 text-white shadow-md' 
                                  : 'text-zinc-500 hover:text-zinc-300' '''.strip(),
    '''activeTab === 'VALIDATION_SWIPE' ? (isClinical ? 'bg-slate-100 text-slate-900 shadow-sm' : 'bg-zinc-800 text-white shadow-md') : (isClinical ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-50' : 'text-zinc-500 hover:text-zinc-300')'''
)

# 5. Update AGENDA button
content = content.replace(
    '''activeTab === 'AGENDA' 
                                  ? 'bg-zinc-800 text-white shadow-md' 
                                  : 'text-zinc-500 hover:text-zinc-300' '''.strip(),
    '''activeTab === 'AGENDA' ? (isClinical ? 'bg-slate-100 text-slate-900 shadow-sm' : 'bg-zinc-800 text-white shadow-md') : (isClinical ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-50' : 'text-zinc-500 hover:text-zinc-300')'''
)

# 6. Update CASCADE_BUILDER button
content = content.replace(
    '''activeTab === 'CASCADE_BUILDER' 
                                  ? 'bg-[#CEFF00] text-black shadow-[0_0_15px_rgba(206,255,0,0.2)]' 
                                  : 'text-zinc-500 hover:text-zinc-300' '''.strip(),
    '''activeTab === 'CASCADE_BUILDER' ? (isClinical ? 'bg-slate-900 text-white shadow-md' : 'bg-[#CEFF00] text-black shadow-[0_0_15px_rgba(206,255,0,0.2)]') : (isClinical ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-50' : 'text-zinc-500 hover:text-zinc-300')'''
)

# 7. Update SMART_LAB button
content = content.replace(
    '''activeTab === 'SMART_LAB' 
                                  ? 'bg-zinc-800 text-white shadow-md' 
                                  : 'text-zinc-500 hover:text-zinc-300' '''.strip(),
    '''activeTab === 'SMART_LAB' ? (isClinical ? 'bg-slate-100 text-slate-900 shadow-sm' : 'bg-zinc-800 text-white shadow-md') : (isClinical ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-50' : 'text-zinc-500 hover:text-zinc-300')'''
)

# 8. Update Crear Atleta button
content = content.replace(
    'className="flex items-center gap-2 bg-[#CEFF00] hover:bg-[#b8e600] text-black font-black uppercase tracking-widest text-xs px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(206,255,0,0.3)] hover:shadow-[0_0_30px_rgba(206,255,0,0.5)]"',
    'className={`flex items-center gap-2 font-black uppercase tracking-widest text-xs px-6 py-3 rounded-xl transition-all ${isClinical ? \\'bg-slate-900 hover:bg-slate-800 text-white shadow-md hover:shadow-lg\\' : \\'bg-[#CEFF00] hover:bg-[#b8e600] text-black shadow-[0_0_20px_rgba(206,255,0,0.3)] hover:shadow-[0_0_30px_rgba(206,255,0,0.5)]\\'}`}'
)

with open('web/src/components/CommandCenter.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
