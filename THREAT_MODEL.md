# Threat Modeling Document

## Executive Summary

This document presents a comprehensive threat analysis of the Secure Student Portal application using the STRIDE methodology. It identifies potential security threats, their likelihood, impact, and the mitigations implemented.

## 1. System Overview

### Application Description
The Secure Student Portal is a web application that allows:
- **Students**: To view courses, assignments, and submit work
- **Administrators**: To manage users, courses, assignments, and grade submissions

### Technology Stack
- **Frontend**: Next.js, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: iron-session
- **Deployment**: Web server (development/production)

## 2. Data Flow Diagrams (DFD)

### Level 0 DFD - Context Diagram

```
┌─────────────┐
│   Student   │───┐
└─────────────┘   │
                  │
┌─────────────┐   │       ┌─────────────────────┐       ┌──────────────┐
│    Admin    │───┼──────>│ Student Portal Web  │<─────>│  PostgreSQL  │
└─────────────┘   │       │    Application      │       │   Database   │
                  │       └─────────────────────┘       └──────────────┘
┌─────────────┐   │
│  Attacker   │───┘
└─────────────┘
```

### Level 1 DFD - Authentication Flow

```
┌─────────┐                                           ┌──────────────┐
│ Browser │──(1)──>Login Credentials──>┌────────────┐│              │
│         │                             │ Login API  ││              │
│         │<─(5)──Session Cookie───────<│ Route      ││  PostgreSQL  │
└─────────┘                             └────────────┘│              │
                                              │       │              │
                                              │(2)    │              │
                                              v       │              │
                                        ┌─────────────┤              │
                                        │ Validate    │              │
                                        │ Input (Zod) │              │
                                        └─────────────┘              │
                                              │(3)                   │
                                              v                      │
                                        ┌─────────────┐              │
                                        │ Query User  │───(3a)──────>│
                                        │ from DB     │<──(3b)───────│
                                        └─────────────┘              │
                                              │                      │
                                              │(4)                   │
                                              v                      │
                                        ┌─────────────┐              │
                                        │ Verify      │              │
                                        │ Password    │              │
                                        │ (bcrypt)    │              │
                                        └─────────────┘              │
                                                                     │
Data Flow:                                                           │
(1) User submits credentials                                        │
(2) Input validation                                                │
(3) Database query for user                                         │
(4) Password verification                                           │
(5) Session cookie creation                                         │
```

### Level 1 DFD - Submission Flow

```
┌──────────┐
│ Student  │──(1)──>Assignment Submission──>┌──────────────┐
│ Browser  │                                 │ Submission   │
│          │<──(7)──Success Response────────<│ API Route    │
└──────────┘                                 └──────────────┘
                                                     │
                                                     │(2)
                                                     v
                                             ┌──────────────┐       ┌─────────────┐
                                             │ Require Auth │──────>│ Session     │
                                             └──────────────┘       │ Check       │
                                                     │               └─────────────┘
                                                     │(3)
                                                     v
                                             ┌──────────────┐
                                             │ Validate     │
                                             │ Input (Zod)  │
                                             └──────────────┘
                                                     │(4)
                                                     v
                                             ┌──────────────┐       ┌─────────────┐
                                             │ Check        │──────>│ Database    │
                                             │ Enrollment   │<──────│ Query       │
                                             └──────────────┘       └─────────────┘
                                                     │(5)
                                                     │ (authorized)
                                                     v
                                             ┌──────────────┐       ┌─────────────┐
                                             │ Create/      │──────>│ Database    │
                                             │ Update       │<──────│ Transaction │
                                             │ Submission   │       └─────────────┘
                                             └──────────────┘
                                                     │(6)
                                                     v
                                             ┌──────────────┐
                                             │ Log Activity │
                                             └──────────────┘

Data Flow:
(1) Student submits assignment
(2) Session authentication check
(3) Input validation
(4) Enrollment verification
(5) Database operation (authorized)
(6) Security logging
(7) Response to client
```

## 3. Assets

### High-Value Assets
1. **User Credentials** (passwords, session tokens)
   - Impact of Compromise: Critical
   - Protection: Bcrypt hashing, HTTP-only cookies

2. **Student Submissions** (assignment work)
   - Impact of Compromise: High
   - Protection: Access control, enrollment checks

3. **Grades and Feedback**
   - Impact of Compromise: High
   - Protection: Role-based access, audit logging

4. **Personal Information** (names, emails)
   - Impact of Compromise: Medium
   - Protection: Access control, data validation

### Medium-Value Assets
5. **Course Information**
   - Impact of Compromise: Medium
   - Protection: Authentication required

6. **Session Data**
   - Impact of Compromise: High
   - Protection: Secure cookies, expiration

## 4. Threat Analysis using STRIDE

