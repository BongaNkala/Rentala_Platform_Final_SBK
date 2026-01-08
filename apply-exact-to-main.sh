#!/bin/bash

echo "Applying exact styling to main.main-content..."

# Backup
cp tenants.html tenants.html.backup.main-exact-styles

# Find the main element line
main_line=$(grep -n '<main class="main-content">' tenants.html | head -1 | cut -d: -f1)

# Apply the exact inline styles
sed -i "${main_line}s|<main class=\"main-content\">|<main class=\"main-content\" style=\"font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 16px; line-height: 1.6; color: var(--light); box-sizing: border-box; margin: 0; overflow-y: auto; flex: 1 1 0%; padding: 30px; background: url('rentala_web_background.png') center/cover no-repeat fixed, linear-gradient(135deg, rgba(67, 97, 238, 0.08) 0%, rgba(58, 12, 163, 0.04) 100%); min-height: calc(100vh - 80px);\">|" tenants.html

echo "✅ Applied exact styling to main.main-content"
echo "✅ Added: padding: 30px, overflow-y: auto, flex: 1 1 0%"
echo "✅ Added exact typography and background"
