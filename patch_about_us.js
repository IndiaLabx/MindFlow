import fs from 'fs';

const file = 'src/features/about/components/AboutUs.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix the card structure to ensure title is shown outside the icon div.
// Currently the title is placed inside the card correctly but let's check the HTML hierarchy
content = content.replace(
/<\/motion\.div>\s*<div className="flex flex-col items-center justify-end w-full text-center pb-2">/g,
`</motion.div>
                            </div>
                            <div className="flex flex-col items-center justify-end w-full text-center pb-2">`
);

content = content.replace(
/<\/p>\s*<\/div>\s*<\/div>\s*<\/motion\.div>/g,
`</p>
                            </div>
                        </div>
                    </motion.div>`
);

fs.writeFileSync(file, content);
