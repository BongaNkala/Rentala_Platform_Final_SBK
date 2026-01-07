import express from 'express';
import mysql from 'mysql2';
import path from 'url';
import { fileURLToPath } from 'url';
import pathNode from 'path';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import security from './middleware/security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathNode.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'rentala_secret_key_2026';

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.static('.'));
app.use(security.requestLogger);

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rentala'
});

db.connect((err) => {
    if (err) {
        console.error('âŒ MySQL Connection Error:', err.message);
        return;
    }
    console.log('âœ… Connected to the "rentala" MySQL database.');
});

// --- LOGIN ROUTE ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful', token });
    });
});

// Default route - serve login page
app.get('/', (req, res) => {
    res.redirect('/login.html');
});
app.listen(PORT, () => {
    console.log(`íº€ Server running at http://localhost:${PORT}` );
});

// ============================================
// TENANT MANAGEMENT API ENDPOINTS
// ============================================

// Create tenants table if not exists
db.query(`
    CREATE TABLE IF NOT EXISTS tenants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        property_id INT,
        property_address VARCHAR(200),
        rent_amount DECIMAL(10, 2),
        lease_start DATE,
        lease_end DATE,
        status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
    )
`, (err) => {
    if (err) console.error('Tenants table error:', err.message);
    else console.log('âœ… Tenants table ready');
});

// GET all tenants
app.get('/api/tenants', (req, res) => {
    const query = `
        SELECT t.*, p.address as property_address, p.status as property_status 
        FROM tenants t 
        LEFT JOIN properties p ON t.property_id = p.id 
        ORDER BY t.created_at DESC
    `;
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching tenants:', err);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(results);
        }
    });
});

// GET single tenant
app.get('/api/tenants/:id', (req, res) => {
    const query = `
        SELECT t.*, p.address as property_address, p.type as property_type 
        FROM tenants t 
        LEFT JOIN properties p ON t.property_id = p.id 
        WHERE t.id = ?
    `;
    
    db.query(query, [req.params.id], (err, results) => {
        if (err) {
            console.error('Error fetching tenant:', err);
            res.status(500).json({ error: 'Database error' });
        } else if (results.length === 0) {
            res.status(404).json({ error: 'Tenant not found' });
        } else {
            res.json(results[0]);
        }
    });
});

// POST create new tenant
app.post('/api/tenants', (req, res) => {
    const { 
        full_name, email, phone, property_id, 
        property_address, rent_amount, lease_start, 
        lease_end, status 
    } = req.body;
    
    const query = `
        INSERT INTO tenants 
        (full_name, email, phone, property_id, property_address, 
         rent_amount, lease_start, lease_end, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        full_name, email, phone, property_id || null, property_address,
        rent_amount || 0, lease_start, lease_end, status || 'active'
    ];
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error creating tenant:', err);
            res.status(500).json({ error: 'Database error' });
        } else {
            // Update property status if property_id exists
            if (property_id) {
                db.query('UPDATE properties SET status = "occupied" WHERE id = ?', [property_id]);
            }
            
            res.json({ 
                id: result.insertId, 
                message: 'Tenant created successfully',
                ...req.body 
            });
        }
    });
});

// PUT update tenant
app.put('/api/tenants/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
        if (key !== 'id') {
            fields.push(`${key} = ?`);
            values.push(updates[key]);
        }
    });
    
    if (fields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }
    
    values.push(id);
    const query = `UPDATE tenants SET ${fields.join(', ')} WHERE id = ?`;
    
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating tenant:', err);
            res.status(500).json({ error: 'Database error' });
        } else if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Tenant not found' });
        } else {
            res.json({ 
                message: 'Tenant updated successfully',
                ...updates 
            });
        }
    });
});

// DELETE tenant
app.delete('/api/tenants/:id', (req, res) => {
    const { id } = req.params;
    
    // First get the tenant to check for property_id
    db.query('SELECT property_id FROM tenants WHERE id = ?', [id], (err, results) => {
        if (err) {
            console.error('Error fetching tenant:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        
        const property_id = results[0].property_id;
        
        // Delete the tenant
        db.query('DELETE FROM tenants WHERE id = ?', [id], (err, result) => {
            if (err) {
                console.error('Error deleting tenant:', err);
                res.status(500).json({ error: 'Database error' });
            } else {
                // Update property status back to available if it was occupied
                if (property_id) {
                    db.query('UPDATE properties SET status = "available" WHERE id = ?', [property_id]);
                }
                
                res.json({ 
                    message: 'Tenant deleted successfully',
                    property_freed: property_id ? true : false 
                });
            }
        });
    });
});

// GET tenant stats for dashboard
app.get('/api/tenants/stats', (req, res) => {
    const queries = {
        total: 'SELECT COUNT(*) as count FROM tenants',
        active: 'SELECT COUNT(*) as count FROM tenants WHERE status = "active"',
        inactive: 'SELECT COUNT(*) as count FROM tenants WHERE status = "inactive"',
        pending: 'SELECT COUNT(*) as count FROM tenants WHERE status = "pending"',
        totalRent: 'SELECT SUM(rent_amount) as total FROM tenants WHERE status = "active"',
        recent: 'SELECT COUNT(*) as count FROM tenants WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    };
    
    const stats = {};
    let completed = 0;
    const totalQueries = Object.keys(queries).length;
    
    Object.keys(queries).forEach((key, index) => {
        db.query(queries[key], (err, results) => {
            if (err) {
                console.error(`Error fetching ${key} stats:`, err);
                stats[key] = 0;
            } else {
                stats[key] = results[0].count || results[0].total || 0;
            }
            
            completed++;
            if (completed === totalQueries) {
                res.json(stats);
            }
        });
    });
});

// GET properties for tenant assignment
app.get('/api/properties/available', (req, res) => {
    const query = 'SELECT id, address, type, rent FROM properties WHERE status = "available"';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching available properties:', err);
            res.status(500).json({ error: 'Database error' });
        } else {
            res.json(results);
        }
    });
});
