const fs = require('fs');
const path = require('path');

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('lib/apiClient') || content.includes('apiClient.')) {
                // Replace import
                let newContent = content.replace(/import\s+(?:\{)?\s*apiClient\s*(?:\})?\s+from\s+['"].*?lib\/apiClient['"]/g, "import { api } from '../../api/client'");
                // Also some might use a different relative path length, just replace generically:
                newContent = newContent.replace(/import\s+apiClient\s+from\s+['"][^'"]+lib\/apiClient['"]/g, "import { api } from '../../api/client'");
                // Replace usage
                newContent = newContent.replace(/apiClient\./g, 'api.');
                
                if (content !== newContent) {
                    fs.writeFileSync(fullPath, newContent);
                    console.log('Fixed: ' + fullPath);
                }
            }
        }
    });
}

walk('src');
console.log('Done');
