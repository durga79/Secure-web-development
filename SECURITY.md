# Security Features Documentation

## Overview

This document provides a comprehensive overview of all security features implemented in the Secure Student Portal application. It serves as evidence of security considerations throughout the Software Development Lifecycle (SDLC).

## Table of Contents

1. [Authentication Security](#authentication-security)
2. [Authorization & Access Control](#authorization--access-control)
3. [Input Validation](#input-validation)
4. [Data Protection](#data-protection)
5. [Session Management](#session-management)
6. [Security Headers](#security-headers)
7. [Error Handling](#error-handling)
8. [Logging & Auditing](#logging--auditing)
9. [Database Security](#database-security)
10. [API Security](#api-security)

---

## 1. Authentication Security

### Password Security

**Implementation**: `lib/auth.ts`

```typescript
// Bcrypt with 12 salt rounds
const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

**Features**:
- ✅ Bcrypt hashing algorithm (industry standard)
- ✅ 12 salt rounds (secure against brute force)
- ✅ Passwords never stored in plain text
- ✅ Passwords never sent to client
- ✅ Secure password verification

**Password Requirements** (`lib/validations.ts`):
```typescript
password: z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number')
```

- ✅ Minimum 8 characters
- ✅ At least one uppercase letter
- ✅ At least one lowercase letter
- ✅ At least one number

### Login Security

**Implementation**: `app/api/auth/login/route.ts`

**Security Features**:
1. ✅ Generic error messages ("Invalid credentials")
2. ✅ No information disclosure about user existence
3. ✅ Failed login attempts logged
4. ✅ Constant-time password comparison (via bcrypt)

**Security Logging**:
```typescript
// Successful login
logger.security('Successful login', { userId, email, role });

// Failed login
logger.security('Failed login attempt', { userId, email });
```

---

## 2. Authorization & Access Control

### Role-Based Access Control (RBAC)

**Roles**:
- `STUDENT`: Access to enrolled courses and own submissions
- `ADMIN`: Full access to all resources

**Implementation**: `lib/session.ts`

```typescript
export async function requireAuth(): Promise<SessionData> {
  const sessionData = await isAuthenticated();
  if (!sessionData) {
    throw new Error('Unauthorized');
  }
  return sessionData;
}

export async function requireAdmin(): Promise<SessionData> {
  const sessionData = await requireAuth();
  if (sessionData.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required');
  }
  return sessionData;
}
```

### Resource-Level Authorization

**Enrollment Verification** (Student can only access enrolled courses):

```typescript
// Check if student is enrolled before allowing access
const isEnrolled = await prisma.enrollment.findUnique({
  where: {
    userId_courseId: {
      userId: sessionData.userId!,
      courseId: assignment.courseId,
    },
  },
});

if (!isEnrolled) {
  return NextResponse.json(
    { error: 'Not enrolled in this course' },
    { status: 403 }
  );
}
```

**Ownership Verification** (Student can only see own submissions):

```typescript
submissions: {
  where: sessionData.role === 'STUDENT'
    ? { studentId: sessionData.userId }
    : undefined,
}
```

**Protected Routes**:

| Route | Required Role | Enforcement |
|-------|---------------|-------------|
| `/dashboard/student` | STUDENT | ProtectedRoute component |
| `/dashboard/admin/*` | ADMIN | ProtectedRoute component |
| `/api/courses` (POST/PUT/DELETE) | ADMIN | requireAdmin() |
| `/api/assignments` (POST/PUT/DELETE) | ADMIN | requireAdmin() |
| `/api/users/*` | ADMIN | requireAdmin() |
| `/api/submissions` (POST) | STUDENT | requireAuth() + role check |

---

## 3. Input Validation

### Validation Strategy

**Tool**: Zod (TypeScript-first schema validation)

**Location**: `lib/validations.ts`

**All Inputs Validated**:
- ✅ Authentication (register, login)
- ✅ Course creation/update
- ✅ Assignment creation/update
- ✅ Submission creation
- ✅ Grading
- ✅ Enrollment
- ✅ User updates

### Example: Registration Validation

```typescript
export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number'),
});
```

### Validation Error Handling

```typescript
try {
  const validatedData = schema.parse(body);
  // Process valid data
} catch (error) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }
}
```

**Benefits**:
- ✅ Type safety
- ✅ Runtime validation
- ✅ Detailed error messages (in development)
- ✅ Protection against malformed data

---

## 4. Data Protection

### Data Sanitization

**User Data Sanitization** (`lib/auth.ts`):

```typescript
export function sanitizeUserForClient(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    // passwordHash deliberately excluded
  };
}
```

**What's Protected**:
- ✅ Password hashes never sent to client
- ✅ Session tokens never exposed in API responses
- ✅ Internal IDs validated before use
- ✅ Sensitive data filtered based on user role

### XSS Protection

**React Built-in Protection**:
- ✅ Automatic HTML escaping
- ✅ Dangerous HTML disabled by default

**Content Security Policy** (`middleware.ts`):
```typescript
response.headers.set(
  'Content-Security-Policy',
  "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
);
```

---

## 5. Session Management

### Session Configuration

**Implementation**: `lib/session.ts`

```typescript
export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'student_portal_session',
  cookieOptions: {
    httpOnly: true,                    // Prevents JavaScript access
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
    sameSite: 'strict',                // CSRF protection
    maxAge: 60 * 60 * 24 * 7,         // 7 days
    path: '/',
  },
};
```

**Security Features**:
- ✅ **HttpOnly**: Prevents XSS cookie theft
- ✅ **Secure**: HTTPS-only in production
- ✅ **SameSite=Strict**: CSRF protection
- ✅ **7-day expiration**: Automatic timeout
- ✅ **iron-session**: Encrypted session data

### Session Data Structure

```typescript
export interface SessionData {
  userId?: string;
  email?: string;
  role?: 'STUDENT' | 'ADMIN';
  isLoggedIn: boolean;
}
```

**What's Stored**:
- ✅ User ID (for database lookups)
- ✅ Email (for display)
- ✅ Role (for authorization)
- ✅ Login state

**What's NOT Stored**:
- ❌ Password or hash
- ❌ Sensitive personal information
- ❌ Payment information (N/A)

---

## 6. Security Headers

### HTTP Security Headers

**Implementation**: `middleware.ts`

```typescript
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Content-Security-Policy', /* CSP policy */);
  }

  return response;
}
```

### Header Explanations

| Header | Purpose | Protection Against |
|--------|---------|---------------------|
| `X-Frame-Options: DENY` | Prevents embedding in iframes | Clickjacking |
| `X-Content-Type-Options: nosniff` | Prevents MIME type sniffing | MIME confusion attacks |
| `X-XSS-Protection: 1; mode=block` | Enables browser XSS filter | XSS attacks |
| `Strict-Transport-Security` | Forces HTTPS | Man-in-the-middle |
| `Content-Security-Policy` | Restricts resource loading | XSS, data injection |
| `Referrer-Policy` | Controls referrer information | Information leakage |
| `Permissions-Policy` | Restricts browser features | Privacy invasion |

---

## 7. Error Handling

### Secure Error Handling Pattern

**Implementation**: All API routes

```typescript
try {
  // Operation logic
} catch (error) {
  // Detailed logging server-side
  logger.error('Operation failed', { error: String(error) });

  // Generic message to client
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

**Principles**:
- ✅ **No stack traces** to client in production
- ✅ **No database errors** exposed
- ✅ **No system paths** revealed
- ✅ **Generic error messages** for unexpected errors
- ✅ **Detailed logging** server-side for debugging

### Specific Error Messages

Only provided when safe:
- "Invalid credentials" (login)
- "Email already registered" (registration)
- "Validation failed" (with field details)
- "Not found" (404 errors)
- "Forbidden" (authorization errors)

---

## 8. Logging & Auditing

### Security Event Logging

**Implementation**: `lib/logger.ts`

```typescript
class Logger {
  security(message: string, metadata?: Record<string, unknown>) {
    this.log('security', message, metadata);
  }
}
```

### Events Logged

**Authentication**:
- ✅ User registration
- ✅ Successful login (userId, email, role)
- ✅ Failed login attempts (email)
- ✅ Logout

**Admin Actions**:
- ✅ Course creation/update/deletion
- ✅ Assignment creation/update/deletion
- ✅ User role changes
- ✅ Student enrollment/unenrollment
- ✅ Grade assignments

**Student Actions**:
- ✅ Submission creation
- ✅ Submission updates

### Log Format

**Development**:
```
[2025-12-04T10:30:45.123Z] [SECURITY] User registered { userId: 'abc...', email: 'user@example.com' }
```

**Production** (JSON):
```json
{
  "timestamp": "2025-12-04T10:30:45.123Z",
  "level": "security",
  "message": "User registered",
  "metadata": {
    "userId": "abc...",
    "email": "user@example.com"
  }
}
```

---

## 9. Database Security

### SQL Injection Prevention

**Strategy**: Prisma ORM with parameterized queries

**Example**:
```typescript
// SECURE: Parameterized query
const user = await prisma.user.findUnique({
  where: { email: validatedData.email },
});

// NEVER DONE: String concatenation
// const user = await db.query(`SELECT * FROM users WHERE email = '${email}'`);
```

**Benefits**:
- ✅ All queries are parameterized
- ✅ No raw SQL string concatenation
- ✅ Type-safe database operations
- ✅ Automatic escaping of special characters

### Database Constraints

**Defined in** `prisma/schema.prisma`:

```prisma
model User {
  email String @unique  // Prevents duplicate emails
  // Cascade delete for data integrity
}

model Enrollment {
  @@unique([userId, courseId])  // Prevents duplicate enrollments
}

model Submission {
  @@unique([assignmentId, studentId])  // One submission per student per assignment
}
```

**Security Benefits**:
- ✅ Data integrity
- ✅ Prevents duplicate entries
- ✅ Automatic cleanup (cascade delete)
- ✅ Referential integrity

### Connection Security

**Best Practices**:
- ✅ Connection string in environment variable
- ✅ Database credentials not in code
- ✅ Connection pooling (via Prisma)
- ⚠️ SSL/TLS for production (to be configured)

---

## 10. API Security

### CSRF Protection

**Implementation**:
- ✅ SameSite=Strict cookie attribute
- ✅ State-changing operations require POST/PUT/DELETE
- ✅ GET requests never modify data

### Content Type Validation

```typescript
const body = await request.json();  // Validates Content-Type: application/json
```

### API Route Protection

**Pattern**:
```typescript
// 1. Authentication check
const sessionData = await requireAuth();

// 2. Role authorization
if (operation.requiresAdmin) {
  await requireAdmin();
}

// 3. Input validation
const validatedData = schema.parse(body);

// 4. Resource authorization
if (resource.ownerId !== sessionData.userId) {
  return 403;
}

// 5. Operation
// 6. Logging
// 7. Response
```

### Rate Limiting

**Status**: ⚠️ **Not Yet Implemented**

**Planned Implementation**:
- Login endpoint: 5 requests per 15 minutes per IP
- Registration: 3 requests per hour per IP
- API endpoints: 100 requests per minute per user

---

## Security Testing

### Manual Security Tests Performed

✅ SQL Injection attempts (blocked by Prisma)
✅ XSS attempts (blocked by React + CSP)
✅ CSRF attempts (blocked by SameSite cookies)
✅ Unauthorized access (blocked by authentication)
✅ Privilege escalation (blocked by role checks)
✅ Session hijacking (mitigated by secure cookies)
✅ Brute force login (logged, but no rate limiting yet)

### Security Tools Used

- **ESLint**: Static code analysis
- **npm audit**: Dependency vulnerability scanning
- **Browser DevTools**: Security header verification
- **Manual Testing**: Authorization and authentication testing

---

## Future Security Enhancements

### High Priority
1. **Rate Limiting**: Prevent brute force attacks
2. **Account Lockout**: After N failed login attempts
3. **Two-Factor Authentication**: Additional security layer

### Medium Priority
4. **Password Reset**: Secure reset flow with email verification
5. **CAPTCHA**: On registration and login
6. **Enhanced Logging**: More detailed audit trails
7. **IP Whitelisting**: For admin access (optional)

### Low Priority
8. **Advanced Monitoring**: Anomaly detection
9. **Database Encryption**: At-rest encryption
10. **API Versioning**: For backward compatibility

---

## Security Compliance

### OWASP Top 10 2021

| # | Threat | Status | Mitigation |
|---|--------|--------|------------|
| 1 | Broken Access Control | ✅ Mitigated | RBAC, ownership checks |
| 2 | Cryptographic Failures | ✅ Mitigated | Bcrypt, HTTPS, secure sessions |
| 3 | Injection | ✅ Mitigated | Prisma ORM, input validation |
| 4 | Insecure Design | ✅ Mitigated | Threat modeling, secure SDLC |
| 5 | Security Misconfiguration | ✅ Mitigated | Security headers, env vars |
| 6 | Vulnerable Components | ✅ Mitigated | npm audit, updates |
| 7 | Auth Failures | ⚠️ Partial | Strong passwords, sessions (no MFA yet) |
| 8 | Software/Data Integrity | ✅ Mitigated | Input validation, logging |
| 9 | Logging Failures | ✅ Mitigated | Comprehensive security logging |
| 10 | SSRF | ✅ N/A | No external requests made |

---

## Contact

For security concerns or vulnerability reports:
- Email: [Your Email]
- Please use responsible disclosure

---

**Last Updated**: December 4, 2025
**Version**: 1.0.0

