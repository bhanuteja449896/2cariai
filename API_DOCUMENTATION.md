# API Documentation
## Digital Health Wallet API

Base URL: `http://localhost:5000/api`

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Authentication Endpoints

### Register New User

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "phone": "1234567890",
  "date_of_birth": "1990-01-15",
  "gender": "Male"
}
```

**Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "full_name": "John Doe",
    "phone": "1234567890",
    "date_of_birth": "1990-01-15",
    "gender": "Male"
  }
}
```

### Login User

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "full_name": "John Doe"
  }
}
```

### Get User Profile

**Endpoint:** `GET /auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "user": {
    "id": 1,
    "email": "john@example.com",
    "full_name": "John Doe",
    "phone": "1234567890",
    "date_of_birth": "1990-01-15",
    "gender": "Male",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Update User Profile

**Endpoint:** `PUT /auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "full_name": "John Updated Doe",
  "phone": "9876543210",
  "date_of_birth": "1990-01-15",
  "gender": "Male"
}
```

**Response:** `200 OK`
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "john@example.com",
    "full_name": "John Updated Doe",
    "phone": "9876543210"
  }
}
```

## Reports Endpoints

### Upload Report

**Endpoint:** `POST /reports`

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file`: File (PDF/JPG/PNG)
- `title`: String
- `report_type`: String
- `report_date`: Date (YYYY-MM-DD)
- `notes`: String (optional)
- `vitals`: JSON String (optional)

**Example Vitals:**
```json
[
  {
    "vital_type": "Blood Sugar",
    "vital_value": "95",
    "unit": "mg/dL"
  },
  {
    "vital_type": "Blood Pressure",
    "vital_value": "120/80",
    "unit": "mmHg"
  }
]
```

**Response:** `201 Created`
```json
{
  "message": "Report uploaded successfully",
  "report": {
    "id": 1,
    "user_id": 1,
    "title": "Blood Test Results",
    "report_type": "Blood Test",
    "file_path": "uploads/1642345678901-abc123.pdf",
    "file_name": "blood-test-2024.pdf",
    "file_type": "application/pdf",
    "report_date": "2024-01-15",
    "notes": "Annual checkup results",
    "created_at": "2024-01-15T10:30:00.000Z",
    "vitals": [
      {
        "id": 1,
        "report_id": 1,
        "vital_type": "Blood Sugar",
        "vital_value": "95",
        "unit": "mg/dL"
      }
    ]
  }
}
```

### Get All Reports

**Endpoint:** `GET /reports`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `report_type` (optional): Filter by report type
- `start_date` (optional): Start date filter (YYYY-MM-DD)
- `end_date` (optional): End date filter (YYYY-MM-DD)
- `vital_type` (optional): Filter by vital type

**Example:** `GET /reports?report_type=Blood%20Test&start_date=2024-01-01`

**Response:** `200 OK`
```json
{
  "reports": [
    {
      "id": 1,
      "user_id": 1,
      "title": "Blood Test Results",
      "report_type": "Blood Test",
      "file_name": "blood-test-2024.pdf",
      "report_date": "2024-01-15",
      "notes": "Annual checkup results",
      "created_at": "2024-01-15T10:30:00.000Z",
      "vitals": [...]
    }
  ]
}
```

### Get Single Report

**Endpoint:** `GET /reports/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "report": {
    "id": 1,
    "title": "Blood Test Results",
    "report_type": "Blood Test",
    "file_path": "uploads/1642345678901-abc123.pdf",
    "file_name": "blood-test-2024.pdf",
    "file_type": "application/pdf",
    "report_date": "2024-01-15",
    "notes": "Annual checkup results",
    "vitals": [
      {
        "id": 1,
        "vital_type": "Blood Sugar",
        "vital_value": "95",
        "unit": "mg/dL"
      }
    ]
  }
}
```

### Download Report

**Endpoint:** `GET /reports/:id/download`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK` (File Download)
- Content-Type: application/pdf or image/jpeg or image/png
- Content-Disposition: attachment; filename="report.pdf"

### Delete Report

**Endpoint:** `DELETE /reports/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Report deleted successfully"
}
```

### Share Report

**Endpoint:** `POST /reports/:id/share`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "shared_with_email": "doctor@example.com",
  "shared_with_name": "Dr. Smith",
  "access_type": "viewer",
  "expires_at": "2024-12-31T23:59:59Z"
}
```

