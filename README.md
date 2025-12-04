# ScholarHub

A secure web application for managing student courses, assignments, and submissions with enterprise-level security features.

## 📋 Table of Contents
- [Project Overview](#project-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Security Features](#security-features)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Security Considerations](#security-considerations)

## 🎯 Project Overview

ScholarHub is a secure student portal developed as part of the Secure Web Development course at National College of Ireland. It demonstrates comprehensive security practices throughout the software development lifecycle, from design to deployment.

The application supports two user roles:
- **Students**: Can view enrolled courses, assignments, and submit their work
- **Admins**: Can manage users, courses, assignments, and grade submissions

## ✨ Features

### For Students
- Register and login with secure authentication
- View enrolled courses and upcoming assignments
- Submit assignments for grading
- Track submission status and grades
- View feedback from instructors

### For Administrators
- Manage user accounts (CRUD operations)
- Create and manage courses
- Create and manage assignments
- Enroll students in courses
- Grade student submissions
- View system-wide statistics

## 🛠️ Technology Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: iron-session (secure HTTP-only cookies)
- **Password Hashing**: bcryptjs
- **Validation**: Zod
- **Security**: Custom middleware for security headers

## 🔐 Security Features

### 1. Authentication & Authorization
- **Password Security**: Bcrypt hashing with 12 salt rounds
- **Session Management**: HTTP-only, secure, SameSite cookies via iron-session
- **Role-Based Access Control**: Student and Admin roles with appropriate permissions
- **Session Validation**: Server-side session verification on every protected route

### 2. Input Validation & Sanitization
- **Zod Schema Validation**: All user inputs validated against strict schemas
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: Input sanitization and output encoding
- **CSRF Protection**: SameSite cookie attribute
- **Email Validation**: RFC-compliant email validation
- **Password Requirements**: Minimum 8 characters, uppercase, lowercase, and numbers

### 3. Security Headers
Implemented via Next.js middleware:
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-XSS-Protection: 1; mode=block` - XSS filter
- `Strict-Transport-Security` - Enforces HTTPS
- `Content-Security-Policy` - Restricts resource loading
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` - Restricts browser features

### 4. Error Handling
- **Generic Error Messages**: No sensitive information in client responses
- **Detailed Server Logging**: Complete error details logged server-side
- **Graceful Degradation**: User-friendly error pages

### 5. Auditing & Logging
- Security event logging (login attempts, admin actions)
- Failed authentication tracking
- User activity monitoring
- Structured logging with timestamps and metadata

### 6. Data Protection
- **Password Storage**: Never stored in plain text
- **Database Encryption**: Connection string in environment variables
- **Session Token Security**: Cryptographically secure random tokens
- **Sensitive Data Exclusion**: Password hashes never sent to client

## 📁 Project Structure

```
secure-student-portal/
├── app/
│   ├── api/
│   │   ├── auth/           # Authentication endpoints
│   │   ├── courses/        # Course management
│   │   ├── assignments/    # Assignment management
│   │   ├── submissions/    # Submission handling
│   │   ├── users/          # User management
│   │   └── dashboard/      # Dashboard data
│   ├── auth/
│   │   ├── login/          # Login page
│   │   └── register/       # Registration page
│   ├── dashboard/
│   │   ├── student/        # Student dashboard
│   │   └── admin/          # Admin dashboard
│   └── layout.tsx          # Root layout with AuthProvider
├── components/
│   ├── AuthProvider.tsx    # Authentication context
│   ├── ProtectedRoute.tsx  # Route protection HOC
│   └── Navbar.tsx          # Navigation component
├── lib/
│   ├── db.ts              # Prisma client
│   ├── session.ts         # Session management
│   ├── auth.ts            # Authentication utilities
│   ├── validations.ts     # Zod schemas
│   └── logger.ts          # Logging utility
├── prisma/
│   └── schema.prisma      # Database schema
├── middleware.ts          # Security headers middleware
└── .env                   # Environment variables
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd secure-student-portal
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/secure_student_portal"
SESSION_SECRET="your-secret-key-minimum-32-characters-long"
NODE_ENV="development"
```

**Important**: Change the `SESSION_SECRET` to a cryptographically secure random string in production.

4. **Set up PostgreSQL database**
```bash
# Create the database
createdb secure_student_portal

# Or using psql
psql -U postgres
CREATE DATABASE secure_student_portal;
\q
```

5. **Run Prisma migrations**
```bash
npx prisma migrate dev --name init
```

6. **Generate Prisma Client**
```bash
npx prisma generate
```

7. **Seed the database (optional)**

You can create an admin user manually using the registration page and then updating the role in the database:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-admin-email@example.com';
```

8. **Start the development server**
```bash
npm run dev
```

9. **Access the application**
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use a strong, random `SESSION_SECRET`
3. Enable SSL/TLS for database connections
4. Use environment-specific database URLs
5. Run `npm run build` before deployment
6. Set up proper logging and monitoring

## 🗄️ Database Schema

### User
- `id`: UUID (Primary Key)
- `name`: String
- `email`: String (Unique)
- `passwordHash`: String
- `role`: Enum (STUDENT, ADMIN)
- `createdAt`, `updatedAt`: DateTime

### Course
- `id`: UUID (Primary Key)
- `code`: String (Unique)
- `name`: String
- `description`: String (Optional)
- `createdAt`, `updatedAt`: DateTime

### Enrollment
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key → User)
- `courseId`: UUID (Foreign Key → Course)
- `createdAt`, `updatedAt`: DateTime
- Unique constraint on (userId, courseId)

### Assignment
- `id`: UUID (Primary Key)
- `courseId`: UUID (Foreign Key → Course)
- `title`: String
- `description`: String (Optional)
- `dueDate`: DateTime (Optional)
- `createdAt`, `updatedAt`: DateTime

### Submission
- `id`: UUID (Primary Key)
- `assignmentId`: UUID (Foreign Key → Assignment)
- `studentId`: UUID (Foreign Key → User)
- `content`: String (Optional)
- `grade`: Float (Optional)
- `feedback`: String (Optional)
- `status`: Enum (PENDING, SUBMITTED, GRADED)
- `createdAt`, `updatedAt`: DateTime
- Unique constraint on (assignmentId, studentId)

### Session
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key → User)
- `sessionToken`: String (Unique)
- `expiresAt`: DateTime
- `createdAt`: DateTime

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Courses (Admin only for POST/PUT/DELETE)
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create course
- `GET /api/courses/[id]` - Get course details
- `PUT /api/courses/[id]` - Update course
- `DELETE /api/courses/[id]` - Delete course

### Enrollments (Admin only)
- `POST /api/courses/enrollments` - Enroll student
- `DELETE /api/courses/enrollments` - Remove enrollment

### Assignments
- `GET /api/assignments?courseId=xxx` - List assignments
- `POST /api/assignments` - Create assignment (Admin)
- `GET /api/assignments/[id]` - Get assignment details
- `PUT /api/assignments/[id]` - Update assignment (Admin)
- `DELETE /api/assignments/[id]` - Delete assignment (Admin)

### Submissions
- `POST /api/submissions` - Submit assignment (Student)
- `PUT /api/submissions/[id]/grade` - Grade submission (Admin)

### Users (Admin only)
- `GET /api/users` - List all users
- `GET /api/users/[id]` - Get user details
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Dashboard
- `GET /api/dashboard` - Get role-specific dashboard data

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] Registration with valid data
- [ ] Registration with weak password (should fail)
- [ ] Login with correct credentials
- [ ] Login with incorrect credentials (should fail)
- [ ] Access protected route without authentication (should redirect)
- [ ] Session persistence across page refreshes

#### Authorization
- [ ] Student cannot access admin routes
- [ ] Admin can access all routes
- [ ] Students can only see their own submissions
- [ ] Students can only submit to enrolled courses

#### Input Validation
- [ ] SQL injection attempts are blocked
- [ ] XSS attempts are sanitized
- [ ] Invalid email formats rejected
- [ ] Long input strings handled gracefully

#### Security Headers
Use browser DevTools Network tab to verify:
- [ ] X-Frame-Options header present
- [ ] X-XSS-Protection header present
- [ ] Strict-Transport-Security header present
- [ ] Content-Security-Policy header present

### Automated Testing

To be implemented with Jest and React Testing Library:

```bash
npm run test
```

## 🛡️ Security Considerations

### Threat Model

1. **SQL Injection**: Mitigated through Prisma ORM parameterized queries
2. **XSS Attacks**: Prevented via input validation and React's built-in escaping
3. **CSRF**: Mitigated with SameSite cookies and secure session management
4. **Brute Force**: Rate limiting should be implemented (future enhancement)
5. **Session Hijacking**: Prevented with HTTP-only, secure cookies
6. **Privilege Escalation**: Role-based checks on every protected operation
7. **Data Leakage**: Generic error messages, no sensitive data in responses

### Known Limitations

1. **Rate Limiting**: Not currently implemented - should add for production
2. **Password Reset**: Not implemented - future feature
3. **Two-Factor Authentication**: Not implemented - future enhancement
4. **Account Lockout**: Not implemented after failed login attempts
5. **File Upload**: Not implemented - would need additional security measures

### Security Best Practices Applied

- ✅ Principle of Least Privilege
- ✅ Defense in Depth
- ✅ Fail Securely
- ✅ Input Validation (Whitelist approach)
- ✅ Secure Session Management
- ✅ Proper Error Handling
- ✅ Security Logging and Monitoring
- ✅ Secure by Default configuration

## 📝 Development Notes

### Adding New Features

When adding new features, ensure:
1. Input validation with Zod schemas
2. Authorization checks for protected resources
3. Proper error handling with generic client messages
4. Security logging for sensitive operations
5. Database transactions where appropriate

### Database Migrations

After schema changes:
```bash
npx prisma migrate dev --name description_of_changes
npx prisma generate
```

## 📄 License

This project is for educational purposes as part of the Secure Web Development course at National College of Ireland.

## 👥 Author

[Your Name]
Student ID: [Your ID]
MSc in Cybersecurity - National College of Ireland

## 🙏 Acknowledgments

- National College of Ireland
- Dr. Zakaria Sabir
- Secure Web Development Course Materials
