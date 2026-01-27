#!/usr/bin/env python3
import os
import re

# Color mappings
color_replacements = {
    '#006A4E': '#D91976',  # Primary green -> Primary pink
    '#005a42': '#A8145A',  # Dark green -> Dark pink
    '#005239': '#A8145A',  # Dark green -> Dark pink  
    '#004d39': '#A8145A',  # Dark green -> Dark pink
    '#004835': '#A8145A',  # Dark green -> Dark pink
    '#008f69': '#E84A9C',  # Light green -> Light pink
    '#008866': '#E84A9C',  # Light green -> Light pink
}

# Tailwind class replacements
class_replacements = {
    'hover:bg-green-800': 'hover:bg-pink-800',
    'hover:bg-green-700': 'hover:bg-pink-700',
    'bg-green-50': 'bg-pink-50',
    'shadow-green-100': 'shadow-pink-100',
    'from-green-50': 'from-pink-50',
    'to-emerald-50': 'to-pink-50',
    'via-green-50': 'via-pink-50',
    'to-green-700': 'to-pink-700',
    'to-green-600': 'to-pink-600',
    'from-green-500': 'from-pink-500',
}

def replace_colors_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace hex colors
        for old_color, new_color in color_replacements.items():
            content = content.replace(old_color, new_color)
        
        # Replace Tailwind classes
        for old_class, new_class in class_replacements.items():
            content = content.replace(old_class, new_class)
        
        # Only write if content changed
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

# Find all .tsx files
tsx_files = []
for root, dirs, files in os.walk('/tmp/sandbox/src'):
    # Skip node_modules
    if 'node_modules' in root:
        continue
    for file in files:
        if file.endswith('.tsx'):
            tsx_files.append(os.path.join(root, file))

print(f"Found {len(tsx_files)} .tsx files")

updated_count = 0
for filepath in tsx_files:
    if replace_colors_in_file(filepath):
        updated_count += 1
        print(f"Updated: {filepath}")

print(f"\nTotal files updated: {updated_count}")
