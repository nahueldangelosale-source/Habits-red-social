import pandas as pd
import glob
import os
import re

archivos = glob.glob("*.xls")
lista_dataframes = []

for archivo in archivos:
    print(f"Procesando ETL: {archivo}...")
    try:
        # skiprows=3 ubica en la fila 0 los nombres en español, y en fila 1 los TAGS de la FAO
        df_raw = pd.read_excel(archivo, skiprows=3)
        
        spanish_names = df_raw.iloc[0].astype(str).tolist()
        fao_tags = df_raw.iloc[1].astype(str).tolist()
        
        new_columns = []
        for i in range(len(df_raw.columns)):
            tag = str(fao_tags[i]).strip()
            name = str(spanish_names[i]).strip()
            
            # 1. Prioridad: Tag de la FAO (ej. <PROTCNT>)
            if tag.startswith('<') and tag.endswith('>'):
                col_name = tag.replace('<', '').replace('>', '')
                # Diferenciar las dos columnas de energía (KJ vs Kcal)
                if col_name == 'ENERC':
                    if 'Kcal' in name or 'kcal' in name.lower():
                        col_name = 'ENERC_KCAL'
                    else:
                        col_name = 'ENERC_KJ'
                new_columns.append(col_name)
            
            # 2. Secundario: Nombre de columna válido en español
            elif name != 'nan' and name != 'NaN' and name != '':
                clean_name = re.sub(r'[^a-zA-Z0-9]', '', name)
                if 'Alimento' in name: 
                    clean_name = 'Alimento'
                elif 'N' in name or 'n°' in name.lower() or 'n' in name.lower(): 
                    clean_name = 'ID_SARA'
                elif 'G' in name and 'especie' in name:
                    clean_name = 'Nombre_Cientifico'
                new_columns.append(clean_name)
            
            # 3. Descartar basura
            else:
                new_columns.append(f"Ignorar_{i}")
                
        # Asegurar unicidad de columnas antes de asignar
        seen = set()
        unique_columns = []
        for col in new_columns:
            new_col = col
            counter = 1
            while new_col in seen:
                new_col = f"{col}_{counter}"
                counter += 1
            seen.add(new_col)
            unique_columns.append(new_col)
            
        # Asignar nuevos nombres
        df_raw.columns = unique_columns
        
        # La data real siempre empieza en la fila 4 (descartando encabezados y sub-tags)
        df_data = df_raw.iloc[4:].copy()
        
        # Eliminar las columnas ignoradas
        cols_to_keep = [c for c in df_data.columns if not c.startswith('Ignorar_')]
        df_data = df_data[cols_to_keep]
        
        # Limpiar filas 100% nulas
        df_data = df_data.dropna(how='all')
        
        # Etiquetar categoría de origen
        df_data['origen_categoria'] = os.path.basename(archivo)
        
        lista_dataframes.append(df_data)
        
    except Exception as e:
        print(f"Error procesando {archivo}: {e}")

if not lista_dataframes:
    print("No se encontraron archivos o hubo un error al leerlos.")
    exit(1)

# Concatenar todos los dataframes (Pandas alinea automáticamente las columnas con el mismo nombre)
master_df = pd.concat(lista_dataframes, ignore_index=True)

# Estandarizar decimales: reemplazar comas por puntos en toda la data
master_df = master_df.replace(',', '.', regex=True)

# Eliminar duplicados si los hubiere en los IDs de SARA
# Limpiamos NaNs de ID_SARA primero, los consideramos inválidos
master_df = master_df.dropna(subset=['ID_SARA'])
master_df = master_df.drop_duplicates(subset=['ID_SARA'])

# Exportar
master_df.to_csv("SARA_Master_Database.csv", index=False, encoding='utf-8')
master_df.to_json("SARA_Master_Database.json", orient='records', indent=4, force_ascii=False)

print("\n=======================================================")
print("¡PROCESO ETL (SARA 2) FINALIZADO CON ÉXITO!")
print("=======================================================")
print(f"Total de alimentos únicos normalizados: {len(master_df)}")
print("\nColumnas Normalizadas Extraídas (Soporte NaaS):")
print(list(master_df.columns))
