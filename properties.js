// Rentala Properties Management System
// Exact design implementation with backend API integration

// API Configuration
const API_BASE_URL = 'http://localhost:3002';
const API_PROPERTIES = `${API_BASE_URL}/api/properties`;

// Global State
let allProperties = [];
let currentPropertyId = null;
let currentFilter = 'all';
let searchQuery = '';

// DOM Elements
const elements = {
    // Navigation
    sidebar: document.getElementById('sidebar'),
    menuToggle: document.getElementById('menuToggle'),
    logoutBtn: document.getElementById('logoutBtn'),
    
    // Stats Cards
    totalPropertiesCount: document.getElementById('totalPropertiesCount'),
    totalUnitsCount: document.getElementById('totalUnitsCount'),
    occupiedUnitsCount: document.getElementById('occupiedUnitsCount'),
    vacancyRateCount: document.getElementById('vacancyRateCount'),
    propertiesNavCount: document.getElementById('propertiesNavCount'),
    
    // Controls
    propertySearch: document.getElementById('propertySearch'),
    advancedSearch: document.getElementById('advancedSearch'),
    filterButtons: document.querySelectorAll('.filter-btn'),
    addPropertyBtn: document.getElementById('addPropertyBtn'),
    
    // Properties Grid
    propertiesContainer: document.getElementById('propertiesContainer'),
    
    // Modals
    propertyDetailModal: document.getElementById('propertyDetailModal'),
    propertyFormModal: document.getElementById('propertyFormModal'),
    
    // Detail Modal Elements
    closeModalBtn: document.getElementById('closeModalBtn'),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody'),
    editPropertyBtn: document.getElementById('editPropertyBtn'),
    savePropertyBtn: document.getElementById('savePropertyBtn'),
    deletePropertyBtn: document.getElementById('deletePropertyBtn'),
    
    // Form Modal Elements
    closeFormModalBtn: document.getElementById('closeFormModalBtn'),
    formModalTitle: document.getElementById('formModalTitle'),
    propertyForm: document.getElementById('propertyForm'),
    cancelFormBtn: document.getElementById('cancelFormBtn'),
    submitFormBtn: document.getElementById('submitFormBtn'),
    
    // Form Fields
    propertyName: document.getElementById('propertyName'),
    propertyAddress: document.getElementById('propertyAddress'),
    propertyCity: document.getElementById('propertyCity'),
    propertyPostalCode: document.getElementById('propertyPostalCode'),
    propertyType: document.getElementById('propertyType'),
    propertyUnits: document.getElementById('propertyUnits'),
    propertyValue: document.getElementById('propertyValue'),
    propertyDescription: document.getElementById('propertyDescription'),
    propertyStatus: document.getElementById('propertyStatus')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Rentala Properties Management System Initializing...');
    
    // Setup auto login for demo
    setupAutoLogin();
    
    // Load properties from backend
    loadProperties();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup search with debounce
    setupSearch();
    
    console.log('Application initialized successfully.');
});

// Auto login for demo purposes
function setupAutoLogin() {
    // Check if we're in development/demo environment
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    const hasDemoParam = window.location.search.includes('demo=true');
    
    if (isLocalhost || hasDemoParam) {
        // Create demo user session if not exists
        if (!localStorage.getItem('authToken')) {
            const demoUser = {
                id: 1,
                name: 'John Smith',
                email: 'demo@rentala.com',
                role: 'admin',
                avatar: 'JS'
            };
            
            localStorage.setItem('authToken', 'demo-token-' + Date.now());
            localStorage.setItem('user', JSON.stringify(demoUser));
            
            console.log('Demo session created for:', demoUser.name);
        }
        
        // Update profile display
        updateProfileDisplay();
    } else {
        // Check for existing auth
        checkAuthentication();
    }
}

// Update profile display in header
function updateProfileDisplay() {
    try {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const avatar = document.querySelector('.top-profile-avatar');
        const name = document.querySelector('.top-profile-name');
        
        if (avatar && userData.avatar) {
            avatar.textContent = userData.avatar;
        }
        
        if (name && userData.name) {
            name.textContent = userData.name;
        }
    } catch (error) {
        console.log('No user data to display');
    }
}

