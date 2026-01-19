# System Architecture Document
## Digital Health Wallet - 2care.ai

## Overview

The Digital Health Wallet is a full-stack web application built using a three-tier architecture pattern (Presentation, Application, Data layers) with clear separation of concerns.

## Architecture Pattern

**Model-View-Controller (MVC) with RESTful API**

The application follows a client-server architecture where:
- **Client (View)**: React SPA handles presentation and user interactions
- **Server (Controller)**: Express.js handles business logic and routing
- **Database (Model)**: PostgreSQL stores persistent data

## Component Architecture

### 1. Frontend Architecture (React)

#### Component Hierarchy
```
App
├── AuthProvider (Context)
│   ├── Navbar
│   ├── Router
│   │   ├── Public Routes
│   │   │   ├── Login
│   │   │   └── Register
│   │   └── Private Routes (Protected)
│   │       ├── Dashboard
│   │       ├── Reports
│   │       │   ├── ReportsList
│   │       │   ├── UploadReport
│   │       │   └── ReportDetail
│   │       ├── Vitals
│   │       ├── SharedReports
│   │       └── Profile
```

#### State Management
- **Authentication State**: Managed via React Context API
- **Local State**: Component-level state using useState
- **Server State**: API calls via Axios with response caching

#### Routing Strategy
- **React Router v6** for client-side routing
- **Private Routes**: Protected by authentication check
- **Lazy Loading**: Can be implemented for code splitting

### 2. Backend Architecture (Node.js + Express)

#### Layered Architecture

```
┌─────────────────────────────────┐
│     Routes Layer                │
│  (API Endpoint Definitions)     │
└─────────────────────────────────┘
              ▼
┌─────────────────────────────────┐
│    Middleware Layer             │
│  - Authentication (JWT)         │
│  - File Upload (Multer)         │
│  - Validation                   │
└─────────────────────────────────┘
              ▼
┌─────────────────────────────────┐
│   Controller Layer              │
│  (Business Logic)               │
└─────────────────────────────────┘
              ▼
┌─────────────────────────────────┐
│   Data Access Layer             │
│  (PostgreSQL Queries)           │
└─────────────────────────────────┘
```

#### Request Flow

1. **Client Request** → Express Router
2. **Middleware Check** → JWT Validation
3. **Controller Processing** → Business Logic
4. **Database Query** → PostgreSQL
5. **Response** → JSON/File to Client

### 3. Database Architecture (PostgreSQL)

#### Entity Relationship Diagram

```
┌─────────────┐
│    users    │
└─────────────┘
      │ 1
      │
      │ N
┌─────────────┐      N ┌──────────────────┐
│   reports   │────────│  shared_access   │
└─────────────┘        └──────────────────┘
      │ 1
      │
      │ N
┌─────────────┐
│   vitals    │
└─────────────┘
```

#### Table Relationships

**users** (1) → (N) **reports**
- One user can have many reports
- Foreign Key: reports.user_id → users.id
- Cascade Delete: Deleting user deletes all their reports

**reports** (1) → (N) **vitals**
- One report can have many vitals
- Foreign Key: vitals.report_id → reports.id
- Cascade Delete: Deleting report deletes all associated vitals

**reports** (1) → (N) **shared_access**
- One report can be shared with many users
- Foreign Key: shared_access.report_id → reports.id
- Cascade Delete: Deleting report deletes all shared access entries

**users** (1) → (N) **shared_access**
- One user can share many reports
- Foreign Key: shared_access.shared_by → users.id
- Cascade Delete: Deleting user removes their sharing records

#### Indexes
- `idx_reports_user_id`: Fast lookup of user's reports
- `idx_reports_date`: Date-based filtering
- `idx_vitals_report_id`: Fast vitals lookup per report
- `idx_vitals_type`: Filter vitals by type
- `idx_shared_access_email`: Find reports shared with an email

## Security Architecture

### Authentication Flow

```
1. User Login/Register
   ↓
2. Server validates credentials
   ↓
3. Server generates JWT token
   - Payload: userId, email
   - Expiry: 7 days
   ↓
4. Client stores token in localStorage
   ↓
5. Client includes token in all API requests
   - Header: Authorization: Bearer <token>
   ↓
6. Server verifies token on each request
   - Valid: Process request
   - Invalid: Return 401 Unauthorized
```

### Data Security Layers

1. **Transport Security**: HTTPS (in production)
2. **Authentication**: JWT tokens
3. **Authorization**: Resource ownership checks
4. **Input Validation**: Server-side validation
5. **SQL Injection Prevention**: Parameterized queries
6. **Password Security**: bcrypt hashing
7. **File Security**: Type and size validation

## File Storage Architecture

### Current Implementation: Local File System

```
backend/
└── uploads/
    ├── 1642345678901-abc123.pdf
    ├── 1642345789012-xyz456.jpg
    └── ... (unique filenames)
```

**Filename Strategy**: `timestamp-random-originalextension`

### Production Recommendation: Cloud Storage

```
┌──────────────┐      Upload      ┌──────────────┐
│   Frontend   │─────────────────→│   Backend    │
└──────────────┘                   └──────────────┘
                                          │
                                          │ Store
                                          ▼
                                   ┌──────────────┐
                                   │  AWS S3 /    │
                                   │  Azure Blob  │
                                   └──────────────┘
```

**Benefits**:
- Scalability
- CDN integration
- Backup and redundancy
- Cost-effective

## API Design Principles

