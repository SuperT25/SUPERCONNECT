# SuperT — Local Services App

Connect customers with trusted local service providers across Nigeria.

## Stack
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- Database: MongoDB

## Setup

### Backend
```bash
cd backend
cp .env.example .env   # fill in your MONGO_URI and JWT_SECRET
npm install
npm run dev            # runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev            # runs on http://localhost:5173
```

## Features
- Browse service providers by category (Plumber, Electrician, Mechanic, Cleaner, etc.)
- Filter by Nigerian state
- Customer & Provider registration/login
- Book a service with date, time, and address
- Provider dashboard: accept/decline/complete bookings
- Customer dashboard: track bookings, leave reviews
- Star ratings system
