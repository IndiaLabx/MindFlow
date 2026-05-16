import re

with open('src/features/quiz/hooks/useQuiz.ts', 'r') as f:
    content = f.read()

replacement = """              const payload = {
                  id: state.quizId,
                  user_id: userId,
                  // PostgREST merge-duplicates requires updating the whole row schema, but we only really want to update 'state'
                  // We should ideally use PATCH instead of POST for partial updates, or include all NOT NULL fields for POST.
                  // Since we are just updating the 'state' column of an existing row, let's switch to PATCH.
                  state: stateWithoutQuestions
              };

              const headers = new Headers();
              headers.append("apikey", SUPABASE_ANON_KEY);
              headers.append("Authorization", `Bearer ${token}`);
              headers.append("Content-Type", "application/json");

              if (isKeepAlive) {
                  fetch(`${SUPABASE_URL}/rest/v1/saved_quizzes?id=eq.${state.quizId}`, {
                      method: 'PATCH',
                      headers: headers,
                      body: JSON.stringify({ state: stateWithoutQuestions }),
                      keepalive: true
                  }).catch(() => {});
              } else {
                  // Direct async fetch without keepalive for standard debounced calls
                  await fetch(`${SUPABASE_URL}/rest/v1/saved_quizzes?id=eq.${state.quizId}`, {
                      method: 'PATCH',
                      headers: headers,
                      body: JSON.stringify({ state: stateWithoutQuestions })
                  });
              }"""

# Find the block and replace it
content = re.sub(r'              const payload = \{\n                  id: state\.quizId,\n                  user_id: userId,\n                  state: stateWithoutQuestions\n              \};\n\n              const headers = new Headers\(\);\n              headers\.append\("apikey", SUPABASE_ANON_KEY\);\n              headers\.append\("Authorization", `Bearer \$\{token\}`\);\n              headers\.append\("Content-Type", "application/json"\);\n              headers\.append\("Prefer", "resolution=merge-duplicates"\);\n\n              if \(isKeepAlive\) \{\n                  fetch\(`\$\{SUPABASE_URL\}/rest/v1/saved_quizzes`, \{\n                      method: \'POST\',\n                      headers: headers,\n                      body: JSON\.stringify\(payload\),\n                      keepalive: true\n                  \}\)\.catch\(\(\) => \{\}\);\n              \} else \{\n                  // Direct async fetch without keepalive for standard debounced calls\n                  await fetch\(`\$\{SUPABASE_URL\}/rest/v1/saved_quizzes`, \{\n                      method: \'POST\',\n                      headers: headers,\n                      body: JSON\.stringify\(payload\)\n                  \}\);\n              \}', replacement, content, flags=re.DOTALL)


with open('src/features/quiz/hooks/useQuiz.ts', 'w') as f:
    f.write(content)
