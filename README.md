# 🎮 SPELINX - Premium Gaming Platform

A comprehensive web-based gaming platform built with Next.js, featuring interactive games, customizable themes, referral systems, wallet functionality, and premium subscriptions.

## ✨ Features

### 🎯 Gaming System
- **6 Interactive Games**: 2048, Crossword, Guess the Flag, Snake, Tetris, Tic-Tac-Toe
- **Scoring & Leaderboards**: Track performance and compete globally
- **Reward System**: Earn credits and bonuses through gameplay

### 🎨 Theme & Customization
- **Dynamic Themes**: Preview and apply custom themes with smooth transitions
- **Theme Persistence**: LocalStorage + Database synchronization
- **CSS Variables**: Support for colors and fonts with 250ms transitions
- **Theme Store**: Purchase and manage custom themes

### 👥 Social & Referral System
- **Referral Program**: Share codes and earn rewards
- **Leaderboards**: Multiple competitive rankings
- **User Profiles**: Custom avatars and profile management

### 💰 Wallet & Payments
- **UPI Integration**: Secure payment processing with QR codes
- **Transaction Management**: Deposits, withdrawals, and history
- **Premium Subscriptions**: Monthly/annual plans with exclusive features

### 🔧 Admin Panel
- **User Management**: Ban/unban users, view profiles
- **Payment Approval**: Verify deposits and withdrawals
- **Content Management**: Manage themes and store items
- **Analytics Dashboard**: Monitor platform activity

### 🔒 Security Features
- **DevSafetyProvider**: Development protection with password authentication
- **JWT Authentication**: Secure session management
- **Audit Logging**: Track all user actions
- **Input Validation**: Comprehensive security measures

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Hassamhub/Spelinx.git
   cd Spelinx
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Configure your environment variables:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   npm run db:setup
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
spelinx/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── admin/             # Admin panel pages
│   ├── games/             # Game pages
│   ├── my-themes/         # User theme management
│   └── ...
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...
├── lib/                   # Utility libraries
│   ├── mongodb.ts        # Database connection
│   ├── models.ts         # Data models
│   └── ...
├── public/               # Static assets
│   └── assets/           # Images and icons
├── scripts/              # Database seeding scripts
└── ...
```

## 🎮 Available Games

1. **2048** - Classic sliding number puzzle
2. **Crossword** - Word-based puzzle game
3. **Guess the Flag** - Geography guessing game
4. **Snake** - Classic snake game with scoring
5. **Tetris** - Block-stacking puzzle game
6. **Tic-Tac-Toe** - Strategic two-player game

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/profile` - User profile
- `POST /api/auth/logout` - User logout

### Games & Leaderboards
- `GET /api/games` - Game statistics
- `GET /api/leaderboard` - Global leaderboard
- `GET /api/referrals/leaderboard` - Referral leaderboard

### Store & Themes
- `GET /api/themes` - Available themes
- `GET /api/user/themes` - User's purchased themes
- `POST /api/themes/buy/[themeId]` - Purchase theme
- `POST /api/user/themes/apply/[themeId]` - Apply theme

### Wallet & Payments
- `GET /api/wallet` - Wallet balance
- `POST /api/wallet/deposit-initiate` - Initiate deposit
- `POST /api/wallet/deposit-submit-proof` - Submit deposit proof

## 🔐 Security Features

### DevSafetyProvider
- **Activation Date**: November 1, 2025
- **Password**: `SPELINX_MASTER_KEY_zidifm32ncKN2XXEYDH7M`
- **Purpose**: Development protection and unauthorized access prevention

### Authentication
- JWT-based sessions with secure token storage
- Password hashing with bcrypt
- Session validation on all protected routes

## 🎨 Theme System

Themes are defined using CSS variables and support:
- **Colors**: Primary, secondary, accent colors
- **Fonts**: Custom font families and sizes
- **Scope**: Full site or games only
- **Preview**: 10-second temporary preview
- **Persistence**: LocalStorage + Database sync

## 👨‍💼 Admin Features

- **User Management**: Ban, unban, view user profiles
- **Payment Verification**: Approve/reject deposits and withdrawals
- **Content Moderation**: Manage themes and store items
- **Analytics**: Platform usage statistics
- **Audit Logs**: Track all administrative actions

## 🌟 Premium Features

- Exclusive themes and customizations
- Premium-only leaderboards
- Higher earning rates
- Priority support
- Advanced game modes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support or questions:
- Create an issue on GitHub
- Contact the development team
- Check the admin panel for system status

---

**Built with ❤️ for the gaming community**