// Basic authentication check (non-blocking for demo)
function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        console.log('No authentication found. Continuing in demo mode.');
        
        // For demo, create a temporary session
        const demoUser = {
            id: 0,
            name: 'Guest User',
            email: 'guest@rentala.com',
            role: 'viewer',
            avatar: 'GU'
        };
        
        localStorage.setItem('authToken', 'guest-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify(demoUser));
        
        updateProfileDisplay();
    } else {
        updateProfileDisplay();
    }
    
    return true;
}

// Load properties from backend API
async function loadProperties() {
    showLoading();
    
    try {
        console.log('Fetching properties from:', API_PROPERTIES);
        const response = await fetch(API_PROPERTIES);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const properties = await response.json();
        console.log(`Loaded ${properties.length} properties from API`);
        
        // Transform API data to match our exact format
        allProperties = transformBackendToFrontend(properties);
        
        // Add mock data if no properties returned
        if (allProperties.length === 0) {
            console.log('No properties found, creating mock data...');
            allProperties = createMockProperties();
        }
        
        updateStats();
        renderProperties();
        showNotification('Properties loaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error loading properties:', error);
        
        // Fallback to mock data if API fails
        console.log('Using mock data due to API error');
        allProperties = createMockProperties();
        updateStats();
        renderProperties();
        showNotification('Using demo data. Backend may be unavailable.', 'warning');
    }
}

// Transform backend format to frontend exact format
function transformBackendToFrontend(backendProperties) {
    return backendProperties.map(property => {
        // Parse address to get street and city
        const addressParts = property.address ? property.address.split(', ') : ['Unknown Address', 'Unknown City'];
        const streetAddress = addressParts[0];
        const city = addressParts.length > 1 ? addressParts[1] : 'Unknown City';
        
        // Determine property type mapping
        const typeMapping = {
            'apartment': 'residential',
            'house': 'residential',
            'commercial': 'commercial',
            'office': 'commercial',
            'mixed': 'mixed'
        };
        
        const propertyType = typeMapping[property.type.toLowerCase()] || 'residential';
        
        // Determine status mapping
        const statusMapping = {
            'available': 'vacant',
            'occupied': 'occupied',
            'maintenance': 'vacant'
        };
        
        const propertyStatus = statusMapping[property.status.toLowerCase()] || 'vacant';
        
        // Generate a name if not provided
        const propertyName = `Property ${property.id}`;
        
        // Calculate units based on type (for demo purposes)
        const propertyUnits = propertyType === 'residential' ? Math.floor(Math.random() * 10) + 1 : 
                             propertyType === 'commercial' ? Math.floor(Math.random() * 5) + 1 : 3;
        
        // Calculate value based on rent (for demo purposes)
        const propertyValue = property.rent ? property.rent * 100 : 1000000;
        
        return {
            id: property.id,
            name: propertyName,
            address: streetAddress,
            city: city,
            postalCode: getPostalCode(city),
            type: propertyType,
            units: propertyUnits,
            value: propertyValue,
            description: `${property.type} property located in ${property.address}`,
            status: propertyStatus,
            createdAt: property.createdAt || new Date().toISOString().split('T')[0],
            rent: property.rent || propertyValue / 100
        };
    });
}

// Helper function to get postal code
function getPostalCode(city) {
    const postalCodes = {
        'Johannesburg': '2000',
        'Sandton': '2196',
        'Pretoria': '0002',
        'Cape Town': '8001',
        'Durban': '4001',
        'Unknown City': '0000'
    };
    return postalCodes[city] || '0000';
}

