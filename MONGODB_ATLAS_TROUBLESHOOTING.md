# MongoDB Atlas Authentication Error Fix

The error `bad auth : authentication failed` (code 8000) means your MongoDB Atlas connection string has incorrect credentials.

## Quick Fix Steps

### Step 1: Get Your Correct Connection String from Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/) and log in
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** and version **"5.5 or later"**
5. Copy the connection string (it looks like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 2: Replace Username and Password

The connection string will have placeholders `<username>` and `<password>`. Replace them with:

1. **Username**: The database user you created in Atlas
2. **Password**: The password for that user (URL-encode special characters if needed)

**Important:** If your password contains special characters, you need to URL-encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `$` becomes `%24`
- `%` becomes `%25`
- `&` becomes `%26`
- `+` becomes `%2B`
- `=` becomes `%3D`
- `?` becomes `%3F`

### Step 3: Add Database Name

Add your database name at the end of the connection string:

**Before:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**After:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/livemart?retryWrites=true&w=majority
```

Notice `/livemart` added before the `?` - this is your database name.

### Step 4: Update Your .env File

Update your `.env` file with the correct connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/livemart?retryWrites=true&w=majority
```

**Important:**
- No quotes around the connection string
- No spaces
- Make sure username and password are correct
- Database name is added (`/livemart`)

### Step 5: Verify Database User in Atlas

1. In MongoDB Atlas, go to **"Database Access"** (left sidebar)
2. Check that your database user exists
3. If you forgot the password:
   - Click **"Edit"** on the user
   - Click **"Edit Password"**
   - Set a new password
   - Update your connection string with the new password

### Step 6: Check IP Whitelist

1. In MongoDB Atlas, go to **"Network Access"** (left sidebar)
2. Make sure your IP address is whitelisted, OR
3. Click **"Add IP Address"**
4. Click **"Allow Access from Anywhere"** (for development) or add your specific IP
5. Click **"Confirm"**

### Step 7: Restart Your Server

After updating `.env`:
```bash
# Stop your server (Ctrl+C)
# Then restart
npm run dev
```

## Common Mistakes

### ❌ Wrong: Missing Database Name
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
```

### ✅ Correct: With Database Name
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/livemart?retryWrites=true&w=majority
```

### ❌ Wrong: Special Characters Not Encoded
```env
MONGODB_URI=mongodb+srv://user:pass@word@cluster.mongodb.net/livemart
```
(If password is `pass@word`, the `@` needs to be `%40`)

### ✅ Correct: Special Characters Encoded
```env
MONGODB_URI=mongodb+srv://user:pass%40word@cluster.mongodb.net/livemart
```

### ❌ Wrong: Using Wrong Username/Password
- Using your Atlas account email/password instead of database user credentials
- Using old/expired credentials

### ✅ Correct: Using Database User Credentials
- Create a database user in "Database Access"
- Use that username and password in connection string

## Step-by-Step: Create New Database User

If you need to create a new database user:

1. Go to MongoDB Atlas → **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter a username (e.g., `livemart-user`)
5. Enter a password (use a strong password, save it!)
6. Under **"Database User Privileges"**, select **"Atlas admin"** or **"Read and write to any database"**
7. Click **"Add User"**
8. Use these credentials in your connection string

## Testing Your Connection

After updating your `.env` file, test the connection:

1. Restart your development server
2. Try to sign up again
3. If it still fails, check:
   - Server terminal for detailed error messages
   - Browser console for errors
   - MongoDB Atlas → "Database Access" to verify user exists
   - MongoDB Atlas → "Network Access" to verify IP is whitelisted

## Still Having Issues?

1. **Double-check your connection string format:**
   ```
   mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
   ```

2. **Verify in Atlas:**
   - Database user exists and is active
   - Password is correct
   - IP address is whitelisted

3. **Try creating a new database user** with a simple password (no special characters) to test

4. **Check server logs** for more detailed error messages

## Alternative: Use Local MongoDB

If you continue having issues with Atlas, you can use local MongoDB:

1. Install MongoDB Community Edition locally
2. Update `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/livemart
   ```
3. Start MongoDB service
4. Restart your dev server

---

**Most Common Fix:** Make sure you're using the **database user credentials** (not your Atlas account credentials) and that the database name (`/livemart`) is included in the connection string!



