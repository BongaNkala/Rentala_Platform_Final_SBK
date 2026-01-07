# 🏠 Rentala Platform

A modern, elegant property management platform for rental properties. Built with a clean frontend and a robust Node.js backend with SQLite database.

## ✨ Features

- **User Authentication** - Secure login system with demo credentials
- **Property Management** - Add, view, and manage rental properties
- **Dashboard Analytics** - Real-time statistics and insights
- **Modern UI** - Glassmorphism design with smooth animations
- **RESTful API** - Complete backend API for property operations
- **SQLite Database** - Lightweight, file-based database

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

### Installation

1. **Navigate to the project directory**
   ```bash
   cd rentala-dev
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   ```
   http://localhost:3002
   ```

## 🔐 Demo Credentials

Use these credentials to log in:

- **Email**: `demo@rentala.com`
- **Password**: `demopassword123`

Or use any valid email format with a password of at least 6 characters.

## 📁 Project Structure

```
rentala-dev/
├── server.js              # Express server and API routes
├── package.json           # Node.js dependencies
├── rentala.db            # SQLite database (auto-created)
├── login.html            # Login page
├── dashboard.html        # Main dashboard
├── dashboard.css         # Dashboard styles
├── js/
│   ├── auth.js          # Authentication logic
│   └── dashboard.js     # Dashboard functionality
├── images/              # Image assets
└── README.md           # This file
```

## 🔌 API Endpoints

### Properties

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | Get all properties |
| GET | `/api/properties/:id` | Get single property |
| POST | `/api/properties` | Create new property |
| PUT | `/api/properties/:id` | Update property |
| DELETE | `/api/properties/:id` | Delete property |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check API status |

### Example API Request

**Create a new property:**

```bash
curl -X POST http://localhost:3002/api/properties \
  -H "Content-Type: application/json" \
  -d '{
    "address": "123 Main Street, Johannesburg",
    "type": "Apartment",
    "rent": 8500,
    "status": "available"
  }'
```

## 🛠️ Development

### Start with auto-reload (development mode)

```bash
npm run dev
```

This uses `nodemon` to automatically restart the server when you make changes.

### VS Code Setup

1. Open the project in VS Code:
   ```bash
   code .
   ```

2. Install recommended extensions:
   - ESLint
   - Prettier
   - SQLite Viewer

3. The server will serve static files, so you can edit HTML, CSS, and JS files and just refresh your browser.

## 🎨 UI Features

- **Glassmorphism Design** - Modern transparent glass effect
- **Responsive Layout** - Works on desktop and mobile
- **Smooth Animations** - Polished user experience
- **Real-time Updates** - Dashboard updates automatically
- **Custom Color Scheme** - Professional blue and purple gradient

## 🔒 Security Notes

**Current Implementation:**
- Client-side authentication (for demo purposes)
- No password hashing
- Tokens stored in localStorage

**For Production:**
- Implement JWT authentication
- Hash passwords with bcrypt
- Use HTTP-only cookies
- Add HTTPS
- Implement rate limiting
- Add input sanitization

## 📊 Database Schema

### Properties Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| address | TEXT | Property address |
| type | TEXT | Property type (Apartment, House, etc.) |
| rent | REAL | Monthly rent amount |
| status | TEXT | Status (available, occupied) |
| createdAt | DATETIME | Creation timestamp |

## 🐛 Troubleshooting

### Port already in use

If port 3002 is already in use, you can change it in `server.js`:

```javascript
const PORT = 3002; // Change to any available port
```

### Database locked

If you get a "database is locked" error, make sure only one instance of the server is running.

### Cannot find module

Run `npm install` again to ensure all dependencies are installed.

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 👨‍💻 Author

**BongaNkala**

## 🙏 Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- Express.js for the backend framework
- SQLite for the database
