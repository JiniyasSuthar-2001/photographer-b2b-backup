from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "your-secret-key-for-jwt"
ALGORITHM = "HS256"

def create_token(username):
    to_encode = {"sub": username, "exp": datetime.utcnow() + timedelta(minutes=60)}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except Exception as e:
        return str(e)

token = create_token("admin")
print(f"Token: {token}")
print(f"Verified: {verify_token(token)}")
