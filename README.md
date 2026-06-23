# LastRep by chrkk

> Know what you did last time. Lift better today.

A full-stack workout tracker that remembers your previous sets, reps, and weights — so you always know what to aim for next session.

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, RPC)
- **Deployment:** Vercel (frontend)

## Project Structure
```
lastrep-by-chrkk/
└── frontend/   # React + Vite app (Supabase client)
```

## Environment Variables
Create `frontend/.env.local` with:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```
