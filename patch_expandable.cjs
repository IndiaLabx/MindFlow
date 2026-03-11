const fs = require('fs');
const file = 'src/features/synonyms/components/SynonymPhase1Session.tsx';
let content = fs.readFileSync(file, 'utf8');

const search = `// Helper component for Synonym/Antonym list items
const ExpandableListItem: React.FC<{item: any, isHindi?: boolean, accentColor: string}> = ({item, isHindi, accentColor}) => {
    const [expanded, setExpanded] = React.useState(false);`;

const replace = `// Helper component for Synonym/Antonym list items
const ExpandableListItem: React.FC<{item: any, isHindi?: boolean, accentColor: string, forceExpanded?: boolean}> = ({item, isHindi, accentColor, forceExpanded}) => {
    const [expanded, setExpanded] = React.useState(false);

    React.useEffect(() => {
        if (forceExpanded !== undefined) {
            setExpanded(forceExpanded);
        }
    }, [forceExpanded]);`;

content = content.replace(search, replace);
fs.writeFileSync(file, content);