**Response:** `201 Created`
```json
{
  "message": "Report shared successfully",
  "shared_access": {
    "id": 1,
    "report_id": 1,
    "shared_by": 1,
    "shared_with_email": "doctor@example.com",
    "shared_with_name": "Dr. Smith",
    "access_type": "viewer",
    "expires_at": "2024-12-31T23:59:59Z",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Get Shared Reports

**Endpoint:** `GET /reports/shared`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "reports": [
    {
      "id": 5,
      "title": "MRI Scan",
      "report_type": "MRI",
      "report_date": "2024-01-10",
      "shared_by": 2,
      "owner_name": "Jane Doe",
      "owner_email": "jane@example.com",
      "access_type": "viewer",
      "expires_at": null,
      "vitals": [...]
    }
  ]
}
```

### Revoke Access

**Endpoint:** `DELETE /reports/shared/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Access revoked successfully"
}
```

## Vitals Endpoints

### Get Vitals

**Endpoint:** `GET /vitals`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `vital_type` (optional): Filter by vital type
- `start_date` (optional): Start date filter
- `end_date` (optional): End date filter

**Example:** `GET /vitals?vital_type=Blood%20Sugar&start_date=2024-01-01`

**Response:** `200 OK`
```json
{
  "vitals": [
    {
      "id": 1,
      "report_id": 1,
      "vital_type": "Blood Sugar",
      "vital_value": "95",
      "unit": "mg/dL",
      "report_date": "2024-01-15",
      "report_title": "Blood Test Results",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### Get Vitals Summary

**Endpoint:** `GET /vitals/summary`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "summary": [
    {
      "vital_type": "Blood Sugar",
      "vital_value": "95",
      "unit": "mg/dL",
      "report_date": "2024-01-15"
    },
    {
      "vital_type": "Blood Pressure",
      "vital_value": "120/80",
      "unit": "mmHg",
      "report_date": "2024-01-15"
    }
  ]
}
```

### Get Vital Types

**Endpoint:** `GET /vitals/types`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "vital_types": [
    "Blood Sugar",
    "Blood Pressure",
    "Heart Rate",
    "Weight"
  ]
}
```

### Get Vitals Trends

**Endpoint:** `GET /vitals/trends?vital_type=Blood%20Sugar`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `vital_type` (required): The vital type to get trends for

**Response:** `200 OK`
```json
{
  "vital_type": "Blood Sugar",
  "data": [
    {
      "vital_type": "Blood Sugar",
      "vital_value": "92",
      "unit": "mg/dL",
      "report_date": "2024-01-01",
      "report_title": "Monthly Checkup",
      "report_type": "Blood Test"
    },
    {
      "vital_type": "Blood Sugar",
      "vital_value": "95",
      "unit": "mg/dL",
      "report_date": "2024-01-15",
      "report_title": "Blood Test Results",
      "report_type": "Blood Test"
    }
  ],
  "statistics": {
    "count": 2,
    "min": 92,
    "max": 95,
    "average": 93.5,
    "latest": 95
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "error": "Access denied. No token provided."
}
```

or

```json
{
  "error": "Invalid token."
}
```

### 404 Not Found
```json
{
  "error": "Report not found or access denied"
}
```

### 500 Internal Server Error
```json
{
  "error": "Server error during operation"
}
```

## Report Types

Available report types:
- Blood Test
- X-Ray
- MRI
- CT Scan
- Ultrasound
- ECG
- General Checkup
- Prescription
- Lab Report
- Other

## Vital Types

Available vital types:
- Blood Pressure
- Blood Sugar
- Heart Rate
- Temperature
- Weight
- Height
- Oxygen Saturation
- Cholesterol
- Hemoglobin
- Other

## Access Types

Available access types for sharing:
- `viewer` - Read-only access
- `editor` - Can edit (future feature)

## Rate Limiting

Currently no rate limiting implemented. 

Recommended for production:
- 100 requests per 15 minutes per IP
- 1000 requests per day per user

## File Upload Limits

- Maximum file size: 5MB
- Allowed formats: PDF, JPG, JPEG, PNG
- Files stored in: `backend/uploads/`

## CORS Configuration

Development: All origins allowed
Production: Configure specific allowed origins

---

## Example Usage with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "full_name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

### Get Reports (with auth)
```bash
curl -X GET http://localhost:5000/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Upload Report
```bash
curl -X POST http://localhost:5000/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/report.pdf" \
  -F "title=Blood Test" \
  -F "report_type=Blood Test" \
  -F "report_date=2024-01-15" \
  -F "notes=Annual checkup"
```

---

For more details, refer to the source code in `backend/src/controllers/` directory.
