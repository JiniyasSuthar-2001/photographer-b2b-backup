from main import app
from utils.postman_generator import generate_postman_collection
import os

root_dir = os.path.dirname(os.path.abspath(__file__))
postman_path = os.path.join(os.path.dirname(root_dir), "postman.json")
generate_postman_collection(app, postman_path)
print(f"Postman collection generated at {postman_path}")
