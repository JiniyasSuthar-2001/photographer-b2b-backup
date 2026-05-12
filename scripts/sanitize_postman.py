import json
from pathlib import Path

p = Path(r"C:\Users\Jiniyas Suthar\OneDrive\Desktop\New folder\postman.json")
if not p.exists():
    print('postman.json not found')
    raise SystemExit(1)

data = json.loads(p.read_text(encoding='utf-8'))
changed = 0

def sanitize_item(item):
    global changed
    if isinstance(item, dict) and 'request' in item:
        req = item['request']
        url = req.get('url')
        if isinstance(url, dict):
            raw = url.get('raw')
            if raw:
                req['url'] = {'raw': raw}
                changed += 1
    if isinstance(item, dict) and 'item' in item:
        for sub in item['item']:
            sanitize_item(sub)

for it in data.get('item', []):
    sanitize_item(it)

p.write_text(json.dumps(data, indent=4), encoding='utf-8')
print(f'sanitized postman.json, updated {changed} request urls')
