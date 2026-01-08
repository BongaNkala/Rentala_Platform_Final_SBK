const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const TENANTS_FILE = path.join(__dirname, '../../data/tenants.json');

// Helper functions
async function readTenants() {
    try {
        const data = await fs.readFile(TENANTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function writeTenants(tenants) {
    try {
        await fs.writeFile(TENANTS_FILE, JSON.stringify(tenants, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing tenants:', error);
        return false;
    }
}

// GET all tenants
router.get('/', async (req, res) => {
    try {
        const tenants = await readTenants();
        res.json(tenants);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tenants' });
    }
});

// GET tenant by ID
router.get('/:id', async (req, res) => {
    try {
        const tenants = await readTenants();
        const tenant = tenants.find(t => t.id === req.params.id);
        
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        
        res.json(tenant);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tenant' });
    }
});

// POST new tenant
router.post('/', async (req, res) => {
    try {
        const tenants = await readTenants();
        
        const newTenant = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            payments: []
        };
        
        tenants.push(newTenant);
        await writeTenants(tenants);
        
        res.status(201).json(newTenant);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create tenant' });
    }
});

// PUT update tenant
router.put('/:id', async (req, res) => {
    try {
        const tenants = await readTenants();
        const index = tenants.findIndex(t => t.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        
        tenants[index] = {
            ...tenants[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        await writeTenants(tenants);
        res.json(tenants[index]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update tenant' });
    }
});

// DELETE tenant
router.delete('/:id', async (req, res) => {
    try {
        const tenants = await readTenants();
        const filtered = tenants.filter(t => t.id !== req.params.id);
        
        await writeTenants(filtered);
        res.json({ message: 'Tenant deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete tenant' });
    }
});

// GET tenant statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const tenants = await readTenants();
        
        const totalTenants = tenants.length;
        const activeTenants = tenants.filter(t => t.status === 'active').length;
        const pendingTenants = tenants.filter(t => t.status === 'pending').length;
        const inactiveTenants = tenants.filter(t => t.status === 'inactive').length;
        
        const totalRent = tenants
            .filter(t => t.status === 'active')
            .reduce((sum, t) => sum + (t.rent || 0), 0);
        
        res.json({
            totalTenants,
            activeTenants,
            pendingTenants,
            inactiveTenants,
            totalRent,
            averageRent: totalTenants > 0 ? Math.round((totalRent / activeTenants) * 100) / 100 : 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Search tenants
router.get('/search/:query', async (req, res) => {
    try {
        const tenants = await readTenants();
        const query = req.params.query.toLowerCase();
        
        const filtered = tenants.filter(t => 
            t.name.toLowerCase().includes(query) ||
            t.email.toLowerCase().includes(query) ||
            t.phone.includes(query) ||
            t.propertyName.toLowerCase().includes(query)
        );
        
        res.json(filtered);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search tenants' });
    }
});

module.exports = router;
