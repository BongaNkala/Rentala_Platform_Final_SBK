# 🚀 Rentala Platform - Complete Setup Guide

## Overview

The Rentala Platform is now fully set up and ready to use! This guide will help you access the code in VS Code and run the server locally.

## ✅ What's Been Set Up

1. **Clean Codebase** - All encoding issues fixed, UTF-8 throughout
2. **Backend Server** - Node.js + Express + SQLite database
3. **Frontend** - Clean HTML, CSS, and JavaScript files
4. **API Endpoints** - Full CRUD operations for properties
5. **Documentation** - README and this setup guide

## 📂 Project Location

The project is located at:
```
/home/ubuntu/rentala-dev/
```

## 🖥️ Opening in VS Code

### Option 1: Open via Terminal
```bash
cd /home/ubuntu/rentala-dev
code .
```

### Option 2: Open Workspace File
```bash
code /home/ubuntu/rentala-dev/rentala.code-workspace
```

### Option 3: VS Code File Menu
1. Open VS Code
2. File → Open Folder
3. Navigate to `/home/ubuntu/rentala-dev`
4. Click "Open"

## 🏃 Running the Server

### Method 1: Using npm (Recommended)
```bash
cd /home/ubuntu/rentala-dev
npm start
```

### Method 2: Using the start script
```bash
cd /home/ubuntu/rentala-dev
./start.sh
```

### Method 3: Direct Node.js
```bash
cd /home/ubuntu/rentala-dev
node server.js
```

## 🌐 Accessing the Application

Once the server is running, you'll see:

```
╔═══════════════════════════════════════╗
║   🏠 Rentala Platform Server         ║
║   ✅ Server running on port 3002     ║
║   📍 http://localhost:3002            ║
║   🔌 API: http://localhost:3002/api   ║
╚═══════════════════════════════════════╝
```

### Local Access
Open your browser and go to:
- **Application**: http://localhost:3002
- **API Health**: http://localhost:3002/api/health

### Public Access (Current Session)
The server is currently exposed at:
```
https://3002-ie3cmzgexd7j40q9pq5iz-e87bc7f4.us1.manus.computer
```

**Note**: This public URL is temporary and only works while the current session is active.

## 🔐 Login Credentials

### Demo Account
- **Email**: `demo@rentala.com`
- **Password**: `demopassword123`

### Any Valid Email
You can also log in with any valid email format and a password of at least 6 characters.

## 📁 Project Structure

```
rentala-dev/
├── server.js              # Backend server (Node.js + Express)
├── package.json           # Dependencies
├── rentala.db            # SQLite database (auto-created)
├── login.html            # Login page
├── dashboard.html        # Main dashboard
├── dashboard.css         # Styles
├── js/
│   ├── auth.js          # Authentication
│   └── dashboard.js     # Dashboard logic
├── images/              # Assets
├── README.md           # Main documentation
├── SETUP_GUIDE.md      # This file
├── .gitignore          # Git ignore rules
└── start.sh            # Quick start script
```

## 🔧 Development Workflow

### 1. Start the Server
```bash
npm start
```

### 2. Make Changes
- Edit HTML, CSS, or JS files in VS Code
- The server serves static files automatically

### 3. Test Changes
- Refresh your browser to see changes
- Check the terminal for server logs

### 4. Stop the Server
Press `Ctrl+C` in the terminal where the server is running

## 🧪 Testing the API

### Get All Properties
```bash
curl http://localhost:3002/api/properties
```

### Create a Property
```bash
curl -X POST http://localhost:3002/api/properties \
  -H "Content-Type: application/json" \
  -d '{
    "address": "456 Test Avenue, Cape Town",
    "type": "House",
    "rent": 12000,
    "status": "available"
  }'
```

### Get Single Property
```bash
curl http://localhost:3002/api/properties/1
```

### Update a Property
```bash
curl -X PUT http://localhost:3002/api/properties/1 \
  -H "Content-Type: application/json" \
  -d '{
    "address": "456 Updated Street",
    "type": "House",
    "rent": 13000,
    "status": "occupied"
  }'
```

### Delete a Property
```bash
curl -X DELETE http://localhost:3002/api/properties/1
```

## 🗄️ Database

The SQLite database (`rentala.db`) is automatically created when you start the server.

### View Database Contents
You can use the SQLite command-line tool:
```bash
sqlite3 /home/ubuntu/rentala-dev/rentala.db
```

Then run SQL queries:
```sql
SELECT * FROM properties;
.exit
```

### VS Code SQLite Extension
Install the "SQLite Viewer" extension in VS Code to view the database visually.

## 🐛 Troubleshooting

### Server Won't Start
**Problem**: Port 3002 already in use
**Solution**: Kill the existing process
```bash
lsof -ti:3002 | xargs kill -9
```

### Database Locked
**Problem**: "Database is locked" error
**Solution**: Only run one server instance at a time

### Cannot Find Module
**Problem**: Missing dependencies
**Solution**: Reinstall packages
```bash
cd /home/ubuntu/rentala-dev
rm -rf node_modules package-lock.json
npm install
```

### Changes Not Showing
**Problem**: Browser cache
**Solution**: Hard refresh
- Chrome/Firefox: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or open DevTools and disable cache

## 📝 Next Steps

### Recommended Improvements

1. **Add More Features**
   - Tenant management
   - Payment tracking
   - Reports and analytics

2. **Enhance Security**
   - Implement JWT authentication
   - Add password hashing
   - Use environment variables

3. **Improve UI**
   - Add property images
   - Implement search and filters
   - Add pagination

4. **Testing**
   - Write unit tests
   - Add integration tests
   - Set up CI/CD

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 💡 Tips

- **Auto-reload**: Install `nodemon` globally for automatic server restarts
  ```bash
  npm install -g nodemon
  npm run dev
  ```

- **VS Code Extensions**: Install these for better development experience
  - ESLint
  - Prettier
  - SQLite Viewer
  - Live Server (for frontend-only testing)

- **Git Integration**: Initialize a git repository to track changes
  ```bash
  cd /home/ubuntu/rentala-dev
  git init
  git add .
  git commit -m "Initial commit: Rentala Platform setup"
  ```

## ✅ Verification Checklist

- [ ] Server starts without errors
- [ ] Can access http://localhost:3002
- [ ] Login page loads correctly
- [ ] Can log in with demo credentials
- [ ] Dashboard displays properly
- [ ] Can add a new property
- [ ] Property appears in the list
- [ ] Statistics update correctly
- [ ] API endpoints respond correctly

## 🎉 You're All Set!

The Rentala Platform is ready for development. Happy coding! 🚀
