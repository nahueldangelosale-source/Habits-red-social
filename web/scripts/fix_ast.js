import fs from 'fs';
const file = 'src/widgets/workout-builder/WorkoutBuilderWidget.tsx';
const code = fs.readFileSync(file, 'utf-8');
const lines = code.split('\n');
const top = lines.slice(0, 329);
const bottom = lines.slice(524);
const newLines = [...top, ...bottom];
fs.writeFileSync(file, newLines.join('\n'));
console.log("File sliced successfully!");
