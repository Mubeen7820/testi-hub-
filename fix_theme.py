
import os
import re

directories_to_scan = [
    r"c:\Users\aluga\Downloads\testimonial-automation-tool-mxu\testimonial-automation-tool-mxu\src\pages",
    r"c:\Users\aluga\Downloads\testimonial-automation-tool-mxu\testimonial-automation-tool-mxu\src\components"
]

replacements = {
    r'\bbg-white\b': 'bg-card',
    r'\btext-slate-900\b': 'text-foreground',
    r'\btext-slate-800\b': 'text-foreground',
    r'\btext-slate-500\b': 'text-muted-foreground',
    r'\bbg-slate-50/50\b': 'bg-muted/50',
    r'\bbg-slate-50\b': 'bg-accent',
    r'\bbg-gray-50\b': 'bg-background',
    r'\bborder-slate-200\b': 'border-border',
    r'\bborder-slate-100\b': 'border-border',
    r'\bborder-slate-300\b': 'border-border',
    r'\btext-slate-600\b': 'text-muted-foreground',
    r'\btext-slate-700\b': 'text-foreground',
}

files_modified = 0

for directory in directories_to_scan:
    for root, _, files in os.walk(directory):
        for file in files:
            if not file.endswith('.tsx'):
                continue
            filepath = os.path.join(root, file)
            # Skip TestimonialTemplates as it renders visual mocks
            if "TestimonialTemplates" in file or "TemplatePicker" in file:
                continue

            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            new_content = content
            for old, new in replacements.items():
                new_content = re.sub(old, new, new_content)

            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {file}")
                files_modified += 1

print(f"\nTotal files updated: {files_modified}")
