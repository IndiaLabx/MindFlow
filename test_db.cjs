const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const envUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)[1];
const envKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];

const supabase = createClient(envUrl, envKey);

async function check() {
    console.log("Checking synonymPlugin table ('Synonyms')");
    const { data: d1, error: e1 } = await supabase.from('Synonyms').select('*').limit(1);
    console.log("Plugin Table:", { count: d1 ? d1.length : 0, error: e1 });

    console.log("Checking synonymService table ('synonym')");
    const { data: d2, error: e2 } = await supabase.from('synonym').select('*').limit(1);
    console.log("Service Table:", { count: d2 ? d2.length : 0, error: e2 });
}

check();
