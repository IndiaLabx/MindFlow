const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://sjcfagpjstbfxuiwhlps.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqY2ZhZ3Bqc3RiZnh1aXdobHBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NDQ5OTUsImV4cCI6MjA3NjUyMDk5NX0.8p6tIdBum2uhi0mRYENtF81WryaVlZFCwukwAAwJwJA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking synonymPlugin table ('Synonyms')");
    const { data: d1, error: e1 } = await supabase.from('Synonyms').select('*').limit(1);
    console.log("Plugin Table:", { count: d1 ? d1.length : 0, error: e1 });

    console.log("Checking synonymService table ('synonym')");
    const { data: d2, error: e2 } = await supabase.from('synonym').select('*').limit(1);
    console.log("Service Table:", { count: d2 ? d2.length : 0, error: e2 });
}

check();
