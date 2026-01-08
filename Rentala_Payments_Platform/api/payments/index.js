const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const PAYMENTS_FILE = path.join(__dirname, '../../data/payments.json');

// Helper functions
async function readPayments() {
    try {
        const data = await fs.readFile(PAYMENTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function writePayments(payments) {
    try {
        await fs.writeFile(PAYMENTS_FILE, JSON.stringify(payments, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing payments:', error);
        return false;
    }
}

// GET all payments
router.get('/', async (req, res) => {
    try {
        const payments = await readPayments();
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

// GET payment by ID
router.get('/:id', async (req, res) => {
    try {
        const payments = await readPayments();
        const payment = payments.find(p => p.id === req.params.id);
        
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        res.json(payment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch payment' });
    }
});

// POST new payment
router.post('/', async (req, res) => {
    try {
        const payments = await readPayments();
        
        const newPayment = {
            id: Date.now().toString(),
            ...req.body,
            createdAt: new Date().toISOString()
        };
        
        payments.push(newPayment);
        await writePayments(payments);
        
        res.status(201).json(newPayment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create payment' });
    }
});

// PUT update payment
router.put('/:id', async (req, res) => {
    try {
        const payments = await readPayments();
        const index = payments.findIndex(p => p.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        payments[index] = {
            ...payments[index],
            ...req.body,
            updatedAt: new Date().toISOString()
        };
        
        await writePayments(payments);
        res.json(payments[index]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update payment' });
    }
});

// DELETE payment
router.delete('/:id', async (req, res) => {
    try {
        const payments = await readPayments();
        const filtered = payments.filter(p => p.id !== req.params.id);
        
        await writePayments(filtered);
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
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
            totalPayments: payments.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

module.exports = router;
