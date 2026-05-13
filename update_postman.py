import json
import os

POSTMAN_FILE = 'postman.json'

with open(POSTMAN_FILE, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Define query params for specific paths (substring match)
query_params_map = {
    'api/team/users/search': [{'key': 'phone', 'value': '{{phone}}', 'description': 'Phone number'}],
    'api/team': [{'key': 'page', 'value': '1'}, {'key': 'limit', 'value': '10'}, {'key': 'category', 'value': '', 'disabled': True}, {'key': 'city', 'value': '', 'disabled': True}],
    'api/notifications': [{'key': 'page', 'value': '1'}, {'key': 'limit', 'value': '20'}],
    'api/requests': [{'key': 'role', 'value': 'receiver', 'description': 'sender or receiver'}, {'key': 'status', 'value': 'pending', 'disabled': True}],
    'api/dashboard/summary': [{'key': 'role', 'value': 'studio_owner', 'description': 'studio_owner or photographer'}],
    'api/analytics/stats': [{'key': 'role', 'value': 'studio_owner'}, {'key': 'timeframe', 'value': '1M'}],
    'api/analytics/trends': [{'key': 'role', 'value': 'studio_owner'}, {'key': 'timeframe', 'value': '1M'}],
    'api/analytics/categories': [{'key': 'role', 'value': 'studio_owner'}, {'key': 'timeframe', 'value': '1M'}],
    'api/analytics/rankings': [{'key': 'role', 'value': 'studio_owner'}],
}

# Define mock bodies for POST/PUT/PATCH
mock_bodies = {
    'api/auth/signup': {
        "username": "new_user",
        "email": "new@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "phone": "+919876543210",
        "full_name": "Test User",
        "city": "Mumbai",
        "category": "Wedding",
        "user_type": "photographer",
        "referral_code_applied": ""
    },
    'api/auth/login': {
        "username": "admin",
        "password": "admin@001"
    },
    'api/auth/forgot-password': {
        "username": "admin"
    },
    'api/auth/profile': {
        "full_name": "Updated Name",
        "city": "Pune",
        "category": "Pre-Wedding"
    },
    'api/team/request': {
        "phone": "+919876543211",
        "display_name": "Rohan Shah",
        "display_category": "Candid",
        "display_city": "Surat"
    },
    'api/team/request/{id}': {
        "status": "accepted"
    },
    'api/team/{member_id}': {
        "display_name": "Updated Alias",
        "display_category": "Wedding",
        "display_city": "Ahmedabad"
    },
    'api/requests': {
        "job_id": 1,
        "receiver_id": 2,
        "role": "Candid Photographer",
        "budget": 5000
    },
    'api/requests/{id}': {
        "status": "accepted"
    },
    'api/projects': {
        "title": "Grand Indian Wedding",
        "client": "Sharma Family",
        "venue": "Taj Hotel, Mumbai",
        "budget": 100000,
        "category": "Wedding",
        "date": "2026-12-01T10:00:00",
        "roles": ["Candid Photographer", "Cinematographer"]
    },
    'api/projects/{job_id}': {
        "status": "completed",
        "budget": 120000
    },
    'api/tasks': {
        "title": "Edit wedding highlights",
        "job_id": 1
    },
    'api/tasks/{task_id}': {
        "is_completed": True
    },
    'api/notes': {
        "content": "Meeting with client at 5 PM",
        "job_id": 1
    },
    'api/notes/{note_id}': {
        "content": "Meeting rescheduled to 6 PM"
    },
    'api/subscription/purchase': {
        "plan": "Pro",
        "duration_months": 12
    },
    'api/referral/apply': {
        "referral_code": "REF12345"
    }
}

def update_request(req):
    path_list = req.get('url', {}).get('path', [])
    if not path_list: return
    
    full_path = '/'.join(path_list)
    
    # 1. Update GET query params
    if req['method'] == 'GET':
        best_match = None
        for path_key in query_params_map:
            if path_key in full_path:
                if best_match is None or len(path_key) > len(best_match):
                    best_match = path_key
        
        if best_match:
            params = query_params_map[best_match]
            req['url']['query'] = params
            # Update raw URL string to include query
            query_str = '&'.join([f"{p['key']}={p['value']}" for p in params if not p.get('disabled', False) and p['value'] != ''])
            base_raw = req['url']['raw'].split('?')[0]
            if query_str:
                req['url']['raw'] = f"{base_raw}?{query_str}"
    
    # 2. Update POST/PUT/PATCH bodies
    if req['method'] in ['POST', 'PUT', 'PATCH']:
        if 'body' not in req:
            req['body'] = {"mode": "raw", "options": {"raw": {"language": "json"}}}
        
        best_match = None
        for path_key in mock_bodies:
            if path_key in full_path:
                 if best_match is None or len(path_key) > len(best_match):
                    best_match = path_key
        
        if best_match:
            req['body']['raw'] = json.dumps(mock_bodies[best_match], indent=4)
        else:
            # Default empty body for any POST/PUT/PATCH that didn't match
            if 'raw' not in req['body'] or req['body']['raw'].strip() in ["", "{}"]:
                req['body']['raw'] = "{}"


def traverse_items(items):
    for item in items:
        if 'item' in item:
            traverse_items(item['item'])
        elif 'request' in item:
            update_request(item['request'])

traverse_items(data['item'])

with open(POSTMAN_FILE, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4)

print("postman.json updated successfully.")