// Create mock properties in exact format
function createMockProperties() {
    const mockProperties = [
        {
            id: 1,
            name: "Sunset Apartments",
            address: "123 Main Street",
            city: "Johannesburg",
            postalCode: "2000",
            type: "residential",
            units: 12,
            value: 12500000,
            description: "Modern apartment complex with swimming pool and gym facilities. Ideal for young professionals and small families.",
            status: "occupied",
            createdAt: "2024-01-15",
            rent: 8500
        },
        {
            id: 2,
            name: "CBD Office Tower",
            address: "456 Business Avenue",
            city: "Sandton",
            postalCode: "2196",
            type: "commercial",
            units: 8,
            value: 35000000,
            description: "Premium office space in Sandton CBD with high-speed internet, conference rooms, and 24/7 security.",
            status: "vacant",
            createdAt: "2024-02-10",
            rent: 25000
        },
        {
            id: 3,
            name: "Garden View Complex",
            address: "789 Park Lane",
            city: "Pretoria",
            postalCode: "0002",
            type: "residential",
            units: 24,
            value: 18000000,
            description: "Family-friendly complex with beautiful gardens, playground, and community center. Perfect for families.",
            status: "occupied",
            createdAt: "2024-01-20",
            rent: 7500
        },
        {
            id: 4,
            name: "Retail Mall",
            address: "321 Shopping Street",
            city: "Cape Town",
            postalCode: "8001",
            type: "commercial",
            units: 15,
            value: 50000000,
            description: "Large retail space with multiple tenant spaces, ample parking, and high foot traffic location.",
            status: "vacant",
            createdAt: "2024-03-05",
            rent: 45000
        },
        {
            id: 5,
            name: "Mixed-Use Development",
            address: "654 Urban Boulevard",
            city: "Durban",
            postalCode: "4001",
            type: "mixed",
            units: 20,
            value: 28000000,
            description: "Combined residential and commercial spaces with retail on ground floor and apartments above.",
            status: "occupied",
            createdAt: "2024-02-28",
            rent: 12000
        },
        {
            id: 6,
            name: "Luxury Villa Estate",
            address: "987 Estate Road",
            city: "Johannesburg",
            postalCode: "2191",
            type: "residential",
            units: 1,
            value: 15000000,
            description: "Exclusive standalone villa with private pool, garden, and security. Premium location.",
            status: "occupied",
            createdAt: "2024-01-10",
            rent: 35000
        }
    ];
    
    return mockProperties;
}

// Update statistics cards
function updateStats() {
    const totalProperties = allProperties.length;
    const totalUnits = allProperties.reduce((sum, prop) => sum + prop.units, 0);
    const occupiedUnits = allProperties.filter(prop => prop.status === 'occupied').length;
    const vacancyRate = totalUnits > 0 ? Math.round(((totalUnits - occupiedUnits) / totalUnits) * 100) : 0;
    
    if (elements.totalPropertiesCount) {
        elements.totalPropertiesCount.textContent = totalProperties;
        elements.totalUnitsCount.textContent = totalUnits;
        elements.occupiedUnitsCount.textContent = occupiedUnits;
        elements.vacancyRateCount.textContent = `${vacancyRate}%`;
    }
    
    if (elements.propertiesNavCount) {
        elements.propertiesNavCount.textContent = totalProperties;
    }
    
    console.log(`Stats updated: ${totalProperties} properties, ${totalUnits} units, ${occupiedUnits} occupied, ${vacancyRate}% vacancy`);
}

