import json

with open('web/src/data/SARA_Master_Database.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"Total Unified Foods: {len(data)}")
print("\n--- Muestra de Alimentos USDA Traducidos e Incorporados ---")
for x in data[471:495]:
    p = x.get('PROTCNT', 0)
    c = x.get('CHOCDF', 0)
    f_val = x.get('FAT', 0)
    kcal = x.get('ENERC_KCAL', 0)
    print(f"* {x['Alimento']} -> {kcal} kcal | P: {p}g | C: {c}g | F: {f_val}g [{x['origen_categoria']}]")
