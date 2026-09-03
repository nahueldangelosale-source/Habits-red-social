const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.match(/\.(ts|tsx)$/)) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('d:/Musica Descargada/Bienestar APP/web/src');
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let newContent = content
        .replace(/from '(\.\.\/)+store\//g, match => match.replace('store/', 'stores/'))
        .replace(/from '\.\/store\//g, "from './stores/");
    
    if (content !== newContent) {
        fs.writeFileSync(file, newContent, 'utf8');
        changedCount++;
        console.log('Updated:', file);
    }
});

console.log('Total files updated:', changedCount);
