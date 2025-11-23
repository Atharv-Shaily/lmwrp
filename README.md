# LiveMart - Multi-Role E-Commerce Platform

A comprehensive e-commerce platform supporting Customers, Retailers, and Wholesalers with full-featured modules for registration, dashboards, search, orders, payments, and feedback.

## Features

### Module 1: Registration and Sign-Up
- Multi-role registration (Customer/Retailer/Wholesaler)
- OTP-based email/SMS authentication
- Social logins (Google/Facebook)
- Google Maps API integration for location-based services

### Module 2: User Dashboards
- Category-wise item listing with images
- Detailed item information (price, stock, availability)
- Retailer proxy availability (show wholesaler items)

### Module 3: Search & Navigation
- Smart filtering (price, quantity, stock availability)
- Location-based shop listings
- Distance filters for nearby options

### Module 4: Order & Payment Management
- Online and offline order placement
- Calendar integration for offline orders with reminders
- Order tracking with delivery details and status updates
- Automatic stock updates after transactions
- Stripe payment integration

### Module 5: Feedback & Dashboard Updates
- Real-time order status updates
- Delivery confirmation via SMS/Email
- Product-specific feedback collection
- Feedback visible on item pages

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js (OTP, Social Logins)
- **Payment**: Stripe
- **Location**: Google Maps API
- **Notifications**: Nodemailer (Email), Twilio (SMS)

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB database
- Google Maps API key
- Stripe account (for payments)
- Twilio account (for SMS - optional)
- Email service credentials (for OTP and notifications)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd LiveMart
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/livemart

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Stripe Payment
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Twilio SMS
TWILIO_ACCOUNT_SID=AC3daeb408280b707630f6f17a98f2555e
TWILIO_AUTH_TOKEN=713c2597faaecf5535df43e0be806bf9
TWILIO_PHONE_NUMBER=9301147551

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
LiveMart/
├── components/          # React components
├── lib/                 # Utility functions (auth, email, SMS, location)
├── models/              # MongoDB models
├── pages/
│   ├── api/             # API routes
│   ├── auth/            # Authentication pages
│   ├── products/        # Product pages
│   ├── cart.tsx         # Shopping cart
│   ├── checkout.tsx     # Checkout page
│   ├── orders/          # Order management
│   ├── dashboard/       # Dashboard for retailers/wholesalers
│   ├── feedback/        # Feedback pages
│   └── queries/          # Customer query pages
├── styles/              # Global styles
└── public/              # Static assets
```

## User Roles

### Customers
- Browse and search products
- Add items to cart and place orders
- Make payments (online/offline/COD)
- Provide feedback and raise queries
- Track order status

### Retailers
- Manage inventory (add/update/delete products)
- Track customer purchase history
- Place orders with wholesalers
- Handle payments and customer queries
- Show proxy availability from wholesalers

### Wholesalers
- Manage inventory for retailers
- Set item pricing
- Maintain retailer purchase/transaction history
- Update stock after retailer orders
- Handle retailer queries

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/resend-otp` - Resend OTP

### Products
- `GET /api/products` - List products with filters
- `GET /api/products/[id]` - Get product details
- `POST /api/products` - Create product (retailer/wholesaler)
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart` - Update cart
- `DELETE /api/cart/[productId]` - Remove item from cart

### Orders
- `GET /api/orders` - List orders
- `GET /api/orders/[id]` - Get order details
- `POST /api/orders` - Create order
- `PATCH /api/orders/[id]` - Update order status

### Payments
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/payments/webhook` - Stripe webhook handler

### Feedback
- `GET /api/feedback` - List feedbacks
- `POST /api/feedback` - Create feedback

### Queries
- `GET /api/queries` - List queries
- `GET /api/queries/[id]` - Get query details
- `POST /api/queries` - Create query
- `PATCH /api/queries/[id]` - Respond to query

## Development

### Running in Development Mode
```bash
npm run dev
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.






