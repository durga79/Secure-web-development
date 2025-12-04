# Deployment Guide

## Production Deployment Checklist

Before deploying to production, ensure the following:

### 1. Environment Variables

Create a production `.env` file with:

```env
# Production Database URL with SSL
DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"

# Strong, Random Session Secret (32+ characters)
SESSION_SECRET="CHANGE_THIS_TO_A_CRYPTOGRAPHICALLY_SECURE_RANDOM_STRING"

# Production Environment
NODE_ENV="production"
```

### 2. Security Configuration

- [ ] Generate strong `SESSION_SECRET`: `openssl rand -base64 48`
- [ ] Enable PostgreSQL SSL/TLS connections
- [ ] Set up HTTPS (SSL certificate)
- [ ] Configure firewall rules
- [ ] Restrict database access to application server only

### 3. Database Setup

```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 4. Build Application

```bash
# Install dependencies
npm ci

# Build for production
npm run build

# Start production server
npm run start
```

### 5. Security Hardening

**Recommended Actions**:

1. **Rate Limiting**: Add rate limiting middleware
2. **Helmet.js**: Additional security headers
3. **CORS**: Configure allowed origins
4. **Monitoring**: Set up logging and monitoring
5. **Backups**: Configure automated database backups

### 6. Deployment Platforms

#### Vercel (Recommended for Next.js)

1. Connect GitHub repository
2. Add environment variables in Vercel dashboard
3. Configure PostgreSQL database (Vercel Postgres or external)
4. Deploy

#### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SESSION_SECRET=${SESSION_SECRET}
      - NODE_ENV=production
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=secure_student_portal
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 7. Post-Deployment

1. **Create Admin User**:
   - Register via UI
   - Update role in database to ADMIN

2. **Test All Features**:
   - Authentication
   - Authorization
   - CRUD operations
   - Security headers

3. **Monitor Logs**:
   - Check application logs
   - Monitor error rates
   - Track security events

### 8. Monitoring & Maintenance

- Set up error tracking (Sentry, LogRocket)
- Configure uptime monitoring
- Schedule regular backups
- Keep dependencies updated
- Review security logs weekly

### 9. Performance Optimization

- Enable caching where appropriate
- Optimize database queries
- Use CDN for static assets
- Enable compression

### 10. Security Maintenance

- Regular security audits
- Update dependencies monthly
- Review access logs
- Test security controls quarterly

---

**Production Readiness**: With the above checklist completed, the application is production-ready.

