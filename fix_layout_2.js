const fs = require('fs');

function updateFile(path) {
    let content = fs.readFileSync(path, 'utf8');

    // Replace aspect ratio classes
    content = content.replace(/aspect-\[4\/3\] sm:aspect-square min-h-\[160px\]/g, 'aspect-square min-h-[160px] sm:min-h-[180px]');

    // Also, we can just use `aspect-[4/3] sm:aspect-square` and make sure it has enough padding
    // But maybe let's use `aspect-square min-h-[160px]` and remove `overflow-hidden` so text doesn't clip? No, overflow-hidden is needed for the background glow.
    // Instead of aspect ratio, maybe use a fixed height or aspect-auto for mobile.
    content = content.replace(/aspect-square min-h-\[160px\] sm:min-h-\[180px\]/g, 'aspect-auto sm:aspect-square min-h-[180px]');
    content = content.replace(/aspect-\[4\/3\] sm:aspect-square min-h-\[160px\]/g, 'aspect-auto sm:aspect-square min-h-[180px]');

    // Let's also adjust the flex layout to make sure text is not pushed down too far
    // from "h-full w-full p-4 sm:p-6 flex flex-col items-center justify-center gap-2 sm:gap-4 relative z-10"
    content = content.replace(/h-full w-full p-4 sm:p-6 flex flex-col items-center justify-center gap-2 sm:gap-4 relative z-10/g, 'h-full w-full p-4 sm:p-6 flex flex-col items-center justify-center gap-1 sm:gap-3 relative z-10');

    // Make svg smaller to fit text
    content = content.replace(/w-12 h-12/g, 'w-10 h-10');
    content = content.replace(/w-14 h-14/g, 'w-12 h-12');

    // Ensure the text sizing is smaller for the subtext
    content = content.replace(/text-xs sm:text-sm text-slate-500/g, 'text-[10px] sm:text-xs text-slate-500');

    fs.writeFileSync(path, content, 'utf8');
}

updateFile('src/features/about/components/AboutUs.tsx');
updateFile('src/features/about/components/DeveloperProfile.tsx');

console.log('Fixed layouts.');
