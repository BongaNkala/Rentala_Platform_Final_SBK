import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function setup() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'rentala'
    });

    console.log('Connected to MySQL. Setting up tables...');

    // Create users table
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create demo user if not exists
    const [rows] = await connection.execute('SELECT * FROM users WHERE email = ?', ['demo@rentala.com']);
    if (rows.length === 0) {
        const hashedPassword = await bcrypt.hash('demopassword123', 10);
        await connection.execute('INSERT INTO users (email, password) VALUES (?, ?)', ['demo@rentala.com', hashedPassword]);
        console.log('Demo user created successfully!');
    } else {
        console.log('Demo user already exists.');
    }

    await connection.end();
    console.log('Database setup complete!');
}

setup().catch(err => {
    console.error('Setup failed:', err.message);
    process.exit(1);
});
