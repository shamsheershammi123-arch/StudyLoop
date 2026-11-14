# StudyLoop: AI Study Planner & Focus Coach

> **The Guilt-Free AI Study Companion**  
> Turn course materials and deadlines into a realistic study plan, focus on one task at a time, and recover smoothly when your schedule slips—without shame or cramming.

---

## 🏆 Hackathon Fit & Themes

- **Primary Theme:** **Agentic AI & Intelligent Systems**
  - **StudyLoop Agent Architecture**: An ensemble of server-side Gemini 3.8 Flash agents that parse unstructured academic materials, synthesize conflict-free study schedules, evaluate schedule disruptions, and propose realistic rebalanced schedules with transparent rationale.
- **Supporting Themes:** 
  - **Personalized AI Experiences**: Pacing, session lengths, break intervals, and study hours are uniquely adapted to each student's availability and post-session focus patterns.
  - **Smart Automation**: Automated extraction of tasks, dates, exam weights, and effort hours directly from syllabi or assignment sheets with source citations.

---

## 🔄 The Product Core Loop

```
       ┌───────────────────────────────┐
       │             PLAN              │
       │  Syllabus AI Extraction &     │
       │  Availability-based Pacing    │
       └──────────────┬────────────────┘
                      │
                      ▼
       ┌───────────────────────────────┐
       │             FOCUS             │
       │  Distraction-Free Environment │
       │  Pomodoro / Stopwatch / Audio │
       └──────────────┬────────────────┘
                      │
                      ▼
       ┌───────────────────────────────┐
       │            REFLECT            │
       │  15-Second Focus Check-in     │
       │  (Energy & Friction Factors)  │
       └──────────────┬────────────────┘
                      │
                      ▼
       ┌───────────────────────────────┐
       │       ADJUST & RECOVER        │
       │  Guilt-Free Plan Recovery &   │
       │  Personalized Pattern Coach   │
       └───────────────────────────────┘
```

---

## ✨ Key Differentiator: Plan Recovery

Traditional study planners punish students: if you miss a scheduled session, the app flashes red warnings, breaks your "streak", or creates an overwhelming backlog of overdue alerts that leads to shame and abandonment.

**StudyLoop solves this with Plan Recovery:**
- **Zero Guilt & Non-Punitive:** Missing a session is treated as normal life variance.
- **Intelligent Rebalance:** When a session is missed, skipped, or stopped early, StudyLoop's recovery engine analyzes upcoming available study windows, deadline proximity, and daily workload caps.
- **Transparent Before & After Diff:** Shows exactly which sessions are moving, when, and *why* ("Moved to Friday 5 PM where you have a 2-hour open window; zero deadlines compromised").
- **Student Agency:** Proposed revisions are never forced silently—students review the diff and confirm with one click.

---

## 🚀 Features Walkthrough

### 1. Onboarding & Profile
- Student enters name, timezone, weekly availability grid (Monday–Sunday hours), preferred focus session duration (25m, 45m, 60m), and break lengths (5m, 10m, 15m).
- **Educational Context:** Every requested field explicitly explains *why* it helps create a more realistic schedule (e.g., preventing cognitive fatigue, avoiding bookings during class or sleep).
- Completely editable anytime from the Profile & Settings menu.

### 2. Study Materials & Multimodal AI Extraction
- Upload syllabi, assignment sheets, or exam schedules as PDF, images, or plain text.
- **Gemini 3.8 Flash Multimodal Agent**:
  - Identifies course/subject, upcoming tasks/exams, due dates, estimated effort hours, required materials, and submission instructions.
  - Captures exact **source quotes** and page references.
  - Marks uncertain or inferred items with a **"Needs Review"** tag.
- **Interactive Review Table**: Review, modify dates, reject false candidates, or add manual items before committing to your schedule.
- **Instant 1-Click Prototype Test Materials**: Built-in realistic sample materials (CS 201 Data Structures, Chemistry 101, Cognitive Psychology) allow immediate testing with one click.
- **Resilient Fallback**: If offline or if the Gemini API key is not configured, a deterministic heuristic parser extracts tasks so the app remains 100% usable.

### 3. Task List & Conflict-Free Study Plan
- Comprehensive task view with course tags, due dates, effort estimates, priority badges, and subtasks.
- **Deterministic Scheduler**:
  - Slices large assignments into manageable focus sessions.
  - Places sessions strictly within the student's declared study windows.
  - Prevents overlapping session conflicts.
  - Enforces spaced repetition (caps daily sessions per subject to prevent cramming).
  - Supplies an explicit **priority rationale** for every scheduled block.

### 4. Honest In-App Focus Room
- **Timer Modes**: Classic Pomodoro (25m), Custom Duration (15–120m), or Stopwatch.
- **Controls**: Start, Pause, Resume, Complete, and End Early & Recover.
- **Web Audio Chimes**: Gentle synthesized singing bowl and bell chime upon session and break completions.
- **Synthesized Soundscapes**: Built-in Web Audio pink noise, gentle rain, and cafe hum to block background chatter without external audio downloads.
- **Session State Persistence**: Timer state persists in `localStorage` across page refreshes and browser tabs.

