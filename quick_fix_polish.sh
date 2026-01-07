#!/bin/bash

cd "/c/Tools/mingw/Rentala_Platform_Final_SBK"

echo "=== QUICK FIX FOR POLISH APPLICATION ==="
echo ""

echo "Ì¥ß Applying quick fixes..."
echo ""

# 1. Make sure all CSS files exist
echo "1. Checking CSS files..."
if [ ! -f "rentala-design-system.css" ]; then
    echo "   ‚ùå rentala-design-system.css missing"
    echo "   Creating from backup..."
    cp "backup_final_polish_20260107_183756/rentala-design-system.css" .
fi

if [ ! -f "tenants.css" ]; then
    echo "   ‚ùå tenants.css missing"
    echo "   Creating from backup..."
    cp "backup_final_polish_20260107_183756/tenants.css" .
fi

# 2. Update login.html if exists
if [ -f "login.html" ]; then
    echo "2. Updating login.html..."
    if ! grep -q "rentala-design-system.css" login.html; then
        sed -i '/<head>/a\    <link rel="stylesheet" href="rentala-design-system.css">' login.html
        echo "   ‚úÖ Added design system to login.html"
    fi
fi

# 3. Update dashboard.html if exists
if [ -f "dashboard.html" ]; then
    echo "3. Updating dashboard.html..."
    if ! grep -q "rentala-design-system.css" dashboard.html; then
        sed -i '/<head>/a\    <link rel="stylesheet" href="rentala-design-system.css">' dashboard.html
        echo "   ‚úÖ Added design system to dashboard.html"
    fi
fi

# 4. Create a simple tenants.html if missing
if [ ! -f "tenants.html" ] && [ -f "tenants_final.html" ]; then
    echo "4. Creating tenants.html..."
    cp tenants_final.html tenants.html
    echo "   ‚úÖ Created tenants.html"
fi

# 5. Start the server
echo ""
echo "Ì∫Ä Starting server to test..."
echo ""
echo "Open these URLs in your browser:"
echo "1. Polish Test: http://localhost:3002/test_polish.html"
echo "2. Tenants: http://localhost:3002/tenants.html"
echo "3. Login: http://localhost:3002/login.html"
echo ""
echo "Press Ctrl+C to stop server"
echo ""

export PATH="/c/nvm4w/nodejs:$PATH"
npm start
