import csv

foundation_foods = {}
with open('docs/Alimentos/FoodData_Central_foundation_food_csv_2026-04-30/food.csv', 'r', encoding='utf-8') as f:
    for row in csv.DictReader(f):
        if row.get('data_type') == 'foundation_food':
            foundation_foods[row['fdc_id']] = {
                'id': row['fdc_id'],
                'description': row['description'],
                'category_id': row.get('food_category_id', ''),
                'calories': 0.0,
                'protein': 0.0,
                'fat': 0.0,
                'carbs': 0.0
            }

with open('docs/Alimentos/FoodData_Central_foundation_food_csv_2026-04-30/food_nutrient.csv', 'r', encoding='utf-8') as f:
    for row in csv.DictReader(f):
        fdc_id = row['fdc_id']
        if fdc_id in foundation_foods:
            n_id = row['nutrient_id']
            try:
                amt = float(row['amount'])
            except:
                continue
            if n_id in ('1008', '2047', '2048') and foundation_foods[fdc_id]['calories'] == 0:
                foundation_foods[fdc_id]['calories'] = amt
            elif n_id == '1003':
                foundation_foods[fdc_id]['protein'] = amt
            elif n_id == '1004':
                foundation_foods[fdc_id]['fat'] = amt
            elif n_id == '1005':
                foundation_foods[fdc_id]['carbs'] = amt

print(f"Total Foundation Foods parsed: {len(foundation_foods)}")
for f in list(foundation_foods.values())[:15]:
    cals = f['calories'] if f['calories'] > 0 else round(f['protein']*4 + f['carbs']*4 + f['fat']*9)
    print(f"ID: {f['id']} | {f['description']} => P: {f['protein']}g, C: {f['carbs']}g, F: {f['fat']}g, Kcal: {cals}")
