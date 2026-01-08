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
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');
const TENANTS_FILE = path.join(DATA_DIR, 'tenants.json');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');

// Initialize data directory
async function initializeData() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        
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
        
        // Create tenants file
        try {
            await fs.access(TENANTS_FILE);
        } catch {
            const initialTenants = [
                {
                    "id": "1",
                    "name": "John Smith",
                    "email": "john@example.com",
                    "phone": "0712345678"
                },
                {
                    "id": "2",
                    "name": "Sarah Johnson",
                    "email": "sarah@example.com",
                    "phone": "0712345679"
                }
            ];
            await fs.writeFile(TENANTS_FILE, JSON.stringify(initialTenants, null, 2));
        }
        
        // Create properties file
        try {
            await fs.access(PROPERTIES_FILE);
        } catch {
            const initialProperties = [
                {
                    "id": "1",
                    "name": "Sunset Villa",
                    "address": "123 Beach Rd",
                    "rent": 8500
                },
                {
                    "id": "2",
                    "name": "Mountain View",
                    "address": "456 Hill St",
                    "rent": 7200
                }
            ];
            await fs.writeFile(PROPERTIES_FILE, JSON.stringify(initialProperties, null, 2));
        }
        
        console.log('‚úÖ Data files initialized');
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

// API Routes
app.get('/api/payments', async (req, res) => {
    try {
        const data = await fs.readFile(PAYMENTS_FILE, 'utf8');
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

app.get('/api/properties', async (req, res) => {
    try {
        const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.json([]);
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

app.put('/api/payments/:id', async (req, res) => {
    try {
        const data = await fs.readFile(PAYMENTS_FILE, 'utf8');
        let payments = JSON.parse(data);
        
        const index = payments.findIndex(p => p.id === req.params.id);
        if (index === -1) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        payments[index] = {
            ...payments[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        await fs.writeFile(PAYMENTS_FILE, JSON.stringify(payments, null, 2));
        res.json(payments[index]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update payment' });
    }
});

app.delete('/api/payments/:id', async (req, res) => {
    try {
        const data = await fs.readFile(PAYMENTS_FILE, 'utf8');
        let payments = JSON.parse(data);
        
        payments = payments.filter(p => p.id !== req.params.id);
        await fs.writeFile(PAYMENTS_FILE, JSON.stringify(payments, null, 2));
        
        res.json({ message: 'Payment deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete payment' });
    }
});

// Serve payments page
app.get('/payments', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/payments.html'));
});

// Serve other pages
app.get('/', (req, res) => {
    res.redirect('/payments');
});

// Start server
async function startServer() {
    await initializeData();
    
    app.listen(PORT, () => {
        console.log(`Ì∫Ä Server running at http://localhost:${PORT}`);
        console.log(`Ì≥Ñ Payments page: http://localhost:${PORT}/payments`);
        console.log(`Ìºê API available at: http://localhost:${PORT}/api/payments`);
    });
}

startServer();
