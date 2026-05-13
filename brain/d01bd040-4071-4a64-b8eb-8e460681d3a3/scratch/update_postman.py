import json

def add_body_to_item(item):
    if "request" in item:
        request = item["request"]
        if "body" not in request:
            # Add an empty body for GET/DELETE or others missing it
            request["body"] = {
                "mode": "raw",
                "raw": "{\n    \n}",
                "options": {
                    "raw": {
                        "language": "json"
                    }
                }
            }
        elif request["body"].get("mode") != "raw":
             # Ensure it's raw JSON if it exists but in different mode (unlikely here)
             pass
    
    if "item" in item:
        for sub_item in item["item"]:
            add_body_to_item(sub_item)

with open('postman.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for item in data["item"]:
    add_body_to_item(item)

with open('postman.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4)
