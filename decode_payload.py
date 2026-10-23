import base64
import io

with open('payload.b64', 'r', encoding='ascii') as f:
    payload = f.read().strip()

decoded = base64.b64decode(payload).decode('utf-8')

with io.open('index.html', 'w', encoding='utf-8') as f:
    f.write(decoded)

print('Done:', len(decoded), 'chars')
