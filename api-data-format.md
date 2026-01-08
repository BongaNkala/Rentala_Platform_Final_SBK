# API Data Format

## Backend Format
```json
{
  "id": 1,
  "address": "123 Main Street, Johannesburg",
  "type": "Apartment",
  "rent": 8500,
  "status": "available",
  "createdAt": "2024-01-15"
}
cat > api-data-format.md << 'EOF'
# API Data Format

## Backend Format
{
  "id": 1,
  "address": "123 Main Street, Johannesburg",
  "type": "Apartment",
  "rent": 8500,
  "status": "available",
  "createdAt": "2024-01-15"
}

## Frontend Format  
{
  "id": 1,
  "name": "Property 1",
  "address": "123 Main Street",
  "city": "Johannesburg",
  "type": "residential",
  "units": 1,
  "value": 850000,
  "status": "active",
  "rent": 8500
}
