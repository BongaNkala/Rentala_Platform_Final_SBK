        throw new Error(`HTTP ${response.status}`);
        
        const tenants = await response.json();
        
        if (!tenants || tenants.length === 0) {
            showNotification('No tenants to export', 'warning');
            return;
        }
        
        // CSV headers
        const headers = [
            'ID', 'Full Name', 'Email', 'Phone', 'Property Address',
            'Monthly Rent', 'Lease Start', 'Lease End', 'Status'
        ];
        
        // CSV rows
        const csvRows = [
            headers.join(','),
            ...tenants.map(tenant => [
                tenant.id,
                `"${escapeCsv(tenant.full_name)}"`,
                `"${escapeCsv(tenant.email)}"`,
                `"${escapeCsv(tenant.phone || '')}"`,
                `"${escapeCsv(tenant.property_address || '')}"`,
                tenant.rent_amount || 0,
                `"${tenant.lease_start || ''}"`,
                `"${tenant.lease_end || ''}"`,
                `"${tenant.status}"`
            ].join(','))
        ];
        
        // Create and download CSV
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rentala-tenants-${new Date().toISOString().split('T')[0]}.csv`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showNotification('Tenants exported to CSV successfully!', 'success');
        
    } catch (error) {
        console.error('Error exporting tenants:', error);
        showNotification('Failed to export tenants.', 'error');
    }
}

/**
 * Load tenants for specific property
 */
async function loadPropertyTenants(propertyId) {
    try {
        const response = await fetch(`/api/tenants?property_id=${propertyId}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const tenants = await response.json();
        
        // Update page title
        document.querySelector('.header-title h1').innerHTML = 
            `<i class="fas fa-users"></i> Tenants for Property #${propertyId}`;
        
        // Update description
        document.querySelector('.header-title p').textContent = 
            `Showing tenants for selected property`;
        
        renderTenants(tenants);
        
    } catch (error) {
        console.error('Error loading property tenants:', error);
        showNotification('Failed to load property tenants.', 'error');
    }
}

/**
 * Sync tenant data with dashboard
 */
function syncWithDashboard() {
    // Send tenant data to dashboard if it's open
    if (typeof window.parent !== 'undefined' && window.parent !== window) {
        // We're in an iframe or parent window context
        window.parent.postMessage({
            type: 'TENANT_DATA_UPDATED',
            timestamp: new Date().toISOString()
        }, '*');
    }
    
    // Broadcast to other tabs
    if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel('rentala_tenant_updates');
        channel.postMessage({
            action: 'tenants_updated',
            timestamp: Date.now()
        });
    }
    
    // Update localStorage for cross-tab communication
    const event = new Event('tenantDataChanged');
    window.dispatchEvent(event);
}

/**
 * Update reports with tenant data
 */
function updateReportsWithTenantData() {
    // This function would integrate with your reports system
    // For now, it just stores the data for reports to use
    fetch('/api/tenants')
        .then(response => response.json())
        .then(tenants => {
            localStorage.setItem('report_tenant_data', JSON.stringify({
                total: tenants.length,
                active: tenants.filter(t => t.status === 'active').length,
                totalRent: tenants.reduce((sum, t) => sum + (t.rent_amount || 0), 0),
                lastUpdated: new Date().toISOString()
            }));
        })
        .catch(console.error);
}

/**
 * Update stats display
 */
function updateStatsDisplay(stats) {
    const elements = {
        'totalTenants': 'total',
        'activeTenants': 'active',
        'pendingTenants': 'pending',
        'totalTenantRent': 'totalRent'
    };
    
    Object.entries(elements).forEach(([elementId, statKey]) => {
        const element = document.getElementById(elementId);
        if (element) {
            let value = stats[statKey] || 0;
            if (statKey === 'totalRent') {
                value = `R${value.toLocaleString()}`;
            }
            element.textContent = value;
        }
    });
}

/**
 * Update tenant stats display from tenant list
 */
