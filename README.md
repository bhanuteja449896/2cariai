# 🏥 Digital Health Wallet - 2care.ai

A comprehensive web application for managing personal health records with secure report storage, vitals tracking, and access sharing capabilities.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Security Features](#security-features)
- [Project Structure](#project-structure)
- [Demo Credentials](#demo-credentials)

## ✨ Features

### User Management
- User registration and authentication
- Secure JWT-based authorization
- Profile management with personal information
- Different access roles (Owner, Viewer)

### Health Reports
- Upload medical reports (PDF/Image files)
- Store comprehensive metadata (type, date, vitals)
- View and download uploaded reports
- Search and filter reports by:
  - Date range
  - Report type
  - Vital type
  - Report category

### Vitals Tracking
- Store multiple vitals per report
- Track vitals over time with interactive charts
- View trends and statistics
- Support for various vital types:
  - Blood Pressure
  - Blood Sugar
  - Heart Rate
  - Temperature
  - Weight, Height
  - Oxygen Saturation
  - Cholesterol, Hemoglobin

### Access Control & Sharing
- Share specific reports with others
- Define read-only or editor access
- Manage shared access permissions
- View reports shared by others
- Revoke access anytime

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18.2
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Charts**: Chart.js with react-chartjs-2
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Styling**: Custom CSS with CSS Variables

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **CORS**: cors middleware

### Database
- **RDBMS**: PostgreSQL
- **Schema**: Relational design with foreign keys
- **Tables**: Users, Reports, Vitals, Shared Access

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         React Application (Port 3000)                 │  │
│  │  - Components (Navbar, Cards, Modals)                │  │
│  │  - Pages (Dashboard, Reports, Vitals)                │  │
│  │  - Context API (Authentication)                       │  │
│  │  - Services (API Calls)                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │       Node.js + Express Server (Port 5000)           │  │
│  │                                                       │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │  │
│  │  │  Auth       │  │  Reports    │  │  Vitals    │  │  │
│  │  │  Routes     │  │  Routes     │  │  Routes    │  │  │
│  │  └─────────────┘  └─────────────┘  └────────────┘  │  │
│  │         ▼                 ▼                ▼         │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │  │
│  │  │  Auth       │  │  Report     │  │  Vitals    │  │  │
│  │  │  Controller │  │  Controller │  │  Controller│  │  │
│  │  └─────────────┘  └─────────────┘  └────────────┘  │  │
│  │         ▼                 ▼                ▼         │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │         Middleware Layer                      │  │  │
│  │  │  - JWT Authentication                         │  │  │
│  │  │  - File Upload (Multer)                       │  │  │
│  │  │  - Error Handling                             │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼ SQL Queries
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            PostgreSQL Database                        │  │
│  │                                                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │  │
│  │  │  users   │  │  reports │  │  shared_access   │  │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘  │  │
│  │       │              │                                │  │
│  │       └──────────────┴──────────────┐               │  │
│  │                                       ▼               │  │
│  │                              ┌──────────────┐        │  │
│  │                              │   vitals     │        │  │
│  │                              └──────────────┘        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Storage Layer                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         File System Storage                           │  │
│  │         (backend/uploads/)                            │  │
│  │  - PDF Documents                                      │  │
│  │  - Medical Images (JPEG, PNG)                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/health-wallet.git
cd 2cariai
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory based on `.env.example`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (UPDATE WITH YOUR CREDENTIALS)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=health_wallet
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password

# JWT Secret (Generate a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

## 🗄️ Database Setup

### Create PostgreSQL Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE health_wallet;

# Exit psql
\q
```

### Initialize Database Schema

```bash
cd backend
npm run init-db
```

This will create all necessary tables:
- `users` - User accounts and profiles
- `reports` - Medical reports metadata
- `vitals` - Health vitals data
- `shared_access` - Report sharing permissions

## ▶️ Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Server will run on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Application will run on http://localhost:3000

### Production Build

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "1234567890",
  "date_of_birth": "1990-01-01",
  "gender": "Male"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

## 🔐 Security Features

### Authentication & Authorization
- JWT-based authentication with secure token generation
- Password hashing using bcryptjs (10 salt rounds)
- Token expiration (7 days)
- Protected routes with middleware
- Automatic token refresh on API calls

### Data Protection
- SQL injection prevention using parameterized queries
- CORS configuration for cross-origin requests
- Input validation on all endpoints
- File type validation (PDF, JPEG, PNG only)
- File size limits (5MB maximum)

### Access Control
- Role-based access (Owner, Viewer)
- Report-level permissions
- Sharing expiration dates
- Access revocation capabilities

### File Security
- Unique filename generation
- Secure file storage outside web root
- Access validation before file download
- File type verification

## 📁 Project Structure

```
2cariai/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & initialization
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth & file upload
│   │   ├── routes/          # API endpoints
│   │   └── server.js        # Express app
│   ├── uploads/             # File storage
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # Auth context
│   │   ├── pages/           # Application pages
│   │   ├── services/        # API services
│   │   ├── utils/           # Helper functions
│   │   └── App.jsx          # Main component
│   └── package.json
│
└── README.md                # This file
```

## 🚦 Testing the Application

1. **Register a new user** at http://localhost:3000/register
2. **Login** with your credentials
3. **Upload a report** from the dashboard or reports page
4. **Add vitals** when uploading reports
5. **View vitals trends** with interactive charts
6. **Share a report** with another email address
7. **Download reports** as needed

## 🤝 Contributing

This is an assignment project for 2care.ai. For production use, consider:
- Implementing comprehensive error handling
- Adding unit and integration tests
- Setting up CI/CD pipelines
- Implementing cloud storage (AWS S3, Azure Blob)
- Adding email notifications for sharing
- Implementing WhatsApp integration
- Adding more chart types and analytics

## 📄 License

MIT License - Feel free to use this project for learning purposes.

## 👤 Author

Assignment for 2care.ai

---

**Note**: Remember to update your PostgreSQL credentials in the `.env` file before running the application.
Assignment Project