### 4.1 Spoofing Identity

#### Threat 1: Unauthorized Access via Stolen Credentials
- **Description**: Attacker obtains user credentials through phishing or breach
- **Likelihood**: Medium
- **Impact**: High
- **Mitigations Implemented**:
  - Strong password requirements (8+ chars, mixed case, numbers)
  - Bcrypt hashing with 12 rounds
  - Session timeout
- **Residual Risk**: Medium
- **Recommendations**: Implement 2FA, account lockout after failed attempts

#### Threat 2: Session Hijacking
- **Description**: Attacker intercepts or steals session token
- **Likelihood**: Low (with HTTPS)
- **Impact**: High
- **Mitigations Implemented**:
  - HTTP-only cookies
  - Secure flag (production)
  - SameSite=Strict
  - Session expiration
- **Residual Risk**: Low

### 4.2 Tampering

#### Threat 3: SQL Injection
- **Description**: Attacker manipulates SQL queries via input
- **Likelihood**: Low
- **Impact**: Critical
- **Mitigations Implemented**:
  - Prisma ORM (parameterized queries)
  - Input validation with Zod
  - No raw SQL queries
- **Residual Risk**: Very Low

#### Threat 4: Data Manipulation
- **Description**: Unauthorized modification of grades, submissions, or user data
- **Likelihood**: Medium
- **Impact**: High
- **Mitigations Implemented**:
  - Role-based access control
  - Authorization checks on all mutations
  - Audit logging
  - Database constraints (unique, foreign keys)
- **Residual Risk**: Low

#### Threat 5: CSRF Attacks
- **Description**: Attacker tricks authenticated user into performing unwanted actions
- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigations Implemented**:
  - SameSite cookie attribute
  - State-changing operations via POST/PUT/DELETE only
- **Residual Risk**: Low
- **Recommendations**: Consider CSRF tokens for critical operations

### 4.3 Repudiation

#### Threat 6: Denial of Actions
- **Description**: User denies performing an action (submission, grade change)
- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigations Implemented**:
  - Comprehensive audit logging
  - Timestamps on all records
  - User ID tracked on all operations
- **Residual Risk**: Low

### 4.4 Information Disclosure

#### Threat 7: Sensitive Data Exposure in Errors
- **Description**: Error messages reveal system details or sensitive data
- **Likelihood**: Medium
- **Impact**: Medium
- **Mitigations Implemented**:
  - Generic error messages to clients
  - Detailed logging server-side only
  - No stack traces in production
- **Residual Risk**: Low

#### Threat 8: Unauthorized Data Access
- **Description**: Student accesses another student's submissions or grades
- **Likelihood**: Medium
- **Impact**: High
- **Mitigations Implemented**:
  - Ownership checks on all data access
  - Enrollment verification
  - Role-based filtering
- **Residual Risk**: Low

#### Threat 9: XSS (Cross-Site Scripting)
- **Description**: Attacker injects malicious scripts via user input
- **Likelihood**: Medium
- **Impact**: High
- **Mitigations Implemented**:
  - React's automatic HTML escaping
  - Input validation and sanitization
  - Content Security Policy header
- **Residual Risk**: Low

### 4.5 Denial of Service

#### Threat 10: Brute Force Attack
- **Description**: Automated login attempts to guess credentials
- **Likelihood**: High
- **Impact**: Medium
- **Mitigations Implemented**:
  - None (current limitation)
- **Residual Risk**: High
- **Recommendations**: Implement rate limiting on login endpoint

#### Threat 11: Resource Exhaustion
- **Description**: Excessive requests overload the system
- **Likelihood**: Medium
- **Impact**: High
- **Mitigations Implemented**:
  - Database connection pooling (Prisma)
  - Pagination on list endpoints (future enhancement)
- **Residual Risk**: Medium
- **Recommendations**: Implement rate limiting, request throttling

### 4.6 Elevation of Privilege

#### Threat 12: Student Accessing Admin Functions
- **Description**: Student attempts to access admin-only operations
- **Likelihood**: Medium
- **Impact**: Critical
- **Mitigations Implemented**:
  - Role checks on every admin operation
  - Separate route protection
  - Server-side role validation
- **Residual Risk**: Low

#### Threat 13: Privilege Escalation via Parameter Manipulation
- **Description**: Attacker modifies request to change their role
- **Likelihood**: Low
- **Impact**: Critical
- **Mitigations Implemented**:
  - Role stored in server-side session only
  - No role in client-controlled data
  - Database integrity constraints
- **Residual Risk**: Very Low

## 5. Abuse Cases

### Abuse Case 1: Grade Manipulation
- **Attacker Goal**: Change own or others' grades
- **Attack Path**:
  1. Student logs in
  2. Attempts to call grade API endpoint
  3. Tries parameter manipulation
