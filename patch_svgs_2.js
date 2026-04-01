import fs from 'fs';

const file = 'src/features/about/components/AboutSVGs.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace complex framer-motion variants with simpler ones to ensure visibility
content = content.replace(/const iconVariants: Variants = \{[\s\S]*?\n\};/m, `const iconVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 }
  }
};`);

content = content.replace(/const gVariants: Variants = \{[\s\S]*?\n\};/m, `const gVariants: Variants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3 }
  }
};`);

fs.writeFileSync(file, content);
