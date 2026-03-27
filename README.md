# Code Arena ⚔️

Code Arena is a premier developer performance dashboard designed for competitive programmers and software engineers. It aggregates real-time data from major coding platforms to help you track your progress, participate in contests, and build your developer identity.

## 🚀 Features

- **Multi-Platform Dashboard**: View your live statistics (Total Solved, Rating, Global Rank) from **LeetCode**, **Codeforces**, and **CodeChef**.
- **Daily Challenges (POTD)**: Never miss a daily problem! Aggregated links to Problems of the Day from all supported platforms.
- **Contest Tracker**: A real-time timeline of upcoming competitive programming contests with direct registration links.
- **Curated Challenges**: Explore a handpicked list of problems categorize by difficulty and tags to sharpen your skills.
- **Hackathon Hub**: Stay updated with the latest hackathons happening in the developer community.
- **Developer Profiles**: Showcase your coding handles, social links, and skills in a premium, glassmorphic UI.

## 🛠️ Tech Stack

- **Frontend**: React.js, TypeScript, Vite, Vanilla CSS.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Styling**: Modern, premium design featuring glassmorphism and rich animations.

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/code-arena.git
cd code-arena
```

### 2. Install Dependencies
Install dependencies for both client and server:
```bash
# In the root directory
npm install
cd client && npm install
cd ../server && npm install
```

### 3. Environment Configuration
Create a `.env` file in the `server` directory and add your credentials (follow `server/.env.example`):
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 4. Run the Application
You can run both the client and server concurrently from the root directory:
```bash
npm run dev
```
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000

## 📂 Project Structure

```text
code_arena/
├── client/           # React Frontend (Vite)
│   ├── src/
│   │   ├── pages/    # Dashboard, Profile, POTD, etc.
│   │   └── components/
├── server/           # Node.js Express Backend
│   ├── models/       # Mongoose Schemas
│   ├── routes/       # API Endpoints
│   └── middleware/   # Auth & Security
└── package.json      # Workspace scripts
```

## 📄 License
This project is licensed under the ISC License.

---
Created with ❤️ by [Akshat](https://github.com/akshat-777)
