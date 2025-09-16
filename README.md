# 🎓 CourseQuest Lite

A beautiful, full-stack course search and comparison app with AI-assisted querying using Python Flask + MySQL backend and React frontend.

## ✨ Features

- **🔍 Advanced Search**: Filter courses by department, level, delivery mode, fee range, rating, and more
- **⚖️ Course Comparison**: Select multiple courses for side-by-side comparison with beautiful cards
- **🤖 AI-Powered Queries**: Natural language search with rule-based parsing
- **📊 CSV Import**: Upload course data with token protection
- **📱 Responsive Design**: Beautiful, modern UI that works on all devices
- **🚀 Fast Performance**: Debounced search, optimized rendering, and smooth interactions

## 🛠 Tech Stack

- **Backend**: Python Flask + SQLAlchemy + MySQL
- **Frontend**: React + TypeScript + Vite
- **Database**: MySQL 8+
- **AI**: Rule-based natural language parsing
- **Styling**: Modern CSS with gradients and animations

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8+

### 1. Database Setup
```sql
CREATE DATABASE coursequest_lite;
```

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:
```
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/coursequest_lite
PORT=5000
INGEST_TOKEN=dev_ingest_token
```

### 3. Frontend Setup
```bash
cd client
npm install
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 5. Load Sample Data
```bash
# Using PowerShell
$headers = @{ "x-ingest-token" = "dev_ingest_token" }
Invoke-WebRequest -Uri "http://localhost:5000/api/ingest" -Method Post -Headers $headers -InFile "backend\sample-courses.csv" -ContentType "multipart/form-data"
```

### 6. Access the App
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/health

## 📊 Sample Data

The app comes with 34 sample courses across multiple departments:
- **Computer Science**: 8 courses (UG + PG)
- **Data Science**: 2 courses (PG)
- **Artificial Intelligence**: 2 courses (PG)
- **Mechanical**: 3 courses (UG + PG)
- **Electrical**: 3 courses (UG + PG)
- **Economics**: 3 courses (UG + PG)
- **Management**: 3 courses (UG + PG)
- **Mathematics**: 3 courses (UG + PG)
- **Physics**: 2 courses (UG)
- **Chemistry**: 2 courses (UG)
- **Biology**: 3 courses (UG + PG)

## 🎯 How to Use

### Search Courses
1. Use the search bar to find courses by name or department
2. Apply filters for level (UG/PG), delivery mode, fee range, etc.
3. Browse results with pagination
4. Click "Add" to add courses to comparison

### Compare Courses
1. Add courses from search results
2. View selected courses in beautiful comparison cards
3. See all details side-by-side
4. Remove courses you don't want to compare

### Ask AI
Try these natural language queries:
- "Show PG courses under 50,000 INR offered online"
- "UG computer science courses with rating 4.0+"
- "offline mechanical courses"
- "hybrid data science programs"
- "courses under 40000 INR"

## 🔌 API Endpoints

### GET /api/courses
List courses with filters and pagination.

**Query Parameters:**
- `search` - Search by course name or department
- `department` - Filter by department
- `level` - UG or PG
- `delivery_mode` - online, offline, or hybrid
- `min_credits`, `max_credits` - Credit range
- `max_fee` - Maximum fee in INR
- `min_rating` - Minimum rating (0-5)
- `year_offered` - Year filter
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 10)

**Example:**
```
GET /api/courses?level=PG&max_fee=50000&page=1&page_size=5
```

### GET /api/compare
Compare selected courses.

**Query Parameters:**
- `ids` - Comma-separated course IDs

**Example:**
```
GET /api/compare?ids=CS101,CS201,CS301
```

### POST /api/ingest
Upload CSV file to populate database.

**Headers:**
- `x-ingest-token` - Authentication token

**Body:**
- `file` - CSV file (multipart/form-data)

### POST /api/ask
Parse natural language query and return filtered results.

**Body:**
```json
{
  "question": "Show PG courses under 50,000 INR offered online"
}
```

**Response:**
```json
{
  "filters": {
    "level": "PG",
    "max_fee": 50000,
    "delivery_mode": "online"
  },
  "items": [...],
  "message": null
}
```

## 📁 Project Structure

```
coursequest-lite/
├── backend/
│   ├── app.py                 # Flask application
│   ├── db.py                  # Database configuration
│   ├── models/
│   │   └── course.py          # Course model
│   ├── routes/
│   │   ├── courses.py         # Course listing API
│   │   ├── compare.py         # Course comparison API
│   │   ├── ingest.py          # CSV upload API
│   │   └── ask.py             # AI query API
│   ├── tests/
│   │   ├── test_parser.py     # Parser tests
│   │   └── test_endpoints.py  # API tests
│   ├── requirements.txt       # Python dependencies
│   ├── sample-courses.csv     # Sample data (34 courses)
│   └── .env                   # Environment variables
└── client/
    ├── src/
    │   └── App.tsx            # React application
    ├── package.json           # Node dependencies
    └── vite.config.ts         # Vite configuration
```

## 🧪 Testing

Run backend tests:
```bash
cd backend
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pytest
```

## 🎨 UI Features

- **Modern Design**: Beautiful gradients and animations
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Interactive Elements**: Hover effects and smooth transitions
- **Loading States**: Visual feedback during data fetching
- **Error Handling**: Graceful error messages
- **Accessibility**: Proper labels and keyboard navigation

## 🔧 Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Check DATABASE_URL in .env file
- Verify database exists: `SHOW DATABASES;`

### Port Already in Use
- Backend: Change PORT in .env file
- Frontend: Vite will suggest an alternative port

### CSV Upload Fails
- Check x-ingest-token header
- Ensure CSV has all required columns
- Verify file is valid CSV format

### UI Not Displaying Properly
- Check browser console for errors
- Ensure both backend and frontend are running
- Try refreshing the page

## 📝 CSV Format

```csv
course_id,course_name,department,level,delivery_mode,credits,duration_weeks,rating,tuition_fee_inr,year_offered
CS101,Intro to Computer Science,Computer Science,UG,online,4,12,4.5,30000,2025
CS201,Data Structures and Algorithms,Computer Science,UG,offline,3,12,4.2,40000,2025
```

## 🚀 Performance Features

- **Debounced Search**: 300ms delay prevents API spam
- **Optimized Rendering**: Minimal re-renders for smooth UI
- **Efficient Pagination**: Load only needed data
- **Smart Caching**: Reuse data when possible
- **Responsive Design**: Fast loading on all devices

## 📱 Mobile Support

The app is fully responsive and works great on:
- Desktop computers
- Tablets
- Mobile phones
- All screen sizes

## 🎯 Future Enhancements

- User authentication and profiles
- Course recommendations
- Advanced filtering options
- Export functionality
- Real-time notifications
- Course reviews and ratings

## 📄 License

MIT License - feel free to use this project for learning and development!

---

**Happy Course Hunting! 🎓✨**