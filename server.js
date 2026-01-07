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

app.listen(PORT, () => {
    console.log(`íº€ Server running at http://localhost:${PORT}` );
});