### RESTful Conventions

- **Resource-based URLs**: `/api/reports`, `/api/vitals`
- **HTTP Methods**:
  - GET: Retrieve data
  - POST: Create new resource
  - PUT: Update existing resource
  - DELETE: Remove resource
- **Status Codes**:
  - 200: Success
  - 201: Created
  - 400: Bad Request
  - 401: Unauthorized
  - 404: Not Found
  - 500: Server Error

### Response Format

```json
{
  "message": "Success message",
  "data": { },
  "error": null
}
```

### Error Handling

```json
{
  "error": "Error message",
  "details": "Additional details"
}
```

## Scalability Considerations

### Current Limitations
- Single server instance
- Local file storage
- No caching layer
- No load balancing

### Scalability Improvements

1. **Horizontal Scaling**
   - Deploy multiple backend instances
   - Add load balancer (Nginx, AWS ALB)
   - Session management via Redis

2. **Database Optimization**
   - Read replicas for reporting queries
   - Connection pooling
   - Query optimization
   - Partitioning large tables

3. **Caching Strategy**
   - Redis for frequently accessed data
   - CDN for static assets
   - Browser caching headers

4. **Microservices Migration**
   ```
   Current: Monolith
   Future:
   - Auth Service
   - Reports Service
   - Vitals Service
   - File Storage Service
   - Notification Service
   ```

## Performance Optimization

### Frontend
- Code splitting with React lazy loading
- Image optimization
- Gzip compression
- Browser caching
- Debouncing search/filter inputs

### Backend
- Database query optimization
- Response compression
- Connection pooling
- Async operations
- Rate limiting

### Database
- Proper indexing
- Query optimization
- Regular VACUUM
- Connection pooling

## Monitoring & Logging

### Recommended Tools

**Application Monitoring**:
- PM2 for process management
- New Relic / Datadog for APM
- Sentry for error tracking

**Logging**:
- Winston for structured logging
- ELK Stack (Elasticsearch, Logstash, Kibana)

**Metrics**:
- Response times
- Error rates
- API usage
- Database performance

## Deployment Architecture

### Development
```
localhost:3000 (Frontend)
     ↓
localhost:5000 (Backend)
     ↓
localhost:5432 (PostgreSQL)
```

### Production (Recommended)

```
┌─────────────────┐
│   CDN/Cloudflare│
└─────────────────┘
        ↓
┌─────────────────┐
│  Load Balancer  │
└─────────────────┘
        ↓
┌─────────────────────────────────┐
│  Frontend (Vercel/Netlify)      │
│  - Static React Build           │
└─────────────────────────────────┘
        ↓ API Calls
┌─────────────────────────────────┐
│  Backend Cluster                │
│  - Node.js instances            │
│  - Auto-scaling                 │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│  Database (AWS RDS/Azure)       │
│  - PostgreSQL                   │
│  - Automated backups            │
└─────────────────────────────────┘
        ↓
┌─────────────────────────────────┐
│  File Storage (S3/Azure Blob)   │
│  - Medical reports              │
│  - CDN integration              │
└─────────────────────────────────┘
```

## Technology Choices Rationale

### Frontend: React
- **Why**: Component reusability, large ecosystem, excellent documentation
- **Alternatives**: Vue.js, Angular

### Backend: Node.js + Express
- **Why**: JavaScript across stack, non-blocking I/O, extensive middleware
- **Alternatives**: Python (Django/Flask), Java (Spring Boot)

### Database: PostgreSQL
- **Why**: ACID compliance, relational data model, JSON support, open-source
- **Alternatives**: MySQL, MongoDB (for document storage)

### Authentication: JWT
- **Why**: Stateless, scalable, widely supported
- **Alternatives**: Session-based auth, OAuth2

## Future Enhancements

### Phase 2 Features
1. Email notifications for sharing
2. WhatsApp integration for report upload
3. OCR for extracting data from reports
4. AI-powered health insights
5. Mobile app (React Native)
6. Multi-language support
7. Dark mode
8. Export reports as PDF

### Phase 3 Features
1. Doctor dashboard
2. Appointment scheduling
3. Telemedicine integration
4. Insurance claim management
5. Family account management
6. Health goals and reminders

## Compliance & Standards

### Healthcare Standards
- **HIPAA** compliance considerations
- **HL7** FHIR for data interoperability
- **DICOM** for medical imaging

### Data Privacy
- **GDPR** compliance (EU)
- **CCPA** compliance (California)
- Data encryption at rest and in transit
- Right to be forgotten

## Testing Strategy

### Unit Tests
- Controller functions
- Service methods
- Utility functions

### Integration Tests
- API endpoints
- Database operations
- Authentication flow

### End-to-End Tests
- User registration & login
- Report upload workflow
- Vitals tracking
- Sharing functionality

### Testing Tools
- **Frontend**: Jest, React Testing Library
- **Backend**: Jest, Supertest
- **E2E**: Cypress, Playwright

## Backup & Disaster Recovery

### Backup Strategy
- **Database**: Daily automated backups
- **Files**: Replicated across regions
- **Configuration**: Version controlled

### Recovery Plan
- **RPO** (Recovery Point Objective): < 24 hours
- **RTO** (Recovery Time Objective): < 4 hours
- **Procedures**: Documented restore process

---

## Conclusion

This architecture provides a solid foundation for a healthcare application with considerations for security, scalability, and future enhancements. The modular design allows for easy maintenance and feature additions while maintaining code quality and performance.
