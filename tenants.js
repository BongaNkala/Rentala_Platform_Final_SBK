/* ============================================
   TENANT MANAGEMENT - UNIVERSAL JAVASCRIPT
   Aligned with login.js and dashboard.js patterns
   Updated: 2026-01-07
   ============================================ */

class TenantManager {
    constructor() {
        this.tenants = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.init();
    }
    
    async init() {
        console.log('Tenant Manager initialized');
        this.setupEventListeners();
        await this.loadTenants();
        this.renderTenants();
    }
    
    async loadTenants() {
        try {
            // Show loading state
            this.showLoading();
            
            // Fetch tenants from API (matching dashboard.js pattern)
            const response = await fetch('/api/tenants', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.tenants = await response.json();
            
            // Store in localStorage for offline access (matching other pages)
            localStorage.setItem('tenants_cache', JSON.stringify({
                data: this.tenants,
                timestamp: Date.now()
            }));
            
        } catch (error) {
            console.error('Error loading tenants:', error);
            this.showError('Failed to load tenants. Please try again.');
            
            // Try to load from cache (matching dashboard.js pattern)
            const cached = localStorage.getItem('tenants_cache');
            if (cached) {
                const { data } = JSON.parse(cached);
                this.tenants = data;
            }
        } finally {
            this.hideLoading();
        }
    }
    
    renderTenants() {
        const container = document.getElementById('tenantsContainer');
        if (!container) return;
        
        if (this.tenants.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }
        
        // Create grid matching dashboard.js structure
        container.innerHTML = `
            <div class="tenants-grid">
                ${this.tenants.map(tenant => this.renderTenantCard(tenant)).join('')}
            </div>
        `;
        
        // Reattach event listeners
        this.attachCardListeners();
    }
    
    renderTenantCard(tenant) {
        return `
            <div class="tenant-card glass-card" data-tenant-id="${tenant.id}">
                <div class="tenant-card glass-card-header">
                    <h3>${this.escapeHtml(tenant.name)}</h3>
                    <span class="glass-badge ${tenant.status === 'active' ? 'status-active' : 'status-inactive'}">
                        ${tenant.status}
                    </span>
                </div>
                
                <div class="tenant-card glass-card-body">
                    <p><strong>Email:</strong> ${this.escapeHtml(tenant.email)}</p>
                    <p><strong>Phone:</strong> ${tenant.phone || 'Not provided'}</p>
                    <p><strong>Property:</strong> ${tenant.property || 'Not assigned'}</p>
                    <p><strong>Rent:</strong> R${tenant.rent || '0'}/month</p>
                </div>
                
                <div class="tenant-card glass-card-actions">
                    <button class="glass-button glass-button-primary btn-view" data-action="view" data-id="${tenant.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="glass-button glass-button-primary btn-edit" data-action="edit" data-id="${tenant.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="glass-button glass-button-primary glass-button glass-button-danger" data-action="delete" data-id="${tenant.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }
    
    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-users-slash"></i>
                </div>
                <h3>No Tenants Found</h3>
                <p>Get started by adding your first tenant.</p>
                <button class="glass-button glass-button-primary" id="addFirstTenant">
                    <i class="fas fa-user-plus"></i> Add First Tenant
                </button>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Add tenant button
        const addBtn = document.getElementById('addTenantBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }
        
        // Search functionality
        const searchInput = document.getElementById('tenantSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterTenants(e.target.value);
            });
        }
        
        // Filter buttons
        document.querySelectorAll('.tenant-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterByStatus(filter);
            });
        });
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshTenants');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadTenants());
        }
    }
    
    attachCardListeners() {
        // Attach event listeners to dynamically created buttons
        document.querySelectorAll('[data-action="view"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tenantId = e.target.dataset.id;
                this.viewTenant(tenantId);
            });
        });
        
        document.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tenantId = e.target.dataset.id;
                this.editTenant(tenantId);
            });
        });
        
        document.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tenantId = e.target.dataset.id;
                this.deleteTenant(tenantId);
            });
        });
    }
    
    async viewTenant(id) {
        try {
            const response = await fetch(`/api/tenants/${id}`);
            const tenant = await response.json();
            this.showViewModal(tenant);
        } catch (error) {
            console.error('Error viewing tenant:', error);
            this.showError('Failed to load tenant details');
        }
    }
    
    async editTenant(id) {
        try {
            const response = await fetch(`/api/tenants/${id}`);
            const tenant = await response.json();
            this.showEditModal(tenant);
        } catch (error) {
            console.error('Error editing tenant:', error);
            this.showError('Failed to load tenant for editing');
        }
    }
    
    async deleteTenant(id) {
        if (!confirm('Are you sure you want to delete this tenant?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/tenants/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                this.showSuccess('Tenant deleted successfully');
                await this.loadTenants();
            } else {
                throw new Error('Delete failed');
            }
        } catch (error) {
            console.error('Error deleting tenant:', error);
            this.showError('Failed to delete tenant');
        }
    }
    
    showAddModal() {
        // Implementation matching modal patterns from other pages
        const modal = document.createElement('div');
        modal.className = 'tenant-modal';
        modal.innerHTML = `
            <div class="tenant-modal-content">
                <h2>Add New Tenant</h2>
                <form class="tenant-form" id="addTenantForm">
                    <!-- Form fields here -->
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    showLoading() {
        const container = document.getElementById('tenantsContainer');
        if (container) {
            container.innerHTML = `
                <div class="tenant-loading">
                    <div class="loading-spinner"></div>
                    <p>Loading tenants...</p>
                </div>
            `;
        }
    }
    
    hideLoading() {
        // Implementation for hiding loading state
    }
    
    showError(message) {
        // Error display matching dashboard.js pattern
        console.error('Tenant Error:', message);
        // Add error display UI
    }
    
    showSuccess(message) {
        // Success notification matching other pages
        console.log('Tenant Success:', message);
        // Add success notification UI
    }
    
    filterTenants(searchTerm) {
        // Search/filter implementation
    }
    
    filterByStatus(status) {
        // Status filter implementation
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is ready (matching other pages)
document.addEventListener('DOMContentLoaded', () => {
    window.tenantManager = new TenantManager();
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TenantManager;
}

// Toast Notification System
class Toast {
    static show(message, type = 'success') {
        // Create toast container if it doesn't exist
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;
            document.body.appendChild(container);
            
            // Add toast styles
            const style = document.createElement('style');
            style.textContent = `
                .toast {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                    animation: slideInRight 0.3s ease-out;
                    max-width: 350px;
                }
                .toast-success { border-left: 4px solid #10b981; }
                .toast-error { border-left: 4px solid #ef4444; }
                .toast-warning { border-left: 4px solid #f59e0b; }
                .toast-info { border-left: 4px solid #3b82f6; }
                .toast-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                }
                .toast-content i {
                    font-size: 1.25rem;
                }
                .toast-success .toast-content i { color: #10b981; }
                .toast-error .toast-content i { color: #ef4444; }
                .toast-warning .toast-content i { color: #f59e0b; }
                .toast-info .toast-content i { color: #3b82f6; }
                .toast-close {
                    background: none;
                    border: none;
                    color: #6b7280;
                    font-size: 1.25rem;
                    cursor: pointer;
                    padding: 0;
                    line-height: 1;
                }
                .toast-close:hover { color: #ef4444; }
                @keyframes slideInRight {
                    from { opacity: 0; transform: translateX(100%); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes fadeOut {
                    from { opacity: 1; transform: translateX(0); }
                    to { opacity: 0; transform: translateX(100%); }
                }
                .fade-out { animation: fadeOut 0.3s ease-out forwards; }
            `;
            document.head.appendChild(style);
        }
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 
                                  type === 'error' ? 'exclamation-circle' :
                                  type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="toast-close">&times;</button>
        `;
        
        container.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
        
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        });
    }
}
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
