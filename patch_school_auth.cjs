const fs = require('fs');

const path = 'src/features/school/components/SchoolAuth.tsx';
let data = fs.readFileSync(path, 'utf8');

data = data.replace(
  "if (isSignUp) {\n        localStorage.setItem('mindflow_is_signup', 'true');\n      }",
  "if (isSignUp) {\n        localStorage.setItem('mindflow_is_signup', 'true');\n      }\n      // Force redirect back to school module after OAuth\n      localStorage.setItem('mindflow_auth_redirect', '/school/dashboard');\n      localStorage.setItem('mindflow_target_audience_intent', 'school');"
);

fs.writeFileSync(path, data);
console.log('done');
