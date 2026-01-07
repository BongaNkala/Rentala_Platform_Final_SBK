/* ============================================
   RENTALA DASHBOARD - POLISHED JAVASCRIPT
   Modern Property Management Platform
   ============================================ */

/**
 * Dashboard Initialization
 * Main entry point when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Ìø† Rentala Dashboard Initializing...');
    console.log('‚ú® Features: Glassmorphism design, real-time updates, responsive layout');
    
    initializeDashboard();
    setupEventListeners();
    setupResponsiveBehavior();
    
    console.log('‚úÖ Dashboard ready!');
});

/**
 * Initialize core dashboard components
 */
function initializeDashboard() {
    // Auto-hide sidebar on desktop for cleaner initial view
    if (window.innerWidth > 992) {
        setTimeout(() => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.remove('active');
                console.log('Ì≥± Sidebar auto-hidden on desktop');
            }
        }, 3000);
    }
    
    // Initialize any components that need setup
    updateDashboardStats();
    setupNotifications();
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            console.log(`Ì≥± Sidebar ${sidebar.classList.contains('active') ? 'opened' : 'closed'}`);
        });
        
        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                }
            }
        });
    }
    
    // Period filter buttons
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all period buttons
            document.querySelectorAll('.period-btn').forEach(b => {
                b.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update chart/data based on selected period
            const period = this.textContent.toLowerCase();
            updateChartData(period);
    });
    });

    // Initialize first period button as active
    const firstPeriodBtn = document.querySelector('.period-btn');
    if (firstPeriodBtn && !document.querySelector('.period-btn.active')) {
        firstPeriodBtn.classList.add('.active');
    }
            console.log(`Ì≥ä Period changed to: ${period}`);
        });
    });
    
    // Navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!this.classList.contains('active')) {
                e.preventDefault();
                
                // Update active navigation item
                document.querySelectorAll('.nav-item').forEach(i => {
                    i.classList.remove('active');
                });
                this.classList.add('active');
                
                // Update page title based on navigation
                updatePageTitle(this);
                console.log(`Ì≥ã Navigation changed to: ${this.querySelector('span').textContent}`);
            }
        });
    });
    
    // Property card buttons
    document.querySelectorAll('.property-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const propertyCard = this.closest('.property-card');
            const propertyTitle = propertyCard.querySelector('.property-title').textContent;
            const action = this.classList.contains('primary') ? 'edit' : 'view';
            
            // In a real app, this would navigate or open a modal
            showPropertyModal(propertyTitle, action);
            console.log(`Ìø† Property action: ${action} - ${propertyTitle}`);
        });
    });
    
    // Search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim()) {
                performSearch(this.value.trim());
                this.value = '';
            }
        });
        
        // Add search button if it exists
        const searchButton = document.querySelector('.search-button');
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                if (searchInput.value.trim()) {
                    performSearch(searchInput.value.trim());
                    searchInput.value = '';
                }
            });
        }
    }
    
    // Notification button
    const notificationBtn = document.querySelector('.notification-btn');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            showNotifications();
            this.querySelector('.notification-badge').style.display = 'none';
        });
    }
    
    // Logout functionality
    const logoutBtn = document.querySelector('.nav-item:last-child');
    if (logoutBtn && logoutBtn.querySelector('.fa-sign-out-alt')) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                performLogout();
            }
        });
    }
}

/**
 * Set up responsive behavior
 */
function setupResponsiveBehavior() {
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            handleResponsiveLayout();
        }, 250);
    });
    
    // Initial responsive setup
    handleResponsiveLayout();
}

/**
 * Handle responsive layout changes
 */
function handleResponsiveLayout() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    
    if (window.innerWidth > 992) {
        // Desktop: Ensure menu toggle is hidden
        if (menuToggle) {
            menuToggle.style.display = 'none';
        }
    } else {
        // Mobile: Show menu toggle
        if (menuToggle) {
            menuToggle.style.display = 'block';
        }
    }
}

/**
 * Update page title based on navigation
 * @param {HTMLElement} navItem - The clicked navigation item
 */
function updatePageTitle(navItem) {
    const pageTitle = document.querySelector('.page-title h1');
    const pageDescription = document.querySelector('.page-title p');
    const navText = navItem.querySelector('span').textContent;
    
    if (pageTitle) {
        pageTitle.textContent = navText + ' Overview';
    }
    
    if (pageDescription) {
        pageDescription.textContent = `Manage your ${navText.toLowerCase()} from this dashboard.`;
    }
}

/**
 * Perform search operation
 * @param {string} query - Search query
 */
function performSearch(query) {
    // Show loading state
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.classList.add('loading');
    }
    
    // Simulate API call
    setTimeout(() => {
        // Remove loading state
        if (searchInput) {
            searchInput.classList.remove('loading');
        }
        
        // Show search results (in a real app, this would update the UI)
        showNotification(`Search results for: "${query}"`, 'info');
        console.log(`Ì¥ç Search performed: "${query}"`);
        
        // In a real app, you would:
        // 1. Make an API call
        // 2. Update the UI with results
        // 3. Handle errors
    }, 500);
}

/**
 * Show property modal
 * @param {string} propertyTitle - Property title
 * @param {string} action - Action type ('view' or 'edit')
 */
function showPropertyModal(propertyTitle, action) {
    // In a real app, this would open a modal
    // For now, show an alert
    alert(`${action === 'edit' ? 'Editing' : 'Viewing'}: ${propertyTitle}\n\nThis would open a ${action} modal in the full application.`);
}

/**
 * Show notifications panel
 */
function showNotifications() {
    // In a real app, this would open a notifications panel
    // For now, show an alert
    const notifications = [
        'New tenant application received',
        'Maintenance request updated',
        'Rent payment received for Unit 105'
    ];
    
    alert(`Ì≥¢ You have ${notifications.length} notifications:\n\n‚Ä¢ ${notifications.join('\n‚Ä¢ ')}`);
}

/**
 * Perform logout
 */
function performLogout() {
    // Show loading state
    showNotification('Logging out...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        // In a real app, you would:
        // 1. Clear authentication tokens
        // 2. Clear user data
        // 3. Redirect to login page
        
        alert('‚úÖ Successfully logged out. Redirecting to login page...');
        window.location.href = 'login.html';
    }, 1000);
}

/**
 * Update dashboard statistics
 */
function updateDashboardStats() {
    // In a real app, this would fetch data from an API
    // For now, simulate updating stats
    setTimeout(() => {
        console.log('Ì≥à Dashboard stats updated');
        // Update UI elements here
    }, 1000);
}

/**
 * Update chart data based on selected period
 * @param {string} period - Time period ('monthly', 'quarterly', 'yearly')
 */
function updateChartData(period) {
    // In a real app, this would fetch chart data from API
    console.log(`Updating chart data for period: ${period}`);
    // Update charts here
}

/**
 * Setup notifications system
 */
function setupNotifications() {
    // In a real app, this would setup WebSocket or polling for notifications
    console.log('Ì¥î Notifications system initialized');
}

/**
 * Show notification message
 * @param {string} message - Notification message
 * @param {string} type - Notification type ('success', 'error', 'warning', 'info')
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `overview-notification ${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

/**
 * Error handling utility
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 */
function handleError(error, context = 'Dashboard operation') {
    console.error(`‚ùå ${context}:`, error);
    showNotification(`Error: ${error.message || 'Something went wrong'}`, 'error');
}

// Export functions for testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeDashboard,
        setupEventListeners,
        performSearch,
        showNotification,
        handleError
    };
}
