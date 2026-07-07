# LastRep by chrkk

> Know what you did last time. Lift better today.

A full-stack workout tracker that remembers your previous sets, reps, and weights — so you always know what to aim for next session.

## Tech Stack
- **Frontend:** React 18 + Vite + Tailwind CSS v4
- **State/Data:** Dexie (IndexedDB) for local-first workout storage, Zustand for auth state
- **Backend:** Supabase (PostgreSQL, Auth, RPC)
- **Deployment:** Vercel for the frontend

## Current Architecture
- The app is local-first and works offline for workout creation, logging, and history.
- Supabase handles authentication and cloud sync.
- The repository no longer contains a custom backend server.

## Project Structure
```
lastrep-by-chrkk/
└── frontend/   # React + Vite app (Supabase client + Dexie)
```

Built by Christian Jake (@chrkk) — [github.com/chrkk](https://github.com/chrkk)

This repository is publicly visible for portfolio purposes.
See LICENSE for usage terms.
