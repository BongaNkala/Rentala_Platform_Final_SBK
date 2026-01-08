// Payments API Backend
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// File path for storing payments data
const PAYMENTS_FILE = path.join(__dirname, '../../data/payments.json');
const TENANTS_FILE = path.join(__dirname, '../../data/tenants.json');
const PROPERTIES_FILE = path.join(__dirname, '../../data/properties.json');

// Ensure data directory exists
async function ensureDataDir() {
    const dataDir = path.join(__dirname, '../../data');
    try {
        await fs.mkdir(dataDir, { recursive: true });
        
        // Initialize files if they don't exist
        try {
            await fs.access(PAYMENTS_FILE);
        } catch {
            await fs.writeFile(PAYMENTS_FILE, JSON.stringify([], null, 2));
        }
        
        try {
            await fs.access(TENANTS_FILE);
        } catch {
            await fs.writeFile(TENANTS_FILE, JSON.stringify([
                { id: '1', name: 'John Smith', email: 'john@example.com', phone: '0712345678' },
                { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '0712345679' },
                { id: '3', name: 'Mike Wilson', email: 'mike@example.com', phone: '0712345680' }
            ], null, 2));
        }
        
        try {
            await fs.access(PROPERTIES_FILE);
        } catch {
            await fs.writeFile(PROPERTIES_FILE, JSON.stringify([
                { id: '1', name: 'Sunset Villa', address: '123 Beach Rd', type: 'House', rent: 8500 },
                { id: '2', name: 'Mountain View', address: '456 Hill St', type: 'Apartment', rent: 7200 },
                { id: '3', name: 'City Center Apt', address: '789 Main St', type: 'Apartment', rent: 9500 }
            ], null, 2));
        }
    } catch (error) {
        console.error('Error setting up data directory:', error);
    }
}

// Initialize data directory
ensureDataDir();

// Helper function to read payments
async function readPayments() {
    try {
        const data = await fs.readFile(PAYMENTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading payments:', error);
        return [];
    }
}

// Helper function to write payments
async function writePayments(payments) {
    try {
        await fs.writeFile(PAYMENTS_FILE, JSON.stringify(payments, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing payments:', error);
        return false;
    }
}

// Helper function to read tenants
async function readTenants() {
    try {
        const data = await fs.readFile(TENANTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading tenants:', error);
        return [];
    }
}

// Helper function to read properties
async function readProperties() {
    try {
        const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading properties:', error);
        return [];
    }
}

// GET all payments
router.get('/', async (req, res) => {
    try {
        const payments = await readPayments();
        res.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

// GET specific payment
router.get('/:id', async (req, res) => {
    try {
        const payments = await readPayments();
        const payment = payments.find(p => p.id === req.params.id);
        
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        res.json(payment);
    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({ error: 'Failed to fetch payment' });
    }
});

// CREATE new payment
router.post('/', async (req, res) => {
    try {
        const payments = await readPayments();
        const tenants = await readTenants();
        const properties = await readProperties();
        
        const { tenantId, propertyId, amount, date, method, reference, notes, status } = req.body;
        
        // Validate required fields
        if (!tenantId || !propertyId || !amount || !date || !method || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Find tenant and property names
        const tenant = tenants.find(t => t.id === tenantId);
        const property = properties.find(p => p.id === propertyId);
        
        if (!tenant || !property) {
            return res.status(400).json({ error: 'Invalid tenant or property' });
        }
        
        // Generate payment ID
        const id = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Generate reference if not provided
        const paymentReference = reference || `TXN${Date.now().toString().slice(-8)}`;
        
        const newPayment = {
            id,
            tenantId,
            tenantName: tenant.name,
            propertyId,
            propertyName: property.name,
            amount: parseFloat(amount),
            date,
            method,
            reference: paymentReference,
            notes: notes || '',
            status,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        payments.push(newPayment);
        await writePayments(payments);
        
        res.status(201).json(newPayment);
    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
});

// UPDATE payment
router.put('/:id', async (req, res) => {
    try {
        const payments = await readPayments();
        const tenants = await readTenants();
        const properties = await readProperties();
        
        const paymentIndex = payments.findIndex(p => p.id === req.params.id);
        
        if (paymentIndex === -1) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        const { tenantId, propertyId, amount, date, method, reference, notes, status } = req.body;
        
        // Validate required fields
        if (!tenantId || !propertyId || !amount || !date || !method || !status) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Find tenant and property names
        const tenant = tenants.find(t => t.id === tenantId);
        const property = properties.find(p => p.id === propertyId);
        
        if (!tenant || !property) {
            return res.status(400).json({ error: 'Invalid tenant or property' });
        }
        
        const updatedPayment = {
            ...payments[paymentIndex],
            tenantId,
            tenantName: tenant.name,
            propertyId,
            propertyName: property.name,
            amount: parseFloat(amount),
            date,
            method,
            reference: reference || payments[paymentIndex].reference,
            notes: notes || '',
            status,
            updatedAt: new Date().toISOString()
        };
        
        payments[paymentIndex] = updatedPayment;
        await writePayments(payments);
        
        res.json(updatedPayment);
    } catch (error) {
        console.error('Error updating payment:', error);
        res.status(500).json({ error: 'Failed to update payment' });
    }
});

// DELETE payment
router.delete('/:id', async (req, res) => {
    try {
        const payments = await readPayments();
        const paymentIndex = payments.findIndex(p => p.id === req.params.id);
        
        if (paymentIndex === -1) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        payments.splice(paymentIndex, 1);
        await writePayments(payments);
        
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        console.error('Error deleting payment:', error);
        res.status(500).json({ error: 'Failed to delete payment' });
    }
});

// GET payment statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const payments = await readPayments();
        
        const totalCollected = payments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + (p.amount || 0), 0);
        
        const pendingPayments = payments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + (p.amount || 0), 0);
        
        const overduePayments = payments
            .filter(p => p.status === 'overdue')
            .reduce((sum, p) => sum + (p.amount || 0), 0);
        
        const totalExpected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
        
        res.json({
            totalCollected,
            pendingPayments,
            overduePayments,
            collectionRate: Math.round(collectionRate),
            totalPayments: payments.length,
            completedPayments: payments.filter(p => p.status === 'completed').length,
            pendingCount: payments.filter(p => p.status === 'pending').length,
            overdueCount: payments.filter(p => p.status === 'overdue').length
        });
    } catch (error) {
        console.error('Error fetching payment stats:', error);
        res.status(500).json({ error: 'Failed to fetch payment statistics' });
    }
});

// GET tenants list
router.get('/tenants/list', async (req, res) => {
    try {
        const tenants = await readTenants();
        res.json(tenants);
    } catch (error) {
        console.error('Error fetching tenants:', error);
        res.status(500).json({ error: 'Failed to fetch tenants' });
    }
});

// GET properties list
router.get('/properties/list', async (req, res) => {
    try {
        const properties = await readProperties();
        res.json(properties);
    } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
});

module.exports = router;
