import fs from 'fs';

function fixLayout(filePath) {
    let code = fs.readFileSync(filePath, 'utf-8');

    // Make cards min-height instead of strict aspect-square so they don't clip text
    code = code.replace(/aspect-square/g, 'aspect-[4/3] sm:aspect-square min-h-[160px]');

    // Make SVGs smaller to leave room for text
    code = code.replace(/w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 mt-2/g, 'w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 flex-shrink-0 mb-2');

    // Change layout from space-between to center with gap
    code = code.replace(/justify-between/g, 'justify-center gap-2 sm:gap-4');

    // Fix the text container alignment
    code = code.replace(/justify-end w-full text-center pb-2/g, 'justify-center w-full text-center');

    // Fix any clipping text
    code = code.replace(/line-clamp-2/g, 'line-clamp-2 sm:line-clamp-none');

    fs.writeFileSync(filePath, code);
}

fixLayout('src/features/about/components/AboutUs.tsx');
fixLayout('src/features/about/components/DeveloperProfile.tsx');