### 5. Focus Pattern Coach
- Post-session 15-second reflection check-in: rate energy level (1–5) and select primary factors:
  - *Deep Flow*, *Tiredness / Low Energy*, *Notifications / Phone*, *Task Felt Too Large*, *Unsure What To Do Next*, *Unexpected Interruption*.
- Pattern analysis detects recurring friction points and provides proactive, actionable recommendations (e.g. shortening session length to 25m or breaking down large tasks).
- Students can skip check-ins or delete their coach history at any time.

### 6. Dashboard & Insights
- Today's study blocks with prominent **"Start Next Session"** CTA.
- Upcoming deadlines alert card (next 7 days).
- Weekly focus time hours and completed session counts.
- Progress by course completion bars.
- Plan recovery alert banner whenever an uncompleted session's scheduled time has elapsed.

---

## 🛡️ Platform Limitations & Honest Architecture Disclosure

> **Transparency Note regarding Third-Party App Blocking:**  
> A standard web application running in a desktop or mobile browser sandbox **cannot reliably or legally block, freeze, or intercept other applications** (such as Instagram, WhatsApp, Discord, or Steam) on a student's operating system. Any web product claiming to do so is either using deceptive marketing or spoofing screenshots.
>
> StudyLoop takes an honest, empowering approach:
> 1. We provide an immersive **Distraction-Free Fullscreen View**.
> 2. We synthesize calming **ambient audio soundscapes** (Rain, Pink Noise, Cafe) directly via the Web Audio API.
> 3. We provide structured time-boxing and intention-setting.
> 4. If you get distracted and end early, StudyLoop's **Plan Recovery** steps in without shame or broken-streak guilt to rebalance your calendar.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router, React 18/19, TypeScript)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with custom calm palette (emerald/teal/slate)
- **AI Engine:** [Google Gemini 3.8 Flash](https://ai.google.dev/) via `@google/genai` SDK
- **Data Validation:** [Zod](https://zod.dev/) for server-side response schema enforcement
- **Icons:** [Lucide React](https://lucide.react)
- **Audio:** Native Browser Web Audio API (zero external mp3 assets)
- **Celebration:** `canvas-confetti`
- **Database & Persistence:**
  - **Local Turnkey Store:** `src/lib/store.ts` with reactive event dispatching and browser persistence.
  - **Production Supabase Integration:** Provided in `src/lib/supabase.ts` with full Postgres DDL and Row-Level Security in `supabase/schema.sql`.

---

## ⚙️ Setup & Local Development

### Prerequisites
- Node.js >= 18 (Node.js 20 or 24 recommended)
- npm or pnpm

### 1. Clone & Install
```bash
git clone <repository-url>
cd Project_1
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Google Gemini API Key (obtain from https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# (Optional) Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

> **Note:** If `GEMINI_API_KEY` is omitted, StudyLoop's deterministic heuristic engine automatically provides realistic extractions and scheduling so the prototype remains 100% testable out-of-the-box!

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## 🗄️ Database & Supabase Configuration

If you wish to deploy with a cloud PostgreSQL database:

1. Create a free project at [Supabase](https://supabase.com/).
2. Navigate to the **SQL Editor** in your Supabase dashboard.
3. Paste and run the contents of [`supabase/schema.sql`](file:///c:/Users/shams/OneDrive/Desktop/Project_1/supabase/schema.sql).
4. This will create:
   - `profiles` (with user study preferences and weekly availability)
   - `courses`
   - `tasks` (with subtasks, due dates, source quotes)
   - `study_sessions` (scheduled blocks with recovery flags)
   - `focus_logs`
   - `focus_reflections`
   - `uploaded_materials`
   - Row Level Security (RLS) policies scoping access to `auth.uid() = user_id`.
5. Copy your **Project URL** and **Anon Key** into `.env.local`.

---

## ☁️ Cloud Deployment

StudyLoop is configured for one-click cloud deployment on modern hosting providers:

### Vercel
1. Push your repository to GitHub / GitLab.
2. Import the repository in [Vercel](https://vercel.com).
3. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL` (optional)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional)
4. Click **Deploy**.

### Google Cloud Run / Docker
1. Build container: `gcloud builds submit --tag gcr.io/PROJECT_ID/studyloop`
2. Deploy service: `gcloud run deploy studyloop --image gcr.io/PROJECT_ID/studyloop --platform managed --set-env-vars GEMINI_API_KEY=xxx`

---

## 🔒 Privacy & Data Ownership

- **Server-Side API Key:** The Gemini API key resides solely on the server in `process.env.GEMINI_API_KEY` and is never bundled in client code.
- **Isolated User Storage:** Study documents and personal check-ins are private to the student and never transmitted to third-party ad networks.
- **1-Click Data Controls:** In **Settings & Privacy**, students can export their entire history as a JSON file, reset to clean prototype sample data, or permanently delete all local records.

