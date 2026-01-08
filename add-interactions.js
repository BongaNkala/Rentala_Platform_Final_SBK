// Add smooth interactions and animations
document.addEventListener('DOMContentLoaded', function() {
    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.card, .tenant-card, .property-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in-up');
    });
    
    // Add smooth modal animation
    const modal = document.querySelector('.modal-content.glass-card');
    const addBtn = document.getElementById('addTenantBtn');
    
    if (modal && addBtn) {
        addBtn.addEventListener('click', function() {
            modal.style.display = 'block';
            // Trigger reflow for animation
            modal.style.animation = 'none';
            setTimeout(() => {
                modal.style.animation = 'fadeInUp 0.4s ease-out';
            }, 10);
        });
    }
    
    // Add hover effect to table rows
    const tableRows = document.querySelectorAll('tbody tr');
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(4px)';
            this.style.transition = 'transform 0.2s ease';
        });
        
        row.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
    
    // Add loading animation to buttons on click
    const buttons = document.querySelectorAll('.btn, .button');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const originalText = this.innerHTML;
            this.innerHTML = '<span class="spinner"></span> Processing...';
            this.disabled = true;
            
            // Reset after 2 seconds (for demo)
            setTimeout(() => {
                this.innerHTML = originalText;
                this.disabled = false;
            }, 2000);
        });
    });
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + N to add new tenant
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            if (addBtn) addBtn.click();
        }
        
        // Escape to close modal
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
});

// Add spinner CSS
const style = document.createElement('style');
style.textContent = `
.spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
    margin-right: 8px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
`;
document.head.appendChild(style);
