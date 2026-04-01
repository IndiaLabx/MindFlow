import fs from 'fs';
const file = 'src/features/about/components/AboutSVGs.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
/const iconVariants: Variants = \{[\s\S]*? transition: .*?repeatType: "reverse".*?\}\s*\n  \}\n\};/m,
`const iconVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: [0, 1, 0],
    opacity: 1,
    transition: { duration: 3, ease: "easeInOut", repeat: Infinity }
  }
};`
);

fs.writeFileSync(file, content);
