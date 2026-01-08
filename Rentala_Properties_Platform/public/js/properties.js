class PropertiesManager {
    constructor() {
        this.properties = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.init();
    }
    
    async init() {
        console.log('í¿¢ Properties Manager Initializing...');
        this.setupEventListeners();
        await this.loadProperties();
        this.renderProperties();
        this.updateStats();
        this.updateNavCount();
    }
    
    async loadProperties() {
        // Try to load from localStorage first
        const saved = localStorage.getItem('rentala_properties');
        if (saved) {
            this.properties = JSON.parse(saved);
            console.log('í³¦ Loaded properties from localStorage');
        } else {
            // Load sample properties
            this.properties = [
                {
                    id: '1',
                    name: 'Sunset Villa',
                    address: '123 Beach Rd',
                    city: 'Cape Town',
                    postalCode: '8001',
                    type: 'residential',
                    units: 3,
                    occupiedUnits: 2,
                    value: 3500000,
                    rent: 8500,
                    bedrooms: 3,
                    bathrooms: 2,
                    size: 180,
                    yearBuilt: 2018,
                    description: 'Beautiful beachfront property with stunning ocean views. Features modern amenities.',
                    amenities: ['Pool', 'Gym', 'Parking', 'Security'],
                    status: 'active',
                    createdAt: '2023-05-15T10:00:00.000Z',
                    updatedAt: '2023-05-15T10:00:00.000Z'
                },
                {
                    id: '2',
                    name: 'Mountain View Apartments',
                    address: '456 Hill St',
                    city: 'Johannesburg',
                    postalCode: '2001',
                    type: 'residential',
                    units: 12,
                    occupiedUnits: 10,
                    value: 12000000,
                    rent: 7200,
                    bedrooms: 2,
                    bathrooms: 1,
                    size: 85,
                    yearBuilt: 2020,
                    description: 'Modern apartment complex with mountain views and communal facilities.',
                    amenities: ['Gym', 'Laundry', 'Parking', 'Elevator'],
                    status: 'active',
                    createdAt: '2023-03-10T14:30:00.000Z',
                    updatedAt: '2023-03-10T14:30:00.000Z'
                },
                {
                    id: '3',
                    name: 'City Center Office Tower',
                    address: '789 Main St',
                    city: 'Pretoria',
                    postalCode: '0001',
                    type: 'commercial',
                    units: 20,
                    occupiedUnits: 15,
                    value: 25000000,
                    rent: 9500,
                    bedrooms: 0,
                    bathrooms: 1,
                    size: 120,
                    yearBuilt: 2015,
                    description: 'Prime commercial office space in central business district.',
                    amenities: ['Parking', 'Security', 'Conference Rooms', 'High-speed Internet'],
                    status: 'active',
                    createdAt: '2022-11-20T09:15:00.000Z',
                    updatedAt: '2022-11-20T09:15:00.000Z'
                },
                {
                    id: '4',
                    name: 'Garden House Complex',
                    address: '101 Garden Ln',
                    city: 'Durban',
                    postalCode: '4001',
                    type: 'mixed',
                    units: 8,
                    occupiedUnits: 6,
                    value: 8500000,
                    rent: 6800,
                    bedrooms: 2,
                    bathrooms: 1,
                    size: 95,
                    yearBuilt: 2019,
                    description: 'Mixed-use property with residential units and ground floor retail.',
                    amenities: ['Garden', 'Parking', 'Security', 'Retail Space'],
                    status: 'active',
                    createdAt: '2023-01-25T16:45:00.000Z',
                    updatedAt: '2023-01-25T16:45:00.000Z'
                },
                {
                    id: '5',
                    name: 'Lake View Estate',
                    address: '202 Lake Dr',
                    city: 'Stellenbosch',
                    postalCode: '7600',
                    type: 'residential',
                    units: 5,
                    occupiedUnits: 3,
                    value: 5200000,
                    rent: 7800,
                    bedrooms: 3,
                    bathrooms: 2,
                    size: 200,
                    yearBuilt: 2016,
                    description: 'Luxury lakeside estate with private amenities.',
                    amenities: ['Lake Access', 'Pool', 'Tennis Court', 'Security'],
                    status: 'maintenance',
                    createdAt: '2022-09-05T11:20:00.000Z',
                    updatedAt: '2023-06-10T13:00:00.000Z'
                },
                {
                    id: '6',
                    name: 'Tech Park Offices',
                    address: '303 Innovation Ave',
                    city: 'Sandton',
                    postalCode: '2146',
                    type: 'commercial',
                    units: 15,
                    occupiedUnits: 12,
                    value: 18000000,
                    rent: 8500,
                    bedrooms: 0,
                    bathrooms: 1,
                    size: 100,
                    yearBuilt: 2021,
                    description: 'Modern office spaces in technology park with fiber connectivity.',
                    amenities: ['Fiber Internet', 'Parking', 'Cafeteria', 'Meeting Rooms'],
                    status: 'active',
                    createdAt: '2023-02-28T15:10:00.000Z',
                    updatedAt: '2023-02-28T15:10:00.000Z'
                },
                {
                    id: '7',
                    name: 'University Apartments',
                    address: '404 Student St',
                    city: 'Grahamstown',
                    postalCode: '6139',
                    type: 'residential',
                    units: 10,
                    occupiedUnits: 4,
                    value: 6500000,
                    rent: 4500,
                    bedrooms: 1,
                    bathrooms: 1,
                    size: 45,
                    yearBuilt: 2017,
                    description: 'Student accommodation near university campus.',
                    amenities: ['Study Room', 'Laundry', 'WiFi', 'Security'],
                    status: 'vacant',
                    createdAt: '2022-12-15T08:30:00.000Z',
                    updatedAt: '2023-05-20T10:15:00.000Z'
                },
                {
                    id: '8',
                    name: 'Heritage Building',
                    address: '505 Historic Rd',
                    city: 'Port Elizabeth',
                    postalCode: '6001',
                    type: 'mixed',
                    units: 6,
                    occupiedUnits: 5,
                    value: 9500000,
                    rent: 6200,
                    bedrooms: 2,
                    bathrooms: 1,
                    size: 150,
                    yearBuilt: 1930,
                    description: 'Restored heritage building with character and modern amenities.',
                    amenities: ['Heritage Features', 'Parking', 'Security', 'Restored'],
                    status: 'inactive',
                    createdAt: '2022-08-12T09:45:00.000Z',
                    updatedAt: '2023-04-05T14:20:00.000Z'
                }
            ];
            this.saveToLocalStorage();
            console.log('í³¦ Loaded sample properties');
        }
    }
    
    setupEventListeners() {
        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
        
        // Search functionality
        const searchInputs = ['propertySearch', 'advancedSearch'];
        searchInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', (e) => {
                    this.searchTerm = e.target.value.toLowerCase();
                    this.renderProperties();
                });
            }
        });
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.getAttribute('data-filter');
                this.renderProperties();
            });
        });
        
        // Add property button
        const addBtn = document.getElementById('addPropertyBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openAddPropertyModal());
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
        const editPropertyBtn = document.getElementById('editPropertyBtn');
        const savePropertyBtn = document.getElementById('savePropertyBtn');
        const deletePropertyBtn = document.getElementById('deletePropertyBtn');
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                document.getElementById('propertyDetailModal').style.display = 'none';
            });
        }
        
        if (closeFormBtn) {
            closeFormBtn.addEventListener('click', () => {
                document.getElementById('propertyFormModal').style.display = 'none';
            });
        }
        
        if (cancelFormBtn) {
            cancelFormBtn.addEventListener('click', () => {
                document.getElementById('propertyFormModal').style.display = 'none';
            });
        }
        
        if (submitFormBtn) {
            submitFormBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitPropertyForm();
            });
        }
        
        if (editPropertyBtn) {
            editPropertyBtn.addEventListener('click', () => {
                this.enableEditMode();
            });
        }
        
        if (savePropertyBtn) {
            savePropertyBtn.addEventListener('click', () => {
                this.saveEditMode();
            });
        }
        
        if (deletePropertyBtn) {
            deletePropertyBtn.addEventListener('click', () => {
                this.deleteCurrentProperty();
            });
        }
        
        // Close modals on outside click
        window.addEventListener('click', (e) => {
            const modals = ['propertyDetailModal', 'propertyFormModal'];
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });
    }
    
    renderProperties() {
        const container = document.getElementById('propertiesContainer');
        if (!container) return;
        
        let filtered = this.properties;
        
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(p => p.type === this.currentFilter);
        }
        
        if (this.searchTerm) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(this.searchTerm) ||
                p.address.toLowerCase().includes(this.searchTerm) ||
                p.city.toLowerCase().includes(this.searchTerm) ||
                p.description.toLowerCase().includes(this.searchTerm)
            );
        }
        
        if (filtered.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }
        
        const html = filtered.map(property => this.renderPropertyCard(property)).join('');
        container.innerHTML = html;
        
        // Add event listeners to property cards
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const propertyId = e.currentTarget.getAttribute('data-id');
                this.viewProperty(propertyId);
            });
        });
        
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const propertyId = e.currentTarget.getAttribute('data-id');
                this.editProperty(propertyId);
            });
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const propertyId = e.currentTarget.getAttribute('data-id');
                this.deleteProperty(propertyId);
            });
        });
    }
    
    renderPropertyCard(property) {
        const vacancyRate = property.units > 0 ? 
            Math.round(((property.units - (property.occupiedUnits || 0)) / property.units) * 100) : 0;
        
        const icons = {
            residential: 'fas fa-home',
            commercial: 'fas fa-building',
            mixed: 'fas fa-store-alt'
        };
        
        const typeLabels = {
            residential: 'Residential',
            commercial: 'Commercial',
            mixed: 'Mixed Use'
        };
        
        return `
            <div class="property-card">
                <div class="property-image">
                    <i class="${icons[property.type] || 'fas fa-home'}"></i>
                    <span class="property-status status-${property.status}">
                        ${property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </span>
                </div>
                <div class="property-content">
                    <h3 class="property-title">${property.name}</h3>
                    <div class="property-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${property.address}, ${property.city}</span>
                    </div>
                    
                    <div class="property-stats">
                        <div class="property-stat">
                            <div class="stat-number">${property.units}</div>
                            <div class="stat-label">Units</div>
                        </div>
                        <div class="property-stat">
                            <div class="stat-number">${property.occupiedUnits || 0}</div>
                            <div class="stat-label">Occupied</div>
                        </div>
                        <div class="property-stat">
                            <div class="stat-number">${vacancyRate}%</div>
                            <div class="stat-label">Vacancy</div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <span class="property-type-badge" style="
                            background: rgba(255, 255, 255, 0.1);
                            padding: 5px 10px;
                            border-radius: 15px;
                            font-size: 12px;
                            font-weight: 500;
                        ">
                            ${typeLabels[property.type] || property.type}
                        </span>
                        <span style="
                            background: rgba(255, 255, 255, 0.1);
                            padding: 5px 10px;
                            border-radius: 15px;
                            font-size: 12px;
                            font-weight: 500;
                            margin-left: 8px;
                        ">
                            R${property.value.toLocaleString('en-ZA')}
                        </span>
                    </div>
                    
                    <div class="property-actions">
                        <button class="property-btn btn-view" data-id="${property.id}">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="property-btn btn-edit" data-id="${property.id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="property-btn btn-delete" data-id="${property.id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    viewProperty(propertyId) {
        const property = this.properties.find(p => p.id === propertyId);
        if (!property) return;
        
        const modal = document.getElementById('propertyDetailModal');
        const modalBody = document.getElementById('modalBody');
        const modalTitle = document.getElementById('modalTitle');
        const saveBtn = document.getElementById('savePropertyBtn');
        
        modalTitle.textContent = property.name;
        saveBtn.style.display = 'none';
        
        const createdAt = new Date(property.createdAt).toLocaleDateString('en-ZA');
        const updatedAt = new Date(property.updatedAt).toLocaleDateString('en-ZA');
        const vacancyRate = property.units > 0 ? 
            Math.round(((property.units - (property.occupiedUnits || 0)) / property.units) * 100) : 0;
        
        const typeLabels = {
            residential: 'Residential',
            commercial: 'Commercial',
            mixed: 'Mixed Use'
        };
        
        const statusLabels = {
            active: 'Active',
            inactive: 'Inactive',
            maintenance: 'Under Maintenance',
            vacant: 'Vacant'
        };
        
        modalBody.innerHTML = `
            <div class="detail-grid">
                <div class="detail-item">
                    <label>Address</label>
                    <p>${property.address}</p>
                </div>
                <div class="detail-item">
                    <label>City</label>
                    <p>${property.city}</p>
                </div>
                <div class="detail-item">
                    <label>Postal Code</label>
                    <p>${property.postalCode || 'N/A'}</p>
                </div>
                <div class="detail-item">
                    <label>Property Type</label>
                    <p>${typeLabels[property.type] || property.type}</p>
                </div>
                <div class="detail-item">
                    <label>Total Units</label>
                    <p>${property.units}</p>
                </div>
                <div class="detail-item">
                    <label>Occupied Units</label>
                    <p>${property.occupiedUnits || 0}</p>
                </div>
                <div class="detail-item">
                    <label>Vacancy Rate</label>
                    <p>${vacancyRate}%</p>
                </div>
                <div class="detail-item">
                    <label>Property Value</label>
                    <p>R${property.value.toLocaleString('en-ZA')}</p>
                </div>
                <div class="detail-item">
                    <label>Monthly Rent</label>
                    <p>${property.rent ? 'R' + property.rent.toLocaleString('en-ZA') : 'N/A'}</p>
                </div>
                <div class="detail-item">
                    <label>Bedrooms</label>
                    <p>${property.bedrooms || 'N/A'}</p>
                </div>
                <div class="detail-item">
                    <label>Bathrooms</label>
                    <p>${property.bathrooms || 'N/A'}</p>
                </div>
                <div class="detail-item">
                    <label>Size</label>
                    <p>${property.size ? property.size + ' sqm' : 'N/A'}</p>
                </div>
                <div class="detail-item">
                    <label>Year Built</label>
                    <p>${property.yearBuilt || 'N/A'}</p>
                </div>
                <div class="detail-item">
                    <label>Status</label>
                    <p><span class="property-status status-${property.status}">
                        ${statusLabels[property.status] || property.status}
                    </span></p>
                </div>
                <div class="detail-item">
                    <label>Created</label>
                    <p>${createdAt}</p>
                </div>
                <div class="detail-item">
                    <label>Last Updated</label>
                    <p>${updatedAt}</p>
                </div>
            </div>
            
            ${property.description ? `
            <div style="margin-top: 20px;">
                <h4 style="color: white; margin-bottom: 10px;">Description</h4>
                <div class="detail-item">
                    <p>${property.description}</p>
                </div>
            </div>
            ` : ''}
            
            ${property.amenities && property.amenities.length > 0 ? `
            <div style="margin-top: 20px;">
                <h4 style="color: white; margin-bottom: 10px;">Amenities</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${property.amenities.map(amenity => `
                        <span style="
                            background: rgba(255, 255, 255, 0.1);
                            padding: 5px 10px;
                            border-radius: 15px;
                            font-size: 12px;
                        ">
                            ${amenity}
                        </span>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;
        
        modal.setAttribute('data-property-id', propertyId);
        modal.style.display = 'flex';
    }
    
    enableEditMode() {
        const modal = document.getElementById('propertyDetailModal');
        const modalBody = document.getElementById('modalBody');
        const saveBtn = document.getElementById('savePropertyBtn');
        const editBtn = document.getElementById('editPropertyBtn');
        
        const propertyId = modal.getAttribute('data-property-id');
        const property = this.properties.find(p => p.id === propertyId);
        if (!property) return;
        
        // Replace static text with editable inputs
        modalBody.innerHTML = `
            <form id="editPropertyForm">
                <div class="form-group">
                    <label for="editName">Property Name</label>
                    <input type="text" id="editName" value="${property.name}" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="editAddress">Address</label>
                    <input type="text" id="editAddress" value="${property.address}" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="editCity">City</label>
                    <input type="text" id="editCity" value="${property.city}" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="editPostalCode">Postal Code</label>
                    <input type="text" id="editPostalCode" value="${property.postalCode || ''}" class="form-control">
                </div>
                <div class="form-group">
                    <label for="editType">Property Type</label>
                    <select id="editType" class="form-control" required>
                        <option value="residential" ${property.type === 'residential' ? 'selected' : ''}>Residential</option>
                        <option value="commercial" ${property.type === 'commercial' ? 'selected' : ''}>Commercial</option>
                        <option value="mixed" ${property.type === 'mixed' ? 'selected' : ''}>Mixed Use</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editUnits">Total Units</label>
                    <input type="number" id="editUnits" value="${property.units}" class="form-control" min="1" required>
                </div>
                <div class="form-group">
                    <label for="editOccupiedUnits">Occupied Units</label>
                    <input type="number" id="editOccupiedUnits" value="${property.occupiedUnits || 0}" class="form-control" min="0" max="${property.units}">
                </div>
                <div class="form-group">
                    <label for="editValue">Property Value (R)</label>
                    <input type="number" id="editValue" value="${property.value}" class="form-control" min="0" step="0.01" required>
                </div>
                <div class="form-group">
                    <label for="editRent">Monthly Rent (R)</label>
                    <input type="number" id="editRent" value="${property.rent || ''}" class="form-control" min="0" step="0.01">
                </div>
                <div class="form-group">
                    <label for="editStatus">Status</label>
                    <select id="editStatus" class="form-control" required>
                        <option value="active" ${property.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${property.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                        <option value="maintenance" ${property.status === 'maintenance' ? 'selected' : ''}>Under Maintenance</option>
                        <option value="vacant" ${property.status === 'vacant' ? 'selected' : ''}>Vacant</option>
                    </select>
                </div>
            </form>
        `;
        
        editBtn.style.display = 'none';
        saveBtn.style.display = 'flex';
    }
    
    saveEditMode() {
        const modal = document.getElementById('propertyDetailModal');
        const saveBtn = document.getElementById('savePropertyBtn');
        const editBtn = document.getElementById('editPropertyBtn');
        const propertyId = modal.getAttribute('data-property-id');
        const propertyIndex = this.properties.findIndex(p => p.id === propertyId);
        
        if (propertyIndex === -1) return;
        
        const updatedProperty = {
            ...this.properties[propertyIndex],
            name: document.getElementById('editName').value,
            address: document.getElementById('editAddress').value,
            city: document.getElementById('editCity').value,
            postalCode: document.getElementById('editPostalCode').value || undefined,
            type: document.getElementById('editType').value,
            units: parseInt(document.getElementById('editUnits').value),
            occupiedUnits: parseInt(document.getElementById('editOccupiedUnits').value) || 0,
            value: parseFloat(document.getElementById('editValue').value),
            rent: document.getElementById('editRent').value ? parseFloat(document.getElementById('editRent').value) : undefined,
            status: document.getElementById('editStatus').value,
            updatedAt: new Date().toISOString()
        };
        
        this.properties[propertyIndex] = updatedProperty;
        this.saveToLocalStorage();
        
        this.showNotification('Property updated successfully!', 'success');
        this.renderProperties();
        this.updateStats();
        this.updateNavCount();
        
        // Switch back to view mode
        editBtn.style.display = 'flex';
        saveBtn.style.display = 'none';
        this.viewProperty(propertyId);
    }
    
    deleteCurrentProperty() {
        const modal = document.getElementById('propertyDetailModal');
        const propertyId = modal.getAttribute('data-property-id');
        
        if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
            this.deleteProperty(propertyId);
            modal.style.display = 'none';
        }
    }
    
    deleteProperty(propertyId) {
        if (confirm('Are you sure you want to delete this property?')) {
            this.properties = this.properties.filter(p => p.id !== propertyId);
            this.saveToLocalStorage();
            this.showNotification('Property deleted successfully!', 'success');
            this.renderProperties();
            this.updateStats();
            this.updateNavCount();
        }
    }
    
    editProperty(propertyId) {
        const property = this.properties.find(p => p.id === propertyId);
        if (!property) return;
        
        const modal = document.getElementById('propertyFormModal');
        const formTitle = document.getElementById('formModalTitle');
        const form = document.getElementById('propertyForm');
        
        formTitle.textContent = 'Edit Property';
        
        document.getElementById('propertyName').value = property.name;
        document.getElementById('propertyAddress').value = property.address;
        document.getElementById('propertyCity').value = property.city;
        document.getElementById('propertyPostalCode').value = property.postalCode || '';
        document.getElementById('propertyType').value = property.type;
        document.getElementById('propertyUnits').value = property.units;
        document.getElementById('propertyValue').value = property.value;
        document.getElementById('propertyRent').value = property.rent || '';
        document.getElementById('propertyBedrooms').value = property.bedrooms || '';
        document.getElementById('propertyBathrooms').value = property.bathrooms || '';
        document.getElementById('propertySize').value = property.size || '';
        document.getElementById('propertyYearBuilt').value = property.yearBuilt || '';
        document.getElementById('propertyDescription').value = property.description || '';
        document.getElementById('propertyAmenities').value = property.amenities ? property.amenities.join(', ') : '';
        document.getElementById('propertyStatus').value = property.status;
        
        form.setAttribute('data-property-id', propertyId);
        modal.style.display = 'flex';
    }
    
    openAddPropertyModal() {
        const modal = document.getElementById('propertyFormModal');
        const formTitle = document.getElementById('formModalTitle');
        const form = document.getElementById('propertyForm');
        
        formTitle.textContent = 'Add New Property';
        form.reset();
        form.removeAttribute('data-property-id');
        
        // Set default values
        document.getElementById('propertyUnits').value = 1;
        document.getElementById('propertyStatus').value = 'active';
        
        modal.style.display = 'flex';
    }
    
    submitPropertyForm() {
        const form = document.getElementById('propertyForm');
        const propertyId = form.getAttribute('data-property-id');
        
        const amenities = document.getElementById('propertyAmenities').value
            ? document.getElementById('propertyAmenities').value.split(',').map(a => a.trim()).filter(a => a)
            : [];
        
        const propertyData = {
            id: propertyId || Date.now().toString(),
            name: document.getElementById('propertyName').value,
            address: document.getElementById('propertyAddress').value,
            city: document.getElementById('propertyCity').value,
            postalCode: document.getElementById('propertyPostalCode').value || undefined,
            type: document.getElementById('propertyType').value,
            units: parseInt(document.getElementById('propertyUnits').value),
            occupiedUnits: 0, // Default to 0 for new properties
            value: parseFloat(document.getElementById('propertyValue').value),
            rent: document.getElementById('propertyRent').value ? parseFloat(document.getElementById('propertyRent').value) : undefined,
            bedrooms: document.getElementById('propertyBedrooms').value ? parseInt(document.getElementById('propertyBedrooms').value) : undefined,
            bathrooms: document.getElementById('propertyBathrooms').value ? parseFloat(document.getElementById('propertyBathrooms').value) : undefined,
            size: document.getElementById('propertySize').value ? parseFloat(document.getElementById('propertySize').value) : undefined,
            yearBuilt: document.getElementById('propertyYearBuilt').value ? parseInt(document.getElementById('propertyYearBuilt').value) : undefined,
            description: document.getElementById('propertyDescription').value || undefined,
            amenities: amenities.length > 0 ? amenities : undefined,
            status: document.getElementById('propertyStatus').value,
            createdAt: propertyId ? this.properties.find(p => p.id === propertyId)?.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        try {
            // Try to save to API
            try {
                const method = propertyId ? 'PUT' : 'POST';
                const url = propertyId ? `/api/properties/${propertyId}` : '/api/properties';
                
                fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(propertyData)
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
            if (propertyId) {
                const index = this.properties.findIndex(p => p.id === propertyId);
                if (index !== -1) {
                    this.properties[index] = propertyData;
                    this.showNotification('Property updated successfully!', 'success');
                }
            } else {
                this.properties.push(propertyData);
                this.showNotification('Property added successfully!', 'success');
            }
            
            this.saveToLocalStorage();
            this.renderProperties();
            this.updateStats();
            this.updateNavCount();
            
            document.getElementById('propertyFormModal').style.display = 'none';
            
        } catch (error) {
            console.error('Error saving property:', error);
            this.showNotification('Failed to save property. Please try again.', 'error');
        }
    }
    
    updateStats() {
        const totalProperties = this.properties.length;
        const totalUnits = this.properties.reduce((sum, p) => sum + p.units, 0);
        const occupiedUnits = this.properties.reduce((sum, p) => sum + (p.occupiedUnits || 0), 0);
        const vacancyRate = totalUnits > 0 ? Math.round(((totalUnits - occupiedUnits) / totalUnits) * 100) : 0;
        
        document.getElementById('totalPropertiesCount').textContent = totalProperties;
        document.getElementById('totalUnitsCount').textContent = totalUnits;
        document.getElementById('occupiedUnitsCount').textContent = occupiedUnits;
        document.getElementById('vacancyRateCount').textContent = vacancyRate + '%';
    }
    
    updateNavCount() {
        const navBadge = document.getElementById('propertiesNavCount');
        if (navBadge) {
            navBadge.textContent = this.properties.length;
        }
    }
    
    renderEmptyState() {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-building"></i>
                </div>
                <h3 class="empty-state-title">No Properties Found</h3>
                <p class="empty-state-text">
                    ${this.searchTerm ? 'No properties match your search criteria.' : 'Start by adding your first property.'}
                </p>
                ${!this.searchTerm ? `
                <button class="property-btn property-btn-primary" onclick="propertiesManager.openAddPropertyModal()" style="margin-top: 20px;">
                    <i class="fas fa-plus"></i> Add First Property
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
        localStorage.setItem('rentala_properties', JSON.stringify(this.properties));
    }
    
    logout() {
        localStorage.removeItem('rentala_properties');
        this.showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    window.propertiesManager = new PropertiesManager();
    console.log('âœ… Properties Platform Ready!');
});
