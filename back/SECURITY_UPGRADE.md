# Security Upgrade Documentation

## Overview

This document describes the security improvements made to the authentication system to eliminate plaintext password storage.

## Changes Made

### 1. Password Hashing with bcrypt

**Before**: Passwords were stored in plaintext in the MongoDB `users` collection.

**After**: Passwords are now hashed using bcrypt with 10 salt rounds before storage.

**Files modified**:
- `back/fe-server.js`: Added bcrypt for password verification
- `back/package.json`: Added bcrypt dependency

### 2. Simplified Authentication Flow

**Before**:
1. Client requests token from `/authtoken`
2. Client hashes password with token using SHA-256
3. Client sends hash to `/auth`
4. Server compares hashes

**After**:
1. Client sends username and password directly to `/auth`
2. Server uses bcrypt to verify password against stored hash
3. Server creates session on success

**Files modified**:
- `back/fe-server.js`: Removed `/authtoken` endpoint, updated `/auth` endpoint
- `front/src/contexts/AuthContext.js`: Simplified login function

### 3. Session Secret Security

**Before**: Hardcoded session secret "keyboard cat"

**After**: Uses `SESSION_SECRET` environment variable with secure fallback

**Files modified**:
- `back/fe-server.js`: Updated session configuration

### 4. Removed Security Leaks

**Before**: User data (including passwords) logged to console in helpers.js

**After**: Removed sensitive logging

**Files modified**:
- `back/helpers.js`: Removed `console.log` statement at line 12

### 5. Improved Error Handling

- Added proper MongoDB client cleanup in auth endpoint
- Generic error messages to prevent user enumeration
- Better error logging for debugging (logs only to server, not to client)

## Migration Guide

### Step 1: Set Environment Variable (Production)

For production environments, set a strong session secret:

```bash
export SESSION_SECRET=$(openssl rand -hex 32)
```

Add this to your `.env` file or server configuration.

### Step 2: Backup Your Database

**CRITICAL**: Before migrating passwords, backup your database:

```bash
mongodump --db fe --out ./backup-$(date +%Y%m%d)
```

### Step 3: Run Password Migration

The migration script will convert all existing plaintext passwords to bcrypt hashes:

```bash
cd /var/projects/fe/back
node migrate-passwords.js
```

The script will:
- Check each user's password
- Skip passwords already hashed (starting with `$2`)
- Hash plaintext passwords using bcrypt
- Provide a summary of the migration

**Sample output**:
```
╔════════════════════════════════════════════════════════════╗
║        PASSWORD MIGRATION SCRIPT                           ║
╚════════════════════════════════════════════════════════════╝

Found 3 user(s). Starting migration...
  ✓ User "alice": Password successfully hashed.
  ✓ User "bob": Password successfully hashed.
  - User "charlie": Password already hashed, skipping.

=== Migration Summary ===
Total users: 3
Migrated: 2
Skipped (already hashed): 1
Errors: 0
=========================

✓ Migration completed successfully!
```

### Step 4: Restart the Server

After migration, restart your Node.js server:

```bash
# Stop the current server (Ctrl+C if running in foreground)
# Then start with the SESSION_SECRET:
SESSION_SECRET=your_secret_here node fe-server.js
```

### Step 5: Test Authentication

1. Try logging in with existing credentials
2. Verify that authentication works correctly
3. Check that sessions persist correctly

## Security Best Practices

### 1. HTTPS in Production

**IMPORTANT**: The frontend now sends passwords directly to the server. This is secure only when using HTTPS.

The server already has HTTPS support (port 8089). Ensure you:
- Enable SSL certificates (currently commented out in fe-server.js:123-126)
- Redirect all HTTP traffic to HTTPS
- Use valid SSL/TLS certificates

### 2. Session Secret Management

- Never commit `SESSION_SECRET` to version control
- Use a strong random value (at least 32 bytes)
- Rotate the secret periodically
- Different secrets for dev/staging/production

### 3. Password Policy

Consider adding password requirements:
- Minimum length (e.g., 8 characters)
- Complexity requirements
- Password change functionality
- Password reset via email

### 4. Additional Security Measures

Consider implementing:
- Rate limiting on login attempts
- Account lockout after failed attempts
- Two-factor authentication (2FA)
- Password strength meter
- Security headers (helmet.js)
- CSRF protection

## Rollback Procedure

If you need to rollback (NOT RECOMMENDED):

1. Restore database from backup:
```bash
mongorestore --db fe ./backup-YYYYMMDD/fe
```

2. Revert code changes using git:
```bash
git checkout HEAD~1 back/fe-server.js front/src/contexts/AuthContext.js back/helpers.js
```

3. Restart the server

## Creating New Users

When creating new users, hash passwords with bcrypt:

```javascript
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

const hashedPassword = await bcrypt.hash(plaintextPassword, SALT_ROUNDS);

await users.insertOne({
  user: username,
  password: hashedPassword
});
```

## Troubleshooting

### Issue: Login fails after migration

**Solution**: Check that the migration script completed successfully. The password hash should start with `$2b$` or `$2a$`.

### Issue: "SESSION_SECRET not set" warning

**Solution**: Set the `SESSION_SECRET` environment variable before starting the server.

### Issue: Sessions don't persist across server restarts

**Solution**: This is normal behavior with the default MemoryStore. For production, use a persistent session store like `connect-mongo`.

## Files Reference

### Modified Files
- `back/fe-server.js` - Main authentication logic
- `front/src/contexts/AuthContext.js` - Frontend login flow
- `back/helpers.js` - Removed sensitive logging
- `back/package.json` - Added bcrypt dependency

### New Files
- `back/migrate-passwords.js` - Password migration script
- `back/SECURITY_UPGRADE.md` - This documentation

## Security Comparison

| Aspect | Before | After |
|--------|--------|-------|
| Password Storage | Plaintext | bcrypt hash (10 rounds) |
| Session Secret | Hardcoded | Environment variable |
| Authentication | Token + SHA-256 | bcrypt comparison |
| Sensitive Logging | Yes | No |
| Database Connection | Not always closed | Properly managed |
| Error Messages | Detailed | Generic (no user enumeration) |

## Summary

The authentication system is now significantly more secure:
- Passwords are properly hashed and cannot be recovered
- Session secrets are configurable and secure
- No sensitive data is logged
- Authentication flow follows industry best practices

Remember to use HTTPS in production and set a strong `SESSION_SECRET` environment variable.
