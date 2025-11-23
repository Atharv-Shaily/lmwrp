# Google OAuth Setup Instructions for LiveMart

This guide will walk you through setting up Google OAuth authentication for your LiveMart project.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step-by-Step Instructions

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click **"New Project"**
4. Enter a project name (e.g., "LiveMart OAuth")
5. Click **"Create"**
6. Wait for the project to be created, then select it from the project dropdown

### Step 2: Enable Google+ API / Google Identity Services

1. In the Google Cloud Console, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"Google Identity Services"**
3. Click on **"Google+ API"** (or **"Google Identity Services"**)
4. Click **"Enable"**
5. Wait for the API to be enabled

**Note:** Google+ API is being deprecated, but it's still commonly used. Alternatively, you can use the newer "Google Identity Services" API.

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Choose **"External"** (unless you have a Google Workspace account, then choose "Internal")
3. Click **"Create"**
4. Fill in the required information:
   - **App name**: LiveMart (or your preferred name)
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click **"Save and Continue"**
6. On the **"Scopes"** page, click **"Add or Remove Scopes"**
   - Select the following scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Click **"Update"**
   - Click **"Save and Continue"**
7. On the **"Test users"** page (if in testing mode):
   - Click **"Add Users"**
   - Add your email address (and any test users)
   - Click **"Save and Continue"**
8. Review and click **"Back to Dashboard"**

### Step 4: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**
4. If prompted, choose **"Web application"** as the application type
5. Fill in the details:
   - **Name**: LiveMart Web Client (or any name you prefer)
   - **Authorized JavaScript origins** (Optional but recommended):
     - For development: `http://localhost:3000`
     - For production: `https://yourdomain.com` (add your production URL)
     - **Note:** This is optional for NextAuth.js OAuth, but recommended for security
   - **Authorized redirect URIs** (REQUIRED):
     - For development: `http://localhost:3000/api/auth/callback/google`
     - For production: `https://yourdomain.com/api/auth/callback/google`
     - **Note:** This is REQUIRED - must match exactly (no trailing slash)
6. Click **"Create"**
7. **IMPORTANT**: A popup will appear with your credentials:
   - **Client ID**: Copy this value (looks like: `123456789-abcdefghijklmnop.apps.googleusercontent.com`)
   - **Client Secret**: Copy this value (looks like: `GOCSPX-abcdefghijklmnopqrstuvwxyz`)
   - **Save these immediately** - you won't be able to see the secret again!

### Step 5: Add Credentials to Your Project

1. Open your `.env` file in the root directory of your LiveMart project
2. Add or update these lines:

```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

**Example:**
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
```

3. Save the `.env` file

### Step 6: Verify Your Setup

1. Make sure your `.env` file also has:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key-here
   ```

2. Restart your development server:
   ```bash
   npm run dev
   ```

3. Navigate to your sign-in page: `http://localhost:3000/auth/signin`
4. Click the **"Google"** button
5. You should be redirected to Google's sign-in page
6. After signing in, you should be redirected back to your app

## Production Setup

When deploying to production:

1. **Update OAuth Consent Screen**:
   - Go to **"OAuth consent screen"** in Google Cloud Console
   - Complete all required fields
   - Submit for verification (if making the app public)

2. **Add Production URLs**:
   - Go to **"Credentials"** → Edit your OAuth 2.0 Client ID
   - Add your production domain to:
     - **Authorized JavaScript origins**: `https://yourdomain.com`
     - **Authorized redirect URIs**: `https://yourdomain.com/api/auth/callback/google`

3. **Update `.env` file** (or environment variables in your hosting platform):
   ```env
   NEXTAUTH_URL=https://yourdomain.com
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

## Troubleshooting

### Issue: "redirect_uri_mismatch" Error

**Solution:**
- Make sure the redirect URI in Google Cloud Console exactly matches: `http://localhost:3000/api/auth/callback/google`
- Check for typos, trailing slashes, or protocol mismatches (http vs https)
- Wait a few minutes after updating - changes may take time to propagate

### Issue: "access_denied" Error

**Solution:**
- Make sure you've added your email as a test user in the OAuth consent screen
- Check that the OAuth consent screen is properly configured
- Verify that the required scopes are added

### Issue: "invalid_client" Error

**Solution:**
- Double-check your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Make sure there are no extra spaces or quotes
- Restart your development server after updating `.env`

### Issue: OAuth Button Not Working

**Solution:**
- Check browser console for errors
- Verify `NEXTAUTH_URL` is set correctly in `.env`
- Make sure `NEXTAUTH_SECRET` is set
- Check that NextAuth is properly configured in `pages/api/auth/[...nextauth].ts`

## Security Best Practices

1. **Never commit `.env` file to Git** - it should be in `.gitignore`
2. **Use different credentials** for development and production
3. **Keep your Client Secret secure** - treat it like a password
4. **Regularly review** authorized redirect URIs in Google Cloud Console
5. **Use environment variables** in production hosting platforms (Vercel, Netlify, etc.)

## Additional Resources

- [NextAuth.js Google Provider Documentation](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

## Quick Checklist

- [ ] Google Cloud Project created
- [ ] Google+ API or Google Identity Services enabled
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Client ID and Client Secret copied
- [ ] Credentials added to `.env` file
- [ ] Authorized redirect URI set to: `http://localhost:3000/api/auth/callback/google`
- [ ] Development server restarted
- [ ] Google sign-in tested successfully

---

**Note:** Your project already has the code configured for Google OAuth. You just need to add the credentials from Google Cloud Console to your `.env` file!


