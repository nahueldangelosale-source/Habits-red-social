import pandas as pd
import numpy as np

def run_qa():
    df = pd.read_csv("SARA_Master_Database.csv")
    
    # 1. Columnas Críticas Existentes
    critical_cols = ['ID_SARA', 'Alimento', 'ENERC_KCAL', 'PROTCNT', 'FAT', 'CHOAVLDF']
    missing_cols = [c for c in critical_cols if c not in df.columns]
    if missing_cols:
        print(f"❌ ERROR CRÍTICO: Faltan columnas {missing_cols}")
        return

    # 2. Reemplazo de "Trazas" (Tr) y No Datos (Nd)
    # En bases nutricionales es común encontrar 'Tr' o 'nd'
    for col in ['ENERC_KCAL', 'PROTCNT', 'FAT', 'CHOAVLDF']:
        # Forzar a string para manipular, limpiar y pasar a numérico
        df[col] = df[col].astype(str).str.replace('Tr', '0', case=False)
        df[col] = df[col].str.replace('nd', '0', case=False)
        df[col] = df[col].str.replace('nan', '0', case=False)
        df[col] = df[col].str.replace('<0.1', '0.1', case=False) # Casos como <0.1
        df[col] = pd.to_numeric(df[col], errors='coerce')

    # 3. Verificación de Nulos después de casteo
    nulls = df[critical_cols].isnull().sum()
    print("--- 1. AUDITORÍA DE NULOS (Valores Vacíos o Rotos) ---")
    print(nulls)
    
    # 4. Verificación de Límite Físico (Ningún alimento puede tener >100g de macros en 100g)
    df['total_macros'] = df['PROTCNT'] + df['FAT'] + df['CHOAVLDF']
    impossible_foods = df[df['total_macros'] > 100]
    print(f"\n--- 2. AUDITORÍA DE LEYES FÍSICAS (Macros > 100g) ---")
    if not impossible_foods.empty:
        print(f"ERROR: ENCONTRADOS {len(impossible_foods)} alimentos imposibles:")
        print(impossible_foods[['Alimento', 'PROTCNT', 'FAT', 'CHOAVLDF', 'total_macros']].head())
    else:
        print("OK: 0 alimentos superan los 100g por porcion. Logica fisica intacta.")

    # 5. Verificación de Energía (Fórmula de Atwater: 4/4/9)
    # Permitimos un margen de error de +/- 20 kcal por tema de fibra y alcoholes
    df['calculated_kcal'] = (df['PROTCNT'] * 4) + (df['CHOAVLDF'] * 4) + (df['FAT'] * 9)
    df['kcal_diff'] = abs(df['ENERC_KCAL'] - df['calculated_kcal'])
    
    # Tolerancia de 30 kcal debido a fibra y diferentes factores de conversión
    anomalies = df[df['kcal_diff'] > 30]
    
    print(f"\n--- 3. AUDITORIA DE DESPLAZAMIENTO DE COLUMNAS (Atwater 4/4/9) ---")
    if len(anomalies) > 0:
        print(f"ALERTA: {len(anomalies)} alimentos con variacion de energia mayor a 30 kcal (Suele ser por alto contenido de Fibra).")
        print(anomalies[['Alimento', 'ENERC_KCAL', 'calculated_kcal', 'FIBTG']].head())
    else:
        print("OK: Columnas alineadas perfectamente. Ningun desplazamiento detectado.")

if __name__ == "__main__":
    run_qa()
