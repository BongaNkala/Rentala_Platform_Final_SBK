#!/bin/bash

echo "Adding glass classes to white elements in tenants.html..."

# Backup
cp tenants.html tenants.html.backup.glassify

# Add glass classes to common containers
sed -i 's/<div class="container">/<div class="container glass-medium">/g' tenants.html
sed -i 's/<div class="content-container">/<div class="content-container glass-medium">/g' tenants.html
sed -i 's/<div class="main-container">/<div class="main-container glass-medium">/g' tenants.html

# Add glass classes to cards
sed -i 's/<div class="card">/<div class="card glass-light">/g' tenants.html
sed -i 's/<div class="tenant-card">/<div class="tenant-card glass-light">/g' tenants.html

# Add glass classes to headers
sed -i 's/<div class="header">/<div class="header glass-frosted">/g' tenants.html
sed -i 's/<div class="page-header">/<div class="page-header glass-frosted">/g' tenants.html

# Add glass classes to table containers
sed -i 's/<div class="table-container">/<div class="table-container glass-transparent">/g' tenants.html

# Add glass classes to control panels
sed -i 's/<div class="controls">/<div class="controls glass-transparent">/g' tenants.html

# Add glass classes to search containers
sed -i 's/<div class="search-container">/<div class="search-container glass-transparent">/g' tenants.html

echo "✅ Glass classes added to white elements!"
echo "✅ Different glass intensities for visual hierarchy:"
echo "   - .glass-light (subtle cards)"
echo "   - .glass-medium (main containers)"
echo "   - .glass-frosted (headers)"
echo "   - .glass-transparent (ui elements)"
echo "   - .glass-accent (accented sections)"
