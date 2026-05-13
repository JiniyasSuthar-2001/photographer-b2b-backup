import os
import re
import json

def update_markdown_files(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".md"):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                # 1. Update Signup JSON blocks
                def signup_replacer(match):
                    try:
                        data = json.loads(match.group(1))
                        # Only update if it looks like a signup request (has username, password, email)
                        if all(k in data for k in ["username", "email", "password"]):
                            new_data = {
                                "username": data.get("username"),
                                "email": data.get("email"),
                                "phone": data.get("phone", ""),
                                "password": data.get("password"),
                                "confirm_password": data.get("confirm_password", data.get("password"))
                            }
                            return "```json\n" + json.dumps(new_data, indent=2) + "\n```"
                    except:
                        pass
                    return match.group(0)

                content = re.sub(r'```json\s*(\{.*?\})\s*```', signup_replacer, content, flags=re.DOTALL)

                # 2. Update Search endpoint
                content = content.replace("/api/team/users/search", "/api/team/search")

                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {filepath}")

if __name__ == "__main__":
    base_dir = r"c:\Users\Jiniyas Suthar\OneDrive\Desktop\New folder"
    folders = ["postman_team_requests", "postman_scenarios", "postman test"]
    for folder in folders:
        dir_path = os.path.join(base_dir, folder)
        if os.path.exists(dir_path):
            update_markdown_files(dir_path)
        else:
            print(f"Directory {dir_path} not found")
