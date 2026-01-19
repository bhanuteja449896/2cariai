# Quick Setup Guide

## Prerequisites Checklist
- [ ] Node.js installed (v16+)
- [ ] PostgreSQL installed (v12+)
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

## Step-by-Step Setup

### 1. PostgreSQL Setup

#### Option A: Using psql Command Line
```bash
# Start PostgreSQL service
sudo service postgresql start

# Login as postgres user
sudo -u postgres psql

# In psql prompt:
CREATE DATABASE health_wallet;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE health_wallet TO your_username;
\q
```

#### Option B: Using pgAdmin
1. Open pgAdmin
2. Right-click on "Databases" → "Create" → "Database"
3. Name: `health_wallet`
4. Save

### 2. Backend Configuration

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your PostgreSQL credentials
nano .env  # or use your preferred editor
```

**Update these values in .env:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=health_wallet
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
JWT_SECRET=generate_a_random_secret_key_here
```

**Initialize Database:**
```bash
npm run init-db
```

You should see:
```
✓ Users table created
✓ Reports table created
✓ Vitals table created
✓ Shared Access table created
✓ Indexes created
Database initialization completed successfully!
```

### 3. Frontend Configuration

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

### 4. Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev

# You should see:
# Server is running on port 5000
# Environment: development
# Connected to PostgreSQL database
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev

# You should see:
# VITE v5.x.x  ready in xxx ms
# ➜  Local:   http://localhost:3000/
```

### 5. First Time Access

1. Open browser: http://localhost:3000
2. Click "Register here"
3. Fill in registration form
4. Login with your credentials
5. Start uploading reports!

## Common Issues & Solutions

### Issue: Database connection error
**Solution:**
- Verify PostgreSQL is running: `sudo service postgresql status`
- Check credentials in `.env` file
- Ensure database `health_wallet` exists
- Check if PostgreSQL is listening on port 5432

### Issue: Port 5000 already in use
**Solution:**
- Change PORT in backend/.env to another port (e.g., 5001)
- Update frontend/vite.config.js proxy target

### Issue: npm install fails
**Solution:**
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and package-lock.json
- Run `npm install` again

### Issue: Frontend can't connect to backend
**Solution:**
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify proxy configuration in vite.config.js

## Testing the Application

### 1. Register a User
- Go to `/register`
- Fill in all fields
- Submit form

### 2. Upload a Report
- Go to Dashboard
- Click "Upload New Report"
- Fill in report details
- Add vitals (optional)
- Select a PDF or image file
- Submit

### 3. View Vitals Trends
- Go to Vitals page
- Select a vital type from dropdown
- View the chart and statistics

### 4. Share a Report
- Go to Reports page
- Click on a report
- Click "Share" button
- Enter recipient email
- Submit

### 5. View Shared Reports
- Login with different account
- Go to "Shared" page
- See reports shared with you

## PostgreSQL Commands Reference

```bash
# Connect to database
psql -U your_username -d health_wallet

# List all tables
\dt

# View table structure
\d users
\d reports
\d vitals
\d shared_access

# Count records
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM reports;

# View all users
SELECT id, email, full_name FROM users;

# Exit psql
\q
```

## Development Tips

### Backend Hot Reload
The backend uses `nodemon` for automatic restart on file changes.

### Frontend Hot Reload
Vite provides instant hot module replacement (HMR).

### Database Changes
If you modify the database schema:
1. Drop existing tables (if in development):
   ```sql
   DROP TABLE IF EXISTS shared_access CASCADE;
   DROP TABLE IF EXISTS vitals CASCADE;
   DROP TABLE IF EXISTS reports CASCADE;
   DROP TABLE IF EXISTS users CASCADE;
   ```
2. Run `npm run init-db` again

### API Testing
Use tools like:
- Postman
- Thunder Client (VS Code extension)
- curl commands

Example curl:
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "full_name": "Test User"
  }'
```

## Deployment Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to a strong random string
- [ ] Set NODE_ENV=production
- [ ] Use environment variables (no hardcoded credentials)
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Set up monitoring and logging
- [ ] Use a production PostgreSQL instance
- [ ] Implement cloud storage for files
- [ ] Add proper error handling
- [ ] Run security audit: `npm audit`

## Support

If you encounter issues:
1. Check the console logs (both frontend and backend)
2. Verify all dependencies are installed
3. Ensure PostgreSQL is running
4. Check network connectivity
5. Review the error messages carefully

## Next Steps

After successful setup:
1. Explore all features
2. Review the code structure
3. Read ARCHITECTURE.md for detailed design
4. Consider implementing additional features
5. Add tests for critical functionality

---

Happy Coding! 🚀
