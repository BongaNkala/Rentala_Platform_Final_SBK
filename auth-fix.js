// Quick fix for authentication - add this to the top of properties.js
// or replace the existing checkAuthentication function

const originalCheckAuth = window.checkAuthentication || function() { return false; };

window.checkAuthentication = function() {
    // Try original check first
    const originalResult = originalCheckAuth();
    if (originalResult) return true;
    
    // If original fails, try demo mode
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
        console.log('Localhost detected, creating demo session...');
        
        const demoUser = {
            name: 'Local Demo User',
            email: 'local@rentala.com'
        };
        
        localStorage.setItem('authToken', 'local-demo-' + Date.now());
        localStorage.setItem('user', JSON.stringify(demoUser));
        
        // Update UI
        const profileName = document.querySelector('.top-profile-name');
        if (profileName) profileName.textContent = demoUser.name;
        
        return true;
    }
    
    return false;
};

console.log('Auth fix applied successfully');
