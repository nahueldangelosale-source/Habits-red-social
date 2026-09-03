import io
import re

def fix_file():
    filepath = 'D:/Musica Descargada/Bienestar APP/web/src/components/athlete/ProfileView.tsx'
    with io.open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Import useAuth
    if 'useAuth' not in content:
        content = content.replace("import { useThemeStore } from '../../stores/useThemeStore';", "import { useThemeStore } from '../../stores/useThemeStore';\nimport { useAuth } from '../../context/AuthContext';")
    
    # Add useAuth hook
    if 'const { user } = useAuth();' not in content:
        content = content.replace("const [isCalendarOpen, setIsCalendarOpen] = useState(false);", "const [isCalendarOpen, setIsCalendarOpen] = useState(false);\n    const { user } = useAuth();\n    \n    const fallbackName = 'Atleta';\n    const displayName = user?.full_name || fallbackName;\n    const initials = displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();")

    # Replace hardcoded name
    content = content.replace('<span className="text-4xl font-black text-white">NH</span>', '<span className="text-4xl font-black text-white">{initials}</span>')
    content = content.replace('<h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-5 mb-1">Nahuel H.</h2>', '<h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-5 mb-1">{displayName}</h2>')

    # Add TODO_B2C comments to gamification
    content = content.replace('<!-- Botón de Racha -->', '{/* TODO_B2C: Conectar racha real */}<!-- Botón de Racha -->')
    content = content.replace('<!-- Botón de Logros (Gaming) -->', '{/* TODO_B2C: Conectar vitrina real */}<!-- Botón de Logros (Gaming) -->')

    with io.open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file()
