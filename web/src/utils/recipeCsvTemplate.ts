/**
 * Generador y Descargador de la Plantilla CSV para Carga Masiva de Recetas SARA 2
 */

export const RECIPE_CSV_TEMPLATE_HEADER = "Nombre_Receta,Porciones,Tiempo_Min,Tags,Ingrediente,Cantidad_Gramos,Proteina_100g,Carbos_100g,Grasas_100g,Calorias_100g,Tip_Culinario\n";

export const RECIPE_CSV_SAMPLE_ROWS = [
  'Pancakes de Avena y Cacao,1,10,Hipertrofia;Desayuno;Express,Avena en hojuelas,60,13.5,60.0,6.5,352.5,Licuar en crudo y cocinar a fuego medio',
  'Pancakes de Avena y Cacao,1,10,Hipertrofia;Desayuno;Express,Clara de huevo,150,10.9,0.7,0.2,48.2,',
  'Pancakes de Avena y Cacao,1,10,Hipertrofia;Desayuno;Express,Cacao amargo 100%,10,19.5,13.5,13.5,253.5,',
  'Bife con Batata Asada,1,18,Fuerza;Almuerzo,Bife de cuadril magro,180,21.5,0.0,4.5,126.5,Sellar a fuego fuerte',
  'Bife con Batata Asada,1,18,Fuerza;Almuerzo,Batata cruda,250,1.6,20.0,0.1,87.3,',
  'Bife con Batata Asada,1,18,Fuerza;Almuerzo,Aceite de oliva extra virgen,10,0.0,0.0,100.0,900.0,',
  'Bowl de Yogur Griego y Frutillas,1,3,Express;Probióticos,Yogur griego natural,200,10.0,4.0,0.5,60.5,Ensamble instantáneo',
  'Bowl de Yogur Griego y Frutillas,1,3,Express;Probióticos,Frutillas frescas,100,0.8,7.7,0.3,36.7,',
  'Bowl de Yogur Griego y Frutillas,1,3,Express;Probióticos,Semillas de lino molidas,15,18.0,29.0,42.0,566.0,'
].join('\n');

/**
 * Descarga en el navegador del usuario el archivo CSV con BOM UTF-8 para compatibilidad con Excel
 */
export function downloadRecipeCsvTemplate(): void {
  const csvContent = "\uFEFF" + RECIPE_CSV_TEMPLATE_HEADER + RECIPE_CSV_SAMPLE_ROWS;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Plantilla_Carga_Masiva_Recetas_SARA2.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
