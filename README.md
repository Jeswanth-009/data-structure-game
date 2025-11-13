# 🕵️‍♂️ Detective Agency - DSA Case Solving Game

**Tagline:** "Solve cases. Earn ranks. Rise as the ultimate DSA detective."

A gamified learning platform for Data Structures & Algorithms where players act as detectives solving algorithmic "cases" to earn points and climb the global leaderboard.

## 🎮 Game Overview

Detective Agency is an interactive web game that transforms DSA learning into an engaging detective investigation experience. Players solve timed algorithmic cases, answer questions, and compete on a live leaderboard.

### Key Features

✅ **One-Time Login** - Simple name + roll number authentication (no passwords/OTP)  
✅ **Auto-Saved Progress** - All scores and completed cases stored automatically  
✅ **Interactive Story Mode** - Immersive narration with voice and animations 🎭  
✅ **Voice Narration** - Text-to-speech for story immersion 🔊  
✅ **Timed Cases** - Each case has a time limit with bonus points for speed  
✅ **Mixed Question Types** - MCQ + Text input with smart validation  
✅ **Case-Sensitive Support** - Some questions require exact answers  
✅ **Dynamic Unlocks** - Cases unlock on schedule  
✅ **Live Leaderboard** - Real-time ranking with Supabase Realtime  
✅ **Detective Theme** - Immersive UI styled like a detective agency  
✅ **Responsive Design** - Works on desktop, tablet, and mobile  

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Supabase** | PostgreSQL database + Realtime |
| **Lucide React** | Beautiful icon library |
| **Vercel** | Deployment platform |

---

## 📦 Installation

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Vercel account for deployment (optional)

### Step 1: Clone/Setup Project

```bash
cd "c:\dsa game"
npm install
```

### Step 2: Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the SQL to create tables and sample cases

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Find these values in: **Supabase Dashboard → Settings → API**

### Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗂️ Project Structure

```
c:\dsa game\
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Login page
│   ├── cases/page.tsx        # Cases listing
│   ├── case/[id]/page.tsx    # Individual case page
│   ├── leaderboard/page.tsx  # Global leaderboard
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── lib/
│   ├── supabase.ts          # Supabase client
│   ├── auth.ts              # Auth utilities (localStorage)
│   └── game.ts              # Game logic utilities
├── types/
│   └── game.ts              # TypeScript types
├── supabase/
│   └── schema.sql           # Database schema
├── .env.example             # Environment template
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🎯 How to Play

### 1️⃣ First Visit - Login

- Enter your **name** and **roll number**
- System creates your account automatically
- Progress is saved to Supabase + localStorage

### 2️⃣ View Cases

- See all available cases
- **Unlocked** cases show "INVESTIGATE" button
- **Locked** cases show countdown timer
- **Completed** cases show checkmark + earned score

### 3️⃣ Solve a Case

- Click an unlocked case
- Read the case brief
- Click "START INVESTIGATION"
- Answer multiple-choice questions before time runs out
- Submit to see your score

### 4️⃣ Leaderboard

- View global rankings
- Live updates when anyone scores
- Top 3 displayed on podium
- Your rank highlighted

---

## 🗄️ Database Schema

### `players` Table

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| name | text | Player name |
| number | text | Roll number (unique) |
| score | integer | Total score |
| current_case | text | Current active case |
| completed_cases | text[] | Array of completed case IDs |
| created_at | timestamptz | Account creation time |

### `cases` Table

| Column | Type | Description |
|--------|------|-------------|
| id | text | Case ID (e.g., "case_1") |
| title | text | Case title |
| brief | text | Story/description |
| unlock_time | timestamptz | When case becomes available |
| questions | jsonb | Array of questions |
| max_score | integer | Maximum points possible |
| time_limit | integer | Time limit in seconds |

### Question Format (JSONB)

```json
{
  "q": "Question text?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": 1,  // Index of correct answer (0-based)
  "points": 10
}
```

---

## ➕ Adding New Cases

### Via SQL

```sql
INSERT INTO cases (id, title, brief, unlock_time, questions, max_score, time_limit) VALUES
(
  'case_4',
  'The Hash Table Heist',
  'A criminal has hidden stolen data across multiple hash buckets...',
  NOW() + INTERVAL '7 days',
  '[
    {
      "q": "What is the average time complexity of hash table lookup?",
      "options": ["O(1)", "O(n)", "O(log n)", "O(n²)"],
      "answer": 0,
      "points": 10
    }
  ]',
  50,
  600
);
```

### Question Guidelines

- Keep questions clear and concise
- Use 4 options per question
- Award 10 points per question
- Ensure `answer` index matches correct option
- Time limit: 600 seconds (10 min) is standard

---

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

Vercel will auto-redeploy on every git push.

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start
```

---

## 🎨 Customization

### Colors (tailwind.config.ts)

```typescript
detective: {
  dark: "#1a1a1a",
  charcoal: "#2a2a2a",
  grey: "#3a3a3a",
  amber: "#d4af37",
  "amber-light": "#f0c674",
  red: "#cc6666",
}
```

### Fonts

- **Sans:** Inter (body text)
- **Mono:** System mono (headers, case IDs)

---

## 🔐 Security Notes

- **Authentication:** Custom system using roll number as unique key
- **No passwords:** Simple one-time entry
- **Row Level Security:** Configure in Supabase for production
- **Anon Key:** Safe to expose in client code

### Recommended RLS Policies

```sql
-- Players can only update their own score
CREATE POLICY "Users can update own score"
ON players FOR UPDATE
USING (auth.uid() = id);

-- Anyone can read cases
CREATE POLICY "Cases are public"
ON cases FOR SELECT
TO authenticated, anon
USING (true);
```

---

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### Supabase connection fails
- Check `.env.local` has correct values
- Verify Supabase project is active
- Check network/firewall settings

### Cases not showing
- Verify SQL schema ran successfully
- Check `cases` table in Supabase dashboard
- Ensure `unlock_time` is in the past

### Leaderboard not updating
- Check Supabase Realtime is enabled
- Verify database trigger exists
- Check browser console for errors

---

## 🧠 Future Enhancements

- [ ] Admin dashboard for case management
- [ ] Achievements/badges system
- [ ] Difficulty ratings
- [ ] Hints/clues feature
- [ ] Real-time multiplayer mode
- [ ] Analytics and insights
- [ ] Email notifications (optional)
- [ ] Export progress as PDF

---

## 📄 License

This project is open source and available for educational purposes.

---

## 👥 Contributing

Feel free to submit issues or pull requests to improve the game!

---

## 🎓 Educational Use

Perfect for:
- DSA courses
- Coding bootcamps
- Student competitions
- Self-learning platforms

---

## 📞 Support

For issues or questions:
1. Check this README
2. Review Supabase docs
3. Check Next.js documentation
4. Open an issue on GitHub

---

**Built with ❤️ for DSA learners everywhere**

🕵️‍♂️ **Now go solve some cases, detective!**
