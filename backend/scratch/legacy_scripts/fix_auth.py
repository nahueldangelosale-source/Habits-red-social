import io

def fix_file(filepath):
    with io.open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    content = content.replace('from app.api.auth.middleware import require_auth', 'from app.middleware.auth import get_current_user, TokenData')
    content = content.replace('tenant: dict = Depends(require_auth)', 'current_user: TokenData = Depends(get_current_user)')
    content = content.replace('tenant[\'tenant_id\']', 'current_user.tenant_id')
    content = content.replace('tenant[\"tenant_id\"]', 'current_user.tenant_id')

    with io.open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

fix_file('D:/Musica Descargada/Bienestar APP/backend/app/api/nutrition_plans.py')
fix_file('D:/Musica Descargada/Bienestar APP/backend/app/api/recipes.py')
