import io
import re

def fix_file():
    filepath = 'D:/Musica Descargada/Bienestar APP/web/src/components/MetabolicRadar.tsx'
    with io.open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    replacement = '''    if (loading) {
        return (
            <div style={{
                padding: 'var(--space-xl)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 300
            }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                    <Target size={32} color={accentColor} style={{ opacity: 0.5 }} />
                </motion.div>
            </div>
        );
    }

    if (!radarData) {
        return (
            <div style={{
                padding: 'var(--space-xl)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 300,
                textAlign: 'center'
            }}>
                <Target size={48} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: 16 }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>Radar Inactivo</h3>
                <p style={{ color: 'var(--text-muted)' }}>Sin datos suficientes para generar el perfil metabólico.</p>
            </div>
        );
    }'''

    # We need to replace the old if (loading || !radarData) block
    new_content = re.sub(
        r'if\s*\(\s*loading\s*\|\|\s*!radarData\s*\)\s*\{.*?\n\s*\}',
        replacement,
        content,
        flags=re.DOTALL
    )

    with io.open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Radar empty state fixed.")

fix_file()
