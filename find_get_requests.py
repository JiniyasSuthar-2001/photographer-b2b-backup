import json
import os
import glob

with open('output.txt', 'w', encoding='utf-8') as out:
    # 1. Check postman.json for GET requests
    with open('postman.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    out.write("--- postman.json GET Requests ---\n")
    def find_get_requests(items, path=''):
        for item in items:
            if 'item' in item:
                find_get_requests(item['item'], path + item['name'] + ' > ')
            elif 'request' in item:
                req = item['request']
                if req['method'] == 'GET':
                    out.write(f"{path}{item['name']}: {req['url']['raw']}\n")

    find_get_requests(data['item'])

    out.write("\n--- Markdown GET Requests ---\n")
    md_files = glob.glob('**/*.md', recursive=True)
    # Exclude node_modules
    md_files = [f for f in md_files if 'node_modules' not in f]
    for md_file in md_files:
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if 'GET /' in line.upper() or 'GET http' in line.upper():
                    out.write(f"{md_file}:{i+1}: {line}\n")
