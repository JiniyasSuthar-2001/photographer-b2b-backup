import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app

print("Listing all registered routes:")
for route in app.routes:
    if hasattr(route, "path"):
        methods = getattr(route, "methods", [])
        print(f"{list(methods)} {route.path}")
