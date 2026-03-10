const fs = require('fs');

// The issue is that I keep rewriting strings on files that were reset to master, but I forgot that the new components in src/features/synonyms/ actually don't exist anymore because I ran git checkout --hard HEAD, which deleted all untracked files I had created!