// Render properties grid in exact format
function renderProperties() {
    const filteredProperties = getFilteredProperties();
    
    if (filteredProperties.length === 0) {
        elements.propertiesContainer.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-building" style="font-size: 3rem; color: rgba(255, 255, 255, 0.2); margin-bottom: 20px;"></i>
                <h3 style="color: white; margin-bottom: 10px;">No Properties Found</h3>
                <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 20px;">
                    ${searchQuery ? 'Try a different search term' : 'Add your first property to get started'}
                </p>
                <button class="property-btn primary" id="addFirstPropertyBtn" style="margin-top: 20px;">
                    <i class="fas fa-plus"></i> Add Property
                </button>
            </div>
        `;
        
        document.getElementById('addFirstPropertyBtn')?.addEventListener('click', () => {
            showAddPropertyModal();
        });
        
        return;
    }
    
    const propertiesHTML = filteredProperties.map(property => `
        <div class="property-card" data-id="${property.id}">
            <div class="property-image">
                <div class="property-status ${property.status === 'occupied' ? 'status-occupied' : 'status-vacant'}">
                    ${property.status === 'occupied' ? 'Occupied' : 'Vacant'}
                </div>
            </div>
            <div class="property-content">
                <h3 class="property-title">${property.name}</h3>
                <div class="property-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${property.address}, ${property.city}
                </div>
                <div class="property-stats">
                    <div class="property-stat">
                        <div class="stat-number">${property.units}</div>
                        <div class="stat-label">Units</div>
                    </div>
                    <div class="property-stat">
                        <div class="stat-number">R ${formatNumber(property.value)}</div>
                        <div class="stat-label">Value</div>
                    </div>
                    <div class="property-stat">
                        <div class="stat-number">R ${formatNumber(property.rent)}</div>
                        <div class="stat-label">Rent</div>
                    </div>
                </div>
                <div class="property-actions">
                    <button class="property-btn view-btn" data-id="${property.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="property-btn edit-btn" data-id="${property.id}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="property-btn primary delete-btn" data-id="${property.id}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    elements.propertiesContainer.innerHTML = propertiesHTML;
    
    // Add event listeners to property cards
    document.querySelectorAll('.property-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.property-actions')) {
                const id = parseInt(card.dataset.id);
                showPropertyDetail(id);
            }
        });
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            showPropertyDetail(id);
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            showEditPropertyModal(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            confirmDeleteProperty(id);
        });
    });
}

// Helper function to format numbers
function formatNumber(num) {
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

// Get filtered properties based on current filter and search
function getFilteredProperties() {
    let filtered = [...allProperties];
    
    // Apply type filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(property => property.type === currentFilter);
    }
    
    // Apply search filter
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(property => 
            property.name.toLowerCase().includes(query) ||
            property.address.toLowerCase().includes(query) ||
            property.city.toLowerCase().includes(query) ||
            property.type.toLowerCase().includes(query) ||
            property.description.toLowerCase().includes(query)
        );
    }
    
    return filtered;
}

// Show property detail modal
function showPropertyDetail(id) {
    const property = allProperties.find(p => p.id === id);
    if (!property) return;
    
    currentPropertyId = id;
    
    if (elements.modalTitle) {
        elements.modalTitle.textContent = property.name;
    }
    
    // Format property details for modal
    const propertyDetails = `
        <div class="property-detail-modal">
            <div class="property-status-badge ${property.status === 'occupied' ? 'status-occupied' : 'status-vacant'}" style="display: inline-block; margin-bottom: 20px;">
                ${property.status === 'occupied' ? 'Occupied' : 'Vacant'}
            </div>
            
            <div style="margin-bottom: 25px;">
                <div style="color: rgba(255, 255, 255, 0.8); margin-bottom: 5px;">Address</div>
                <div style="font-size: 16px; color: white; font-weight: 500;">
                    <i class="fas fa-map-marker-alt" style="margin-right: 8px; color: var(--accent);"></i>
                    ${property.address}, ${property.city} ${property.postalCode}
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 25px;">
                <div>
                    <div style="color: rgba(255, 255, 255, 0.8); margin-bottom: 5px; font-size: 14px;">Property Type</div>
                    <div style="color: white; font-weight: 500;">${property.type.charAt(0).toUpperCase() + property.type.slice(1)}</div>
                </div>
                <div>
                    <div style="color: rgba(255, 255, 255, 0.8); margin-bottom: 5px; font-size: 14px;">Units</div>
                    <div style="color: white; font-weight: 500;">${property.units}</div>
                </div>
                <div>
                    <div style="color: rgba(255, 255, 255, 0.8); margin-bottom: 5px; font-size: 14px;">Property Value</div>
                    <div style="color: white; font-weight: 500;">R ${formatNumber(property.value)}</div>
                </div>
                <div>
                    <div style="color: rgba(255, 255, 255, 0.8); margin-bottom: 5px; font-size: 14px;">Monthly Rent</div>
                    <div style="color: white; font-weight: 500;">R ${formatNumber(property.rent)}</div>
                </div>
            </div>
            
            <div>
                <div style="color: rgba(255, 255, 255, 0.8); margin-bottom: 10px; font-size: 14px;">Description</div>
                <div style="color: rgba(255, 255, 255, 0.9); line-height: 1.6; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 10px;">
                    ${property.description || 'No description available.'}
                </div>
            </div>
            
            <div style="margin-top: 20px; color: rgba(255, 255, 255, 0.6); font-size: 13px;">
                <i class="far fa-calendar" style="margin-right: 5px;"></i>
                Added on: ${property.createdAt}
            </div>
        </div>
    `;
    
    if (elements.modalBody) {
        elements.modalBody.innerHTML = propertyDetails;
    }
    
    showModal(elements.propertyDetailModal);
}

