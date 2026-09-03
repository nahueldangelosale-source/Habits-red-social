import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

const args = process.argv.slice(2);
const isFix = args.includes('--fix');
// Targets can be passed as args, fallback to default specified in Hito 2
const targets = args.filter(a => !a.startsWith('-'));
if (targets.length === 0) {
    targets.push('src/widgets/**/*.tsx', 'src/shared/ui/**/*.tsx', 'src/pages/**/*.tsx'); // Added pages to catch PersonalTrainerDashboard
}

console.log(`\n🛡️ [TOKEN-AUDITOR] Iniciando Motor de Gobernanza Agéntico (Nivel L6)`);
console.log(`📡 Modo de Auto-Sanación (--fix): ${isFix ? 'ACTIVADO' : 'DESACTIVADO'}`);

// Reglas de nivel 1: Detección de valores quemados (hardcoded) y Strings mágicos
const level1Rules = [
    {
        name: 'Hex Colors',
        regex: /text-\[#[0-9a-fA-F]{3,8}\]|bg-\[#[0-9a-fA-F]{3,8}\]|border-\[#[0-9a-fA-F]{3,8}\]/g,
        message: 'Violación DTCG: Se detectó un color HEX hardcodeado.'
    },
    {
        name: 'RGBA Colors',
        regex: /(?:bg|text|border|shadow)-\[rgba?\([^\]]+\)\]/g,
        message: 'Violación DTCG: Se detectó un color RGBA hardcodeado.'
    },
    {
        name: 'Hardcoded Pixels',
        regex: /(?:gap|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|w|h|text|rounded)-\[\d+px\]/g,
        message: 'Violación Espacial: Se detectó un valor en píxeles (px) hardcodeado (Magic String).'
    }
];

// Reglas de nivel 2: Jerarquía Semántica
const level2Rules = [
    {
        name: 'Semantic Mismatch (Headers)',
        regex: /<h[12][^>]*className="[^"]*\btext-(?:text-muted|zinc-500)\b[^"]*"[^>]*>/g,
        message: 'Violación Semántica: Los encabezados primarios (H1, H2) no deben utilizar tokens de bajo contraste (text-muted).'
    }
];

// Mapeo para Auto-Sanación (--fix)
const pixelReplacementMap: Record<string, string> = {
    '[24px]': '[var(--spacing-bento-gap)]',
    '[16px]': '[var(--spacing-md)]',
    '[12px]': '[var(--spacing-sm)]',
    '[8px]': '[var(--spacing-xs)]',
    '[11px]': 'xs',
    '[10px]': 'xs',
    '[9px]': 'xs',
    '[20px]': '[var(--radius-xl)]',
    '[180px]': '45',
    '[200px]': '50',
    '[260px]': '65',
    '[220px]': '56',
    '[280px]': '72',
    '[320px]': '80',
    '[400px]': '96',
    '[#CEFF00]': 'action-primary', // depending on context might need prefix but basic fallback
    '[#000]': 'background-base',
    '[#FFF]': 'text-primary'
};

let totalViolations = 0;
let fixedViolations = 0;

targets.forEach((targetPattern) => {
    const files = globSync(targetPattern, { cwd: process.cwd() });
    
    files.forEach((file) => {
        const filePath = path.join(process.cwd(), file);
        let content = fs.readFileSync(filePath, 'utf-8');
        let originalContent = content;
        let fileViolations = 0;

        // Auditar Nivel 1 & 2
        [...level1Rules, ...level2Rules].forEach(rule => {
            let match;
            while ((match = rule.regex.exec(originalContent)) !== null) {
                fileViolations++;
                totalViolations++;
                console.warn(`[!] Violación en ${file}: ${rule.name}`);
                console.warn(`    ↳ Encontrado: ${match[0]}`);
                console.warn(`    ↳ ${rule.message}\n`);
            }
        });

        // Auto-Sanación
        if (isFix && fileViolations > 0) {
            let fixedContent = originalContent;
            
            // Reemplazar Píxeles por Tokens
            Object.entries(pixelReplacementMap).forEach(([hardcoded, token]) => {
                // Regex para buscar -[24px] y reemplazar por -[var(--spacing-bento-gap)]
                const replacer = new RegExp(hardcoded.replace(/\[/g, '\\[').replace(/\]/g, '\\]'), 'g');
                
                const matches = fixedContent.match(replacer);
                if (matches) {
                    fixedContent = fixedContent.replace(replacer, token);
                    fixedViolations += matches.length;
                }
            });

            // Reemplazo especial para Hex sueltos en clases tailwind (ej text-[#CEFF00] -> text-action-primary)
            fixedContent = fixedContent.replace(/text-\[#CEFF00\]/g, 'text-action-primary')
                                       .replace(/bg-\[#CEFF00\]/g, 'bg-action-primary')
                                       .replace(/border-\[#CEFF00\]/g, 'border-action-primary');

            if (originalContent !== fixedContent) {
                 fs.writeFileSync(filePath, fixedContent, 'utf-8');
                 console.log(`[+] Auto-sanación aplicada a: ${file}`);
            }
        }
    });
});

console.log(`\n======================================`);
console.log(`📊 REPORTE DEL AUDITOR AGÉNTICO`);
console.log(`======================================`);
console.log(`- Archivos procesados: ${targets.length} rutas (glob)`);
console.log(`- Total de violaciones encontradas: ${totalViolations}`);
if (isFix) {
    console.log(`- Violaciones corregidas automáticamente: ${fixedViolations}`);
}
console.log(`======================================\n`);

if (totalViolations > 0 && !isFix) {
    console.error('❌ DESIGN DRIFT DETECTADO. El commit ha sido bloqueado hasta resolver las violaciones de UI.');
    process.exit(1);
} else if (totalViolations > 0 && isFix && totalViolations > fixedViolations) {
    console.error('⚠️ ALGUNAS VIOLACIONES NO PUDIERON SER AUTO-SANADAS. Requiere intervención manual.');
    process.exit(1);
} else {
    console.log('✅ GOBERNANZA DE DISEÑO VERIFICADA. CÓDIGO DE INTEGRIDAD: 100%.');
    process.exit(0);
}
