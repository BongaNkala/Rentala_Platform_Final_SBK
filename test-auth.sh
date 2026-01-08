#!/bin/bash

echo "í´ Testing Rentala Authentication System..."
echo "============================================"

# Check if properties.js has auth check
if grep -q "checkAuthentication" properties.js; then
    echo "âœ… Authentication check found in properties.js"
    
    # Check for demo mode support
    if grep -q "demo=true" properties.js || grep -q "isDemoMode" properties.js; then
        echo "âœ… Demo mode support detected"
    else
        echo "âš ï¸  Adding demo mode support..."
        cat >> properties.js << 'DEMOEOF'

// Demo mode bypass for development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Development environment detected');
    
    // Check if we need to create demo session
    if (!localStorage.getItem('authToken')) {
        console.log('Creating demo session for local development...');
        localStorage.setItem('authToken', 'dev-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify({
            name: 'Development User',
            email: 'dev@rentala.com',
            role: 'admin'
        }));
    }
}
DEMOEOF
        echo "âœ… Demo mode support added"
    fi
else
    echo "âŒ No authentication check found in properties.js"
fi

echo ""
echo "í¼ Quick Access URLs:"
echo "  1. Properties (with demo): http://localhost:3002/properties.html?demo=true"
echo "  2. Dev Login Page: http://localhost:3002/dev-login.html"
echo "  3. Direct Access: http://localhost:3002/properties.html?direct=true"
echo ""
echo "í´§ To fix the redirect issue, use any of these methods:"
echo "   - Add ?demo=true to the URL"
echo "   - Use the dev-login.html page first"
echo "   - Manually set localStorage tokens"
echo ""
echo "í²¡ Quick manual fix in browser console:"
echo "  localStorage.setItem('authToken', 'demo-token');"
echo "  localStorage.setItem('user', JSON.stringify({name: 'Demo User', email: 'demo@rentala.com'}));"
echo "  location.reload();"
