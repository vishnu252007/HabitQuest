# 🎮 Habit Tracker - Turn Your Life Into a Game

A full-stack web application for tracking daily habits with **gamification features** to keep you motivated and consistent. Build better habits by earning points, unlocking achievements, and maintaining streaks!

![Habit Tracker](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Stack](https://img.shields.io/badge/Stack-MERN-green)

---

## 🌟 Key Features

### 📊 Habit Tracking
- ✅ Create and manage multiple habits
- 📝 Add daily notes and reflections
- 🎯 Set completion targets
- 📈 Track progress over time
- 🏷️ Organize by categories

### 🎮 Gamification System
- **Points**: Earn points for each completed habit
- **Levels**: Progress through levels (every 1000 points = 1 level)
- **Streaks**: Maintain daily streaks for each habit
- **Achievements**: Unlock badges for milestones
  - 🌱 Getting Started
  - 🔥 7-Day Streak
  - 💪 30-Day Streak  
  - 🏆 100-Day Streak

### 📈 Analytics & Insights
- Weekly completion rates
- Monthly trends
- Best habits (highest completion)
- Best days of the week
- Consistency metrics
- Beautiful charts and graphs

### 👤 User Features
- Secure authentication (JWT)
- Profile management
- Leaderboard tracking
- Password security (bcryptjs)
- Session management

---

## 🎨 Design Philosophy

**Peaceful & Minimal** - The interface is clean and distraction-free, with soft colors and smooth interactions. Focus on the habit, not the interface.

**Responsive** - Works perfectly on desktop, tablet, and mobile devices.

**Intuitive** - Easy to navigate and understand for all users.

---

## 🚀 Tech Stack

### Backend
```
Node.js + Express.js + TypeScript
PostgreSQL | bcryptjs | JWT | Express Validator
```

### Frontend
```
React 18 + TypeScript + Tailwind CSS
Zustand | Recharts | date-fns | Lucide Icons
Axios | React Router | Vite
```

### Database
```
PostgreSQL with indexes for performance
Well-structured schema with proper relationships
Optimized queries for analytics
```

---

## 📱 Screenshots (Features)

### Dashboard
- At a glance: Level, Points, Active Habits, Days Completed
- Today's checklist with completion percentage
- Quick habit overview cards
- Add new habit button

### Daily Checklist
- Beautiful checkbox interface for today's habits
- Show earned points for each completion
- Progress bar showing completion percentage
- Visual feedback with colors and animations

### Statistics Page
- Weekly/Monthly completion charts
- Consistency metrics (7-day & 30-day)
- Insights: Best habit, Best day, Longest streak
- Data visualization with Recharts

### Achievements
- All earned badges displayed
- Badge details (name, description, points)
- Active streaks section
- Motivation indicators

---

## 🎯 Quick Start

### Prerequisites
- Node.js v16+ 
- PostgreSQL v12+
- npm v8+

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd habit-tracker-app

# 2. Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials

# Run database migration
npm run migrate

# Start backend (dev)
npm run dev

# 3. Setup Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev

# 4. Open http://localhost:3000 in your browser
```

See [SETUP.md](./SETUP.md) for detailed setup instructions.

---

## 📚 API Documentation

### Authentication
```
POST /api/auth/signup           Register new user
POST /api/auth/login            Login user
```

### Habits Management
```
GET    /api/habits              Get all habits
POST   /api/habits              Create new habit
PUT    /api/habits/:id          Update habit
DELETE /api/habits/:id          Delete habit
```

### Daily Tracking
```
GET    /api/logs/date/:date     Get logs for specific date
POST   /api/logs                Log habit completion
GET    /api/logs/habit/:id      Get logs for habit
```

### Statistics
```
GET /api/stats/user             User profile & points
GET /api/stats/achievements     User achievements
GET /api/stats/streaks          Current streaks
GET /api/stats/weekly           Weekly statistics
GET /api/stats/monthly          Monthly statistics
GET /api/stats/insights         Smart insights
```

---

## 💾 Database Schema

```sql
Users
├── id (PK)
├── email (unique)
├── username (unique)
├── password (hashed)
├── level
├── total_points
└── ... profile fields

Habits
├── id (PK)
├── user_id (FK)
├── name
├── category
├── frequency
├── point_value
├── emoji
└── ... metadata

Daily_Logs
├── id (PK)
├── habit_id (FK)
├── user_id (FK)
├── log_date
├── completed (boolean)
└── notes

Streaks
├── id (PK)
├── habit_id (FK)
├── current_streak
├── longest_streak
└── last_completed_date

Achievements
├── id (PK)
├── user_id (FK)
├── achievement_type
├── title
├── icon
├── points_earned
└── earned_at
```

---

## 🎮 Gamification Mechanics

### Level System
```
Level = floor(total_points / 1000) + 1
```

### Achievement Tracking
- Achievements unlock automatically when conditions are met
- Bonus points awarded for achievements
- Never duplicate achievements

### Streak Calculation
```
Current Streak = count of consecutive completed days
Best Streak = highest streak ever achieved
```

Streaks reset if a habit is missed for a day.

---

## 🔐 Security Features

- ✅ Password hashing with bcryptjs (salt rounds: 10)
- ✅ JWT authentication with 7-day expiry
- ✅ CORS configuration
- ✅ Input validation & sanitization
- ✅ HTTP-only cookies ready
- ✅ SQL injection prevention (parameterized queries)

---

## 📦 Installation & Deployment

### Local Development
```bash
# See SETUP.md for detailed instructions
npm install       # both backend & frontend
npm run migrate   # setup database
npm run dev       # run both servers
```

### Production
- Backend: Deploy to Railway, Render, or Heroku
- Frontend: Deploy to Vercel, Netlify, or AWS S3
- Database: Use managed PostgreSQL (AWS RDS, Railway, etc.)

See SETUP.md for production deployment details.

---

## 🧪 Testing

### Demo Credentials
```
Email: demo@example.com
Password: password123
```

### Test Workflow
1. Sign up or login
2. Create 3-4 habits
3. Complete habits to earn points
4. Check progress on dashboard
5. View achievements and stats
6. Monitor streaks

---

## 🤝 Contributing

This is a complete, ready-to-use application. Feel free to:
- Add more features
- Improve UI/UX
- Optimize performance
- Add tests

---

## 📝 Features Roadmap

### Phase 1 ✅ (Current)
- Habit creation & tracking
- Daily logging
- Gamification basics
- Analytics

### Phase 2 (Future)
- Mobile app
- Social features (friends, competitions)
- Recurring goals
- Custom notifications
- Dark mode
- Habit templates

### Phase 3 (Future)
- AI habit recommendations
- Integration with health apps
- Advanced analytics
- Export reports
- API for third-party apps

---

## 🐛 Known Issues & Fixes

### Issue: Port Already in Use
```bash
# Find and kill process
lsof -i :5000        # backend
lsof -i :3000        # frontend
kill -9 <PID>
```

### Issue: Database Connection Error
```bash
# Start PostgreSQL
sudo systemctl start postgresql    # Linux
brew services start postgresql     # macOS
```

### Issue: CORS Errors
Update `CORS_ORIGIN` in `.env` to match your frontend URL.

---

## 📊 Performance Optimizations

- Database indexes on frequently queried columns
- Lazy loading of components
- Memoization for expensive calculations
- CSS minification & tree-shaking
- API response pagination (when needed)

---

## 🎓 Learning Resources

### Backend Concepts Used
- REST API design
- Database modeling
- Authentication & authorization
- Data validation
- Error handling

### Frontend Concepts Used
- React hooks & state management
- Component composition
- Routing
- HTTP client patterns
- UI/UX best practices

---

## 📄 License

MIT License - Use freely for personal and commercial projects

---

## 💬 Support & Feedback

- Check SETUP.md for detailed troubleshooting
- Review code comments for implementation details
- Refer to API documentation for integration

---

## 🎉 Celebrate Your Consistency!

> "Motivation is what gets you started. Habit is what keeps you going."
> 
> — Jim Ryun

Start building better habits today with Habit Tracker! 🚀✨

---

**Made with ❤️ for habit builders everywhere**
#   H a b i t Q u e s t  
 