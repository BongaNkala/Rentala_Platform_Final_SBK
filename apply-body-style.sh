#!/bin/bash

echo "Applying exact body styling..."

# Backup
cp tenants.html tenants.html.backup.body-style

# Find the body element
body_line=$(grep -n '<body' tenants.html | head -1 | cut -d: -f1)

if [ ! -z "$body_line" ]; then
    echo "Found body at line $body_line"
    
    # Get current body attributes
    body_content=$(sed -n "${body_line}p" tenants.html)
    
    # Check if body already has class or style
    if [[ $body_content == *"class="* ]]; then
        # Extract existing classes
        existing_classes=$(echo "$body_content" | grep -o 'class="[^"]*"' | cut -d'"' -f2)
        new_classes="$existing_classes styled-body"
        
        # Replace with new styling
        sed -i "${body_line}s|class=\"$existing_classes\"|class=\"$new_classes\" style=\"box-sizing: border-box; margin: 0px; padding: 0px; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 16px; line-height: 1.6; color: var(--light); background-image: url('images/rentala_web_background.png'); background-repeat: no-repeat; background-attachment: fixed; background-size: cover; min-height: 100vh; overflow-x: hidden; background-position: center center;\"|" tenants.html
    else
        # Add class and style
        sed -i "${body_line}s|<body|<body class=\"styled-body\" style=\"box-sizing: border-box; margin: 0px; padding: 0px; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 16px; line-height: 1.6; color: var(--light); background-image: url('images/rentala_web_background.png'); background-repeat: no-repeat; background-attachment: fixed; background-size: cover; min-height: 100vh; overflow-x: hidden; background-position: center center;\"|" tenants.html
    fi
    
    echo "✅ Applied exact body styling"
else
    echo "❌ Could not find body element"
fi
