class TenantsManager {
    constructor() {
        this.tenants = [];
        this.properties = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.init();
    }
    
    async init() {
        console.log('í¿  Tenants Manager Initializing...');
        this.setupEventListeners();
        await this.loadData();
        this.renderTenants();
        this.updateStats();
        this.updateNavCount();
    }
    
    async loadData() {
        // Load properties
        this.properties = [
            { id: '1', name: 'Sunset Villa', address: '123 Beach Rd', rent: 8500 },
            { id: '2', name: 'Mountain View', address: '456 Hill St', rent: 7200 },
            { id: '3', name: 'City Center Apt', address: '789 Main St', rent: 9500 },
            { id: '4', name: 'Garden House', address: '101 Garden Ln', rent: 6800 },
            { id: '5', name: 'Lake View', address: '202 Lake Dr', rent: 7800 }
        ];
        
        // Try to load from localStorage
        const saved = localStorage.getItem('rentala_tenants');
        if (saved) {
            this.tenants = JSON.parse(saved);
        } else {
            // Sample tenants data
            this.tenants = [
                {
                    id: '1',
                    name: 'John Smith',
                    email: 'john@example.com',
                    phone: '0712345678',
                    propertyId: '1',
                    propertyName: 'Sunset Villa',
                    rent: 8500,
                    leaseStart: '2024-01-01',
                    leaseEnd: '2024-12-31',
                    status: 'active',
                    createdAt: '2024-01-01T10:00:00.000Z',
                    payments: [
                        { date: '2024-01-05', amount: 8500, status: 'completed' },
                        { date: '2024-02-05', amount: 8500, status: 'completed' }
                    ]
                },
                {
                    id: '2',
                    name: 'Sarah Johnson',
                    email: 'sarah@example.com',
                    phone: '0712345679',
                    propertyId: '2',
                    propertyName: 'Mountain View',
                    rent: 7200,
                    leaseStart: '2024-02-01',
                    leaseEnd: '2025-01-31',
                    status: 'active',
                    createdAt: '2024-02-01T09:30:00.000Z',
                    payments: [
                        { date: '2024-02-05', amount: 7200, status: 'completed' }
                    ]
                },
                {
                    id: '3',
                    name: 'Mike Wilson',
                    email: 'mike@example.com',
                    phone: '0712345680',
                    propertyId: '3',
                    propertyName: 'City Center Apt',
                    rent: 9500,
                    leaseStart: '2023-12-01',
                    leaseEnd: '2024-11-30',
                    status: 'pending',
                    createdAt: '2023-11-15T14:00:00.000Z',
                    payments: []
                },
                {
                    id: '4',
                    name: 'Emma Davis',
                    email: 'emma@example.com',
                    phone: '0712345681',
                    propertyId: '4',
                    propertyName: 'Garden House',
                    rent: 6800,
                    leaseStart: '2024-01-15',
                    leaseEnd: '2025-01-14',
                    status: 'active',
                    createdAt: '2024-01-10T11:00:00.000Z',
                    payments: [
                        { date: '2024-01-20', amount: 6800, status: 'completed' }
                    ]
                },
                {
                    id: '5',
                    name: 'David Brown',
                    email: 'david@example.com',
                    phone: '0712345682',
                    propertyId: '5',
                    propertyName: 'Lake View',
                    rent: 7800,
                    leaseStart: '2023-11-01',
                    leaseEnd: '2024-10-31',
                    status: 'inactive',
                    createdAt: '2023-10-20T16:00:00.000Z',
                    payments: [
                        { date: '2023-11-05', amount: 7800, status: 'completed' },
                        { date: '2023-12-05', amount: 7800, status: 'completed' }
                    ]
                }
            ];
            this.saveToLocalStorage();
        }
        
        this.populatePropertySelect();
    }
    
    populatePropertySelect() {
        const propertySelect = document.getElementById('tenantProperty');
        if (propertySelect) {
            this.properties.forEach(property => {
                const option = document.createElement('option');
                option.value = property.id;
                option.textContent = `${property.name} - R${property.rent}/month`;
                propertySelect.appendChild(option);
            });
        }
    }
    
