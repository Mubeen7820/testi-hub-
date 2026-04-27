import os
import re

def fix_imports(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Replace @/lib/utils with relative path
                # For a file in src/components/ui, relative to src is ../../
                rel_depth = len(os.path.relpath(root, directory).split(os.sep))
                if os.path.relpath(root, directory) == '.':
                    rel_depth = 0
                
                prefix = '../' * rel_depth if rel_depth > 0 else './'
                
                def sub_func(match):
                    path = match.group(1)
                    # Calculate new relative path
                    # @/lib/utils -> prefix + lib/utils
                    new_path = prefix + path
                    # If prefix is ./ and path starts with a folder, it becomes ./folder
                    # If prefix is ../../ and path is lib/utils, it becomes ../../lib/utils
                    return f'"{new_path}"'

                new_content = re.sub(r'"@/([^"]+)"', sub_func, content)
                new_content = re.sub(r"'@/([^']+)'", lambda m: f"'{prefix + m.group(1)}'", new_content)

                if content != new_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Fixed: {filepath}")

if __name__ == "__main__":
    src_dir = os.path.abspath("src")
    fix_imports(src_dir)
