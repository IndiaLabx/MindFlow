import re

with open('src/routes/AppRoutes.tsx', 'r') as f:
    content = f.read()

# Find and remove the FlashcardMaker route from QuizLayout
pattern = r"\s*<Route path=\"/tools/flashcard-maker\" element={<FlashcardMaker />} />\n"
content = re.sub(pattern, "\n", content)

# Insert it back in the Immersive Session Routes section
insert_target = r"\{/\* Fallback Route \*/\}"
new_route = "                <Route path=\"/tools/flashcard-maker\" element={<FlashcardMaker />} />\n\n                "

content = content.replace("{/* Fallback Route */}", new_route + "{/* Fallback Route */}")

with open('src/routes/AppRoutes.tsx', 'w') as f:
    f.write(content)