    setupEventListeners() {
        // Mobile menu
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
        
        // Search
        const searchInputs = ['tenantSearch', 'advancedSearch'];
        searchInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', (e) => {
                    this.searchTerm = e.target.value.toLowerCase();
                    this.renderTenants();
                });
            }
        });
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.getAttribute('data-filter');
                this.renderTenants();
            });
        });
        
        // Add tenant button
        const addBtn = document.getElementById('addTenantBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openAddTenantModal());
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
        
        // Modal controls
        this.setupModalControls();
    }
    
    setupModalControls() {
        const closeModalBtn = document.getElementById('closeModalBtn');
        const closeFormBtn = document.getElementById('closeFormModalBtn');
        const cancelFormBtn = document.getElementById('cancelFormBtn');
        const submitFormBtn = document.getElementById('submitFormBtn');
        const editTenantBtn = document.getElementById('editTenantBtn');
        const saveTenantBtn = document.getElementById('saveTenantBtn');
        const deleteTenantBtn = document.getElementById('deleteTenantBtn');
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                document.getElementById('tenantDetailModal').style.display = 'none';
            });
        }
        
        if (closeFormBtn) {
            closeFormBtn.addEventListener('click', () => {
                document.getElementById('tenantFormModal').style.display = 'none';
            });
        }
        
        if (cancelFormBtn) {
            cancelFormBtn.addEventListener('click', () => {
                document.getElementById('tenantFormModal').style.display = 'none';
            });
        }
        
        if (submitFormBtn) {
            submitFormBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitTenantForm();
            });
        }
        
        if (editTenantBtn) {
            editTenantBtn.addEventListener('click', () => {
                this.enableEditMode();
            });
        }
        
        if (saveTenantBtn) {
            saveTenantBtn.addEventListener('click', () => {
                this.saveEditMode();
            });
        }
        
        if (deleteTenantBtn) {
            deleteTenantBtn.addEventListener('click', () => {
                this.deleteCurrentTenant();
            });
        }
        
        // Close modals on outside click
        window.addEventListener('click', (e) => {
            const modals = ['tenantDetailModal', 'tenantFormModal'];
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }
    
    renderTenants() {
        const container = document.getElementById('tenantsContainer');
        if (!container) return;
        
        let filtered = this.tenants;
        
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(t => t.status === this.currentFilter);
        }
        
        if (this.searchTerm) {
            filtered = filtered.filter(t => 
                t.name.toLowerCase().includes(this.searchTerm) ||
                t.email.toLowerCase().includes(this.searchTerm) ||
                t.propertyName.toLowerCase().includes(this.searchTerm) ||
                t.phone.includes(this.searchTerm)
            );
        }
        
        if (filtered.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }
        
        const html = filtered.map(tenant => this.renderTenantCard(tenant)).join('');
        container.innerHTML = html;
        
        // Add event listeners to tenant cards
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tenantId = e.currentTarget.getAttribute('data-id');
                this.viewTenant(tenantId);
            });
        });
        
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tenantId = e.currentTarget.getAttribute('data-id');
                this.editTenant(tenantId);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tenantId = e.currentTarget.getAttribute('data-id');
                this.deleteTenant(tenantId);
            });
        });
    }
    
    renderTenantCard(tenant) {
        const leaseStart = new Date(tenant.leaseStart).toLocaleDateString('en-ZA');
        const leaseEnd = new Date(tenant.leaseEnd).toLocaleDateString('en-ZA');
        
        return `
            <div class="tenant-card">
                <div class="tenant-card-header">
                    <h3>${tenant.name}</h3>
                    <span class="tenant-status-badge status-${tenant.status}">
                        ${tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                    </span>
                </div>
                <div class="tenant-card-body">
                    <p><strong>Email:</strong> ${tenant.email}</p>
                    <p><strong>Phone:</strong> ${tenant.phone}</p>
                    <p><strong>Property:</strong> ${tenant.propertyName}</p>
                    <p><strong>Rent:</strong> R${tenant.rent.toFixed(2)}/month</p>
                    <p><strong>Lease:</strong> ${leaseStart} to ${leaseEnd}</p>
                </div>
                <div class="tenant-card-footer">
                    <button class="tenant-btn btn-view" data-id="${tenant.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="tenant-btn btn-edit" data-id="${tenant.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="tenant-btn btn-delete" data-id="${tenant.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }
    
    viewTenant(tenantId) {
        const tenant = this.tenants.find(t => t.id === tenantId);
        if (!tenant) return;
        
        const modal = document.getElementById('tenantDetailModal');
        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const saveBtn = document.getElementById('saveTenantBtn');
        
        modalTitle.textContent = tenant.name;
        saveBtn.style.display = 'none';
        
        const leaseStart = new Date(tenant.leaseStart).toLocaleDateString('en-ZA');
        const leaseEnd = new Date(tenant.leaseEnd).toLocaleDateString('en-ZA');
        const createdAt = new Date(tenant.createdAt).toLocaleDateString('en-ZA');
        
        const totalPaid = tenant.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
        const lastPayment = tenant.payments?.length > 0 ? 
            new Date(tenant.payments[tenant.payments.length - 1].date).toLocaleDateString('en-ZA') : 'None';
        
        modalBody.innerHTML = `
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Email</label>
                    <p class="tenant-email">${tenant.email}</p>
                </div>
                <div class="detail-item">
                    <label>Phone</label>
                    <p class="tenant-phone">${tenant.phone}</p>
                </div>
                <div class="detail-item">
                    <label>Property</label>
                    <p class="tenant-property">${tenant.propertyName}</p>
                </div>
                <div class="detail-item">
                    <label>Monthly Rent</label>
                    <p class="tenant-rent">R${tenant.rent.toFixed(2)}</p>
                </div>
                <div class="detail-item">
                    <label>Lease Start</label>
                    <p class="tenant-leaseStart">${leaseStart}</p>
                </div>
                <div class="detail-item">
                    <label>Lease End</label>
                    <p class="tenant-leaseEnd">${leaseEnd}</p>
                </div>
                <div class="detail-item">
                    <label>Status</label>
                    <p><span class="tenant-status-badge status-${tenant.status}">
                        ${tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                    </span></p>
                </div>
                <div class="detail-item">
                    <label>Member Since</label>
                    <p>${createdAt}</p>
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <h4 style="color: white; margin-bottom: 15px;">Payment Summary</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Total Paid</label>
                        <p>R${totalPaid.toFixed(2)}</p>
                    </div>
                    <div class="detail-item">
                        <label>Last Payment</label>
                        <p>${lastPayment}</p>
                    </div>
                    <div class="detail-item">
                        <label>Payments Count</label>
                        <p>${tenant.payments?.length || 0}</p>
                    </div>
                </div>
            </div>
        `;
        
        modal.setAttribute('data-tenant-id', tenantId);
        modal.style.display = 'flex';
    }
    
    enableEditMode() {
        const modal = document.getElementById('tenantDetailModal');
        const modalBody = document.getElementById('modalBody');
        const saveBtn = document.getElementById('saveTenantBtn');
        const editBtn = document.getElementById('editTenantBtn');
        
        const tenantId = modal.getAttribute('data-tenant-id');
        const tenant = this.tenants.find(t => t.id === tenantId);
        if (!tenant) return;
        
        // Replace static text with editable inputs
        modalBody.innerHTML = `
            <div class="form-group">
                <label for="editName">Full Name</label>
                <input type="text" id="editName" value="${tenant.name}" class="form-control">
            </div>
            <div class="form-group">
                <label for="editEmail">Email</label>
                <input type="email" id="editEmail" value="${tenant.email}" class="form-control">
            </div>
            <div class="form-group">
                <label for="editPhone">Phone</label>
                <input type="tel" id="editPhone" value="${tenant.phone}" class="form-control">
            </div>
            <div class="form-group">
                <label for="editProperty">Property</label>
                <select id="editProperty" class="form-control">
                    ${this.properties.map(p => `
                        <option value="${p.id}" ${p.id === tenant.propertyId ? 'selected' : ''}>
                            ${p.name} - R${p.rent}/month
                        </option>
                    `).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="editRent">Monthly Rent (R)</label>
                <input type="number" id="editRent" value="${tenant.rent}" step="0.01" class="form-control">
            </div>
            <div class="form-group">
                <label for="editStatus">Status</label>
                <select id="editStatus" class="form-control">
                    <option value="active" ${tenant.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${tenant.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    <option value="pending" ${tenant.status === 'pending' ? 'selected' : ''}>Pending</option>
                </select>
            </div>
        `;
        
        editBtn.style.display = 'none';
        saveBtn.style.display = 'flex';
    }
    
    saveEditMode() {
        const modal = document.getElementById('tenantDetailModal');
        const saveBtn = document.getElementById('saveTenantBtn');
        const editBtn = document.getElementById('editTenantBtn');
        const tenantId = modal.getAttribute('data-tenant-id');
        const tenantIndex = this.tenants.findIndex(t => t.id === tenantId);
        
        if (tenantIndex === -1) return;
        
        const updatedTenant = {
            ...this.tenants[tenantIndex],
            name: document.getElementById('editName').value,
            email: document.getElementById('editEmail').value,
            phone: document.getElementById('editPhone').value,
            propertyId: document.getElementById('editProperty').value,
            propertyName: this.properties.find(p => p.id === document.getElementById('editProperty').value)?.name || '',
            rent: parseFloat(document.getElementById('editRent').value),
            status: document.getElementById('editStatus').value,
            updatedAt: new Date().toISOString()
        };
        
        this.tenants[tenantIndex] = updatedTenant;
        this.saveToLocalStorage();
        
        this.showNotification('Tenant updated successfully!', 'success');
        this.renderTenants();
        this.updateStats();
        this.updateNavCount();
        
        // Switch back to view mode
        editBtn.style.display = 'flex';
        saveBtn.style.display = 'none';
        this.viewTenant(tenantId);
    }
    
    deleteCurrentTenant() {
        const modal = document.getElementById('tenantDetailModal');
        const tenantId = modal.getAttribute('data-tenant-id');
        
        if (confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
            this.deleteTenant(tenantId);
            modal.style.display = 'none';
        }
    }
    
    deleteTenant(tenantId) {
        if (confirm('Are you sure you want to delete this tenant?')) {
            this.tenants = this.tenants.filter(t => t.id !== tenantId);
            this.saveToLocalStorage();
            this.showNotification('Tenant deleted successfully!', 'success');
            this.renderTenants();
            this.updateStats();
            this.updateNavCount();
        }
    }
    
    editTenant(tenantId) {
        const tenant = this.tenants.find(t => t.id === tenantId);
        if (!tenant) return;
        
        const modal = document.getElementById('tenantFormModal');
        const formTitle = document.getElementById('formModalTitle');
        const form = document.getElementById('tenantForm');
        
        formTitle.textContent = 'Edit Tenant';
        
        document.getElementById('tenantName').value = tenant.name;
        document.getElementById('tenantEmail').value = tenant.email;
        document.getElementById('tenantPhone').value = tenant.phone;
        document.getElementById('tenantProperty').value = tenant.propertyId;
        document.getElementById('tenantRent').value = tenant.rent;
        document.getElementById('tenantLeaseStart').value = tenant.leaseStart;
        document.getElementById('tenantLeaseEnd').value = tenant.leaseEnd;
        document.getElementById('tenantStatus').value = tenant.status;
        
        form.setAttribute('data-tenant-id', tenantId);
        modal.style.display = 'flex';
    }
    
    openAddTenantModal() {
        const modal = document.getElementById('tenantFormModal');
        const formTitle = document.getElementById('formModalTitle');
        const form = document.getElementById('tenantForm');
        
        formTitle.textContent = 'Add New Tenant';
        form.reset();
        form.removeAttribute('data-tenant-id');
        
        // Set default dates
        const today = new Date();
        const oneYearLater = new Date(today);
        oneYearLater.setFullYear(today.getFullYear() + 1);
        
        document.getElementById('tenantLeaseStart').value = today.toISOString().split('T')[0];
        document.getElementById('tenantLeaseEnd').value = oneYearLater.toISOString().split('T')[0];
        
        modal.style.display = 'flex';
    }
    
    submitTenantForm() {
        const form = document.getElementById('tenantForm');
        const tenantId = form.getAttribute('data-tenant-id');
        
        const propertyId = document.getElementById('tenantProperty').value;
        const property = this.properties.find(p => p.id === propertyId);
        
        const tenantData = {
            id: tenantId || Date.now().toString(),
            name: document.getElementById('tenantName').value,
            email: document.getElementById('tenantEmail').value,
            phone: document.getElementById('tenantPhone').value,
            propertyId: propertyId,
            propertyName: property?.name || 'Unknown Property',
            rent: parseFloat(document.getElementById('tenantRent').value),
            leaseStart: document.getElementById('tenantLeaseStart').value,
            leaseEnd: document.getElementById('tenantLeaseEnd').value,
            status: document.getElementById('tenantStatus').value,
            createdAt: tenantId ? this.tenants.find(t => t.id === tenantId)?.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            payments: tenantId ? this.tenants.find(t => t.id === tenantId)?.payments || [] : []
        };
        
        try {
            // Try to save to API
            try {
                const method = tenantId ? 'PUT' : 'POST';
                const url = tenantId ? `/api/tenants/${tenantId}` : '/api/tenants';
                
                fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(tenantData)
                }).then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                }).catch(error => {
                    console.log('API not available, saving locally');
                });
            } catch (apiError) {
                console.log('Using local storage only');
            }
            
            // Update local data
            if (tenantId) {
                const index = this.tenants.findIndex(t => t.id === tenantId);
                if (index !== -1) {
                    this.tenants[index] = tenantData;
                    this.showNotification('Tenant updated successfully!', 'success');
                }
            } else {
                this.tenants.push(tenantData);
                this.showNotification('Tenant added successfully!', 'success');
            }
            
            this.saveToLocalStorage();
            this.renderTenants();
            this.updateStats();
            this.updateNavCount();
            
            document.getElementById('tenantFormModal').style.display = 'none';
            
        } catch (error) {
            console.error('Error saving tenant:', error);
            this.showNotification('Failed to save tenant. Please try again.', 'error');
        }
    }
    
    updateStats() {
        const totalTenants = this.tenants.length;
        const activeTenants = this.tenants.filter(t => t.status === 'active').length;
        const pendingTenants = this.tenants.filter(t => t.status === 'pending').length;
        
        // Calculate total rent from active tenants
        const totalRent = this.tenants
            .filter(t => t.status === 'active')
            .reduce((sum, t) => sum + (t.rent || 0), 0);
        
        document.getElementById('totalTenantsCount').textContent = totalTenants;
        document.getElementById('activeTenantsCount').textContent = activeTenants;
        document.getElementById('pendingTenantsCount').textContent = pendingTenants;
        document.getElementById('totalRentCollected').textContent = `R${totalRent.toFixed(2)}`;
    }
    
    updateNavCount() {
        const navBadge = document.getElementById('tenantNavCount');
        if (navBadge) {
            navBadge.textContent = this.tenants.length;
        }
    }
    
    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-users"></i>
                </div>
                <h3 class="empty-state-title">No Tenants Found</h3>
                <p class="empty-state-text">
                    ${this.searchTerm ? 'No tenants match your search criteria.' : 'Start by adding your first tenant.'}
                </p>
                ${!this.searchTerm ? `
                <button class="tenant-btn tenant-btn-primary" onclick="tenantsManager.openAddTenantModal()" style="margin-top: 20px;">
                    <i class="fas fa-user-plus"></i> Add First Tenant
                </button>
                ` : ''}
            </div>
        `;
    }
    
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationsContainer');
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: inherit; font-size: 1.2rem; cursor: pointer; margin-left: 15px;">&times;</button>
            </div>
        `;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    saveToLocalStorage() {
        localStorage.setItem('rentala_tenants', JSON.stringify(this.tenants));
    }
    
    logout() {
        localStorage.removeItem('rentala_tenants');
        this.showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    window.tenantsManager = new TenantsManager();
    console.log('âœ… Tenants Platform Ready!');
});
