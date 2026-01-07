-- Tenant Management System for Rentala Platform
-- Run this script to create the tenants table

USE rentala;

-- Create tenants table
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL
);

-- Insert sample tenant data
INSERT INTO tenants (full_name, email, phone, property_id, property_address, rent_amount, lease_start, lease_end, status) VALUES
('John Smith', 'john.smith@email.com', '+27 11 123 4567', 1, '123 Main Street, Johannesburg', 8500.00, '2024-01-01', '2024-12-31', 'active'),
('Sarah Johnson', 'sarah.j@email.com', '+27 11 987 6543', 2, '456 Oak Avenue, Pretoria', 12000.00, '2024-02-01', '2025-01-31', 'active'),
('Mike Wilson', 'mike.wilson@email.com', '+27 11 555 1234', 3, '789 Pine Road, Cape Town', 9500.00, '2024-03-15', '2024-09-14', 'pending'),
('Emma Davis', 'emma.davis@email.com', '+27 11 444 5678', NULL, '321 Beachfront, Durban', 7500.00, '2024-04-01', '2025-03-31', 'active'),
('David Brown', 'david.brown@email.com', '+27 11 333 7890', NULL, '654 Mountain View, Bloemfontein', 11000.00, '2024-01-15', '2024-12-14', 'inactive');

-- Create indexes for better performance
CREATE INDEX idx_tenant_status ON tenants(status);
CREATE INDEX idx_tenant_property ON tenants(property_id);
CREATE INDEX idx_tenant_email ON tenants(email);

-- Create a view for active tenant reports
CREATE VIEW active_tenant_report AS
SELECT 
    t.id,
    t.full_name,
    t.email,
    t.phone,
    COALESCE(p.address, t.property_address) as property_address,
    t.rent_amount,
    t.lease_start,
    t.lease_end,
    t.status,
    p.type as property_type,
    p.status as property_status
FROM tenants t
LEFT JOIN properties p ON t.property_id = p.id
WHERE t.status = 'active';

-- Create a view for lease expiration alerts
CREATE VIEW lease_expiration_alerts AS
SELECT 
    t.id,
    t.full_name,
    t.email,
    t.property_address,
    t.rent_amount,
    t.lease_end,
    DATEDIFF(t.lease_end, CURDATE()) as days_remaining,
    CASE 
        WHEN DATEDIFF(t.lease_end, CURDATE()) <= 30 THEN 'URGENT'
        WHEN DATEDIFF(t.lease_end, CURDATE()) <= 90 THEN 'WARNING'
        ELSE 'OK'
    END as alert_level
FROM tenants t
WHERE t.status = 'active'
AND t.lease_end IS NOT NULL
AND t.lease_end > CURDATE()
ORDER BY days_remaining ASC;

-- Create a view for financial reporting
CREATE VIEW tenant_financial_report AS
SELECT 
    t.id,
    t.full_name,
    t.property_address,
    t.rent_amount,
    t.status,
    DATE_FORMAT(t.lease_start, '%Y-%m') as lease_start_month,
    DATE_FORMAT(t.lease_end, '%Y-%m') as lease_end_month,
    TIMESTAMPDIFF(MONTH, t.lease_start, t.lease_end) as lease_duration_months,
    (t.rent_amount * TIMESTAMPDIFF(MONTH, t.lease_start, t.lease_end)) as total_lease_value
FROM tenants t
WHERE t.status = 'active'
AND t.lease_start IS NOT NULL
AND t.lease_end IS NOT NULL;

-- Create a view for property occupancy analysis
CREATE VIEW property_occupancy_analysis AS
SELECT 
    p.id as property_id,
    p.address,
    p.type,
    p.rent as property_rent,
    p.status as property_status,
    t.id as tenant_id,
    t.full_name as tenant_name,
    t.rent_amount as tenant_rent,
    t.lease_start,
    t.lease_end,
    CASE 
        WHEN t.id IS NOT NULL THEN 'Occupied'
        ELSE 'Vacant'
    END as occupancy_status,
    CASE 
        WHEN t.lease_end IS NOT NULL AND DATEDIFF(t.lease_end, CURDATE()) <= 30 THEN 'Lease Expiring Soon'
        WHEN t.id IS NOT NULL THEN 'Occupied'
        ELSE 'Available'
    END as occupancy_notes
FROM properties p
LEFT JOIN tenants t ON p.id = t.property_id AND t.status = 'active'
ORDER BY p.status, p.address;