function updateTenantStatsDisplay(tenants) {
    const stats = {
        total: tenants.length,
        active: tenants.filter(t => t.status === 'active').length,
        inactive: tenants.filter(t => t.status === 'inactive').length,
        pending: tenants.filter(t => t.status === 'pending').length,
        totalRent: tenants.reduce((sum, t) => sum + (t.rent_amount || 0), 0)
    };
    
    updateStatsDisplay(stats);
}

/**
 * Show loading state
 */
function showLoadingState() {
    const container = document.getElementById('tenantsContainer');
    if (container) {
        container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Loading tenants...</p>
            </div>
        `;
    }
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    // Loading state will be replaced when content loads
}

/**
 * Setup modal controls
 */
function setupModalControls() {
    // Close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
            event.target.classList.remove('active');
        }
    });
}

/**
 * Render sample tenants for demo/fallback
 */
function renderSampleTenants() {
    const sampleTenants = [
        {
            id: 1,
            full_name: 'John Smith',
            email: 'john.smith@email.com',
            phone: '+27 11 123 4567',
            property_address: '123 Main Street, Johannesburg',
            rent_amount: 8500,
            lease_start: '2024-01-01',
            lease_end: '2024-12-31',
            status: 'active'
        },
        {
            id: 2,
            full_name: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            phone: '+27 11 987 6543',
            property_address: '456 Oak Avenue, Pretoria',
            rent_amount: 12000,
            lease_start: '2024-02-01',
            lease_end: '2025-01-31',
            status: 'active'
        },
        {
            id: 3,
            full_name: 'Mike Wilson',
            email: 'mike.wilson@email.com',
            phone: '+27 11 555 1234',
            property_address: '789 Pine Road, Cape Town',
            rent_amount: 9500,
            lease_start: '2024-03-15',
            lease_end: '2024-09-14',
            status: 'pending'
        }
    ];
    
    renderTenants(sampleTenants);
    updateTenantStatsDisplay(sampleTenants);
}

/**
 * Utility: Format date
 */
function formatDate(dateString) {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Utility: Calculate lease duration
 */
function calculateLeaseDuration(startDate, endDate) {
    if (!startDate || !endDate) return 'N/A';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + 
                      (end.getMonth() - start.getMonth());
    
    if (diffMonths === 0) {
        const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
        return `${diffDays} days`;
    }
    
    return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
}

/**
 * Utility: Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Utility: Escape CSV fields
 */
function escapeCsv(field) {
    if (!field) return '';
    const stringField = String(field);
    if (stringField.includes('"') || stringField.includes(',') || stringField.includes('\n')) {
        return stringField.replace(/"/g, '""');
    }
    return stringField;
}

/**
 * Utility: Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Utility: Close modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.remove();
    }
}

/**
 * Utility: Update active navigation
 */
function updateActiveNav() {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to tenants nav item
    const tenantsNav = document.querySelector('a[href="tenants.html"]')?.parentElement;
    if (tenantsNav) {
        tenantsNav.classList.add('active');
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${escapeHtml(message)}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                &times;
            </button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Initialize tenant system when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Rentala Tenant Management System Initializing...');
        initializeTenantSystem();
        setupTenantEventListeners();
        loadTenants();
        loadTenantStats();
        syncWithDashboard();
    });
} else {
    console.log('Rentala Tenant Management System Initializing...');
    initializeTenantSystem();
    setupTenantEventListeners();
    loadTenants();
    loadTenantStats();
    syncWithDashboard();
}

/* ============================================
   TENANT MANAGEMENT - POLISHED FUNCTIONALITY
   Enhanced with animations, better UX, and additional features
   ============================================ */

class TenantManager {
    constructor() {
        this.tenants = [];
        this.filteredTenants = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.isLoading = false;
        this.init();
    }
    
    async init() {
        console.log('��� Rentala Tenant Manager - Enhanced Edition');
        this.setupEventListeners();
        this.setupAnimations();
        await this.loadTenants();
        this.setupRealTimeUpdates();
        this.initializeTooltips();
    }
    
    setupAnimations() {
        // Add animation classes to elements
        document.querySelectorAll('.stat-card, .tenant-card').forEach((el, i) => {
            el.classList.add('fade-in');
            el.style.animationDelay = `${i * 0.1}s`;
        });
    }
    
    initializeTooltips() {
        // Initialize tooltips for action buttons
        const tooltips = {
            'edit-property-btn': 'Edit tenant details',
            'delete-property-btn': 'Remove tenant',
            'status-toggle-btn': 'Toggle tenant status',
            'addTenantBtn': 'Add new tenant',
            'exportTenantsBtn': 'Export to CSV'
        };
        
        Object.entries(tooltips).forEach(([selector, tooltip]) => {
            document.querySelectorAll(`.${selector}, #${selector}`).forEach(btn => {
                btn.setAttribute('title', tooltip);
                btn.setAttribute('data-tooltip', tooltip);
            });
        });
    }
    
    async loadTenants() {
        this.showLoading();
        
        try {
            const response = await fetch('/api/tenants');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            this.tenants = await response.json();
            this.filteredTenants = [...this.tenants];
            
            this.renderTenants();
            this.updateDashboardStats();
            this.updateFilterCounts();
            
            // Store for offline access
            localStorage.setItem('rentala_tenants_cache', JSON.stringify({
                data: this.tenants,
                timestamp: Date.now()
            }));
            
        } catch (error) {
            console.error('Error loading tenants:', error);
            this.showNotification('⚠️ Failed to load tenants. Using cached data.', 'warning');
            this.loadCachedData();
        } finally {
            this.hideLoading();
        }
    }
    
    loadCachedData() {
        const cached = localStorage.getItem('rentala_tenants_cache');
        if (cached) {
            const { data } = JSON.parse(cached);
            this.tenants = data;
            this.filteredTenants = [...data];
            this.renderTenants();
            this.updateDashboardStats();
        }
    }
    
    renderTenants() {
        const container = document.getElementById('tenantsContainer');
        if (!container) return;
        
        if (this.filteredTenants.length === 0) {
            container.innerHTML = this.createEmptyState();
            return;
        }
        
        container.innerHTML = `
            <div class="tenants-grid">
                ${this.filteredTenants.map((tenant, index) => this.createTenantCard(tenant, index)).join('')}
            </div>
        `;
        
        // Re-attach event listeners
        this.attachCardEventListeners();
    }
    
    createTenantCard(tenant, index) {
        const formattedRent = new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 0
        }).format(tenant.rent_amount || 0);
        
        const leaseDuration = this.calculateLeaseDuration(tenant.lease_start, tenant.lease_end);
        const daysRemaining = this.calculateDaysRemaining(tenant.lease_end);
        
        return `
            <div class="tenant-card slide-up" style="animation-delay: ${index * 0.05}s">
                <div class="tenant-header">
                    <div class="tenant-info">
                        <h3>${this.escapeHtml(tenant.full_name)}</h3>
                        <p class="email">${this.escapeHtml(tenant.email)}</p>
                    </div>
                    <span class="tenant-status status-${tenant.status}">
                        ${tenant.status.toUpperCase()}
                    </span>
                </div>
                
                <div class="tenant-details-grid">
                    <div class="detail-item">
                        <i class="fas fa-phone"></i>
                        <div>
                            <div class="label">Phone</div>
                            <div class="value">${tenant.phone || 'Not provided'}</div>
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <i class="fas fa-home"></i>
                        <div>
                            <div class="label">Property</div>
                            <div class="value">${this.escapeHtml(tenant.property_address || 'Not assigned')}</div>
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <i class="fas fa-money-bill-wave"></i>
                        <div>
                            <div class="label">Monthly Rent</div>
                            <div class="value">${formattedRent}</div>
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <i class="fas fa-calendar-alt"></i>
                        <div>
                            <div class="label">Lease Duration</div>
                            <div class="value">${leaseDuration}</div>
                            ${daysRemaining <= 30 ? `
                                <div class="label" style="color: #ef4444; margin-top: 5px;">
                                    <i class="fas fa-exclamation-circle"></i>
                                    ${daysRemaining} days remaining
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="tenant-actions">
                    <button class="btn-tenant-action btn-view-tenant" 
                            data-tenant-id="${tenant.id}"
                            onclick="tenantManager.viewTenantDetails(${tenant.id})">
                        <i class="fas fa-eye"></i> Details
                    </button>
                    <button class="btn-tenant-action btn-edit-tenant" 
                            data-tenant-id="${tenant.id}"
                            onclick="tenantManager.editTenant(${tenant.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-tenant-action btn-delete-tenant" 
                            data-tenant-id="${tenant.id}"
                            onclick="tenantManager.deleteTenant(${tenant.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }
    
    createEmptyState() {
        return `
            <div class="empty-state">
                <i class="fas fa-users-slash"></i>
                <h3>No Tenants Found</h3>
                <p>${this.searchQuery ? 'No tenants match your search criteria.' : 'Add your first tenant to get started.'}</p>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button class="btn-primary" onclick="tenantManager.showAddTenantModal()">
                        <i class="fas fa-user-plus"></i> Add Tenant
                    </button>
                    ${this.searchQuery ? `
                        <button class="btn-secondary" onclick="tenantManager.clearSearch()">
                            <i class="fas fa-times"></i> Clear Search
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    calculateLeaseDuration(startDate, endDate) {
        if (!startDate || !endDate) return 'N/A';
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        
        if (months === 0) {
            const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
            return `${days} days`;
        }
        
        return `${months} month${months !== 1 ? 's' : ''}`;
    }
    
    calculateDaysRemaining(endDate) {
        if (!endDate) return Infinity;
        const end = new Date(endDate);
        const today = new Date();
        return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    }
    
    updateDashboardStats() {
        const stats = {
            total: this.tenants.length,
            active: this.tenants.filter(t => t.status === 'active').length,
            pending: this.tenants.filter(t => t.status === 'pending').length,
            inactive: this.tenants.filter(t => t.status === 'inactive').length,
            totalRent: this.tenants.reduce((sum, t) => sum + (t.rent_amount || 0), 0),
            expiringSoon: this.tenants.filter(t => 
                t.status === 'active' && 
                t.lease_end && 
                this.calculateDaysRemaining(t.lease_end) <= 30
            ).length
        };
        
        // Update stat cards
        this.updateStatElement('totalTenants', stats.total);
        this.updateStatElement('activeTenants', stats.active);
        this.updateStatElement('pendingTenants', stats.pending);
        this.updateStatElement('expiringTenants', stats.expiringSoon);
        this.updateStatElement('totalTenantRent', 
            new Intl.NumberFormat('en-ZA', {
                style: 'currency',
                currency: 'ZAR',
                minimumFractionDigits: 0
            }).format(stats.totalRent)
        );
        
        // Update progress bars
        this.updateProgressBars(stats);
    }
    
    updateProgressBars(stats) {
        if (stats.total > 0) {
            const activePercent = (stats.active / stats.total) * 100;
            const occupiedPercent = (stats.active / (stats.active + stats.inactive)) * 100 || 0;
            
            document.querySelectorAll('.progress-fill').forEach((bar, index) => {
                if (index === 0) bar.style.width = `${activePercent}%`;
                if (index === 1) bar.style.width = `${occupiedPercent}%`;
            });
        }
    }
    
    updateStatElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            // Animate number change
            if (!isNaN(value) && typeof value === 'number') {
                this.animateValue(element, parseInt(element.textContent) || 0, value, 500);
            } else {
                element.textContent = value;
            }
        }
    }
    
    animateValue(element, start, end, duration) {
        const startTime = performance.now();
        const updateValue = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (end - start) * progress);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        };
        requestAnimationFrame(updateValue);
    }
    
    updateFilterCounts() {
        const filters = {
            'all': this.tenants.length,
            'active': this.tenants.filter(t => t.status === 'active').length,
            'inactive': this.tenants.filter(t => t.status === 'inactive').length,
            'pending': this.tenants.filter(t => t.status === 'pending').length
        };
        
        Object.entries(filters).forEach(([filter, count]) => {
            const btn = document.querySelector(`[data-filter="${filter}"]`);
            if (btn) {
                const badge = btn.querySelector('.filter-count') || document.createElement('span');
                badge.className = 'filter-count';
                badge.textContent = count;
                if (!btn.querySelector('.filter-count')) {
                    btn.appendChild(badge);
                }
            }
        });
    }
    
    filterTenants(filterType) {
        this.currentFilter = filterType;
        
        this.filteredTenants = this.tenants.filter(tenant => {
            if (filterType === 'all') return true;
            return tenant.status === filterType;
        });
        
        if (this.searchQuery) {
            this.filteredTenants = this.filteredTenants.filter(tenant =>
                tenant.full_name.toLowerCase().includes(this.searchQuery) ||
                tenant.email.toLowerCase().includes(this.searchQuery) ||
                (tenant.property_address && tenant.property_address.toLowerCase().includes(this.searchQuery))
            );
        }
        
        this.renderTenants();
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filterType}"]`).classList.add('active');
    }
    
    searchTenants(query) {
        this.searchQuery = query.toLowerCase();
        this.filterTenants(this.currentFilter);
        
        // Update search input with animation
        const searchInput = document.getElementById('tenantSearch');
        if (searchInput) {
            if (query) {
                searchInput.parentElement.classList.add('searching');
            } else {
                searchInput.parentElement.classList.remove('searching');
            }
        }
    }
    
    clearSearch() {
        this.searchQuery = '';
        const searchInput = document.getElementById('tenantSearch');
        if (searchInput) {
            searchInput.value = '';
            searchInput.parentElement.classList.remove('searching');
        }
        this.filterTenants(this.currentFilter);
    }
    
    async editTenant(id) {
        try {
            const response = await fetch(`/api/tenants/${id}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const tenant = await response.json();
            this.showEditModal(tenant);
            
        } catch (error) {
            console.error('Error loading tenant:', error);
            this.showNotification('Failed to load tenant details', 'error');
        }
    }
    
    showEditModal(tenant) {
        const modal = document.getElementById('tenantModal');
        if (!modal) return;
        
        // Fill form
        document.getElementById('tenantId').value = tenant.id;
        document.getElementById('full_name').value = tenant.full_name || '';
        document.getElementById('email').value = tenant.email || '';
        document.getElementById('phone').value = tenant.phone || '';
        document.getElementById('rent_amount').value = tenant.rent_amount || '';
        document.getElementById('lease_start').value = tenant.lease_start?.split('T')[0] || '';
        document.getElementById('lease_end').value = tenant.lease_end?.split('T')[0] || '';
        document.getElementById('status').value = tenant.status || 'active';
        
        // Update modal title
        document.getElementById('modalTitle').textContent = 'Edit Tenant';
        
        // Show modal with animation
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('active'), 10);
    }
    
    showAddTenantModal() {
        const modal = document.getElementById('tenantModal');
        if (!modal) return;
        
        // Reset form
        const form = document.getElementById('tenantForm');
        if (form) form.reset();
        document.getElementById('tenantId').value = '';
        
        // Update modal title
        document.getElementById('modalTitle').textContent = 'Add New Tenant';
        
        // Show modal with animation
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('active'), 10);
    }
    
    async deleteTenant(id) {
        if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
            return;
        }
        
        this.showLoading();
        
        try {
            const response = await fetch(`/api/tenants/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            this.showNotification('✅ Tenant deleted successfully', 'success');
            await this.loadTenants();
            
        } catch (error) {
            console.error('Error deleting tenant:', error);
            this.showNotification('Failed to delete tenant', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    viewTenantDetails(id) {
        const tenant = this.tenants.find(t => t.id == id);
        if (!tenant) return;
        
        // Create and show detail modal
        const modalHtml = this.createDetailModal(tenant);
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);
        
        // Animate in
        setTimeout(() => {
            modalContainer.querySelector('.modal').classList.add('active');
        }, 10);
    }
    
    createDetailModal(tenant) {
        const formattedRent = new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 0
        }).format(tenant.rent_amount || 0);
        
        const leaseDuration = this.calculateLeaseDuration(tenant.lease_start, tenant.lease_end);
        const daysRemaining = this.calculateDaysRemaining(tenant.lease_end);
        
        return `
            <div class="modal" id="tenantDetailModal">
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <h3>Tenant Details</h3>
                        <span class="modal-close" onclick="this.closest('.modal').remove()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="tenant-detail-view">
                            <div class="detail-section">
                                <h4><i class="fas fa-user-circle"></i> Personal Information</h4>
                                <div class="detail-grid">
                                    <div class="detail-item">
                                        <strong>Full Name:</strong> ${this.escapeHtml(tenant.full_name)}
                                    </div>
                                    <div class="detail-item">
                                        <strong>Email:</strong> ${this.escapeHtml(tenant.email)}
                                    </div>
                                    <div class="detail-item">
                                        <strong>Phone:</strong> ${tenant.phone || 'Not provided'}
                                    </div>
                                    <div class="detail-item">
                                        <strong>ID Number:</strong> ${tenant.id_number || 'Not provided'}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4><i class="fas fa-home"></i> Property Information</h4>
                                <div class="detail-grid">
                                    <div class="detail-item">
                                        <strong>Property:</strong> ${this.escapeHtml(tenant.property_address || 'Not assigned')}
                                    </div>
                                    <div class="detail-item">
                                        <strong>Unit:</strong> ${tenant.unit_number || 'N/A'}
                                    </div>
                                    <div class="detail-item">
                                        <strong>Rent Amount:</strong> ${formattedRent}
                                    </div>
                                    <div class="detail-item">
                                        <strong>Payment Day:</strong> ${tenant.payment_day || 'Not specified'}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4><i class="fas fa-file-contract"></i> Lease Information</h4>
                                <div class="detail-grid">
                                    <div class="detail-item">
                                        <strong>Lease Start:</strong> ${tenant.lease_start ? new Date(tenant.lease_start).toLocaleDateString() : 'N/A'}
                                    </div>
                                    <div class="detail-item">
                                        <strong>Lease End:</strong> ${tenant.lease_end ? new Date(tenant.lease_end).toLocaleDateString() : 'N/A'}
                                    </div>
                                    <div class="detail-item">
                                        <strong>Duration:</strong> ${leaseDuration}
                                    </div>
                                    <div class="detail-item">
                                        <strong>Status:</strong> 
                                        <span class="tenant-status status-${tenant.status}">
                                            ${tenant.status.toUpperCase()}
                                        </span>
                                        ${daysRemaining <= 30 ? `
                                            <span style="color: #ef4444; margin-left: 10px;">
                                                <i class="fas fa-exclamation-triangle"></i>
                                                ${daysRemaining} days remaining
                                            </span>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h4><i class="fas fa-sticky-note"></i> Additional Information</h4>
                                <div class="detail-grid">
                                    <div class="detail-item">
                                        <strong>Emergency Contact:</strong> ${tenant.emergency_contact || 'Not provided'}
                                    </div>
                                    <div class="detail-item">
                                        <strong>Notes:</strong> ${tenant.notes || 'No additional notes'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-tenant-action btn-edit-tenant" onclick="tenantManager.editTenant(${tenant.id}); this.closest('.modal').remove();">
                            <i class="fas fa-edit"></i> Edit Tenant
                        </button>
                        <button class="btn-tenant-action btn-delete-tenant" onclick="tenantManager.deleteTenant(${tenant.id}); this.closest('.modal').remove();">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                        <button class="btn-tenant-action btn-secondary" onclick="this.closest('.modal').remove()">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    async handleFormSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const tenantData = Object.fromEntries(formData.entries());
        const tenantId = document.getElementById('tenantId').value;
        
        this.showLoading();
        
        try {
            const url = tenantId ? `/api/tenants/${tenantId}` : '/api/tenants';
            const method = tenantId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tenantData)
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            this.showNotification(
                tenantId ? '✅ Tenant updated successfully' : '✅ Tenant added successfully',
                'success'
            );
            
            this.closeModal();
            await this.loadTenants();
            
        } catch (error) {
            console.error('Error saving tenant:', error);
            this.showNotification('Failed to save tenant', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    closeModal() {
        const modal = document.getElementById('tenantModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(el => el.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
    
    showLoading() {
        this.isLoading = true;
        const loading = document.createElement('div');
        loading.className = 'loading-overlay';
        loading.innerHTML = `
            <div class="spinner"></div>
            <p>Loading...</p>
        `;
        document.body.appendChild(loading);
    }
    
    hideLoading() {
        this.isLoading = false;
        document.querySelectorAll('.loading-overlay').forEach(el => el.remove());
    }
    
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('tenantSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTenants(e.target.value);
            });
        }
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.filterTenants(filter);
            });
        });
        
        // Add tenant button
        const addBtn = document.getElementById('addTenantBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddTenantModal());
        }
        
        // Form submission
        const form = document.getElementById('tenantForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // Modal close buttons
        document.querySelectorAll('.modal-close, .modal .btn-secondary').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });
        
        // Export button
        const exportBtn = document.getElementById('exportTenantsBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportTenants());
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshTenantsBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadTenants());
        }
    }
    
    attachCardEventListeners() {
        // Attach event listeners to dynamically created tenant cards
        document.querySelectorAll('.btn-view-tenant').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tenantId = e.currentTarget.dataset.tenantId;
                this.viewTenantDetails(tenantId);
            });
        });
        
        document.querySelectorAll('.btn-edit-tenant').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tenantId = e.currentTarget.dataset.tenantId;
                this.editTenant(tenantId);
            });
        });
        
        document.querySelectorAll('.btn-delete-tenant').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tenantId = e.currentTarget.dataset.tenantId;
                this.deleteTenant(tenantId);
            });
        });
    }
    
    setupRealTimeUpdates() {
        // Simulate real-time updates for demo purposes
        setInterval(() => {
            if (!this.isLoading && Math.random() > 0.7) {
                this.updateDashboardStats();
            }
        }, 10000);
        
        // Listen for tenant updates from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'rentala_tenants_updated') {
                this.loadTenants();
            }
        });
    }
    
    exportTenants() {
        const data = this.filteredTenants.map(tenant => ({
            Name: tenant.full_name,
            Email: tenant.email,
            Phone: tenant.phone,
            Property: tenant.property_address,
            'Monthly Rent': `R${tenant.rent_amount || 0}`,
            Status: tenant.status,
            'Lease Start': tenant.lease_start,
            'Lease End': tenant.lease_end
        }));
        
        // Convert to CSV
        const csv = this.convertToCSV(data);
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `tenants_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showNotification('✅ Tenants exported successfully', 'success');
    }
    
    convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const rows = data.map(row => 
            headers.map(header => 
                JSON.stringify(row[header] || '')
            ).join(',')
        );
        
        return [headers.join(','), ...rows].join('\n');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 0
        }).format(amount);
    }
    
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Initialize Tenant Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tenantManager = new TenantManager();
});

// Export functions for global access
window.showAddTenantModal = () => window.tenantManager?.showAddTenantModal();
window.filterTenants = (filter) => window.tenantManager?.filterTenants(filter);
window.searchTenants = (query) => window.tenantManager?.searchTenants(query);
window.exportTenants = () => window.tenantManager?.exportTenants();
