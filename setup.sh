#!/bin/bash

# Rentala Platform Setup Script
echo "íº€ Setting up Rentala Payments Platform..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "âŒ Node.js is not installed. Please install Node.js first."
    echo "í³¦ Download from: https://nodejs.org/"
    exit 1
fi

echo "âœ… Node.js is installed: $(node --version)"

# Install dependencies
echo "í³¦ Installing dependencies..."
npm install

# Create necessary directories
echo "í³ Creating directories..."
mkdir -p data public/{css,js,images}

# Create sample background image placeholder
echo "í¾¨ Creating sample files..."
curl -s -o public/images/rentala_web_background.png https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=1080&fit=crop 2>/dev/null || echo "í³ Using placeholder for background image"

# Create favicon
echo "í³ Creating favicon..."
echo "data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAI0lEQVQ4jWNkYGD4z4AE/mNggIEMaDAwMDAwMKAqgKkAAwEAAO2BC7B5v5rGAAAAAElFTkSuQmCC" | base64 -d > public/images/favicon.ico 2>/dev/null || echo "í³ Created favicon placeholder"

# Initialize data files
echo "í²¾ Initializing data files..."
cat > data/payments.json << 'DATAEOF'
[
  {
    "id": "pay_1705399200000_abc123",
    "tenantId": "1",
    "tenantName": "John Smith",
    "propertyId": "1",
    "propertyName": "Sunset Villa",
    "amount": 8500,
    "date": "2024-01-15",
    "method": "bank_transfer",
    "status": "completed",
    "reference": "TXN001234",
    "notes": "Monthly rent payment",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  },
  {
    "id": "pay_1705399200001_def456",
    "tenantId": "2",
    "tenantName": "Sarah Johnson",
    "propertyId": "2",
    "propertyName": "Mountain View",
    "amount": 7200,
    "date": "2024-01-10",
    "method": "eft",
    "status": "pending",
    "reference": "TXN001235",
    "notes": "Partial payment received",
    "createdAt": "2024-01-10T09:30:00.000Z",
    "updatedAt": "2024-01-10T09:30:00.000Z"
  },
  {
    "id": "pay_1705399200002_ghi789",
    "tenantId": "3",
    "tenantName": "Mike Wilson",
    "propertyId": "3",
    "propertyName": "City Center Apt",
    "amount": 9500,
    "date": "2023-12-25",
    "method": "cash",
    "status": "overdue",
    "reference": "TXN001236",
    "notes": "Overdue - follow up required",
    "createdAt": "2023-12-25T14:00:00.000Z",
    "updatedAt": "2023-12-25T14:00:00.000Z"
  }
]
DATAEOF

cat > data/tenants.json << 'DATAEOF'
[
  {
    "id": "1",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "0712345678",
    "address": "123 Main St",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "2",
    "name": "Sarah Johnson",
    "email": "sarah@example.com",
    "phone": "0712345679",
    "address": "456 Oak Ave",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "3",
    "name": "Mike Wilson",
    "email": "mike@example.com",
    "phone": "0712345680",
    "address": "789 Pine Rd",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
DATAEOF

cat > data/properties.json << 'DATAEOF'
[
  {
    "id": "1",
    "name": "Sunset Villa",
    "address": "123 Beach Rd",
    "type": "House",
    "rent": 8500,
    "bedrooms": 3,
    "bathrooms": 2,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "2",
    "name": "Mountain View",
    "address": "456 Hill St",
    "type": "Apartment",
    "rent": 7200,
    "bedrooms": 2,
    "bathrooms": 1,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "3",
    "name": "City Center Apt",
    "address": "789 Main St",
    "type": "Apartment",
    "rent": 9500,
    "bedrooms": 3,
    "bathrooms": 2,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
DATAEOF

echo "âœ… Setup complete!"
echo ""
echo "íº€ To start the application:"
echo "   npm start"
echo ""
echo "í³‚ Directory structure:"
echo "   â”œâ”€â”€ public/payments.html     # Main payments page"
echo "   â”œâ”€â”€ public/css/payments.css  # Styles"
echo "   â”œâ”€â”€ public/js/payments.js    # JavaScript"
echo "   â”œâ”€â”€ api/payments/           # Backend API"
echo "   â”œâ”€â”€ data/                   # JSON data files"
echo "   â””â”€â”€ server.js              # Main server"
echo ""
echo "í¼ Open in browser: http://localhost:3000"
