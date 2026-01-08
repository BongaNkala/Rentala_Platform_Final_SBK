// Move Add Tenant button to top
document.addEventListener('DOMContentLoaded', function() {
    // Hide modal initially
    const modal = document.getElementById('tenantModal') || 
                  document.querySelector('.modal[aria-labelledby="modalTitle"]');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Find and move the Add Tenant button
    const addTenantBtn = document.getElementById('addTenantBtn') || 
                        document.querySelector('button:contains("Add Tenant")');
    
    if (addTenantBtn) {
        // Clone button and add to top
        const topBtn = addTenantBtn.cloneNode(true);
        topBtn.id = 'addTenantTopBtn';
        topBtn.classList.add('add-tenant-top-btn');
        
        // Add to top of page
        const header = document.querySelector('header') || 
                      document.querySelector('.header') || 
                      document.body;
        header.insertAdjacentElement('afterbegin', topBtn);
        
        // Hide original button if needed
        addTenantBtn.style.display = 'none';
        
        // Add click event to show modal
        topBtn.addEventListener('click', function() {
            if (modal) {
                modal.style.display = 'block';
            }
        });
    }
});
