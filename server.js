const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const dashboardRoutes = require('./api/dashboard');

const app = express();
const PORT = 3001;

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
const MAINTENANCE_FILE = path.join(DATA_DIR, 'maintenance.json');

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
                    "type": "residential",
                    "units": 3,
                    "occupiedUnits": 2,
                    "value": 3500000,
                    "rent": 8500,
                    "status": "active",
                    "createdAt": "2023-05-15T10:00:00.000Z",
                    "updatedAt": "2023-05-15T10:00:00.000Z"
                },
                {
                    "id": "2",
                    "name": "Mountain View Apartments",
                    "address": "456 Hill St",
                    "city": "Johannesburg",
                    "type": "residential",
                    "units": 12,
                    "occupiedUnits": 10,
                    "value": 12000000,
                    "rent": 7200,
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
                    "updatedAt": "2024-01-01T10:00:00.000Z"
                },
                {
                    "id": "2",
                    "name": "Sarah Johnson",
                    "email": "sarah@example.com",
                    "phone": "0712345679",
                    "propertyId": "2",
                    "propertyName": "Mountain View Apartments",
                    "rent": 7200,
                    "leaseStart": "2024-02-01",
                    "leaseEnd": "2025-01-31",
                    "status": "active",
                    "createdAt": "2024-02-01T09:30:00.000Z",
                    "updatedAt": "2024-02-01T09:30:00.000Z"
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
                    "createdAt": "2024-01-15T10:00:00.000Z",
                    "updatedAt": "2024-01-15T10:00:00.000Z"
                },
                {
                    "id": "2",
                    "tenantId": "2",
                    "tenantName": "Sarah Johnson",
                    "propertyId": "2",
                    "propertyName": "Mountain View Apartments",
                    "amount": 7200,
                    "date": "2024-02-05",
                    "method": "eft",
                    "status": "completed",
                    "createdAt": "2024-02-05T09:30:00.000Z",
                    "updatedAt": "2024-02-05T09:30:00.000Z"
                }
            ];
            await fs.writeFile(PAYMENTS_FILE, JSON.stringify(initialPayments, null, 2));
        }
        
        // Create maintenance file if it doesn't exist
        try {
            await fs.access(MAINTENANCE_FILE);
        } catch {
            const initialMaintenance = [
                {
                    "id": "1",
                    "propertyId": "1",
                    "propertyName": "Sunset Villa",
                    "issue": "Roof Repair",
                    "priority": "high",
                    "dueDate": "2024-03-15",
                    "status": "pending",
                    "cost": 5000,
                    "createdAt": "2024-02-20T14:00:00.000Z",
                    "updatedAt": "2024-02-20T14:00:00.000Z"
                },
                {
                    "id": "2",
                    "propertyId": "2",
                    "propertyName": "Mountain View Apartments",
                    "issue": "Plumbing",
                    "priority": "medium",
                    "dueDate": "2024-03-20",
                    "status": "in-progress",
                    "cost": 3200,
                    "createdAt": "2024-02-18T10:30:00.000Z",
                    "updatedAt": "2024-02-25T09:15:00.000Z"
                }
            ];
            await fs.writeFile(MAINTENANCE_FILE, JSON.stringify(initialMaintenance, null, 2));
        }
        
        console.log('âœ… Data files initialized successfully');
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

// API Routes
app.use('/api/dashboard', dashboardRoutes);

// Basic API endpoints
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

app.get('/api/maintenance', async (req, res) => {
    try {
        const data = await fs.readFile(MAINTENANCE_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.json([]);
    }
});

// Serve main dashboard page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

// Serve other pages (placeholders for now)
const pages = ['properties', 'tenants', 'payments', 'maintenance', 'reports', 'analytics', 'forecasting', 'settings', 'profile'];
pages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        res.sendFile(path.join(__dirname, `public/${page}.html`));
    });
});

// Create placeholder pages
pages.forEach(page => {
    if (page !== 'dashboard') {
        const placeholderPath = path.join(__dirname, `public/${page}.html`);
        if (!fs.existsSync(placeholderPath)) {
            const placeholderHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${page.charAt(0).toUpperCase() + page.slice(1)} | Rentala</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/dashboard.css">
</head>
<body>
    <div class="clear-overlay"></div>
    <div class="bg-app-name">RENTALA</div>
    <div class="dashboard-container">
        <aside class="sidebar">
            <!-- Same sidebar as dashboard -->
        </aside>
        <main class="main-content">
            <header class="top-header">
                <div class="page-title">
                    <h1>${page.charAt(0).toUpperCase() + page.slice(1)}</h1>
                    <p>This page is under construction. Coming soon!</p>
                </div>
            </header>
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="fas fa-tools"></i>
                </div>
                <h3 class="empty-state-title">Page Under Construction</h3>
                <p class="empty-state-text">
                    The ${page} page is currently being developed. 
                    Please check back later or use the dashboard for now.
                </p>
                <a href="dashboard.html" class="btn btn-primary" style="margin-top: 20px;">
                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                </a>
            </div>
        </main>
    </div>
</body>
</html>`;
            fs.writeFileSync(placeholderPath, placeholderHTML);
        }
    }
});

// Start server
async function startServer() {
    await initializeData();
    
    app.listen(PORT, () => {
        console.log(`íº€ Dashboard Server running at http://localhost:${PORT}`);
        console.log(`í³Š Dashboard: http://localhost:${PORT}/dashboard`);
        console.log(`í¿¢ API Summary: http://localhost:${PORT}/api/dashboard/summary`);
        console.log(`í´” API Alerts: http://localhost:${PORT}/api/dashboard/alerts`);
        console.log(`í³ˆ API Activity: http://localhost:${PORT}/api/dashboard/activity`);
        console.log(`\nâœ¨ Dashboard Features:`);
        console.log(`   â€¢ Real-time statistics and charts`);
        console.log(`   â€¢ Interactive data visualizations`);
        console.log(`   â€¢ System alerts and notifications`);
        console.log(`   â€¢ Recent activity tracking`);
        console.log(`   â€¢ Quick action modals`);
        console.log(`   â€¢ Responsive glassmorphism design`);
    });
}

startServer();
