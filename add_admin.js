import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function addAdmin() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'rentala'
        });

        const email = 'admin@rentala.co.za';
        const password = 'password123'; // You can change this if you want
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user exists, if not, insert
        const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            await connection.execute('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
            console.log(`✅ Success! User ${email} created with password: ${password}`);
        } else {
            // Update password just in case
            await connection.execute('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
            console.log(`✅ Success! Password updated for ${email}`);
        }

        await connection.end();
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

addAdmin();
