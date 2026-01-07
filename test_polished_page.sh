#!/bin/bash

echo "��� Testing Polished Tenant Page Features"
echo "=========================================="

# Check if all files are present
echo "1. Checking required files..."
required_files=(
    "tenants.css"
    "tenants.js"
    "tenants_polished_demo.html"
    "tenants.css.backup.polish"
    "tenants.js.backup.polish"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file (missing)"
    fi
done

echo ""
echo "2. Testing CSS styles..."
if grep -q "POLISHED_CSS" tenants.css; then
    echo "   ✅ Polished CSS styles found"
else
    echo "   ⚠️  Polished CSS styles not found (might be integrated differently)"
fi

echo ""
echo "3. Testing JavaScript functionality..."
if grep -q "class TenantManager" tenants.js; then
    echo "   ✅ TenantManager class found"
else
    echo "   ⚠️  TenantManager class not found (check integration)"
fi

echo ""
echo "4. Creating test server..."
echo "   Starting simple HTTP server on port 8080..."
echo "   Open your browser and navigate to:"
echo "   http://localhost:8080/tenants_polished_demo.html"
echo ""
echo "   Or open the file directly in your browser:"
echo "   file://$(pwd)/tenants_polished_demo.html"
echo ""
echo "   Press Ctrl+C to stop the server"

# Start Python simple HTTP server if available
if command -v python3 &> /dev/null; then
    python3 -m http.server 8080
elif command -v python &> /dev/null; then
    python -m http.server 8080
else
    echo "   Python not available for HTTP server"
    echo "   Please install Python or use another method to serve files"
fi
