# BoliBazaar 🔨

BoliBazaar is a premium, high-performance real-time online auction platform designed for secure, transparent, and fair bidding. Built on the MERN stack with real-time WebSocket communication, it features robust concurrency controls, anti-spam mechanisms, and dynamic user watchlists.

## 🚀 Key Features

* **Real-Time Bidding**: Powered by **Socket.io** to synchronize new bids, outbid alerts, and seller notifications instantaneously across all connected clients without page reloads.
* **Fairness in Bidding & Concurrency Control**:
  * **Optimistic Concurrency Control (OCC)**: Uses atomic MongoDB queries (`findOneAndUpdate`) to guarantee data integrity when multiple users bid at the exact same millisecond. Conflicting bids are rolled back cleanly, returning a `409 Conflict` to the client.
  * **Anti-Bot Rate Limiting**: Endpoint protection via Redis-backed rate limiters (with in-memory fallbacks) applied to bid submissions, signups, and logins.
* **Google OAuth & Two-Step Verification**:
  * **Social Login**: Integrated direct Google OAuth 2.0 using Passport.js with automatic backend profile creation and account linking.
  * **Password Creation Redirect Flow**: If a user signed up via Google and has no password set, attempting a manual login sends a verification OTP to their email and redirects them to a password creation screen, allowing dual login methods (Google + Password).
  * **Email Auth**: Secure registration verification links and login OTP codes managed dynamically.
* **Zero-SMTP & Redis Fail-Open Resilience**:
  * **Nodemailer Fallback**: Gracefully catches SMTP connection timeouts (often caused by cloud mail port blocks on Render) and displays mock OTPs / activation links directly in client toasts for verification.
  * **Cache Fallback**: Automatically routes Redis commands to a local Map cache if the Redis client is disconnected or unconfigured.
* **Dynamic Watchlist & Profile Dashboard**:
  * Dedicated **Watchlist** tab enabling users to track live auctions, receive status updates, and manage watched listings.
  * Clickable **Active Auctions** and **Watchlist** overview cards linking straight to dashboard feeds.
  * Dynamic cleanup hides orphan listings from feeds and stats if a seller's user account is deleted.
* **Seller Controls**: Sellers are restricted from bidding on their own listings. Modifications or deletions of listed auctions are locked once active bids are received (`currentBid > 0`).
* **Automated Expiry Scheduler**: Backend cron workers monitor auction end-times, automatically transitioning completed listings to `"Sold"` or `"Expired"`, populating winning bids, and delivering inbox notifications.

---

## 🛠️ Tech Stack

* **Frontend**: React.js, Redux Toolkit, React Router, TailwindCSS / CSS, Framer Motion, React Hook Form.
* **Backend**: Node.js, Express.js, MongoDB (Mongoose), Redis (Upstash client), Socket.io, Nodemailer, Cloudinary (Image hosting).
* **Security & Testing**: Zod validation schemas, Bcrypt hashing, JSON Web Tokens (JWT), IP-based Rate Limiters.

---

## 📂 Project Structure

```text
├── client/                 # React Frontend Client
│   ├── src/
│   │   ├── components/     # UI Components (Dashboard, Profile, Navbar, Common)
│   │   ├── pages/          # Pages (Home, Auctions, Details, Auth Pages)
│   │   ├── services/       # API Connectors, Routes, Operations
│   │   └── slices/         # Redux state management (Auth, Profile, Cart)
│   └── package.json
│
└── server/                 # Express Backend API Server
    ├── config/             # Database connection, Redis client, schemas
    ├── controllers/        # Controllers (Auth, Bids, Auctions, Users)
    ├── middlewares/        # Authentication and Rate Limiter Middlewares
    ├── routes/             # API Route Handlers
    ├── socket/             # Socket.io Server Setup
    └── index.js            # Main Server Entrypoint
```

---

## ⚙️ Environment Configurations

### Backend (`server/.env`)
Create a `.env` file inside the `server/` directory:
```env
MONGODB_URL = "your_mongodb_connection_string"
PORT = "8001"
JWT_SECRET = "your_jwt_secret"
NODE_ENV = "production" # Set to production on host, development locally

# Cloudinary Credentials (For Listing Images)
CLOUDINARY_CLOUD_NAME = "your_cloud_name"
CLOUDINARY_API_KEY = "your_api_key"
CLOUDINARY_API_SECRET = "your_api_secret"

# Redis Server
REDIS_URL = "redis_connection_url" # e.g. Upstash Redis

# Email SMTP Setup (Nodemailer)
MAIL_USER = "your_gmail@gmail.com"
MAIL_PASSWORD = "your_gmail_app_password" # 16-character App Password

FRONTEND_URL = "https://your-frontend-deployment.vercel.app"

# Google OAuth Credentials
GOOGLE_CLIENT_ID = "your_google_client_id"
GOOGLE_CLIENT_SECRET = "your_google_client_secret"
```

### Frontend (`client/.env`)
Create a `.env` file inside the `client/` directory:
```env
VITE_BASE_URL = "http://localhost:8001/api/v1" # Override with production API URL on Vercel
VITE_SOCKET_URL = "http://localhost:8001"       # Override with production server URL on Vercel
```

---

## 📦 Deployment Reminders

1. **Google Console Credentials**: 
   Ensure your frontend URL (e.g. `https://your-app.vercel.app`) is added under **Authorized JavaScript Origins** and your backend callback URL (e.g. `https://your-api.com/api/v1/auth/google/callback`) is added under **Authorized Redirect URIs** in your Google Cloud Console.
2. **CORS Origin Configuration**:
   Production domains must be added to the whitelist arrays in [server/index.js](server/index.js) and [server/socket/socket.js](server/socket/socket.js).
3. **Environment Variables**:
   Add all `.env` secrets manually in your Render (Backend) and Vercel (Frontend) settings dashboards before deploying.
