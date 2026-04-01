const fs = require('fs');

function updateFile(path) {
    let content = fs.readFileSync(path, 'utf8');

    // Change to a more standard aspect ratio for mobile cards that isn't perfectly square
    // so they fit the text.
    content = content.replace(/aspect-\[4\/3\] sm:aspect-square min-h-\[160px\]/g, 'aspect-square sm:aspect-square min-h-[160px]');

    // Decrease spacing
    content = content.replace(/gap-2 sm:gap-4/g, 'gap-1 sm:gap-3');

    // Make svg smaller
    content = content.replace(/w-12 h-12/g, 'w-10 h-10');
    content = content.replace(/w-14 h-14/g, 'w-12 h-12');

    // Make subtext smaller
    content = content.replace(/text-xs sm:text-sm text-slate-500/g, 'text-[10px] sm:text-xs text-slate-500');

    // Remove `sm:aspect-square min-h-[160px]` from Developer Profile if we want to change it.
    // For Developer profile we had:
    // `className="relative group aspect-[4/3] sm:aspect-square min-h-[160px] rounded-[32px] sm:rounded-[40px] p-[1px] overflow-hidden"`

    fs.writeFileSync(path, content, 'utf8');
}

updateFile('src/features/about/components/AboutUs.tsx');
updateFile('src/features/about/components/DeveloperProfile.tsx');

console.log('Fixed layouts.');
