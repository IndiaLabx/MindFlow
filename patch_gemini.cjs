const fs = require('fs');

function patchFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');

    // Add httpOptions to GoogleGenAI instantiation
    content = content.replace(
        'const ai = new GoogleGenAI({ apiKey });',
        "const ai = new GoogleGenAI({ apiKey, httpOptions: { baseUrl: 'https://generativelanguage.googleapis.com' } });"
    );

    fs.writeFileSync(filepath, content, 'utf8');
}

patchFile('src/features/ai/components/SamvadChat.tsx');
patchFile('src/features/quiz/live/useGenAILive.ts');
console.log('Patched API instantiation!');
