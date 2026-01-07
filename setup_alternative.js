// Alternative setup for SQLite (if your Rentala uses SQLite)

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('rentala.db');

// Create tenants table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS tenants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            property_id INTEGER,
            property_address TEXT,
            rent_amount REAL,
            lease_start TEXT,
            lease_end TEXT,
            status TEXT CHECK(status IN ('active', 'inactive', 'pending')) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Insert sample data
    const stmt = db.prepare(`
        INSERT OR IGNORE INTO tenants 
        (full_name, email, phone, property_id, property_address, rent_amount, lease_start, lease_end, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const sampleData = [
        ['John Smith', 'john.smith@email.com', '+27 11 123 4567', 1, '123 Main Street, Johannesburg', 8500, '2024-01-01', '2024-12-31', 'active'],
        ['Sarah Johnson', 'sarah.j@email.com', '+27 11 987 6543', 2, '456 Oak Avenue, Pretoria', 12000, '2024-02-01', '2025-01-31', 'active'],
        ['Mike Wilson', 'mike.wilson@email.com', '+27 11 555 1234', 3, '789 Pine Road, Cape Town', 9500, '2024-03-15', '2024-09-14', 'pending'],
        ['Emma Davis', 'emma.davis@email.com', '+27 11 444 5678', null, '321 Beachfront, Durban', 7500, '2024-04-01', '2025-03-31', 'active'],
        ['David Brown', 'david.brown@email.com', '+27 11 333 7890', null, '654 Mountain View, Bloemfontein', 11000, '2024-01-15', '2024-12-14', 'inactive']
    ];
    
    sampleData.forEach(data => stmt.run(...data));
    stmt.finalize();
    
    console.log('✅ Tenants table created with sample data');
    
    // Create indexes
    db.run('CREATE INDEX IF NOT EXISTS idx_tenant_status ON tenants(status)');
    db.run('CREATE INDEX IF NOT EXISTS idx_tenant_property ON tenants(property_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_tenant_email ON tenants(email)');
    
    // Verify setup
    db.each('SELECT COUNT(*) as count FROM tenants', (err, row) => {
        console.log(`Total tenants: ${row.count}`);
    });
});

db.close();
