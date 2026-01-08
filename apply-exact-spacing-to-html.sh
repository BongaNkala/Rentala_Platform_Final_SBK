#!/bin/bash

echo "Applying exact spacing to tenants.html..."

# Backup
cp tenants.html tenants.html.backup.exact-spacing

# Add the exact spacing CSS
head_line=$(grep -n '</title>' tenants.html | head -1 | cut -d: -f1)
sed -i "${head_line}a\    <link rel=\"stylesheet\" href=\"rental-exact-spacing.css\">" tenants.html

# Ensure the page container has the right class
sed -i 's/<div class="page-container"/<div class="page-container exact-spacing"/' tenants.html

# Add spacing utility classes to key elements
# Add mb-lg to containers
sed -i 's/<div class="container/<div class="container mb-lg/g' tenants.html

# Add p-lg to content sections
sed -i 's/<section class="/<section class="p-lg /g' tenants.html

# Add gap-md to grids
sed -i 's/<div class="stats-grid"/<div class="stats-grid gap-md"/' tenants.html
sed -i 's/<div class="content-grid"/<div class="content-grid gap-md"/' tenants.html

echo "✅ Applied exact spacing to tenants.html"
