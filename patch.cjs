const fs = require('fs');

const file = 'src/features/ai/chat/ChatMessage.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/    const timestamp = message.created_at \? formatTime\(message.created_at\) : '';/, `    const timestamp = message.created_at ? formatTime(message.created_at) : '';`); // Ensure timestamp formatting works

fs.writeFileSync(file, content);
