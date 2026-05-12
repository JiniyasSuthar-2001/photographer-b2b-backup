import json
import os
from fastapi.openapi.utils import get_openapi

def generate_postman_collection(app, output_path: str = "../postman.json"):
    """
    Generates a Postman Collection (v2.1.0) from a FastAPI application's OpenAPI schema.
    """
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        openapi_version=app.openapi_version,
        description=app.description,
        routes=app.routes,
    )
    
    # Postman Collection Base Structure
    postman_collection = {
        "info": {
            "name": openapi_schema.get("info", {}).get("title", "Lumière API"),
            "description": openapi_schema.get("info", {}).get("description", ""),
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "item": [],
        "variable": [
            {
                "key": "baseUrl",
                "value": "http://192.168.1.13:8000",
                "type": "string"
            },
            {
                "key": "token",
                "value": "",
                "type": "string"
            }
        ]    }

    components = openapi_schema.get("components", {}).get("schemas", {})

    def resolve_schema(schema):
        if "$ref" in schema:
            ref_name = schema["$ref"].split("/")[-1]
            return components.get(ref_name, {})
        if "anyOf" in schema:
            for s in schema["anyOf"]:
                if s.get("type") != "null":
                    return resolve_schema(s)
        return schema

    # Specific overrides for known schema names
    SCHEMA_OVERRIDES = {
        "UserSignUp": {
            "username": "photographer_test",
            "password": "SecurePass@123",
            "phone": "+919876543210",
            "full_name": "Arjun Mehta",
            "city": "Ahmedabad",
            "category": "Wedding",
            "user_type": "photographer",
            "referral_code_applied": ""
        },
        "UserLogin": {
            "username": "admin",
            "password": "admin@001"
        },
        "PaymentCreate": {
            "amount": 1499,
            "currency": "INR",
            "plan_name": "Pro"
        },
        "ReferralApply": {
            "referral_code": "ABCD1234"
        },
        "ForgotPassword": {
            "username": "photographer_test"
        },
        "TeamRequestCreate": {
            "phone": "+919876543211",
            "display_name": "Rohan Shah",
            "display_category": "Candid",
            "display_city": "Surat"
        },
        "TeamMemberUpdate": {
            "display_name": "Rohan Shah Updated",
            "display_category": "Wedding",
            "display_city": "Ahmedabad"
        },
        "NotificationUpdate": {
            "is_read": True
        }
    }

    def get_example_for_schema(schema_ref):
        if not schema_ref: return "{}"
        schema_name = schema_ref.split("/")[-1]

        # Use hardcoded override if available
        if schema_name in SCHEMA_OVERRIDES:
            return json.dumps(SCHEMA_OVERRIDES[schema_name], indent=4)

        schema = components.get(schema_name, {})
        example = {}
        properties = schema.get("properties", {})
        for prop, details in properties.items():
            resolved = resolve_schema(details)
            p_type = resolved.get("type")

            if p_type == "string":
                example[prop] = f"test_{prop}"
                if "date" in prop or "time" in prop:
                    example[prop] = "2026-12-25T10:00:00"
                elif "phone" in prop:
                    example[prop] = "+919999988888"
                elif "password" in prop:
                    example[prop] = "Password123!"
                elif "username" in prop:
                    example[prop] = "test_user_1"
                elif "referral_code" in prop:
                    example[prop] = "ABCD1234"
                elif "plan" in prop:
                    example[prop] = "Pro"
                elif "currency" in prop:
                    example[prop] = "INR"
            elif p_type == "integer":
                example[prop] = 1499 if "amount" in prop else 1
            elif p_type == "number":
                example[prop] = 1.0
            elif p_type == "boolean":
                example[prop] = False
            elif p_type == "array":
                example[prop] = ["Wedding", "Candid"]
            else:
                example[prop] = ""

        return json.dumps(example, indent=4)

    paths = openapi_schema.get("paths", {})
    
    for path, methods in paths.items():
        for method, details in methods.items():
            if method.lower() not in ["get", "post", "put", "delete", "patch"]:
                continue

            # Build request entry
            request = {
                "name": details.get("summary") or details.get("operationId") or f"{method.upper()} {path}",
                "request": {
                    "method": method.upper(),
                    "header": [
                        {
                            "key": "Authorization",
                            "value": "Bearer {{token}}",
                            "type": "text"
                        }
                    ],
                    "url": {
                        "raw": "{{baseUrl}}" + path,
                        "host": [
                            "{{baseUrl}}"
                        ],
                        "path": [p for p in path.split("/") if p]
                    }
                },
                "response": []
            }

            # INJECT AUTOMATION SCRIPT FOR LOGIN
            if "login" in path.lower() and method.lower() == "post":
                request["event"] = [
                    {
                        "listen": "test",
                        "script": {
                            "exec": [
                                "const response = pm.response.json();",
                                "",
                                "if (response.access_token) {",
                                "    pm.collectionVariables.set(\"token\", response.access_token);",
                                "",
                                "    if (response.refresh_token) {",
                                "        pm.collectionVariables.set(\"refresh_token\", response.refresh_token);",
                                "    }",
                                "",
                                "    console.log(\"Tokens saved successfully!\");",
                                "} else {",
                                "    console.log(\"No access token found in response\");",
                                "}"
                            ],
                            "type": "text/javascript"
                        }
                    }
                ]

            # Extract body from RequestBody
            if "requestBody" in details:
                content = details["requestBody"].get("content", {})
                json_content = content.get("application/json", {})
                schema_info = json_content.get("schema", {})
                schema_ref = schema_info.get("$ref")
                
                request["request"]["body"] = {
                    "mode": "raw",
                    "raw": get_example_for_schema(schema_ref),
                    "options": {
                        "raw": {
                            "language": "json"
                        }
                    }
                }
            elif method.lower() in ["post", "put", "patch"]:
                request["request"]["body"] = {
                    "mode": "raw",
                    "raw": "{\n    \n}",
                    "options": {
                        "raw": {
                            "language": "json"
                        }
                    }
                }

            desc = details.get("description", "")
            if desc:
                request["request"]["description"] = desc

            tags = details.get("tags", [])
            if tags:
                tag_name = tags[0]
                folder = next((item for item in postman_collection["item"] if item.get("name") == tag_name), None)
                if not folder:
                    folder = {"name": tag_name, "item": []}
                    postman_collection["item"].append(folder)
                folder["item"].append(request)
            else:
                postman_collection["item"].append(request)

    try:
        with open(output_path, "w") as f:
            json.dump(postman_collection, f, indent=4)
    except Exception as e:
        print(f"Error generating Postman collection: {e}")