- **Prevention**:
  - Admin-only authorization on grade endpoint
  - Server-side role verification
  - Audit logging of all grade changes

### Abuse Case 2: Unauthorized Course Access
- **Attacker Goal**: Access course materials without enrollment
- **Attack Path**:
  1. Student logs in
  2. Attempts to access course/assignment IDs directly
- **Prevention**:
  - Enrollment checks before showing content
  - Database queries filtered by enrollment
  - Authorization errors logged

### Abuse Case 3: Data Exfiltration
- **Attacker Goal**: Download all user data
- **Attack Path**:
  1. Compromise admin account
  2. Use user management API
- **Prevention**:
  - Strong password requirements
  - Session timeout
  - Audit logging of bulk operations
  - (Future: Rate limiting on data endpoints)

## 6. Misuse Cases

### Misuse Case 1: SQL Injection via Login Form
- **Attacker**: External attacker
- **Objective**: Bypass authentication or access database
- **Method**: Inject SQL in email/password fields
- **Impact**: Critical - Full database access
- **Countermeasures**:
  - Prisma ORM prevents SQL injection
  - Input validation rejects malformed data
  - All queries are parameterized

### Misuse Case 2: XSS via Course Description
- **Attacker**: Malicious admin
- **Objective**: Inject JavaScript into course pages
- **Method**: Enter `<script>` tags in course description
- **Impact**: High - Affects all users viewing the course
- **Countermeasures**:
  - React auto-escapes all rendered content
  - CSP header blocks inline scripts
  - Input validation limits special characters

### Misuse Case 3: IDOR (Insecure Direct Object Reference)
- **Attacker**: Authenticated student
- **Objective**: View other students' submissions
- **Method**: Change submission ID in URL/API request
- **Impact**: High - Privacy breach
- **Countermeasures**:
  - Ownership verification on submission access
  - Database queries filtered by current user
  - Returns 403 for unauthorized access

## 7. Security Controls Summary

| Threat Category | Controls Implemented | Effectiveness |
|----------------|---------------------|---------------|
| Authentication | Bcrypt, Sessions, Strong passwords | High |
| Authorization | RBAC, Ownership checks | High |
| Input Validation | Zod schemas, Type checking | High |
| Output Encoding | React escaping, CSP | High |
| Cryptography | Bcrypt (12 rounds), HTTPS | High |
| Error Handling | Generic messages, Logging | Medium |
| Session Management | HTTP-only, Secure, SameSite | High |
| Audit Logging | Security events, Timestamps | Medium |
| Rate Limiting | None | ⚠️ Not Implemented |
| CSRF Protection | SameSite cookies | Medium |

## 8. Risk Assessment

### Critical Risks
1. **No Rate Limiting** - Allows brute force attacks
   - Mitigation Priority: HIGH
   - Recommendation: Implement immediately before production

### High Risks
2. **No Account Lockout** - Unlimited login attempts
   - Mitigation Priority: HIGH
   - Recommendation: Implement lockout after 5 failed attempts

3. **No Two-Factor Authentication** - Single authentication factor
   - Mitigation Priority: MEDIUM
   - Recommendation: Optional 2FA for sensitive accounts

### Medium Risks
4. **No Password Reset** - Users can't recover accounts
   - Mitigation Priority: MEDIUM
   - Recommendation: Implement secure reset flow

5. **Limited Audit Trail** - Basic logging only
   - Mitigation Priority: MEDIUM
   - Recommendation: Enhance logging detail and retention

### Low Risks
6. **No Input Length Limits** - Potential for large inputs
   - Mitigation Priority: LOW
   - Current: Zod validation includes max lengths

## 9. Recommendations

### Immediate (Before Production)
1. ✅ Implement rate limiting on authentication endpoints
2. ✅ Add account lockout mechanism
3. ✅ Conduct penetration testing
4. ✅ Review and test all authorization checks
5. ✅ Ensure HTTPS enforcement

### Short-term (Within 3 months)
6. Add password reset functionality
7. Implement two-factor authentication
8. Enhance audit logging
9. Add automated security testing to CI/CD
10. Implement CSRF tokens for critical operations

### Long-term (6+ months)
11. Add intrusion detection system
12. Implement anomaly detection
13. Add advanced monitoring and alerting
14. Conduct regular security audits
15. Implement database encryption at rest

## 10. Conclusion

The Secure Student Portal has implemented strong foundational security controls across authentication, authorization, input validation, and secure communication. The primary areas requiring attention before production deployment are rate limiting and account protection mechanisms. With these enhancements, the application will have defense-in-depth protection against the majority of common web application threats.

---

**Document Version**: 1.0
**Last Updated**: December 4, 2025
**Next Review**: [To be scheduled]