// Show add property modal
function showAddPropertyModal() {
    currentPropertyId = null;
    
    if (elements.formModalTitle) {
        elements.formModalTitle.textContent = 'Add New Property';
    }
    
    if (elements.propertyForm) {
        elements.propertyForm.reset();
        
        // Set default values
        elements.propertyStatus.value = 'active';
        elements.propertyType.value = 'residential';
        elements.propertyUnits.value = '1';
        elements.propertyValue.value = '1000000';
    }
    
    showModal(elements.propertyFormModal);
}

// Show edit property modal
function showEditPropertyModal(id) {
    const property = allProperties.find(p => p.id === id);
    if (!property) return;
    
    currentPropertyId = id;
    
    if (elements.formModalTitle) {
        elements.formModalTitle.textContent = 'Edit Property';
    }
    
    if (elements.propertyForm) {
        // Fill form with property data
        elements.propertyName.value = property.name;
        elements.propertyAddress.value = property.address;
        elements.propertyCity.value = property.city;
        elements.propertyPostalCode.value = property.postalCode || '';
        elements.propertyType.value = property.type;
        elements.propertyUnits.value = property.units;
        elements.propertyValue.value = property.value;
        elements.propertyDescription.value = property.description || '';
        elements.propertyStatus.value = property.status === 'occupied' ? 'active' : 'inactive';
    }
    
    showModal(elements.propertyFormModal);
}

