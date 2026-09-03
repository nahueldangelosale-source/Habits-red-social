# Estrategia de Base de Datos y Backend: Módulo de Nutrición Proactiva

Este documento consolida la arquitectura técnica extraída del **Reporte Técnico-Estratégico** para el módulo de nutrición de ON by CatilliOn.

## 1. Visión Fundamental
Pasar del paradigma de "seguimiento calórico reactivo" (historiador de fracasos) a la "planificación proactiva y delegación logística" (orquestador del futuro). El abandono de apps de nutrición ocurre por la fricción logística y la fatiga de decisión, no por falta de motivación.

## 2. Abstracción del "Hogar" (Household)
El usuario aislado en la cocina es un anti-patrón. La alimentación es un fenómeno tribal.
- **Households**: Entidad propietaria de las listas de compras y despensas.
- **Users**: Entidad propietaria de identidad, biometría, metas calóricas y alergias, vinculada a un Household.
- La seguridad a nivel de fila (RLS) en Supabase debe aislar datos por `household_id`.

## 3. Modelo Relacional Core
- `Recipes`: Catálogo maestro (instrucciones, tiempo de prep, score estacional).
- `Ingredients`: Insumos crudos normalizados (evita duplicidad).
- `Recipe_Ingredients`: Tabla pivote con cantidades y unidades (unit_id).
- `Meal_Plans`: Contenedor semanal por hogar.
- `Meals`: Comida particular (ej. Cena Martes) vinculada a Receta, con `servings_multiplier`.
- `Pantry_Items`: Inventario físico del hogar.
- `Shopping_Lists` & `Shopping_Items`: Lista de compras consolidada, agrupada por pasillo de supermercado (`default_aisle_id`).

## 4. Motor de Consolidación (NLP y Matemática)
El mayor desafío técnico es evitar la fricción operativa de sumar mentalmente unidades ("media cebolla" + "2 tazas picadas").
1. **Extracción Semántica (NLP)**: Librerías para parsear sintaxis culinaria (extraer cantidad, unidad, modificador).
2. **Normalización Volumétrica/Másica**: Diccionario de factores de conversión.
3. **Agregación y Redondeo**: Consolidar "1.37 cabezas de ajo" en unidades comerciales lógicas. 

## 5. Integración de Mensajería (Delegación Low-Cost)
Para que las compras se deleguen entre miembros de la familia sin fricción, se usará **Deep Linking (wa.me)** hacia WhatsApp.
- Costo marginal cero ($0.00).
- Tráfico P2P (envío desde el propio WhatsApp del usuario, no un Bot corporativo).
- Inyección de Markdown (*negritas*, _cursivas_) y Emojis 🥩🍎 para simular una UI dentro del chat.
- Actúa como vector orgánico de Growth Marketing (boca a boca en Dark Social).

## 6. Variables Estacionales
Algoritmo de *Seasonal Score* para sugerir recetas con ingredientes en época de cosecha local, reduciendo el costo de la canasta básica y mejorando el sabor.

## 7. Base de Datos Unificada SARA 2 + USDA Foundation (834 Alimentos)
Para balancear la identidad cultural regional y el rigor analítico de laboratorio, la plataforma opera sobre una base unificada consolidada:
- **Base SARA (Argentina / LatAm - 471 alimentos)**: Cortes cárnicos locales (*cuadril, colita de lomo, matambre, nalga*), nombres hispanos cotidianos (*palta, frutilla, batata, zapallo*) y recetas preparadas.
- **USDA FoodData Central Foundation (+363 alimentos traducidos)**: Análisis por cromatografía y espectrometría con perfil analítico de macronutrientes, micronutrientes (Hierro, Calcio, Potasio, Magnesio, Sodio, Vitaminas A-K) y aminoácidos esenciales (Leucina para mTOR).
- **Total Unificado**: **834 alimentos bromatológicamente verificados** indexados en `SARA_Master_Database.json` y persistidos en PostgreSQL (`food_items`).

## 8. Smart Swap Engine (Sustitución Isocalórica e Isomacronutriente)
El motor [`smartSwapEngine.ts`](file:///D:/Musica%20Descargada/Bienestar%20APP/web/src/utils/smartSwapEngine.ts) previene la deserción del paciente ofreciendo sustituciones instantáneas con cálculo paramétrico exacto de porciones:
- **Detección Automática de Dominancia**: `CARBS` (almidones/energéticos), `PROTEIN` (estructurales), `FAT` (lípidos saludables) y `BALANCED` (isocalórico).
- **Paridad de Macros Completa**: Cada sugerencia muestra Gramos Calculados + Medida Casera Cotidiana (`householdMeasures.ts`) + 4 Badges (Kcal, Carbos, Proteína, Grasas) + % de Match.
- **Buscador SARA Integrado**: Permite al coach o atleta tipear cualquier alimento de la base de 834 items y auto-calcular la porción requerida en tiempo real.

