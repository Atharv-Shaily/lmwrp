# Fix MongoDB Atlas Connection Error

## The Problem
You're getting: `bad auth : authentication failed` (code 8000)

This means your MongoDB connection string has wrong credentials.

## Step-by-Step Fix

### Step 1: Get Your Connection String from Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Log in to your account
3. Click on your **cluster** (or create one if you don't have one)
4. Click the **"Connect"** button
5. Choose **"Connect your application"**
6. Select:
   - **Driver:** Node.js
   - **Version:** 5.5 or later
7. You'll see a connection string like this:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 2: Create/Verify Database User

**IMPORTANT:** You need a **database user**, NOT your Atlas account credentials!

1. In MongoDB Atlas, go to **"Database Access"** (left sidebar)
2. Check if you have a database user:
   - If you see users listed, note the username
   - If no users exist, create one:
     - Click **"Add New Database User"**
     - Choose **"Password"** authentication
     - Enter a username (e.g., `livemart-user`)
     - Enter a password (SAVE THIS - you'll need it!)
     - Under **"Database User Privileges"**, select **"Atlas admin"**
     - Click **"Add User"**

### Step 3: Build Your Connection String

Take the connection string from Step 1 and replace:
- `<username>` → Your database username (from Step 2)
- `<password>` → Your database password (from Step 2)

**Example:**
```
Before: mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
After:  mongodb+srv://livemart-user:MyPassword123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 4: Add Database Name

Add `/livemart` before the `?` in your connection string:

**Before:**
```
mongodb+srv://livemart-user:MyPassword123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**After:**
```
mongodb+srv://livemart-user:MyPassword123@cluster0.xxxxx.mongodb.net/livemart?retryWrites=true&w=majority
```

**OR** (if you want to keep the `?`):
```
mongodb+srv://livemart-user:MyPassword123@cluster0.xxxxx.mongodb.net/livemart?retryWrites=true&w=majority
```

### Step 5: Handle Special Characters in Password

If your password contains special characters, URL-encode them:

| Character | Encoded |
|-----------|---------|
| `@` | `%40` |
| `#` | `%23` |
| `$` | `%24` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `=` | `%3D` |
| `?` | `%3F` |
| `/` | `%2F` |
| `:` | `%3A` |

**Example:**
- Password: `My@Pass#123`
- Encoded: `My%40Pass%23123`
- Connection string: `mongodb+srv://user:My%40Pass%23123@cluster.mongodb.net/livemart?retryWrites=true&w=majority`

### Step 6: Update Your .env File

Open your `.env` file in the root directory and update:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/livemart?retryWrites=true&w=majority
```

**CRITICAL:**
- ✅ No quotes around the connection string
- ✅ No spaces
- ✅ Use database user credentials (NOT your Atlas account email/password)
- ✅ Include `/livemart` before the `?`
- ✅ URL-encode special characters in password

### Step 7: Check Network Access (IP Whitelist)

1. In MongoDB Atlas, go to **"Network Access"** (left sidebar)
2. Check if your IP is whitelisted
3. If not, click **"Add IP Address"**
4. For development, you can click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
5. Click **"Confirm"**

### Step 8: Restart Your Server

1. Stop your development server (Ctrl+C in terminal)
2. Start it again:
   ```bash
   npm run dev
   ```
3. Try signing up again

## Common Mistakes

### ❌ Using Atlas Account Credentials
```env
# WRONG - Using your login email/password
MONGODB_URI=mongodb+srv://your-email@gmail.com:your-login-password@cluster.mongodb.net/livemart
```

### ✅ Using Database User Credentials
```env
# CORRECT - Using database user you created
MONGODB_URI=mongodb+srv://livemart-user:database-password@cluster.mongodb.net/livemart
```

### ❌ Missing Database Name
```env
# WRONG - No database name
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
```

### ✅ With Database Name
```env
# CORRECT - Database name included
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/livemart?retryWrites=true&w=majority
```

### ❌ Special Characters Not Encoded
```env
# WRONG - Password with @ not encoded
MONGODB_URI=mongodb+srv://user:pass@word@cluster.mongodb.net/livemart
```

### ✅ Special Characters Encoded
```env
# CORRECT - @ encoded as %40
MONGODB_URI=mongodb+srv://user:pass%40word@cluster.mongodb.net/livemart
```

## Quick Test

After updating your `.env` file, you can test the connection:

1. Restart your server
2. Try to sign up
3. Check your server terminal for any error messages

## Still Not Working?

1. **Double-check your connection string format:**
   ```
   mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE?retryWrites=true&w=majority
   ```

2. **Verify in Atlas:**
   - Database user exists in "Database Access"
   - User is active (not deleted)
   - Password is correct
   - IP address is whitelisted in "Network Access"

3. **Try resetting the database user password:**
   - Go to "Database Access"
   - Click "Edit" on your user
   - Click "Edit Password"
   - Set a new simple password (no special characters)
   - Update your connection string

4. **Check server logs** for more detailed error messages

5. **Try a simple password** (no special characters) to rule out encoding issues

## Alternative: Use Local MongoDB

If you continue having issues, you can use local MongoDB:

1. Install MongoDB Community Edition
2. Start MongoDB service
3. Update `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/livemart
   ```
4. Restart server

---

**Remember:** The most common issue is using your **Atlas account credentials** instead of a **database user**. Make sure you create a database user in "Database Access" and use those credentials!



