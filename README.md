# SPELINX - Premium Gaming Platform

## 🚀 Project Overview

SPELINX is a modern, full-stack gaming platform built with cutting-edge technologies featuring stunning glassmorphism UI design, real-time multiplayer features, and premium gaming experience.

### ✨ Features

- **Modern Glassmorphism UI** - Beautiful backdrop blur effects and gradient animations
- **Full-Stack Architecture** - Next.js frontend with Express.js backend
- **Real-Time Features** - Socket.io integration for live leaderboards and achievements
- **Premium System** - Wallet integration, premium subscriptions, and in-game purchases
- **Admin Panel** - Complete administrative dashboard for user management
- **Multiple Games** - 2048, Snake, Tetris, Tic-Tac-Toe, Crossword, Guess the Flag
- **Authentication & Security** - JWT-based auth with role-based access control
- **Responsive Design** - Mobile-first approach with dark theme
- **MongoDB Integration** - Comprehensive database schema for all features
- **Custom Theme System** - Dynamic color themes with CSS variables and persistence
- **Referral Program** - Complete referral system with leaderboard and rewards
- **Avatar System** - Custom avatars with default fallbacks
- **Touch-Friendly UI** - Mobile-optimized controls and interactions

### 🛠️ Tech Stack

#### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS with custom glassmorphism effects
- **Framer Motion** - Smooth animations and transitions
- **Axios** - HTTP client for API calls
- **Socket.io Client** - Real-time communication

#### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Rate Limiting** - API protection

### 📁 Project Structure

```
spelinx/
├── README.md
├── package.json
├── server.js
├── .env
├── .env.production
├── .gitignore
├── config/
│   └── db.js
├── models/
│   ├── User.js
│   ├── GameHistory.js
│   ├── Wallet.js
│   ├── Payment.js
│   ├── Achievement.js
│   ├── Leaderboard.js
│   ├── Referral.js
│   ├── Transaction.js
│   ├── DailyClaim.js
├── routes/
│   ├── auth.js
│   ├── games.js
│   ├── wallet.js
│   ├── premium.js
│   ├── admin.js
│   ├── leaderboard.js
│   ├── achievements.js
│   ├── daily.js
│   ├── referral.js
│   └── store.js
├── middleware/
│   └── auth.js
├── spelinx-frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── about/
│   │   ├── dashboard/
│   │   ├── games/
│   │   ├── leaderboard/
│   │   ├── login/
│   │   ├── premium/
│   │   ├── settings/
│   │   ├── signup/
│   │   ├── store/
│   │   └── wallet/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── GameGrid.tsx
│   │   ├── PremiumSection.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── Footer.tsx
│   │   ├── FloatingParticles.tsx
│   │   ├── LoadingScreen.tsx
│   │   └── ui/
│   ├── lib/
│   │   ├── api.ts
│   │   └── utils.ts
│   └── types/
│       └── index.ts
└── tests/
    └── hello.test.js
```

### 🎨 UI/UX Design

#### Glassmorphism Features
- Backdrop blur effects
- Gradient borders and shadows
- Floating particle animations
- Custom scrollbar styling
- Animated gradients
- Responsive card layouts

#### Color Scheme
- Primary: `#6366f1` (Indigo)
- Secondary: `#8b5cf6` (Violet)
- Accent: `#f59e0b` (Amber)
- Dark Background: `#0f0f23`
- Glass Effects: Semi-transparent overlays

### 🚀 Getting Started

#### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Git

#### Installation

1. **Clone and Setup**
```bash
git clone <your-repo-url>
cd spelinx
npm install
```

2. **Environment Variables**
Create `.env` file:
```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Optional for S3/Cloudinary uploads (falls back to local storage)
S3_BUCKET=your-s3-bucket
S3_ACCESS_KEY=your-s3-access-key
S3_SECRET_KEY=your-s3-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# UPI Payment Configuration
FAMPAY_UPI_ID=merchant@fam
MERCHANT_NAME=SPELINX Gaming

# Admin Service Token (for referral rewards)
SERVICE_TOKEN=your-service-token
```

3. **Build Frontend**
```bash
cd spelinx-frontend
npm install --legacy-peer-deps
npm run build
cd ..
```

4. **Run Seed Scripts**
```bash
node scripts/addReferralCodesToUsers.js
node scripts/seedDefaultAvatar.js
node scripts/seedThemes.js
```

5. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see your app!

6. **Testing**
```bash
npm run test
```

### 📱 Pages & Features

#### Public Pages
- **Home** - Landing page with glassmorphism hero and game grid
- **Games** - All available games with previews
- **Leaderboard** - Global and game-specific rankings
- **About** - Platform information and features

#### User Features
- **Dashboard** - User profile and statistics
- **Wallet** - Balance management and transactions
- **Store** - Premium items, themes, avatars, and cosmetics
- **MyThemes** - Manage and apply purchased themes
- **MyAvatars** - Manage and apply purchased avatars
- **Premium** - Subscription plans and features
- **Referral** - Referral program with leaderboard
- **Settings** - Account preferences with theme/avatar selection

#### Admin Features
- **User Management** - Ban/unban users, view stats
- **Payment Management** - Approve/reject deposits, premium payments, and store purchases
- **Referral Management** - View and approve referral rewards
- **Theme Management** - Upload and manage custom themes
- **Store Management** - Manage all store items including themes and avatars
- **Analytics** - Sales stats and user metrics

### 🎮 Games Included

1. **2048** - Number puzzle game
2. **Snake** - Classic arcade game
3. **Tetris** - Block stacking puzzle
4. **Tic-Tac-Toe** - Strategic board game
5. **Crossword** - Word puzzle game
6. **Guess the Flag** - Geography trivia

### 💰 Premium Features

- **Unlimited Games** - All games available
- **Premium Cosmetics** - Exclusive themes and effects
- **VIP Support** - Priority customer service
- **Bonus Rewards** - Increased daily rewards

### 🎨 Theme System

- **Dynamic Themes** - Custom color schemes with CSS variables
- **Theme Persistence** - Settings saved in DB and localStorage
- **Preview Mode** - 10-second preview before applying
- **Admin Management** - Upload and manage themes via admin panel
- **Mobile Optimized** - Touch-friendly theme selection

### 👥 Referral Program

- **Referral Codes** - 8-character unique codes generated on signup
- **Leaderboard** - Top referrers with rankings and rewards
- **Admin Approval** - Manual approval of referral rewards
- **Bonus System** - Credits and theme unlocks for successful referrals
- **Anti-Abuse** - IP-based limits and duplicate prevention

### 🔒 Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting on sensitive endpoints
- CORS protection
- Input validation and sanitization

### 🌐 Deployment

#### Render Deployment
1. Push to GitHub
2. Connect to Render
3. Set environment variables
4. Deploy automatically

#### Environment Variables (Production)
```env
NODE_ENV=production
PORT=10000
MONGO_URI=your-production-mongodb-url
JWT_SECRET=your-production-jwt-secret
RENDER_EXTERNAL_URL=https://your-app-name.onrender.com
ALLOWED_ORIGINS=https://your-app-name.onrender.com
FRONTEND_URL=https://your-app-name.onrender.com
```

### 🧪 Testing

```bash
npm test
```

### 📈 API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration (supports ?ref= parameter)
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile (theme, avatar)

#### Games
- `GET /api/games` - Get available games
- `POST /api/games/:id/play` - Play a game

#### Premium & Store
- `POST /api/premium/initiate-payment` - Start premium subscription
- `POST /api/premium/submit-proof` - Submit payment proof
- `GET /api/themes` - Get available themes
- `POST /api/themes/buy/:themeId` - Purchase theme
- `GET /api/user/themes` - Get user's purchased themes
- `POST /api/user/themes/apply/:themeId` - Apply theme
- `GET /api/store` - Get store items
- `POST /api/store` - Purchase store items

#### Referral System
- `GET /api/referral/leaderboard` - Get referral leaderboard
- `GET /api/referral/me/link` - Get user's referral link and stats
- `POST /api/referral/reward` - Process referral reward (admin only)
- `GET /api/admin/referrals/all` - Get all referrals (admin only)

#### Wallet
- `GET /api/wallet` - Get wallet balance
- `POST /api/wallet/deposit-initiate` - Initiate deposit

#### Admin
- `POST /api/admin/store-payments/:paymentId/approve` - Approve store payment
- `POST /api/admin/themes` - Upload theme (admin only)
- `GET /api/admin/store` - Manage store items

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

### 📞 Support

For support, email support@spelinx.com or join our Discord community.

---

**Built with ❤️ using Next.js, Express.js, MongoDB, and modern web technologies**