// Save property (create or update)
async function saveProperty(formData) {
    try {
        const isEdit = currentPropertyId !== null;
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `${API_PROPERTIES}/${currentPropertyId}` : API_PROPERTIES;
        
        // Transform data to match backend format
        const backendData = {
            address: `${formData.get('address')}, ${formData.get('city')}`,
            type: formData.get('type'),
            rent: parseFloat(formData.get('value')) / 100,
            status: formData.get('status') === 'active' ? 'occupied' : 'available'
        };
        
        console.log(`Saving property to backend: ${method} ${url}`, backendData);
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(backendData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const savedProperty = await response.json();
        console.log('Property saved successfully:', savedProperty);
        
        // Update local state with exact format
        if (isEdit) {
            // Update existing property
            const index = allProperties.findIndex(p => p.id === currentPropertyId);
            if (index !== -1) {
                allProperties[index] = createPropertyObject(formData, currentPropertyId, allProperties[index].createdAt);
            }
        } else {
            // Add new property
            const newProperty = createPropertyObject(formData, savedProperty.id || Math.max(...allProperties.map(p => p.id)) + 1);
            allProperties.push(newProperty);
        }
        
        // Update UI
        updateStats();
        renderProperties();
        closeModal(elements.propertyFormModal);
        showNotification(`Property ${isEdit ? 'updated' : 'added'} successfully!`, 'success');
        
        return true;
        
    } catch (error) {
        console.error('Error saving property:', error);
        
        // Fallback to local update if API fails
        const isEdit = currentPropertyId !== null;
        
        if (isEdit) {
            // Update existing property locally
            const index = allProperties.findIndex(p => p.id === currentPropertyId);
            if (index !== -1) {
                allProperties[index] = createPropertyObject(formData, currentPropertyId, allProperties[index].createdAt);
            }
        } else {
            // Add new property locally
            const newId = Math.max(0, ...allProperties.map(p => p.id)) + 1;
            const newProperty = createPropertyObject(formData, newId);
            allProperties.push(newProperty);
        }
        
        // Update UI
        updateStats();
        renderProperties();
        closeModal(elements.propertyFormModal);
        showNotification('Property saved locally (backend offline)', 'warning');
        
        return true;
    }
}

// Helper to create property object in exact format
function createPropertyObject(formData, id, createdAt = null) {
    const name = formData.get('name');
    const address = formData.get('address');
    const city = formData.get('city');
    const postalCode = formData.get('postalCode');
    const type = formData.get('type');
    const units = parseInt(formData.get('units'));
    const value = parseFloat(formData.get('value'));
    const description = formData.get('description');
    const status = formData.get('status');
    
    return {
        id: id,
        name: name,
        address: address,
        city: city,
        postalCode: postalCode || getPostalCode(city),
        type: type,
        units: units,
        value: value,
        description: description || `${type} property located in ${address}, ${city}`,
        status: status === 'active' ? 'occupied' : 'vacant',
        createdAt: createdAt || new Date().toISOString().split('T')[0],
        rent: value / 100
    };
}

// Delete property
async function deleteProperty(id) {
    try {
        console.log(`Deleting property ${id} from backend`);
        
        const response = await fetch(`${API_PROPERTIES}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Remove from local state
        allProperties = allProperties.filter(p => p.id !== id);
        
        // Update UI
        updateStats();
        renderProperties();
        closeModal(elements.propertyDetailModal);
        showNotification('Property deleted successfully!', 'success');
        
    } catch (error) {
        console.error('Error deleting property:', error);
        
        // Fallback to local deletion if API fails
        allProperties = allProperties.filter(p => p.id !== id);
        
        // Update UI
        updateStats();
        renderProperties();
        closeModal(elements.propertyDetailModal);
        showNotification('Property deleted locally (backend offline)', 'warning');
    }
}

// Confirm property deletion
function confirmDeleteProperty(id) {
    const property = allProperties.find(p => p.id === id);
    if (!property) return;
    
    if (confirm(`Are you sure you want to delete "${property.name}"? This action cannot be undone.`)) {
        deleteProperty(id);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar toggle for mobile
    if (elements.menuToggle) {
        elements.menuToggle.addEventListener('click', () => {
            if (elements.sidebar) {
                elements.sidebar.classList.toggle('active');
            }
        });
    }
    
    // Logout
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to log out?')) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                window.location.href = 'login.html';
            }
        });
    }
    
    // Filter buttons
    if (elements.filterButtons) {
        elements.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                elements.filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                renderProperties();
            });
        });
    }
    
    // Add property button
    if (elements.addPropertyBtn) {
        elements.addPropertyBtn.addEventListener('click', showAddPropertyModal);
    }
    
    // Modal close buttons
    if (elements.closeModalBtn) {
        elements.closeModalBtn.addEventListener('click', () => closeModal(elements.propertyDetailModal));
    }
    
    if (elements.closeFormModalBtn) {
        elements.closeFormModalBtn.addEventListener('click', () => closeModal(elements.propertyFormModal));
    }
    
    if (elements.cancelFormBtn) {
        elements.cancelFormBtn.addEventListener('click', () => closeModal(elements.propertyFormModal));
    }
    
    // Detail modal actions
    if (elements.editPropertyBtn) {
        elements.editPropertyBtn.addEventListener('click', () => {
            if (currentPropertyId) {
                closeModal(elements.propertyDetailModal);
                setTimeout(() => showEditPropertyModal(currentPropertyId), 300);
            }
        });
    }
    
    if (elements.deletePropertyBtn) {
        elements.deletePropertyBtn.addEventListener('click', () => {
            if (currentPropertyId) {
                closeModal(elements.propertyDetailModal);
                setTimeout(() => confirmDeleteProperty(currentPropertyId), 300);
            }
        });
    }
    
    // Form submission
    if (elements.submitFormBtn) {
        elements.submitFormBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (elements.propertyForm && !elements.propertyForm.checkValidity()) {
                showNotification('Please fill in all required fields', 'error');
                return;
            }
            
            if (elements.propertyForm) {
                const formData = new FormData(elements.propertyForm);
                await saveProperty(formData);
            }
        });
    }
    
    // Close modals on background click
    window.addEventListener('click', (e) => {
        if (elements.propertyDetailModal && e.target === elements.propertyDetailModal) {
            closeModal(elements.propertyDetailModal);
        }
        if (elements.propertyFormModal && e.target === elements.propertyFormModal) {
            closeModal(elements.propertyFormModal);
        }
    });
    
    // Close modals on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (elements.propertyDetailModal && elements.propertyDetailModal.style.display !== 'none') {
                closeModal(elements.propertyDetailModal);
            }
            if (elements.propertyFormModal && elements.propertyFormModal.style.display !== 'none') {
                closeModal(elements.propertyFormModal);
            }
        }
    });
}

// Setup search with debounce
function setupSearch() {
    let searchTimeout;
    
    const performSearch = () => {
        const search1 = elements.propertySearch?.value || '';
        const search2 = elements.advancedSearch?.value || '';
        searchQuery = search1 || search2;
        renderProperties();
    };
    
    const debouncedSearch = () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 300);
    };
    
    if (elements.propertySearch) {
        elements.propertySearch.addEventListener('input', debouncedSearch);
    }
    
    if (elements.advancedSearch) {
        elements.advancedSearch.addEventListener('input', debouncedSearch);
    }
}

// Modal utilities
function showModal(modal) {
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Show loading state
function showLoading() {
    if (elements.propertiesContainer) {
        elements.propertiesContainer.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Loading properties...</p>
            </div>
        `;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationsContainer');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Add export/import functionality
function addExportButtons() {
    const controlsSection = document.querySelector('.controls-section');
    if (!controlsSection) return;
    
    // Check if export buttons already exist
    if (document.querySelector('.export-buttons')) return;
    
    const exportDiv = document.createElement('div');
    exportDiv.className = 'export-buttons';
    exportDiv.innerHTML = `
        <button class="property-btn" id="exportJsonBtn">
            <i class="fas fa-file-export"></i> Export JSON
        </button>
        <button class="property-btn" id="exportCsvBtn">
            <i class="fas fa-file-csv"></i> Export CSV
        </button>
    `;
    
    controlsSection.appendChild(exportDiv);
    
    // Add event listeners
    document.getElementById('exportJsonBtn')?.addEventListener('click', () => exportProperties('json'));
    document.getElementById('exportCsvBtn')?.addEventListener('click', () => exportProperties('csv'));
}

// Export properties
function exportProperties(format = 'json') {
    const filteredProperties = getFilteredProperties();
    
    if (filteredProperties.length === 0) {
        showNotification('No properties to export', 'warning');
        return;
    }
    
    let data, mimeType, fileName;
    
    switch(format) {
        case 'json':
            data = JSON.stringify(filteredProperties, null, 2);
            mimeType = 'application/json';
            fileName = `rentala-properties-${new Date().toISOString().split('T')[0]}.json`;
            break;
            
        case 'csv':
            const headers = ['Name', 'Address', 'City', 'Type', 'Units', 'Value', 'Rent', 'Status'];
            const csvRows = [
                headers.join(','),
                ...filteredProperties.map(p => 
                    [p.name, p.address, p.city, p.type, p.units, p.value, p.rent, p.status].join(',')
                )
            ];
            data = csvRows.join('\n');
            mimeType = 'text/csv';
            fileName = `rentala-properties-${new Date().toISOString().split('T')[0]}.csv`;
            break;
            
        default:
            showNotification('Invalid export format', 'error');
            return;
    }
    
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification(`Exported ${filteredProperties.length} properties`, 'success');
}

// Initialize export buttons
setTimeout(addExportButtons, 100);

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + N: New property
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        showAddPropertyModal();
    }
    
    // Ctrl/Cmd + F: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        elements.propertySearch?.focus();
    }
    
    // Escape: Close modals
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal[style*="display: flex"]');
        if (openModals.length > 0) {
            openModals.forEach(modal => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            });
        }
    }
});

// Make functions available globally for debugging
window.RentalaProperties = {
    loadProperties,
    showPropertyDetail,
    showAddPropertyModal,
    showEditPropertyModal,
    deleteProperty,
    getProperties: () => allProperties,
    getFilteredProperties,
    updateStats
};

console.log('Properties management system loaded successfully with exact design.');
