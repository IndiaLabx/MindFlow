import fs from 'fs';
const file = 'src/features/about/components/AboutUs.tsx';
let content = fs.readFileSync(file, 'utf8');

// The replacement was flawed, let's fix the structure.
// I'll rewrite the card components correctly.
content = content.replace(/<div className="flex flex-col items-center justify-end w-full text-center pb-2">/g,
`</div><div className="flex flex-col items-center justify-end w-full text-center pb-2">`);
fs.writeFileSync(file, content);
