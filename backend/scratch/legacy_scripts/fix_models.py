import io
with io.open('D:/Musica Descargada/Bienestar APP/backend/app/db/models.py', 'r', encoding='utf-8', errors='ignore') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if line.strip() == '\"\"\"' or line.strip() == '\\"\"\"':
        lines[i] = '    \"\"\"\n'

with io.open('D:/Musica Descargada/Bienestar APP/backend/app/db/models.py', 'w', encoding='utf-8') as f:
    f.writelines(lines)
