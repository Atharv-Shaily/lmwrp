# Quick Start Guide - Running LiveMart

## Step-by-Step Instructions

### Step 1: Check Prerequisites

Make sure you have installed:
- **Node.js** (version 18 or higher)
  - Check by running: `node --version`
  - Download from: https://nodejs.org/
- **npm** (comes with Node.js)
  - Check by running: `npm --version`
- **MongoDB** (local or cloud instance)
  - Local: Download from https://www.mongodb.com/try/download/community
  - Cloud: Use MongoDB Atlas (free tier available)

### Step 2: Install Dependencies

Open your terminal/command prompt in the LiveMart directory and run:

```bash
npm install
```

This will install all required packages (Next.js, React, MongoDB, etc.)

### Step 3: Set Up MongoDB

**Option A: Local MongoDB**
1. Install MongoDB Community Edition
2. Start MongoDB service:
   - Windows: MongoDB should start automatically as a service
   - Mac/Linux: `sudo systemctl start mongod` or `brew services start mongodb-community`
3. Verify it's running: `mongosh` (should connect successfully)

**Option B: MongoDB Atlas (Cloud - Recommended for beginners)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier)
4. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/livemart`)

### Step 4: Create Environment Variables File

1. In the root directory, create a file named `.env` (not `.env.example`)
2. Copy the content from `.env.example` or use this template:

```env
# Database - Use your MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/livemart
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/livemart

# NextAuth - Generate a random secret (required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-key-here-generate-a-long-random-string

# Google OAuth (Optional - for social login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth (Optional - for social login)
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# Google Maps API (Optional - for location features)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Stripe Payment (Optional - for payments)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Twilio SMS (Optional - for SMS notifications)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Email Configuration (Required for OTP - use Gmail or similar)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

**Important Notes:**
- **NEXTAUTH_SECRET**: Generate a random string. You can use: `openssl rand -base64 32` or any random string generator
- **MONGODB_URI**: Must be set correctly for the app to work
- **EMAIL_PASS**: For Gmail, you need an "App Password" (not your regular password)
  - Go to Google Account → Security → 2-Step Verification → App Passwords

### Step 5: Run the Development Server

In your terminal, run:

```bash
npm run dev
```

You should see output like:
```
> livemart@1.0.0 dev
> next dev

  ▲ Next.js 14.0.4
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

### Step 6: Open the Website

Open your web browser and go to:
```
http://localhost:3000
```

You should see the LiveMart homepage!

## Minimum Required Setup (To Get Started Quickly)

If you want to test the website quickly without all integrations, you only need:

1. **MongoDB** - Required (database)
2. **NEXTAUTH_SECRET** - Required (generate any random string)
3. **MONGODB_URI** - Required (your database connection)

The rest (OAuth, Stripe, SMS, Email) are optional and can be added later.

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:**
- Make sure MongoDB is running
- Check your `MONGODB_URI` in `.env` is correct
- For local MongoDB, try: `mongodb://127.0.0.1:27017/livemart`

### Issue: "Module not found" errors
**Solution:**
- Run `npm install` again
- Delete `node_modules` folder and `.next` folder, then run `npm install`

### Issue: "Port 3000 already in use"
**Solution:**
- Close other applications using port 3000
- Or change the port: `npm run dev -- -p 3001`

### Issue: "NEXTAUTH_SECRET is missing"
**Solution:**
- Add `NEXTAUTH_SECRET=any-random-string-here` to your `.env` file

### Issue: Email OTP not working
**Solution:**
- For Gmail, use an App Password (not your regular password)
- Make sure 2-Step Verification is enabled on your Google Account
- Check `EMAIL_USER` and `EMAIL_PASS` in `.env`

## Testing the Website

Once running, you can:

1. **Sign Up** as a Customer, Retailer, or Wholesaler
2. **Browse Products** (once you add some)
3. **Add Products** (if you're a Retailer/Wholesaler)
4. **Place Orders** and test the flow

## Next Steps After Running

1. Create test accounts for different roles
2. Add some products (as a Retailer/Wholesaler)
3. Test the shopping cart and checkout flow
4. Configure optional services (Stripe, SMS, OAuth) as needed

## Production Deployment

When ready to deploy:

```bash
npm run build
npm start
```

For production, you'll also need to:
- Set up a production MongoDB instance
- Configure production environment variables
- Set up a proper domain and SSL certificate
- Configure production URLs in environment variables

## Need Help?

- Check the main README.md for detailed documentation
- Review the API endpoints section for backend functionality
- Check browser console and terminal for error messages






