import os
import glob
import re

md_files = []
md_files.extend(glob.glob('postman_scenarios/**/*.md', recursive=True))
md_files.extend(glob.glob('postman_team_requests/**/*.md', recursive=True))
md_files.extend(glob.glob('postman test/**/*.md', recursive=True))
md_files.extend(glob.glob('postman_raw_requests.md'))

replacements = [
    (r'(GET /api/dashboard/summary)(?!\?)', r'\1?role=studio_owner'),
    (r'(GET /api/analytics/stats)(?!\?)', r'\1?role=studio_owner&timeframe=1M'),
    (r'(GET /api/analytics/trends)(?!\?)', r'\1?role=studio_owner&timeframe=1M'),
    (r'(GET /api/analytics/categories)(?!\?)', r'\1?role=studio_owner&timeframe=1M'),
    (r'(GET /api/team/)(?!\?)(?!requests|users|joined|collaborations|discover)', r'\1?page=1&limit=10'),
    (r'(GET /api/notifications/)(?!\?)', r'\1?page=1&limit=20'),
    (r'(GET /api/requests/)(?!\?)(?!job|eligible-jobs|accepted-jobs)', r'\1?role=receiver&status=pending'),
]

for md_file in md_files:
    try:
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = content
        for pattern, replacement in replacements:
            new_content = re.sub(pattern, replacement, new_content)
            
        if new_content != content:
            with open(md_file, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated GET requests in {md_file}")
    except Exception as e:
        print(f"Error processing {md_file}: {e}")
