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
                    "description": "Beautiful beachfront property with stunning ocean views",
                    "status": "active",
                    "createdAt": "2024-01-01T10:00:00.000Z",
                    "updatedAt": "2024-01-01T10:00:00.000Z",
                    "amenities": ["Pool", "Garden", "Garage"],
                    "monthlyRent": 8500
                },
                {
                    "id": "2",
                    "name": "Mountain View",
                    "address": "456 Hill St",
                    "city": "Johannesburg",
                    "postalCode": "2001",
                    "type": "residential",
                    "units": 8,
                    "occupiedUnits": 6,
                    "value": 2800000,
                    "description": "Modern apartment building with mountain views",
                    "status": "active",
                    "createdAt": "2024-01-15T09:30:00.000Z",
                    "updatedAt": "2024-01-15T09:30:00.000Z",
                    "amenities": ["Gym", "Pool", "Security"],
                    "monthlyRent": 7200
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
                    "createdAt": "2024-01-15T10:00:00.000Z",
                    "updatedAt": "2024-01-15T10:00:00.000Z"
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

app.post('/api/tenants', async (req, res) => {
    try {
        const data = await fs.readFile(TENANTS_FILE, 'utf8');
        const tenants = JSON.parse(data);
        
        const newTenant = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        tenants.push(newTenant);
        await fs.writeFile(TENANTS_FILE, JSON.stringify(tenants, null, 2));
        
        res.status(201).json(newTenant);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save tenant' });
    }
});

app.post('/api/payments', async (req, res) => {
    try {
        const data = await fs.readFile(PAYMENTS_FILE, 'utf8');
        const payments = JSON.parse(data);
        
        const newPayment = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        
        payments.push(newPayment);
        await fs.writeFile(PAYMENTS_FILE, JSON.stringify(payments, null, 2));
        
        res.status(201).json(newPayment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save payment' });
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

// Start server
async function startServer() {
    await initializeData();
    
    app.listen(PORT, () => {
        console.log(`Ì∫Ä Server running at http://localhost:${PORT}`);
        console.log(`Ìø¢ Properties page: http://localhost:${PORT}/properties`);
        console.log(`Ìø† Tenants page: http://localhost:${PORT}/tenants`);
        console.log(`Ì≤≥ Payments page: http://localhost:${PORT}/payments`);
        console.log(`Ìºê API available at: http://localhost:${PORT}/api/properties`);
    });
}

startServer();
