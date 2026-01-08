#!/bin/bash

echo "Updating closing div for page container..."

# Find the closing div for the container (should be near the end)
# Look for a closing div with comment about container
closing_line=$(grep -n "<!-- .container glass-medium -->" tenants.html | head -1 | cut -d: -f1)

if [ ! -z "$closing_line" ]; then
    sed -i "${closing_line}s|<!-- .container glass-medium -->|<!-- .page-container -->|" tenants.html
    echo "✅ Updated closing div comment"
else
    # Try to find the matching closing div
    # Count opening and closing divs after line 164
    opening_count=1
    current_line=165
    
    while read -r line; do
        if [[ $line == *"<div"* ]]; then
            ((opening_count++))
        elif [[ $line == *"</div>"* ]]; then
            ((opening_count--))
            if [ $opening_count -eq 0 ]; then
                # Found the matching closing div
                sed -i "${current_line}s|</div>|</div> <!-- .page-container -->|" tenants.html
                echo "✅ Added closing comment at line $current_line"
                break
            fi
        fi
        ((current_line++))
    done < <(sed -n '165,$p' tenants.html)
fi
