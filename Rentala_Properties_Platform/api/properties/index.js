const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const PROPERTIES_FILE = path.join(__dirname, '../../data/properties.json');

// Helper functions
async function readProperties() {
    try {
        const data = await fs.readFile(PROPERTIES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function writeProperties(properties) {
    try {
        await fs.writeFile(PROPERTIES_FILE, JSON.stringify(properties, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing properties:', error);
        return false;
    }
}

// GET all properties
router.get('/', async (req, res) => {
    try {
        const properties = await readProperties();
        res.json(properties);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
});

// GET property by ID
router.get('/:id', async (req, res) => {
    try {
        const properties = await readProperties();
        const property = properties.find(p => p.id === req.params.id);
        
        if (!property) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        res.json(property);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch property' });
    }
});

// POST new property
router.post('/', async (req, res) => {
    try {
        const properties = await readProperties();
        
        const newProperty = {
            id: Date.now().toString(),
            ...req.body,
            occupiedUnits: req.body.occupiedUnits || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        properties.push(newProperty);
        await writeProperties(properties);
        
        res.status(201).json(newProperty);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create property' });
    }
});

// PUT update property
router.put('/:id', async (req, res) => {
    try {
        const properties = await readProperties();
        const index = properties.findIndex(p => p.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Property not found' });
        }
        
        properties[index] = {
            ...properties[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        await writeProperties(properties);
        res.json(properties[index]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update property' });
    }
});

// DELETE property
router.delete('/:id', async (req, res) => {
    try {
        const properties = await readProperties();
        const filtered = properties.filter(p => p.id !== req.params.id);
        
        await writeProperties(filtered);
        res.json({ message: 'Property deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete property' });
    }
});

// GET property statistics
router.get('/stats/summary', async (req, res) => {
    try {
        const properties = await readProperties();
        
        const totalProperties = properties.length;
        const totalUnits = properties.reduce((sum, p) => sum + p.units, 0);
        const occupiedUnits = properties.reduce((sum, p) => sum + (p.occupiedUnits || 0), 0);
        const vacancyRate = totalUnits > 0 ? ((totalUnits - occupiedUnits) / totalUnits) * 100 : 0;
        
        const totalValue = properties.reduce((sum, p) => sum + (p.value || 0), 0);
        const avgPropertyValue = totalProperties > 0 ? totalValue / totalProperties : 0;
        
        const propertyTypes = {
            residential: properties.filter(p => p.type === 'residential').length,
            commercial: properties.filter(p => p.type === 'commercial').length,
            mixed: properties.filter(p => p.type === 'mixed').length
        };
        
        const statusCounts = {
            active: properties.filter(p => p.status === 'active').length,
            inactive: properties.filter(p => p.status === 'inactive').length,
            maintenance: properties.filter(p => p.status === 'maintenance').length,
            vacant: properties.filter(p => p.status === 'vacant').length
        };
        
        res.json({
            totalProperties,
            totalUnits,
            occupiedUnits,
            vacantUnits: totalUnits - occupiedUnits,
            vacancyRate: Math.round(vacancyRate * 100) / 100,
            totalValue,
            avgPropertyValue: Math.round(avgPropertyValue * 100) / 100,
            propertyTypes,
            statusCounts,
            avgUnitsPerProperty: totalProperties > 0 ? Math.round((totalUnits / totalProperties) * 100) / 100 : 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

// Search properties
router.get('/search/:query', async (req, res) => {
    try {
        const properties = await readProperties();
        const query = req.params.query.toLowerCase();
        
        const filtered = properties.filter(p => 
            p.name.toLowerCase().includes(query) ||
            p.address.toLowerCase().includes(query) ||
            p.city.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query)) ||
            (p.postalCode && p.postalCode.toLowerCase().includes(query))
        );
        
        res.json(filtered);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search properties' });
    }
});

// Filter properties by type
router.get('/type/:type', async (req, res) => {
    try {
        const properties = await readProperties();
        const filtered = properties.filter(p => p.type === req.params.type);
        
        res.json(filtered);
    } catch (error) {
        res.status(500).json({ error: 'Failed to filter properties' });
    }
});

// Filter properties by status
router.get('/status/:status', async (req, res) => {
    try {
        const properties = await readProperties();
        const filtered = properties.filter(p => p.status === req.params.status);
        
        res.json(filtered);
    } catch (error) {
        res.status(500).json({ error: 'Failed to filter properties' });
    }
});

module.exports = router;
