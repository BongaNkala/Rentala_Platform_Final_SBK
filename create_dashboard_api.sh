#!/bin/bash

echo "Creating dashboard API..."

mkdir -p api/dashboard

cat > api/dashboard/index.js << 'EOF'
const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const PROPERTIES_FILE = path.join(DATA_DIR, 'properties.json');
const TENANTS_FILE = path.join(DATA_DIR, 'tenants.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');
const MAINTENANCE_FILE = path.join(DATA_DIR, 'maintenance.json');

// Helper functions
async function readJSONFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function writeJSONFile(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
}

// GET dashboard summary
router.get('/summary', async (req, res) => {
    try {
        const [properties, tenants, payments, maintenance] = await Promise.all([
            readJSONFile(PROPERTIES_FILE),
            readJSONFile(TENANTS_FILE),
            readJSONFile(PAYMENTS_FILE),
            readJSONFile(MAINTENANCE_FILE)
        ]);

        // Calculate statistics
        const totalProperties = properties.length;
        const totalTenants = tenants.length;
        const activeTenants = tenants.filter(t => t.status === 'active').length;
        
        // Calculate monthly revenue (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const monthlyRevenue = payments
            .filter(p => {
                const paymentDate = new Date(p.date);
                return paymentDate >= thirtyDaysAgo && p.status === 'completed';
            })
            .reduce((sum, p) => sum + (p.amount || 0), 0);

        // Pending maintenance issues
        const pendingIssues = maintenance.filter(m => m.status === 'pending').length;

        // Property type distribution
        const propertyTypes = {
            residential: properties.filter(p => p.type === 'residential').length,
            commercial: properties.filter(p => p.type === 'commercial').length,
            mixed: properties.filter(p => p.type === 'mixed').length
        };

        // Payment status distribution
        const paymentStatus = {
            completed: payments.filter(p => p.status === 'completed').length,
            pending: payments.filter(p => p.status === 'pending').length,
            overdue: payments.filter(p => p.status === 'overdue').length
        };

        // Occupancy rate
        const totalUnits = properties.reduce((sum, p) => sum + (p.units || 0), 0);
        const occupiedUnits = properties.reduce((sum, p) => sum + (p.occupiedUnits || 0), 0);
        const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

        // Recent payments (last 10)
        const recentPayments = payments
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        // Upcoming maintenance
        const upcomingMaintenance = maintenance
            .filter(m => new Date(m.dueDate) >= new Date())
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5);

        // Performance metrics
        const collectionRate = payments.length > 0 ? 
            (paymentStatus.completed / payments.length) * 100 : 0;

        const avgRent = tenants.length > 0 ? 
            tenants.reduce((sum, t) => sum + (t.rent || 0), 0) / tenants.length : 0;

        const maintenanceCost = maintenance
            .filter(m => m.status === 'completed')
            .reduce((sum, m) => sum + (m.cost || 0), 0);

        res.json({
            summary: {
                totalProperties,
                totalTenants,
                activeTenants,
                monthlyRevenue,
                pendingIssues,
                occupancyRate: Math.round(occupancyRate * 100) / 100,
                collectionRate: Math.round(collectionRate * 100) / 100,
                avgRent: Math.round(avgRent * 100) / 100,
                maintenanceCost
            },
            distributions: {
                propertyTypes,
                paymentStatus
            },
            recent: {
                payments: recentPayments,
                maintenance: upcomingMaintenance
            },
            trends: {
                revenueLast30Days: await getRevenueTrend(30),
                occupancyLast6Months: await getOccupancyTrend(6),
                paymentTrend: await getPaymentTrend(30)
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard summary' });
    }
});

// GET revenue trend
router.get('/revenue-trend/:days', async (req, res) => {
    try {
        const days = parseInt(req.params.days) || 30;
        const trend = await getRevenueTrend(days);
        res.json(trend);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch revenue trend' });
    }
});

// GET occupancy trend
router.get('/occupancy-trend/:months', async (req, res) => {
    try {
        const months = parseInt(req.params.months) || 6;
        const trend = await getOccupancyTrend(months);
        res.json(trend);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch occupancy trend' });
    }
});

// GET alerts
router.get('/alerts', async (req, res) => {
    try {
        const [payments, maintenance, tenants] = await Promise.all([
            readJSONFile(PAYMENTS_FILE),
            readJSONFile(MAINTENANCE_FILE),
            readJSONFile(TENANTS_FILE)
        ]);

        const alerts = [];

        // Overdue payments
        const overduePayments = payments.filter(p => p.status === 'overdue');
        if (overduePayments.length > 0) {
            const totalOverdue = overduePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
            alerts.push({
                type: 'danger',
                title: 'Payment Overdue',
                message: `${overduePayments.length} tenants have overdue payments totaling R${totalOverdue.toLocaleString('en-ZA')}`,
                priority: 'high',
                timestamp: new Date().toISOString()
            });
        }

        // High priority maintenance
        const highPriorityMaintenance = maintenance.filter(m => m.priority === 'high' && m.status !== 'completed');
        if (highPriorityMaintenance.length > 0) {
            alerts.push({
                type: 'warning',
                title: 'Maintenance Required',
                message: `${highPriorityMaintenance.length} high priority maintenance issues need attention`,
                priority: 'high',
                timestamp: new Date().toISOString()
            });
        }

        // Expiring leases (next 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        const expiringLeases = tenants.filter(t => {
            if (!t.leaseEnd) return false;
            const leaseEnd = new Date(t.leaseEnd);
            return leaseEnd <= thirtyDaysFromNow && leaseEnd >= new Date();
        });

        if (expiringLeases.length > 0) {
            alerts.push({
                type: 'info',
                title: 'Lease Expiring',
                message: `${expiringLeases.length} tenant leases expire in the next 30 days`,
                priority: 'medium',
                timestamp: new Date().toISOString()
            });
        }

        // Low occupancy properties
        const properties = await readJSONFile(PROPERTIES_FILE);
        const lowOccupancy = properties.filter(p => {
            if (!p.units || !p.occupiedUnits) return false;
            const occupancyRate = (p.occupiedUnits / p.units) * 100;
            return occupancyRate < 70;
        });

        if (lowOccupancy.length > 0) {
            alerts.push({
                type: 'warning',
                title: 'Low Occupancy',
                message: `${lowOccupancy.length} properties have occupancy below 70%`,
                priority: 'medium',
                timestamp: new Date().toISOString()
            });
        }

        res.json(alerts);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

// GET recent activity
router.get('/activity', async (req, res) => {
    try {
        const [payments, maintenance, tenants] = await Promise.all([
            readJSONFile(PAYMENTS_FILE),
            readJSONFile(MAINTENANCE_FILE),
            readJSONFile(TENANTS_FILE)
        ]);

        const activities = [];

        // Recent payments
        const recentPayments = payments
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
            .map(p => ({
                type: 'payment',
                icon: 'money-bill-wave',
                message: `Payment of R${p.amount} received from ${p.tenantName}`,
                timestamp: p.date
            }));

        // Recent maintenance
        const recentMaintenance = maintenance
            .sort((a, b) => new Date(b.createdAt || b.dueDate) - new Date(a.createdAt || a.dueDate))
            .slice(0, 5)
            .map(m => ({
                type: 'maintenance',
                icon: 'tools',
                message: `Maintenance ${m.status} for ${m.propertyName}: ${m.issue}`,
                timestamp: m.updatedAt || m.dueDate
            }));

        // Recent tenant activities
        const recentTenants = tenants
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(t => ({
                type: 'tenant',
                icon: 'user-plus',
                message: `New tenant ${t.name} added`,
                timestamp: t.createdAt
            }));

        // Combine and sort all activities
        const allActivities = [...recentPayments, ...recentMaintenance, ...recentTenants]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        res.json(allActivities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

// Helper function to get revenue trend
async function getRevenueTrend(days) {
    try {
        const payments = await readJSONFile(PAYMENTS_FILE);
        const trend = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toISOString().split('T')[0];
            
            const dailyRevenue = payments
                .filter(p => p.date === dateString && p.status === 'completed')
                .reduce((sum, p) => sum + (p.amount || 0), 0);
            
            trend.push({
                date: dateString,
                revenue: dailyRevenue,
                label: date.toLocaleDateString('en-ZA', { weekday: 'short', month: 'short', day: 'numeric' })
            });
        }
        
        return trend;
    } catch (error) {
        return [];
    }
}

// Helper function to get occupancy trend
async function getOccupancyTrend(months) {
    try {
        const properties = await readJSONFile(PROPERTIES_FILE);
        const trend = [];
        
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            
            // Simulate occupancy data (in a real app, you'd have historical data)
            const monthOccupancy = properties.reduce((sum, p) => {
                const baseOccupancy = (p.occupiedUnits || 0) / (p.units || 1);
                const monthlyVariation = 0.9 + (Math.random() * 0.2); // 90-110% variation
                return sum + (baseOccupancy * monthlyVariation * 100);
            }, 0) / properties.length;
            
            trend.push({
                month: date.toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' }),
                occupancy: Math.round(monthOccupancy * 10) / 10
            });
        }
        
        return trend;
    } catch (error) {
        return [];
    }
}

// Helper function to get payment trend
async function getPaymentTrend(days) {
    try {
        const payments = await readJSONFile(PAYMENTS_FILE);
        const trend = {
            completed: 0,
            pending: 0,
            overdue: 0
        };
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        payments.forEach(payment => {
            const paymentDate = new Date(payment.date);
            if (paymentDate >= cutoffDate) {
                if (trend[payment.status]) {
                    trend[payment.status]++;
                }
            }
        });
        
        return trend;
    } catch (error) {
        return { completed: 0, pending: 0, overdue: 0 };
    }
}

module.exports = router;
EOF

echo "✅ Dashboard API created successfully!"
