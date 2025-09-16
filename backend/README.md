Backend (Flask + MySQL)

Setup
1) Install Python 3.10+ and MySQL 8.
2) Create DB: coursequest_lite
3) Create .env in backend folder:
   DATABASE_URL=mysql+pymysql://root:password@localhost:3306/coursequest_lite
   PORT=5000
   INGEST_TOKEN=dev_ingest_token
4) Create venv and install deps:
   python -m venv .venv
   .\.venv\Scripts\activate
   pip install -r requirements.txt
5) Run server:
   python app.py

CSV Ingestion
POST /api/ingest with header x-ingest-token and form-data file.

APIs
- GET /api/courses (filters + pagination)
- GET /api/compare?ids=...
- POST /api/ask { "question": "..." }

Tests
   pytest



