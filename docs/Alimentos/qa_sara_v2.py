import pandas as pd
import numpy as np

def comprehensive_qa():
    df = pd.read_csv("SARA_Master_Database.csv")
    
    print("=========================================================")
    print("AUDITORIA EXHAUSTIVA DE ESCENARIOS (SARA 2 - Nivel 2)")
    print("=========================================================\n")

    # PRE-PROCESAMIENTO DEFENSIVO (Simulación de lo que hará el Backend)
    cols_to_clean = ['ENERC_KCAL', 'PROTCNT', 'FAT', 'CHOAVLDF', 'CHOCDF', 'Sodiomg']
    
    # 1. Asegurar que las columnas existen, si no, crear con NaN
    for col in cols_to_clean:
        if col not in df.columns:
            df[col] = np.nan
            
    # 2. Limpieza de strings sucios (Tr, nd, <0.1, nan)
    for col in cols_to_clean:
        df[col] = df[col].astype(str).str.replace('Tr', '0', case=False)
        df[col] = df[col].str.replace('nd', '0', case=False)
        df[col] = df[col].str.replace('nan', 'NaN', case=False)
        df[col] = df[col].str.replace('<0.1', '0.1', case=False)
        df[col] = pd.to_numeric(df[col], errors='coerce')

    # Aplicar Fallback de Carbohidratos (El fix del Banana)
    # Si CHOAVLDF es NaN, usar CHOCDF. Si ambos NaN, usar 0.
    df['CHO_FINAL'] = df['CHOAVLDF'].fillna(df['CHOCDF']).fillna(0)
    df['PRO_FINAL'] = df['PROTCNT'].fillna(0)
    df['FAT_FINAL'] = df['FAT'].fillna(0)
    df['KCAL_FINAL'] = df['ENERC_KCAL'].fillna(0)

    # ---------------------------------------------------------
    # ESCENARIO 1: Duplicidad y Colisiones de Identidad
    # ---------------------------------------------------------
    print("--- 1. INTEGRIDAD DE IDENTIFICADORES ---")
    duplicados_id = df[df.duplicated('ID_SARA', keep=False)]
    if not duplicados_id.empty:
        print(f"ERROR PELIGRO: {len(duplicados_id)} IDs SARA duplicados.")
    else:
        print("OK: 0 colisiones en ID_SARA (Primary Key segura).")

    nombres_vacios = df[df['Alimento'].isnull() | (df['Alimento'] == '')]
    if not nombres_vacios.empty:
        print(f"ERROR PELIGRO: {len(nombres_vacios)} alimentos sin nombre.")
    else:
        print("OK: 0 alimentos sin nombre identificable.")

    # ---------------------------------------------------------
    # ESCENARIO 2: Leyes de Termodinámica y Masa FÍSICA
    # ---------------------------------------------------------
    print("\n--- 2. LEYES FISICAS EXTREMAS ---")
    df['total_macros'] = df['PRO_FINAL'] + df['FAT_FINAL'] + df['CHO_FINAL']
    
    macros_negativos = df[(df['PRO_FINAL'] < 0) | (df['FAT_FINAL'] < 0) | (df['CHO_FINAL'] < 0) | (df['KCAL_FINAL'] < 0)]
    if not macros_negativos.empty:
        print(f"ERROR FISICA ROTA: {len(macros_negativos)} alimentos con nutrientes negativos.")
    else:
        print("OK: 0 alimentos con nutrientes negativos (Antimateria descartada).")

    # El límite de calorías en 100g es pura grasa (900 kcal)
    exceso_calorias = df[df['KCAL_FINAL'] > 910]
    if not exceso_calorias.empty:
        print(f"ERROR ENERGIA IMPOSIBLE: {len(exceso_calorias)} alimentos superan las 900 Kcal por 100g.")
        print(exceso_calorias[['Alimento', 'KCAL_FINAL']].head())
    else:
        print("OK: 0 alimentos superan el limite fisico de densidad energetica (900 kcal/100g).")

    exceso_masa = df[df['total_macros'] > 100.5] # 100.5 por redondeos
    if not exceso_masa.empty:
        print(f"ERROR MASA IMPOSIBLE: {len(exceso_masa)} alimentos tienen mas de 100g de macros en 100g.")
        print(exceso_masa[['Alimento', 'PRO_FINAL', 'FAT_FINAL', 'CHO_FINAL', 'total_macros']].head())
    else:
        print("OK: 0 alimentos violan la ley de conservacion de masa (>100g por porcion).")

    # ---------------------------------------------------------
    # ESCENARIO 3: Red de Seguridad de Sodio (Toxicidad)
    # ---------------------------------------------------------
    print("\n--- 3. LIMITES DE TOXICIDAD (Micronutrientes) ---")
    # Sal pura es 39,000 mg de sodio por 100g. Más de 40,000 mg es error de tipeo.
    df['Sodio_Num'] = pd.to_numeric(df['Sodiomg'].astype(str).str.replace('Tr', '0').str.replace('nd', '0'), errors='coerce').fillna(0)
    exceso_sodio = df[df['Sodio_Num'] > 40000]
    if not exceso_sodio.empty:
        print(f"ERROR SODIO TOXICO: {len(exceso_sodio)} alimentos superan los 40,000mg de sodio (Error de coma).")
        print(exceso_sodio[['Alimento', 'Sodio_Num']].head())
    else:
        print("OK: 0 picos anomalos de toxicidad en Sodio detectados.")

    # ---------------------------------------------------------
    # ESCENARIO 4: Recálculo Atwater Post-Fix (Prueba de Fuego)
    # ---------------------------------------------------------
    print("\n--- 4. PRUEBA DE FUEGO ATWATER (Con Fallback CHOCDF) ---")
    df['calculated_kcal_v2'] = (df['PRO_FINAL'] * 4) + (df['CHO_FINAL'] * 4) + (df['FAT_FINAL'] * 9)
    df['kcal_diff_v2'] = abs(df['KCAL_FINAL'] - df['calculated_kcal_v2'])
    
    # 35 kcal de tolerancia debido a factores de Atwater específicos (alcoholes, fibra)
    anomalias_v2 = df[df['kcal_diff_v2'] > 35]
    if not anomalias_v2.empty:
        print(f"ALERTA: {len(anomalias_v2)} alimentos aun mantienen discrepancia de energia.")
        print(anomalias_v2[['Alimento', 'KCAL_FINAL', 'calculated_kcal_v2', 'PRO_FINAL', 'CHO_FINAL', 'FAT_FINAL']].head(10))
    else:
        print("OK ATWATER SINCERADO: La solucion de fallback resolvio los agujeros matematicos criticos.")

    print("\n=========================================================")
    print("FIN DE LA AUDITORÍA")
    print("=========================================================")

if __name__ == "__main__":
    comprehensive_qa()
