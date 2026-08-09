# 🚀 Habit Tracker - Setup Guide

A complete habit tracking application with gamification features. Turn your life into a game!

## System Requirements

- **Node.js**: v16+ (v18+ recommended)
- **PostgreSQL**: v12+
- **npm**: v8+

---

## 📋 Quick Start (5 Minutes)

### 1. PostgreSQL Setup

```bash
# Create database
createdb habit_tracker

# (Or use pgAdmin/psql)
psql -U postgres
CREATE DATABASE habit_tracker;
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=habit_tracker
# DB_USER=postgres
# DB_PASSWORD=your_password
# JWT_SECRET=your_super_secret_key_change_this_in_production
# PORT=5000
# NODE_ENV=development
# CORS_ORIGIN=http://localhost:3000

# Run database migration
npm run migrate

# Start backend server (development)
npm run dev

# Server will run on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev

# App will open on http://localhost:3000
```

---

## 📁 Project Structure

```
habit-tracker-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts          # DB connection
│   │   ├── database/
│   │   │   └── migrate.ts           # Schema & migration
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces
│   │   ├── utils/
│   │   │   ├── auth.ts              # JWT & password hashing
│   │   │   └── gamification.ts      # Points, levels, streaks
│   │   ├── middleware/
│   │   │   └── auth.ts              # Authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.ts              # Login/signup endpoints
│   │   │   ├── habits.ts            # Habit CRUD endpoints
│   │   │   ├── logs.ts              # Daily log endpoints
│   │   │   └── stats.ts             # Stats & analytics endpoints
│   │   └── index.ts                 # Express server
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx           # Navigation bar
│   │   │   ├── HabitCard.tsx         # Habit display card
│   │   │   ├── DailyChecklist.tsx    # Today's checklist
│   │   │   ├── AddHabitModal.tsx     # Add habit modal
│   │   │   └── StatsWidget.tsx       # Stat display
│   │   ├── pages/
│   │   │   ├── Login.tsx             # Login page
│   │   │   ├── Signup.tsx            # Signup page
│   │   │   ├── Dashboard.tsx         # Main dashboard
│   │   │   ├── Stats.tsx             # Analytics page
│   │   │   └── Achievements.tsx      # Achievements page
│   │   ├── services/
│   │   │   └── api.ts               # API calls
│   │   ├── store/
│   │   │   └── authStore.ts         # Zustand auth store
│   │   ├── App.tsx                  # Main app & routes
│   │   ├── main.tsx                 # React entry point
│   │   └── index.css                # Global styles
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── SETUP.md                         # This file
└── README.md
```

---

## 🎨 Features Implemented

### ✅ Authentication
- User registration with email validation
- Secure login with JWT
- Password hashing with bcryptjs
- Token expiry (7 days default)

### ✅ Habit Management
- Create, read, update, delete habits
- Custom emojis and colors
- Category organization
- Points per completion

### ✅ Daily Tracking
- Check off habits each day
- Add notes to completions
- View daily progress bar
- Completion rate tracking

### ✅ Gamification
- **Points System**: Earn points for each completed habit
- **Levels**: Progress from Level 1 (1000 points per level)
- **Streaks**: Current and best streaks per habit
- **Achievements**: Badges for milestones (7-day, 30-day, 100-day streaks)
- **Leaderboard**: Track progress against own records

### ✅ Analytics
- Weekly completion rates
- Monthly completion rates
- Consistency tracking (7-day & 30-day)
- Insights (best habit, best day, longest streak)
- Charts and visualizations

### ✅ UI/UX
- Peaceful, minimal design
- Responsive layout (mobile-friendly)
- Dark mode ready
- Smooth animations
- Intuitive navigation

