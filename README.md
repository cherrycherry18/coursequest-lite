CourseQuest Lite

A full-stack course search and comparison app with rule-based natural language querying.

Getting Started (Windows)
- Install Node.js 18+ and PostgreSQL 14+.
- Copy `server/.env.example` to `server/.env` and set `DATABASE_URL` and `INGEST_TOKEN`.

Install
```
cd server && npm i
cd ../client && npm i
```

DB Setup
```
cd ../server
npx prisma generate
npx prisma migrate dev --name init
```

Run
```
# Terminal 1
cd server
npm run dev

# Terminal 2
cd client
npm run dev
```

API
- GET `/api/courses` with filters: `search, department, level (UG|PG), delivery_mode (online|offline|hybrid), min_credits, max_credits, max_fee, min_rating, year_offered, page, page_size`
- GET `/api/compare?ids=ID1,ID2`
- POST `/api/ingest` header `x-ingest-token`, multipart `file`
- POST `/api/ask` `{ "question": "Show PG courses under 50,000 INR offered online" }`

CSV Columns
`course_id, course_name, department, level, delivery_mode, credits, duration_weeks, rating, tuition_fee_inr, year_offered`


