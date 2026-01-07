/* Tenant Management - Final Polish
   Rentala Platform - Complete Implementation
   =========================================== */

class TenantManager {
    constructor() {
        this.tenants = [];
        this.filteredTenants = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.isLoading = false;
        this.currentPage = 1;
        this.itemsPerPage = 12;
        
        // API Configuration
        this.apiBase = '/api';
        this.endpoints = {
            tenants: `${this.apiBase}/tenants`,
            properties: `${this.apiBase}/properties`
        };
        
        this.init();
    }
    
    async init() {
        console.log('í¿¢ Tenant Manager Initialized');
        
        try {
            // Check authentication
            await this.checkAuth();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial data
            await Promise.all([
                this.loadTenants(),
                this.loadProperties()
            ]);
            
            // Render initial view
            this.renderTenants();
            this.updateStats();
            
            // Start real-time updates
            this.startRealTimeUpdates();
            
            console.log('âœ… Tenant Manager ready');
            Toast.show('Tenant manager loaded successfully', 'success');
            
        } catch (error) {
            console.error('Failed to initialize tenant manager:', error);
            Toast.show('Failed to load tenant manager', 'error');
            this.showErrorState();
        }
    }
    
    async checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
            throw new Error('Not authenticated');
        }
        
        // Validate token (simplified - in production, verify with server)
        return true;
    }
    
    async loadTenants() {
        this.showLoading();
        
        try {
            const response = await fetch(this.endpoints.tenants, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
            
            this.tenants = await response.json();
            this.filteredTenants = [...this.tenants];
            
            // Cache data
            this.cacheData('tenants', this.tenants);
            
        } catch (error) {
            console.error('Error loading tenants:', error);
            Toast.show('Failed to load tenants. Using cached data.', 'warning');
            
            // Try to load from cache
            const cached = this.getCachedData('tenants');
            if (cached) {
                this.tenants = cached;
                this.filteredTenants = [...cached];
            } else {
                // Show demo data if no cache
                this.loadDemoData();
            }
        } finally {
            this.hideLoading();
        }
    }
    
    async loadProperties() {
        try {
            const response = await fetch(this.endpoints.properties, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const properties = await response.json();
                this.populatePropertySelect(properties);
            }
        } catch (error) {
            console.error('Error loading properties:', error);
        }
    }
    
    loadDemoData() {
        // Demo data for testing
        this.tenants = [
            {
                id: 1,
                fullName: 'Sarah Johnson',
                email: 'sarah.j@example.com',
                phone: '+27 82 123 4567',
                propertyId: 1,
                propertyName: '123 Ocean View Apartments',
                rentAmount: 12500,
                leaseStart: '2024-01-15',
                leaseEnd: '2024-12-14',
                status: 'active',
                notes: 'Pays on time, excellent tenant'
            },
            {
                id: 2,
                fullName: 'Michael Brown',
                email: 'michael.b@example.com',
                phone: '+27 81 234 5678',
                propertyId: 2,
                propertyName: '456 Hillcrest Villa',
                rentAmount: 8500,
                leaseStart: '2024-03-01',
                leaseEnd: '2025-02-28',
                status: 'active',
                notes: 'New tenant, first payment received'
            },
            {
                id: 3,
                fullName: 'Emma Wilson',
                email: 'emma.w@example.com',
                phone: '+27 83 345 6789',
                propertyId: 3,
                propertyName: '789 Beachfront House',
                rentAmount: 18000,
                leaseStart: '2023-11-01',
                leaseEnd: '2024-10-31',
                status: 'active',
                notes: 'Long-term tenant, lease expiring soon'
            },
            {
                id: 4,
                fullName: 'David Miller',
                email: 'david.m@example.com',
                phone: '+27 84 456 7890',
                propertyId: 4,
                propertyName: '321 Garden Cottage',
                rentAmount: 6500,
                leaseStart: '2024-06-01',
                leaseEnd: '2024-11-30',
                status: 'pending',
                notes: 'Application under review'
            },
            {
                id: 5,
                fullName: 'Lisa Anderson',
                email: 'lisa.a@example.com',
                phone: '+27 85 567 8901',
                propertyId: 5,
                propertyName: '654 Mountain View',
                rentAmount: 9500,
                leaseStart: '2023-08-01',
                leaseEnd: '2023-07-31',
                status: 'inactive',
                notes: 'Tenant moved out, property being renovated'
            }
        ];
        
        this.filteredTenants = [...this.tenants];
    }
    
    cacheData(key, data) {
        const cache = {
            data: data,
            timestamp: Date.now(),
            version: '1.0'
        };
        
        localStorage.setItem(`rentala_cache_${key}`, JSON.stringify(cache));
    }
    
    getCachedData(key) {
        const cached = localStorage.getItem(`rentala_cache_${key}`);
        if (!cached) return null;
        
        const { data, timestamp, version } = JSON.parse(cached);
        
        // Check if cache is older than 1 hour
        if (Date.now() - timestamp > 3600000) {
            localStorage.removeItem(`rentala_cache_${key}`);
            return null;
        }
        
        return data;
    }
    
    renderTenants() {
        const container = document.getElementById('tenantsContainer');
        if (!container) return;
        
        if (this.filteredTenants.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }
        
        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const paginatedTenants = this.filteredTenants.slice(startIndex, endIndex);
        
        container.innerHTML = paginatedTenants.map((tenant, index) => 
            this.renderTenantCard(tenant, index)
        ).join('');
        
        // Add pagination if needed
        if (this.filteredTenants.length > this.itemsPerPage) {
            container.insertAdjacentHTML('beforeend', this.renderPagination());
        }
    }
    
    renderTenantCard(tenant, index) {
        const formattedRent = new Intl.NumberFormat('en-ZA', {
            style: 'currency',
            currency: 'ZAR',
            minimumFractionDigits: 0
        }).format(tenant.rentAmount || 0);
        
        const leaseInfo = this.formatLeaseInfo(tenant.leaseStart, tenant.leaseEnd);
        const daysRemaining = this.calculateDaysRemaining(tenant.leaseEnd);
        
        return `
            <div class="tenant-card" data-tenant-id="${tenant.id}">
                <div class="tenant-header">
                    <div class="tenant-name">
                        <h3>${this.escapeHtml(tenant.fullName)}</h3>
                        <div class="tenant-email">${this.escapeHtml(tenant.email)}</div>
                    </div>
                    <span class="tenant-status status-${tenant.status}">
                        ${tenant.status.toUpperCase()}
                    </span>
                </div>
                
                <div class="tenant-details">
                    <div class="detail-item">
                        <div class="detail-icon">
                            <i class="fas fa-phone"></i>
                        </div>
                        <div class="detail-content">
                            <span class="detail-label">Phone</span>
                            <span class="detail-value">${tenant.phone || 'Not provided'}</span>
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-icon">
                            <i class="fas fa-home"></i>
                        </div>
                        <div class="detail-content">
                            <span class="detail-label">Property</span>
                            <span class="detail-value">${this.escapeHtml(tenant.propertyName || 'Not assigned')}</span>
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-icon">
                            <i class="fas fa-money-bill-wave"></i>
                        </div>
                        <div class="detail-content">
                            <span class="detail-label">Monthly Rent</span>
                            <span class="detail-value">${formattedRent}</span>
                        </div>
                    </div>
                    
                    <div class="detail-item">
                        <div class="detail-icon">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <div class="detail-content">
                            <span class="detail-label">Lease</span>
                            <span class="detail-value">${leaseInfo}</span>
                            ${daysRemaining <= 30 && tenant.status === 'active' ? `
                                <small class="text-warning mt-1 d-block">
                                    <i class="fas fa-exclamation-circle"></i>
                                    ${daysRemaining} days remaining
                                </small>
                            ` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="tenant-actions">
                    <button class="action-btn view" onclick="tenantManager.viewTenant(${tenant.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="action-btn edit" onclick="tenantManager.editTenant(${tenant.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="tenantManager.deleteTenant(${tenant.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }
    
    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-users-slash"></i>
                </div>
                <h3>No Tenants Found</h3>
                <p>${this.searchQuery ? 'No tenants match your search criteria.' : 'Add your first tenant to get started.'}</p>
                <div class="mt-6">
                    <button class="btn btn-primary" onclick="tenantManager.showAddModal()">
                        <i class="fas fa-user-plus"></i> Add First Tenant
                    </button>
                    ${this.searchQuery ? `
                        <button class="btn btn-secondary ml-3" onclick="tenantManager.clearSearch()">
                            <i class="fas fa-times"></i> Clear Search
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    renderPagination() {
        const totalPages = Math.ceil(this.filteredTenants.length / this.itemsPerPage);
        
        return `
            <div class="pagination mt-8">
                <div class="pagination-controls">
                    <button class="btn btn-sm ${this.currentPage === 1 ? 'disabled' : ''}" 
                            onclick="tenantManager.prevPage()" ${this.currentPage === 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-left"></i> Previous
                    </button>
                    
                    <span class="pagination-info mx-4">
                        Page ${this.currentPage} of ${totalPages}
                    </span>
                    
                    <button class="btn btn-sm ${this.currentPage === totalPages ? 'disabled' : ''}" 
                            onclick="tenantManager.nextPage()" ${this.currentPage === totalPages ? 'disabled' : ''}>
                        Next <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    formatLeaseInfo(startDate, endDate) {
        if (!startDate || !endDate) return 'N/A';
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const startFormatted = start.toLocaleDateString('en-ZA', {
            month: 'short',
            year: 'numeric'
        });
        
        const endFormatted = end.toLocaleDateString('en-ZA', {
            month: 'short',
            year: 'numeric'
        });
        
        return `${startFormatted} - ${endFormatted}`;
    }
    
    calculateDaysRemaining(endDate) {
        if (!endDate) return Infinity;
        const end = new Date(endDate);
        const today = new Date();
        const diff = end - today;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    
    updateStats() {
        const stats = {
            total: this.tenants.length,
            active: this.tenants.filter(t => t.status === 'active').length,
            pending: this.tenants.filter(t => t.status === 'pending').length,
            totalRent: this.tenants.reduce((sum, t) => sum + (t.rentAmount || 0), 0)
        };
        
        // Update DOM elements
        this.updateElementText('totalTenants', stats.total);
        this.updateElementText('activeTenants', stats.active);
        this.updateElementText('pendingTenants', stats.pending);
        this.updateElementText('totalRent', 
            new Intl.NumberFormat('en-ZA', {
                style: 'currency',
                currency: 'ZAR',
                minimumFractionDigits: 0
            }).format(stats.totalRent)
        );
    }
    
    updateElementText(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    filterTenants() {
        this.filteredTenants = this.tenants.filter(tenant => {
            // Apply status filter
            if (this.currentFilter !== 'all' && tenant.status !== this.currentFilter) {
                return false;
            }
            
            // Apply search filter
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                return (
                    tenant.fullName.toLowerCase().includes(query) ||
                    tenant.email.toLowerCase().includes(query) ||
                    (tenant.propertyName && tenant.propertyName.toLowerCase().includes(query)) ||
                    (tenant.phone && tenant.phone.includes(query))
                );
            }
            
            return true;
        });
        
        // Reset to first page when filtering
        this.currentPage = 1;
        
        this.renderTenants();
    }
    
    async viewTenant(id) {
        const tenant = this.tenants.find(t => t.id == id);
        if (!tenant) return;
        
        // Show tenant details in modal
        this.showViewModal(tenant);
    }
    
    async editTenant(id) {
        const tenant = this.tenants.find(t => t.id == id);
        if (!tenant) return;
        
        this.showEditModal(tenant);
    }
    
    async deleteTenant(id) {
        if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
            return;
        }
        
        this.showLoading();
        
        try {
            const response = await fetch(`${this.endpoints.tenants}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
            
            Toast.show('Tenant deleted successfully', 'success');
            
            // Remove from local array
            this.tenants = this.tenants.filter(t => t.id != id);
            this.filteredTenants = this.filteredTenants.filter(t => t.id != id);
            
            // Update UI
            this.renderTenants();
            this.updateStats();
            
        } catch (error) {
            console.error('Error deleting tenant:', error);
            Toast.show('Failed to delete tenant', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    showAddModal() {
        document.getElementById('modalTitle').textContent = 'Add New Tenant';
        document.getElementById('tenantForm').reset();
        document.getElementById('tenantId').value = '';
        document.getElementById('status').value = 'active';
        
        const modal = document.getElementById('tenantModal');
        modal.style.display = 'flex';
        document.getElementById('fullName').focus();
    }
    
    showEditModal(tenant) {
        document.getElementById('modalTitle').textContent = 'Edit Tenant';
        
        // Fill form with tenant data
        document.getElementById('tenantId').value = tenant.id;
        document.getElementById('fullName').value = tenant.fullName || '';
        document.getElementById('email').value = tenant.email || '';
        document.getElementById('phone').value = tenant.phone || '';
        document.getElementById('propertyId').value = tenant.propertyId || '';
        document.getElementById('rentAmount').value = tenant.rentAmount || '';
        document.getElementById('leaseStart').value = tenant.leaseStart || '';
        document.getElementById('leaseEnd').value = tenant.leaseEnd || '';
        document.getElementById('status').value = tenant.status || 'active';
        document.getElementById('notes').value = tenant.notes || '';
        
        const modal = document.getElementById('tenantModal');
        modal.style.display = 'flex';
        document.getElementById('fullName').focus();
    }
    
    showViewModal(tenant) {
        // Implementation for view-only modal
        alert(`Viewing tenant: ${tenant.fullName}\nEmail: ${tenant.email}\nStatus: ${tenant.status}`);
    }
    
    async handleFormSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const tenantData = Object.fromEntries(formData.entries());
        const tenantId = tenantData.id;
        
        // Convert string values to appropriate types
        if (tenantData.rentAmount) tenantData.rentAmount = parseFloat(tenantData.rentAmount);
        if (tenantData.propertyId) tenantData.propertyId = parseInt(tenantData.propertyId);
        
        this.showLoading();
        
        try {
            const url = tenantId ? `${this.endpoints.tenants}/${tenantId}` : this.endpoints.tenants;
            const method = tenantId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tenantData)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
            
            const savedTenant = await response.json();
            
            Toast.show(
                tenantId ? 'Tenant updated successfully' : 'Tenant added successfully',
                'success'
            );
            
            // Close modal
            this.closeModal();
            
            // Reload tenants
            await this.loadTenants();
            this.renderTenants();
            this.updateStats();
            
        } catch (error) {
            console.error('Error saving tenant:', error);
            Toast.show('Failed to save tenant', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    closeModal() {
        const modal = document.getElementById('tenantModal');
        modal.style.display = 'none';
        document.getElementById('tenantForm').reset();
    }
    
    populatePropertySelect(properties) {
        const select = document.getElementById('propertyId');
        if (!select) return;
        
        // Clear existing options except the first one
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Add property options
        properties.forEach(property => {
            const option = document.createElement('option');
            option.value = property.id;
            option.textContent = `${property.address} (${property.type})`;
            select.appendChild(option);
        });
    }
    
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('tenantSearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.searchQuery = e.target.value.trim();
                    this.filterTenants();
                }, 300);
            });
        }
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active button
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Apply filter
                this.currentFilter = e.target.dataset.filter;
                this.filterTenants();
            });
        });
        
        // Add tenant button
        const addBtn = document.getElementById('addTenantBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.showAddModal());
        }
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshTenants');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                Toast.show('Refreshing tenants...', 'info');
                this.loadTenants().then(() => {
                    this.renderTenants();
                    this.updateStats();
                    Toast.show('Tenants refreshed', 'success');
                });
            });
        }
        
        // Form submission
        const form = document.getElementById('tenantForm');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        // Modal close buttons
        const closeModalBtn = document.getElementById('closeModal');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeModal());
        }
        
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeModal());
        }
        
        // Close modal on backdrop click
        const modal = document.getElementById('tenantModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }
    }
    
    prevPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.renderTenants();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    nextPage() {
        const totalPages = Math.ceil(this.filteredTenants.length / this.itemsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderTenants();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    clearSearch() {
        const searchInput = document.getElementById('tenantSearch');
        if (searchInput) {
            searchInput.value = '';
            this.searchQuery = '';
            this.filterTenants();
        }
    }
    
    showLoading() {
        this.isLoading = true;
        const container = document.getElementById('tenantsContainer');
        if (container) {
            container.innerHTML = `
                <div class="tenants-loading">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Loading tenants...</div>
                </div>
            `;
        }
    }
    
    hideLoading() {
        this.isLoading = false;
    }
    
    showErrorState() {
        const container = document.getElementById('tenantsContainer');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3>Failed to Load Data</h3>
                    <p>There was an error loading the tenant data. Please try again.</p>
                    <div class="mt-6">
                        <button class="btn btn-primary" onclick="location.reload()">
                            <i class="fas fa-redo"></i> Reload Page
                        </button>
                    </div>
                </div>
            `;
        }
    }
    
    startRealTimeUpdates() {
        // Simulate real-time updates (in production, use WebSocket or polling)
        setInterval(() => {
            if (!this.isLoading) {
                this.updateStats();
            }
        }, 30000); // Update every 30 seconds
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.tenantManager = new TenantManager();
});

// Global functions for HTML onclick handlers
window.prevPage = () => window.tenantManager?.prevPage();
window.nextPage = () => window.tenantManager?.nextPage();
window.clearSearch = () => window.tenantManager?.clearSearch();
