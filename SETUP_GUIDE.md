# Quick Setup Guide

## Prerequisites Checklist

Before you begin, ensure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] PostgreSQL 14+ installed and running
- [ ] Git installed (for version control)
- [ ] A code editor (VS Code recommended)

## Step-by-Step Setup

### 1. Database Setup

**Option A: Using PostgreSQL locally**

```bash
# Start PostgreSQL service (if not running)
sudo service postgresql start

# Create a new database
createdb secure_student_portal

# Verify database creation
psql -l | grep secure_student_portal
```

**Option B: Using psql command line**

```bash
# Open PostgreSQL CLI
psql -U postgres

# Create database
CREATE DATABASE secure_student_portal;

# Verify
\l

# Exit
\q
```

### 2. Project Setup

```bash
# Navigate to project directory
cd /home/durga/secure-student-portal

# Install dependencies
npm install

# If you face any issues, try:
npm install --legacy-peer-deps
```

### 3. Environment Configuration

Create a `.env` file in the project root (or verify it exists):

```bash
# Check if .env exists
ls -la .env

# If not, create it
touch .env
```

Add the following content to `.env`:

```env
# Database Connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/secure_student_portal?schema=public"

# Session Secret (IMPORTANT: Change this in production!)
SESSION_SECRET="replace-this-with-a-secure-random-string-at-least-32-characters-long"

# Environment
NODE_ENV="development"
```

**Security Note**: Generate a strong `SESSION_SECRET` for production:

```bash
# Generate a secure random string (Linux/Mac)
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Database Migration

Run Prisma migrations to create database tables:

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Verify tables were created
npx prisma studio
# This opens a web UI at http://localhost:5555 to view your database
```

### 5. Create Admin User

Since the first user registered via the UI will be a STUDENT, you need to create an admin:

**Option A: Register normally, then update in database**

```bash
# 1. Start the app (see step 6)
# 2. Register a user at http://localhost:3000/auth/register
# 3. Stop the app (Ctrl+C)
# 4. Update the user role in database

psql -U postgres -d secure_student_portal

UPDATE users SET role = 'ADMIN' WHERE email = 'your-admin-email@example.com';

SELECT email, role FROM users;

\q
```

**Option B: Direct database insert**

```sql
-- Connect to database
psql -U postgres -d secure_student_portal

-- Insert admin user (password will be 'Admin123' after hashing)
-- Note: This is a bcrypt hash of 'Admin123'
INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Admin User',
  'admin@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5lm7BYmzQu3hm',
  'ADMIN',
  NOW(),
  NOW()
);

-- Verify
SELECT email, role FROM users;

\q
```

**Admin Credentials** (if using Option B):
- Email: `admin@example.com`
- Password: `Admin123`

**⚠️ IMPORTANT**: Change this password immediately after first login!

### 6. Start Development Server

```bash
# Start the Next.js development server
npm run dev

# You should see:
# ✓ Ready in Xms
# ○ Compiling / ...
# ✓ Compiled / in Xms
```

### 7. Verify Installation

Open your browser and test:

1. **Home Page**: http://localhost:3000
   - Should show landing page with login/register buttons

2. **Register**: http://localhost:3000/auth/register
   - Create a student account

3. **Login**: http://localhost:3000/auth/login
   - Login with the account you created

4. **Student Dashboard**: Should automatically redirect after login
   - URL: http://localhost:3000/dashboard/student

5. **Admin Login**: Login with admin credentials
   - URL changes to: http://localhost:3000/dashboard/admin

### 8. Seed Sample Data (Optional)

To test the application with sample data, you can manually create courses and assignments via the admin interface:

1. Login as admin
2. Navigate to "Manage Courses"
3. Add a course (e.g., CS101 - Introduction to Programming)
4. Navigate to "Manage Assignments"
5. Create assignments for the course
6. Navigate to "Manage Enrollments"
7. Enroll students in courses

## Troubleshooting

### Issue 1: Database Connection Error

```
Error: Can't reach database server at `localhost:5432`
```

**Solution**:
- Ensure PostgreSQL is running: `sudo service postgresql status`
- Check if port 5432 is in use: `sudo lsof -i :5432`
- Verify credentials in `.env` file

### Issue 2: Prisma Client Not Generated

```
Error: @prisma/client did not initialize yet
```

**Solution**:
```bash
npx prisma generate
```

### Issue 3: Migration Errors

```
Error: P3009 - migration failed to apply
```

**Solution**:
```bash
# Reset database (WARNING: This deletes all data)
npx prisma migrate reset

# Then run migrations again
npx prisma migrate dev
```

### Issue 4: Port 3000 Already in Use

```
Error: Port 3000 is already in use
```

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or run on different port
npm run dev -- -p 3001
```

### Issue 5: Session Secret Error

```
Error: SESSION_SECRET is not defined
```

**Solution**:
- Ensure `.env` file exists
- Verify `SESSION_SECRET` is set in `.env`
- Restart the development server

## Development Workflow

### Making Database Changes

1. Update `prisma/schema.prisma`
2. Run migration:
   ```bash
   npx prisma migrate dev --name description_of_change
   ```
3. Generate client:
   ```bash
   npx prisma generate
   ```

### Running Linter

```bash
npm run lint
```

### Building for Production

```bash
npm run build
npm run start
```

### Viewing Database

```bash
# Open Prisma Studio
npx prisma studio

# Access at http://localhost:5555
```

## Security Checklist

Before deploying to production:

- [ ] Change `SESSION_SECRET` to a strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS for all connections
- [ ] Update admin password from default
- [ ] Enable PostgreSQL SSL/TLS
- [ ] Review and restrict CORS settings
- [ ] Implement rate limiting
- [ ] Set up database backups
- [ ] Configure proper logging
- [ ] Review security headers in middleware

## Next Steps

1. ✅ Application is running
2. ✅ Admin and student accounts created
3. ✅ Database is set up

Now you can:
- Explore the admin dashboard
- Create courses and assignments
- Enroll students
- Test submission functionality
- Review security features
- Read the full documentation in README.md

## Useful Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint

# Database
npx prisma studio              # Open database GUI
npx prisma migrate dev         # Run migrations
npx prisma generate            # Generate Prisma Client
npx prisma migrate reset       # Reset database (destructive!)

# Database Inspection
psql -U postgres -d secure_student_portal
\dt                            # List tables
\d users                       # Describe users table
SELECT * FROM users;           # View all users
\q                             # Quit
```

## Support

For issues or questions:
1. Check the main README.md
2. Review TESTING.md for test cases
3. Read THREAT_MODEL.md for security details
4. Check the error logs in the terminal

---

**Happy Coding! 🚀**

