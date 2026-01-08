#!/bin/bash

echo "Updating HTML for unified design..."

# Create a new unified HTML file
cp tenants.html tenants-unified.html

# Update the CSS links
sed -i '/<link rel="stylesheet" href="[^"]*\.css"/d' tenants-unified.html

# Add unified CSS
head_line=$(grep -n '</title>' tenants-unified.html | head -1 | cut -d: -f1)
sed -i "${head_line}a\    <link rel=\"stylesheet\" href=\"rental-unified.css\">" tenants-unified.html

# Update body structure
# Remove old body classes and inline styles
sed -i 's/<body[^>]*>/<body>/' tenants-unified.html

# Add app container
body_content=$(sed -n '/<body>/,/<\/body>/p' tenants-unified.html | sed '1d;$d')
echo "<body>
<div class=\"app-container\">
$body_content
</div>
</body>" > temp_body.html

# Replace body content
sed -i '/<body>/,/<\/body>/c\
<body>\
<div class=\"app-container\">\
</div>\
</body>' tenants-unified.html

# Insert the body content
body_end=$(grep -n '</div>' tenants-unified.html | tail -1 | cut -d: -f1)
sed -i "${body_end}r temp_body.html" tenants-unified.html

# Clean up
rm temp_body.html

echo "✅ HTML updated for unified design"
