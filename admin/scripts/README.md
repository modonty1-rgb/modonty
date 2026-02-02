# Admin Scripts

This folder contains utility scripts for admin operations.

## Create Admin User

Creates an admin user with the following credentials:
- **Email:** nadis@gmail.com
- **Password:** 123456
- **Role:** ADMIN

### Prerequisites

Make sure you have:
1. MongoDB running
2. `.env` file configured with `DATABASE_URL`
3. Dependencies installed (`npm install` or `pnpm install`)

### How to Run

**Option 1: Using Node.js (Recommended)**
```bash
# From the admin directory
cd admin
node scripts/create-admin-user.js
```

**Option 2: Using TypeScript**
```bash
# From the admin directory
cd admin
npx tsx scripts/create-admin-user.ts
```

**Option 3: From Root Directory**
```bash
# From the monorepo root
node admin/scripts/create-admin-user.js
```

### Expected Output

```
🔄 Creating admin user...

🔐 Hashing password...
👤 Creating user in database...

✅ Admin user created successfully!

==================================================
📧 LOGIN CREDENTIALS
==================================================
Email:    nadis@gmail.com
Password: 123456
==================================================

👤 USER DETAILS
==================================================
ID:         65abc123def456789...
Name:       Nadis Admin
Role:       ADMIN
Created At: 2026-01-20T...
==================================================

⚠️  IMPORTANT: Change the password after first login!

🌐 You can now login at:
   Admin Panel: http://localhost:3001/login
   Frontend:    http://localhost:3000/login

✨ Script completed successfully!
```

### Troubleshooting

**Error: User already exists**
- The user with this email already exists in the database
- You can either use a different email or delete the existing user first

**Error: Cannot find module '@prisma/client'**
```bash
cd admin
npm install
# or
pnpm install
```

**Error: DATABASE_URL not found**
- Make sure you have a `.env` file in the `admin` directory
- Check that `DATABASE_URL` is set correctly

**Error: bcryptjs not found**
```bash
cd admin
npm install bcryptjs
# or
pnpm install bcryptjs
```

### Security Notes

⚠️ **IMPORTANT SECURITY WARNINGS:**

1. **Change Default Password:** This script uses a default password (`123456`) for demonstration purposes. **Always change it after first login!**

2. **Don't Use in Production:** Never use default credentials in production environments.

3. **Use Strong Passwords:** In production, generate strong passwords using:
   ```javascript
   // Example: Generate secure random password
   const crypto = require('crypto');
   const securePassword = crypto.randomBytes(16).toString('hex');
   ```

4. **Environment Variables:** For production, store credentials in environment variables or a secure secrets manager.

### Modifying the Script

To create a user with different credentials, edit the script:

```javascript
const email = "your-email@example.com";  // Change this
const password = "your-secure-password"; // Change this
const name = "Your Name";                // Change this
```

### Additional Operations

**Delete a user:**
```bash
# Use MongoDB shell or Prisma Studio
npx prisma studio
# Then navigate to User model and delete manually
```

**List all admin users:**
```javascript
const admins = await prisma.user.findMany({
  where: { role: 'ADMIN' }
});
console.log(admins);
```

**Update user role:**
```javascript
await prisma.user.update({
  where: { email: 'user@example.com' },
  data: { role: 'ADMIN' }
});
```
