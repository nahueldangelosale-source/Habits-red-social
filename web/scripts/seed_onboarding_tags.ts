import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { z } from 'zod';
import { createClient } from '@libsql/client';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Zod Schema for Validation
const OnboardingTagSchema = z.object({
  id: z.string(),
  category: z.string(), // Objetivo_Principal, Nivel_Experiencia, etc.
  ui_label: z.string(),
  ui_icon: z.string().optional(), // Extract from label if it contains an emoji
  backend_value: z.string(),
  impact: z.string(),
  target: z.string()
});

export type OnboardingTag = z.infer<typeof OnboardingTagSchema>;

// Helper to extract emojis and clean text
const extractIconAndText = (rawText: string) => {
  const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu;
  const match = rawText.match(emojiRegex);
  
  if (match) {
    const icon = match[0];
    const cleanText = rawText.replace(icon, '').trim();
    return { icon, cleanText };
  }
  return { icon: undefined, cleanText: rawText };
};

// Mapeo seguro de categorías
const CATEGORY_MAP: Record<string, string> = {
    'Objetivo_Principal': 'GOAL',
    'Nivel_Experiencia': 'EXPERIENCE',
    'Disponibilidad_Dias': 'DAYS',
    'Tiempo_Sesion': 'TIME',
    'Equipamiento_Local': 'EQUIPMENT',
    'Lesiones_Molestias': 'BIOMECHANICS',
    'Nivel_Estres': 'STRESS',
    'Calidad_Sueno': 'SLEEP',
    'Estilo_Coaching': 'COACHING_STYLE',
    'Estilo_Coaching': 'COACHING_STYLE',
    'Preferencia_Dieta': 'DIET',
    // Mapeo Nutrición Ontológica
    'NUT_LOGISTICS_MARKET': 'NUT_LOGISTICS',
    'NUT_LOGISTICS_KITCHEN': 'NUT_LOGISTICS',
    'NUT_GOAL': 'NUT_GOALS',
    'NUT_OBSTACLE': 'NUT_OBSTACLES',
    'NUT_DIET_TYPE': 'NUT_CLINICAL',
    'NUT_SYMPTOMS': 'NUT_CLINICAL',
    'NUT_READINESS': 'NUT_READINESS'
};

async function seedTags() {
  console.log('🚀 Iniciando Operación "Taxonomy Seeder"');
  
  const csvFilePath = path.resolve(__dirname, '../../backend/Tag Onboarding - Investigación Completada.csv');
  const dbPath = path.resolve(__dirname, '../bienestar_local.db');
  
  // 1. Parse CSV
  console.log(`📂 Leyendo archivo CSV desde: ${csvFilePath}`);
  const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
  
  const records = parse(fileContent, {
    columns: ['id', 'category', 'ui_label', 'backend_value', 'impact', 'target'],
    skip_empty_lines: true,
    from_line: 2 // Saltar cabeceras
  });

  const validTags: OnboardingTag[] = [];

  for (const record of records) {
      if (record.target === 'B2B_Coach') continue; // Solo nos interesan los tracks B2C para ahora
      
      const { icon, cleanText } = extractIconAndText(record.ui_label);
      const mappedCategory = CATEGORY_MAP[record.category] || record.category;

      try {
          const valid = OnboardingTagSchema.parse({
              id: record.id,
              category: mappedCategory,
              ui_label: cleanText,
              ui_icon: icon,
              backend_value: record.backend_value,
              impact: record.impact,
              target: record.target
          });
          validTags.push(valid);
      } catch (err) {
          console.error(`❌ Error de validación en la fila ${record.id}:`, err);
      }
  }

  console.log(`✅ CSV Parseado. Total de Tags B2C extraídos: ${validTags.length}`);

  // 2. Insert en SQLite (Turso Local Embedded)
  console.log(`🔌 Conectando a la réplica Edge Local (Turso libSQL): file:${dbPath}`);
  const db = createClient({
      url: `file:${dbPath}`
  });

  try {
      console.log('🏗️  Reconstruyendo tabla `onboarding_tags`...');
      await db.execute(`
          CREATE TABLE IF NOT EXISTS onboarding_tags (
              id TEXT PRIMARY KEY,
              category TEXT NOT NULL,
              ui_label TEXT NOT NULL,
              ui_icon TEXT,
              backend_value TEXT NOT NULL UNIQUE
          );
      `);
      
      await db.execute('DELETE FROM onboarding_tags'); // Clean before insert

      console.log('💉 Inyectando ontología de etiquetas en el Local Store...');
      
      const insertPromises = validTags.map(tag => {
          return db.execute({
              sql: `INSERT INTO onboarding_tags (id, category, ui_label, ui_icon, backend_value) 
                    VALUES (?, ?, ?, ?, ?)`,
              args: [tag.id, tag.category, tag.ui_label, tag.ui_icon || null, tag.backend_value]
          });
      });

      await Promise.all(insertPromises);
      
      console.log('🟢 Data inyectada en SQLite con éxito (0ms TTI Ready).');
  } catch (err) {
      console.error('❌ Error inyectando datos en SQLite:', err);
  } finally {
      db.close();
  }

  console.log('🏁 Proceso Taxonomy Seeder finalizado.');
}

seedTags();
