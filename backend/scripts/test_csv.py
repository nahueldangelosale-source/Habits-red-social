import csv
import io

with open('_Taxonomía de Ejercicios.csv', mode='r', encoding='utf-8') as f:
    lines = f.readlines()
    
fixed_lines = []
for line in lines:
    line = line.strip()
    if line.startswith('"') and line.endswith('"'):
        line = line[1:-1]
    line = line.replace('""', '"')
    fixed_lines.append(line)
    
print("Lines:", len(fixed_lines))
reader = csv.DictReader(io.StringIO('\n'.join(fixed_lines)))
print("Fieldnames:", reader.fieldnames)
rows = list(reader)
print("Rows:", len(rows))
if rows:
    print("Row 0:", dict(rows[0]))
