import os

# Define the folder and file structure
structure = {
    "backend": {
        "src": {
            "config": ["database.js"],
            "models": ["User.js", "Recipe.js"],
            "routes": ["auth.js", "recipes.js"],
            "middleware": ["auth.js"],
            ".": ["app.js"]  # Files directly under src
        },
        ".": [".env", "server.js"]  # Files directly under backend
    }
}

def create_structure(base_path, struct):
    for name, content in struct.items():
        current_path = os.path.join(base_path, name)
        if isinstance(content, dict):
            os.makedirs(current_path, exist_ok=True)
            create_structure(current_path, content)
        elif isinstance(content, list):
            os.makedirs(base_path, exist_ok=True)
            for file in content:
                file_path = os.path.join(base_path, file)
                open(file_path, 'a').close()

if __name__ == "__main__":
    create_structure('.', structure)
    print("Backend folder structure created successfully.")
