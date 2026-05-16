import re

with open('package.json', 'r') as f:
    content = f.read()

content = re.sub(r'"version": "1.0.88",', '"version": "1.0.89",', content)

with open('package.json', 'w') as f:
    f.write(content)
