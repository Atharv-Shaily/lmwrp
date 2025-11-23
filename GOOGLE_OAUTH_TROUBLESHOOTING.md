# Google OAuth Troubleshooting Guide

If you're experiencing errors when trying to sign up with Google OAuth, follow these steps to identify and fix the issue.

## Common Error Messages and Solutions

### 1. "Error: Invalid credentials" or "OAuthAccountNotLinked"

**Possible Causes:**
- Missing or incorrect environment variables
- Google OAuth credentials not properly configured

**Solution:**
1. Check your `.env` file has these variables:
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   ```

2. Make sure there are **no spaces** or **quotes** around the values
3. Restart your development server after updating `.env`

### 2. "redirect_uri_mismatch" Error

**This is the MOST COMMON error!**

**Cause:** The redirect URI in your Google Cloud Console doesn't match what NextAuth is using.

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **"APIs & Services"** → **"Credentials"**
3. Click on your OAuth 2.0 Client ID
4. Under **"Authorized redirect URIs"**, make sure you have:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. For production, also add:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
6. Click **"Save"**
7. **Wait 5-10 minutes** for changes to propagate
8. Try again

**Important:** The redirect URI must be **exactly** `http://localhost:3000/api/auth/callback/google` (no trailing slash, correct protocol)

### 3. "access_denied" or "Error 403: access_denied"

**Cause:** Your email is not added as a test user, or the OAuth consent screen is not properly configured.

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **"APIs & Services"** → **"OAuth consent screen"**
3. Check the **"Publishing status"**:
   - If it says **"Testing"**, you need to add test users
4. Scroll down to **"Test users"** section
5. Click **"Add Users"**
6. Add your email address (the one you're using to sign in)
7. Click **"Add"**
8. Try signing in again

**Note:** If your app is in "Testing" mode, only test users can sign in. To allow anyone to sign in, you need to publish your app (requires verification for production).

### 4. "Error: [next-auth][error][OAUTH_CALLBACK_ERROR]"

**Cause:** There's an issue with the OAuth callback handling.

**Solution:**
1. Check your browser console for detailed error messages
2. Check your server terminal/logs for error details
3. Verify your `NEXTAUTH_SECRET` is set and is a long random string
4. Make sure `NEXTAUTH_URL` matches your current URL (http://localhost:3000 for development)

### 5. "Error: Missing required parameter: client_id"

**Cause:** `GOOGLE_CLIENT_ID` is not set or is empty.

**Solution:**
1. Check your `.env` file has `GOOGLE_CLIENT_ID` set
2. Make sure the value starts with something like `123456789-...`
3. Restart your development server

### 6. "Error: Missing required parameter: client_secret"

**Cause:** `GOOGLE_CLIENT_SECRET` is not set or is empty.

**Solution:**
1. Check your `.env` file has `GOOGLE_CLIENT_SECRET` set
2. Make sure the value starts with `GOCSPX-...`
3. Restart your development server

### 7. Blank Page or Infinite Loading

**Cause:** The OAuth flow is stuck, usually due to redirect URI mismatch or missing environment variables.

**Solution:**
1. Check browser console for errors
2. Verify redirect URI in Google Cloud Console (see Error #2)
3. Check all environment variables are set
4. Clear browser cache and cookies
5. Try in an incognito/private window

## Step-by-Step Verification Checklist

Use this checklist to verify your setup:

### Environment Variables
- [ ] `GOOGLE_CLIENT_ID` is set in `.env`
- [ ] `GOOGLE_CLIENT_SECRET` is set in `.env`
- [ ] `NEXTAUTH_URL` is set to `http://localhost:3000` (for development)
- [ ] `NEXTAUTH_SECRET` is set (any long random string)
- [ ] No quotes or spaces around values in `.env`
- [ ] Development server restarted after updating `.env`

### Google Cloud Console Configuration
- [ ] OAuth consent screen is configured
- [ ] Your email is added as a test user (if app is in testing mode)
- [ ] OAuth 2.0 Client ID is created
- [ ] Authorized redirect URI includes: `http://localhost:3000/api/auth/callback/google`
- [ ] Redirect URI has no trailing slash
- [ ] Redirect URI uses `http://` (not `https://`) for localhost

### Code Configuration
- [ ] `pages/api/auth/[...nextauth].ts` exists
- [ ] GoogleProvider is configured in the providers array
- [ ] `NEXTAUTH_SECRET` is set in authOptions

## Quick Debug Steps

1. **Check Environment Variables:**
   ```bash
   # In your terminal, check if variables are loaded
   node -e "console.log(process.env.GOOGLE_CLIENT_ID)"
   ```
   (This won't work directly, but you can check your `.env` file)

2. **Check Server Logs:**
   - Look at your terminal where `npm run dev` is running
   - Check for any error messages when you click the Google button

3. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for error messages when clicking Google sign-in

4. **Check Network Tab:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Click the Google button
   - Look for failed requests (red)
   - Check the error message in the response

## Testing Your Setup

1. **Test the OAuth Flow:**
   - Go to `http://localhost:3000/auth/signup`
   - Click the "Google" button
   - You should be redirected to Google's sign-in page
   - After signing in, you should be redirected back to your app

2. **If you get redirected but see an error:**
   - Check the URL in your browser - it might contain error details
   - Check your server logs for the actual error
   - Check browser console for client-side errors

## Common Configuration Mistakes

1. **Wrong Redirect URI:**
   - ❌ `http://localhost:3000/api/auth/callback/google/` (trailing slash)
   - ❌ `https://localhost:3000/api/auth/callback/google` (wrong protocol)
   - ✅ `http://localhost:3000/api/auth/callback/google` (correct)

2. **Environment Variables:**
   - ❌ `GOOGLE_CLIENT_ID="123..."` (with quotes)
   - ❌ `GOOGLE_CLIENT_ID = 123...` (with spaces)
   - ✅ `GOOGLE_CLIENT_ID=123...` (no quotes, no spaces)

3. **Missing Test User:**
   - If your app is in "Testing" mode, you MUST add your email as a test user
   - Go to OAuth consent screen → Test users → Add your email

## Still Having Issues?

If you've checked everything above and still have issues:

1. **Share the exact error message** you're seeing (from browser console or server logs)
2. **Check the URL** when the error occurs - it might contain error details
3. **Verify your Google Cloud Console setup** matches the guide in `GOOGLE_OAUTH_SETUP.md`
4. **Try signing in** (instead of sign up) - sometimes the error is clearer on the sign-in page

## Additional Resources

- [NextAuth.js Google Provider Docs](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**Most Common Fix:** 90% of Google OAuth errors are due to the redirect URI mismatch. Double-check that `http://localhost:3000/api/auth/callback/google` is exactly added in your Google Cloud Console credentials!



