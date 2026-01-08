const express = require('express');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');
const TENANTS_FILE = path.join(DATA_DIR, 'tenants.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');

// Initialize data directory
async function initializeData() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        // Create properties file if it doesn't exist
        try {
            await fs.access(PROPERTIES_FILE);
        } catch {
            const initialProperties = [
                {
                    "id": "1",
                    "name": "Sunset Villa",
                    "address": "123 Beach Rd",
                    "city": "Cape Town",
                    "postalCode": "8001",
                    "type": "residential",
                    "units": 3,
                    "occupiedUnits": 2,
                    "value": 3500000,
                    "rent": 8500,
                    "bedrooms": 3,
                    "bathrooms": 2,
                    "size": 180,
                    "yearBuilt": 2018,
                    "description": "Beautiful beachfront property with stunning ocean views. Features modern amenities.",
                    "amenities": ["Pool", "Gym", "Parking", "Security"],
                    "status": "active",
                    "createdAt": "2023-05-15T10:00:00.000Z",
                    "updatedAt": "2023-05-15T10:00:00.000Z"
                },
                {
                    "id": "2",
                    "name": "Mountain View Apartments",
                    "address": "456 Hill St",
                    "city": "Johannesburg",
                    "postalCode": "2001",
                    "type": "residential",
                    "units": 12,
                    "occupiedUnits": 10,
                    "value": 12000000,
                    "rent": 7200,
                    "bedrooms": 2,
                    "bathrooms": 1,
                    "size": 85,
                    "yearBuilt": 2020,
                    "description": "Modern apartment complex with mountain views and communal facilities.",
                    "amenities": ["Gym", "Laundry", "Parking", "Elevator"],
                    "status": "active",
                    "createdAt": "2023-03-10T14:30:00.000Z",
                    "updatedAt": "2023-03-10T14:30:00.000Z"
                }
            ];
            await fs.writeFile(PROPERTIES_FILE, JSON.stringify(initialProperties, null, 2));
        }
        
        // Create tenants file if it doesn't exist
        try {
            await fs.access(TENANTS_FILE);
        } catch {
            const initialTenants = [
                {
                    "id": "1",
                    "name": "John Smith",
                    "email": "john@example.com",
                    "phone": "0712345678",
                    "propertyId": "1",
                    "propertyName": "Sunset Villa",
                    "rent": 8500,
                    "leaseStart": "2024-01-01",
                    "leaseEnd": "2024-12-31",
                    "status": "active",
                    "createdAt": "2024-01-01T10:00:00.000Z",
                    "updatedAt": "2024-01-01T10:00:00.000Z",
                    "payments": []
                }
            ];
            await fs.writeFile(TENANTS_FILE, JSON.stringify(initialTenants, null, 2));
        }
        
        // Create payments file if it doesn't exist
        try {
            await fs.access(PAYMENTS_FILE);
        } catch {
            const initialPayments = [
                {
                    "id": "1",
                    "tenantId": "1",
                    "tenantName": "John Smith",
                    "propertyId": "1",
                    "propertyName": "Sunset Villa",
                    "amount": 8500,
                    "date": "2024-01-15",
                    "method": "bank_transfer",
                    "status": "completed",
                    "reference": "TXN001234",
                    "notes": "Monthly rent payment",
                    "createdAt": "2024-01-15T10:00:00.000Z"
                }
            ];
            await fs.writeFile(PAYMENTS_FILE, JSON.stringify(initialPayments, null, 2));
        }
        
        console.log('‚úÖ Data files initialized');
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

// API Routes
app.get('/api/properties', async (req, res) => {
    try {
        const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.json([]);
    }
});

app.get('/api/tenants', async (req, res) => {
    try {
        const data = await fs.readFile(TENANTS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.json([]);
    }
});

app.get('/api/payments', async (req, res) => {
    try {
        const data = await fs.readFile(PAYMENTS_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.json([]);
    }
});

app.post('/api/properties', async (req, res) => {
    try {
        const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
        const properties = JSON.parse(data);
        
        const newProperty = {
            id: Date.now().toString(),
            ...req.body,
            occupiedUnits: req.body.occupiedUnits || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        properties.push(newProperty);
        await fs.writeFile(PROPERTIES_FILE, JSON.stringify(properties, null, 2));
        
        res.status(201).json(newProperty);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save property' });
    }
});

app.put('/api/properties/:id', async (req, res) => {
    try {
        const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
        let properties = JSON.parse(data);
        
        const index = properties.findIndex(p => p.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        properties[index] = {
            ...properties[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        await fs.writeFile(PROPERTIES_FILE, JSON.stringify(properties, null, 2));
        res.json(properties[index]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update property' });
    }
});

app.delete('/api/properties/:id', async (req, res) => {
    try {
        const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
        let properties = JSON.parse(data);
        
        properties = properties.filter(p => p.id !== req.params.id);
        await fs.writeFile(PROPERTIES_FILE, JSON.stringify(properties, null, 2));
        
        res.json({ message: 'Property deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete property' });
    }
});

// Statistics endpoints
app.get('/api/properties/stats/summary', async (req, res) => {
    try {
        const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
        const properties = JSON.parse(data);
        
        const totalProperties = properties.length;
        const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
        const occupiedUnits = properties.reduce((sum, p) => sum + (p.occupiedUnits || 0), 0);
        const vacancyRate = totalUnits > 0 ? ((totalUnits - occupiedUnits) / totalUnits) * 100 : 0;
        
        const totalValue = properties.reduce((sum, p) => sum + (p.value || 0), 0);
        const avgPropertyValue = totalProperties > 0 ? totalValue / totalProperties : 0;
        
        res.json({
            totalProperties,
            totalUnits,
            occupiedUnits,
            vacantUnits: totalUnits - occupiedUnits,
            vacancyRate: Math.round(vacancyRate * 100) / 100,
            totalValue,
            avgPropertyValue: Math.round(avgPropertyValue * 100) / 100
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Search endpoint
app.get('/api/properties/search/:query', async (req, res) => {
    try {
        const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
        const properties = JSON.parse(data);
        const query = req.params.query.toLowerCase();
        
        const filtered = properties.filter(p => 
            p.name.toLowerCase().includes(query) ||
            p.address.toLowerCase().includes(query) ||
            p.city.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query))
        );
        
        res.json(filtered);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search properties' });
    }
});

// Serve pages
app.get('/properties', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/properties.html'));
});

app.get('/tenants', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/tenants.html'));
});

app.get('/payments', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/payments.html'));
});

app.get('/', (req, res) => {
    res.redirect('/properties');
});

// Serve other pages
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

app.get('/maintenance', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/maintenance.html'));
});

app.get('/reports', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/reports.html'));
});

app.get('/analytics', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/analytics.html'));
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/settings.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/profile.html'));
});

// Start server
async function startServer() {
    await initializeData();
    
    app.listen(PORT, () => {
        console.log(`Ì∫Ä Server running at http://localhost:${PORT}`);
        console.log(`Ìø¢ Properties page: http://localhost:${PORT}/properties`);
        console.log(`Ì±• Tenants page: http://localhost:${PORT}/tenants`);
        console.log(`Ì≤≥ Payments page: http://localhost:${PORT}/payments`);
        console.log(`Ìºê API available at: http://localhost:${PORT}/api/properties`);
        console.log(`Ì≥ä Statistics: http://localhost:${PORT}/api/properties/stats/summary`);
    });
}

startServer();