---

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/signup          # Register
POST /api/auth/login           # Login
```

### Habits
```
GET    /api/habits             # Get all habits
GET    /api/habits/:id         # Get specific habit
POST   /api/habits             # Create habit
PUT    /api/habits/:id         # Update habit
DELETE /api/habits/:id         # Delete habit
```

### Logs (Daily Tracking)
```
GET    /api/logs/date/:date    # Get logs for date
GET    /api/logs/habit/:id     # Get logs for habit
POST   /api/logs               # Create/update log
GET    /api/logs/calendar/:month/:year  # Calendar view
```

### Statistics
```
GET /api/stats/user            # User stats
GET /api/stats/achievements    # Achievements
GET /api/stats/streaks         # All streaks
GET /api/stats/weekly          # Weekly stats
GET /api/stats/monthly         # Monthly stats
GET /api/stats/insights        # Smart insights
```

---

## 🧪 Testing the App

### Demo Account
- Email: `demo@example.com`
- Password: `password123`

### Test Workflow
1. Sign up / Login
2. Add 3-4 habits
3. Complete some habits today
4. Check dashboard stats
5. View achievements page
6. Check analytics/stats page

---

## 🛠️ Development

### Backend Development
```bash
cd backend

# Install dev dependencies
npm install

# Run with auto-reload
npm run dev

# Build for production
npm run build

# Start production build
npm start
```

### Frontend Development
```bash
cd frontend

# Run dev server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🚀 Production Deployment

### Backend (Deploy to Railway/Render)
```bash
cd backend

# Build
npm run build

# Set environment variables on hosting platform:
# - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
# - JWT_SECRET (use strong key)
# - PORT (usually 5000)
# - NODE_ENV=production
# - CORS_ORIGIN=your-frontend-url

# Start
npm start
```

### Frontend (Deploy to Vercel/Netlify)
```bash
cd frontend

# Build
npm run build

# Deploy dist folder
# Set VITE_API_URL to your backend URL

# Example for Vercel:
# vercel --prod
```

---

## 📊 Database Schema

### Users Table
```sql
id, email, username, password, avatar_url, level, total_points, rank, bio, created_at, updated_at
```

### Habits Table
```sql
id, user_id, name, description, category, frequency, point_value, color, emoji, is_active, created_at, updated_at
```

### Daily Logs Table
```sql
id, user_id, habit_id, log_date, completed, notes, created_at, updated_at
```

### Streaks Table
```sql
id, user_id, habit_id, current_streak, longest_streak, last_completed_date, created_at, updated_at
```

### Achievements Table
```sql
id, user_id, achievement_type, title, description, icon, points_earned, earned_at
```

---

## 🎮 Gamification System

### Level Calculation
```
Level = floor(total_points / 1000) + 1
Progress to next level = (total_points % 1000) / 1000 * 100%
```

### Achievement Thresholds
- **Getting Started**: First habit completion (+10 pts)
- **7 Day Streak**: 7 consecutive days (+50 pts)
- **30 Day Streak**: 30 consecutive days (+100 pts)
- **100 Day Streak**: 100 consecutive days (+500 pts)

### Streak Tracking
- Streak breaks if a habit is skipped for a day
- Longest streak is recorded forever
- Current streak resets on miss

---

## ⚙️ Configuration

### Environment Variables

**Backend (.env)**
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=habit_tracker
DB_USER=postgres
DB_PASSWORD=your_password
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRY=7d
CORS_ORIGIN=http://localhost:3000
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:5000/api
```

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Make sure PostgreSQL is running
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
net start PostgreSQL
```

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Check CORS_ORIGIN in backend .env matches frontend URL

### Port Already in Use
```bash
# Backend
lsof -i :5000
kill -9 <PID>

# Frontend
lsof -i :3000
kill -9 <PID>
```

### Database Migration Failed
```bash
# Clear and recreate
dropdb habit_tracker
createdb habit_tracker
npm run migrate
```

---

## 📚 Tech Stack

**Backend**
- Node.js + Express.js
- TypeScript
- PostgreSQL
- bcryptjs (password hashing)
- jsonwebtoken (JWT)

**Frontend**
- React 18
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Recharts (data visualization)
- date-fns (date handling)
- Lucide React (icons)
- Axios (HTTP client)

---

## 📄 License

MIT License - feel free to use this project for personal or commercial use.

---

## 🤝 Support

For issues or questions, check the troubleshooting section or review the code comments.

Happy habit tracking! 🎉✨
