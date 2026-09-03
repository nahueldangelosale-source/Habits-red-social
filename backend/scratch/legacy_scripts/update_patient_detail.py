import io

def update_file():
    filepath = 'D:/Musica Descargada/Bienestar APP/web/src/components/drilldown/PatientDetailView.tsx'
    with io.open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Hide Protocolo Nutricional Operativo if no nutrition plan
    block_start = "{/* RIGHT COLS: OPERATIONAL DIET & ALERTS */}"
    if block_start in content and "patient.nutrition ?" not in content:
        content = content.replace(
            "                    {/* RIGHT COLS: OPERATIONAL DIET & ALERTS */}\n                    <div className=\"lg:col-span-8 space-y-6\">",
            "                    {/* RIGHT COLS: OPERATIONAL DIET & ALERTS */}\n                    <div className=\"lg:col-span-8 space-y-6\">\n                        {patient.nutrition ? ("
        )
        # Find where to close it: right before {/* ALERTS & INJURIES */} or next section. 
        # Wait, there's <!-- ALERTS & INJURIES --> or similar? Let's check the code.
        # Actually I can just replace the hardcoded values:
        content = content.replace('{patient.calories || 1800}', '{patient.nutrition?.macros?.calories || 0}')
        content = content.replace('{patient.protein || 140}g', '{patient.nutrition?.macros?.protein || 0}g')
        content = content.replace('{patient.carbs || 160}g', '{patient.nutrition?.macros?.carbs || 0}g')
        content = content.replace('{patient.fats || 60}g', '{patient.nutrition?.macros?.fats || 0}g')

        with io.open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Updated PatientDetailView.tsx macros to use patient.nutrition.macros")

update_file()
