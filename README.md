# Code Arena ⚔️

Code Arena is a premier developer performance dashboard designed for competitive programmers and software engineers. It aggregates real-time data from major coding platforms to help you track your progress, participate in contests, and build your developer identity across a global leaderboard.

## 🚀 Features

- **Multi-Platform Dashboard**: View your live statistics (Total Solved, Rating, Global Rank) from **LeetCode**, **Codeforces**, and **CodeChef**.
- **Global Ranking System**: Compete on a global leaderboard with a normalized scoring formula: `(LC * 1.0) + (CF * 1.2) + (CC * 0.9) + (TotalSolved * 0.5)`.
- **Hackathon Hub**: Stay updated with the latest hackathons from **Devpost**, **Devfolio**, and **Unstop**, filtered by registration deadlines.
- **Contest Tracker**: A real-time timeline of upcoming competitive programming contests from Codeforces, CodeChef, and LeetCode.
- **Daily Challenges (POTD)**: Never miss a daily problem with aggregated links to Problems of the Day.
- **Developer Profiles**: Showcase your coding handles, social links, and skills in a premium, glassmorphic UI.

## ⚡ Performance & Automation

- **24h Dashboard Cache**: Platform statistics (LeetCode/CF/CC) are cached for 24 hours per user to ensure instant loads and reduce API overhead.
- **7-Day Automatic Sync**: Contests and Hackathons are automatically refreshed every 7 days to keep the platform autonomous.
- **Manual Refresh**: Users can force a stats update anytime via the "Refresh Stats" button on the dashboard.

## 🛠️ Tech Stack

- **Frontend**: React.js, TypeScript, Vite, Vanilla CSS.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Styling**: Premium design featuring glassmorphism, glowing micro-animations, and responsive layouts.

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/akshat-777/code-arena-hub.git
cd code-arena
```

### 2. Install Dependencies
```bash
# Install all dependencies (Workspace)
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 4. Run the Application
```bash
npm start # Starts both client and server concurrently
```
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

## 📂 Project Structure

```text
code_arena/
├── client/           # React Frontend (Vite)
│   ├── src/
│   │   ├── pages/    # Dashboard, Rankings, Hackathons, Contests, POTD, etc.
│   │   └── components/
├── server/           # Node.js Express Backend
│   ├── models/       # Mongoose Schemas (User, Contest, Hackathon, Metadata)
│   ├── routes/       # API Endpoints
│   └── middleware/   # Auth & Security
└── package.json      # Workspace scripts
```

## 📄 License
This project is licensed under the ISC License.

---
Created with ❤️ by [Akshat](https://github.com/akshat-777)
