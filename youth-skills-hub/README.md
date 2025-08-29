# Youth Skills Development and Mentorship Hub

A full-stack web application designed to address South Africa's youth unemployment crisis by connecting young users (aged 15–35) to free online courses, virtual mentorship from professionals, and peer study groups, focusing on skills like digital literacy, coding, and renewable energy tech.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- PostgreSQL (or SQLite for development)
- Git

### 1. Clone and Setup
```bash
git clone <repository-url>
cd youth-skills-hub
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
```

### 3. Populate Test Data
```bash
# Create comprehensive test data (200 users, 150 courses, etc.)
python populate_db.py
```

### 4. Create Admin User
```bash
python manage.py createsuperuser --username admin --email admin@youthskills.com --noinput
python manage.py shell -c "from hub.models import User; user = User.objects.get(username='admin'); user.role = 'superadmin'; user.set_password('admin123'); user.save()"
```

### 5. Start Backend Server
```bash
python manage.py runserver 8000
```

### 6. Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm run dev
```

### 7. Access the Application
- **Frontend:** http://localhost:6002/
- **Backend API:** http://127.0.0.1:8000/
- **Admin Panel:** Login with `admin` / `admin123`

## 📊 Test Data Overview

The `populate_db.py` script creates comprehensive test data including:

### Users (200 total)
- **80% Learners** - Regular users taking courses
- **20% Mentors** - Experienced users providing mentorship
- Diverse backgrounds, skills, and locations across South Africa

### Courses (150 total)
- **Coding:** Python, JavaScript, React, ML, Cybersecurity
- **Digital Literacy:** Microsoft Office, Online Safety, Social Media
- **Renewable Energy:** Solar, Wind, Green Building, EV Technology
- Multiple skill levels: Beginner, Intermediate, Advanced

### Platform Features
- **Enrollments:** Users enrolled in 2-8 courses each
- **Mentorships:** 100 active mentorship relationships
- **Study Groups:** 50 groups with discussions and members
- **Portfolios:** 80 user portfolios with projects
- **Badges:** 10 achievement badges with criteria
- **Notifications:** In-app messaging system
- **Events:** 30 community events and webinars

### Sample Admin Credentials
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** `superadmin` (full platform access)

## Features

- **User Authentication**: Sign-up/login with email/username/password or social login (Google OAuth), 2FA support.
- **Course Discovery and Enrollment**: Browse free courses from platforms like Coursera, edX with progress tracking.
- **Free Online Courses Integration**: Access thousands of free courses from Coursera, edX, and Khan Academy with filtering and search capabilities.
- **Admin Content Management**: Comprehensive admin panel for managing courses, users, and platform analytics.
- **Mentorship Matching**: Semantic matching using TF-IDF and cosine similarity for mentor-learner pairing.
- **Peer Study Groups**: Create/join study groups with discussion forums and video calls.
- **Portfolio Building**: Users create portfolios with verification by admins.
- **Gamification**: Points and badges system with leaderboard.
- **Dashboards**: Learner, Mentor, Public, and Admin dashboards with analytics.
- **Notifications**: Email, SMS, and push notifications.
- **AI Integration**: ML-based course recommendations and mentor matching.
- **Multilingual Support**: English, Zulu, Afrikaans.
- **Accessibility**: WCAG 2.1 AA compliance.
- **Offline Capabilities**: PWA with service workers.
- **Community Features**: Success stories and virtual events.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, React Router, Redux Toolkit, Axios, React i18next, Chart.js, Simple Peer, Workbox
- **Backend**: Django 4.2, Django REST Framework, PostgreSQL, Celery, Redis, scikit-learn, Pillow, SendGrid, Twilio
- **Deployment**: Docker, Nginx, Gunicorn

## Installation

### Prerequisites

- Node.js 18+
- Python 3.8+
- PostgreSQL
- Redis
- Docker (optional)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your values.

5. Run migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

6. **Populate with test data:**
   ```bash
   python populate_db.py
   ```

7. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

8. Run the server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Register a new account or login with existing credentials.
2. Browse and enroll in courses.
3. Request mentorship or join study groups.
4. Build your portfolio and earn badges.
5. Participate in community events.

### Test Data Exploration

After running `populate_db.py`, explore the platform with:

- **200 diverse users** with different roles and backgrounds
- **150 courses** across coding, digital literacy, and renewable energy
- **Active mentorship relationships** between learners and mentors
- **Study groups** with discussions and collaborative learning
- **User portfolios** showcasing projects and achievements
- **Gamification system** with badges and points
- **Community events** and notifications system

## Admin Features

### Admin Panel Access
- Admin users can access the comprehensive admin panel through the main application
- Login with admin credentials to access full platform management
- **Default Admin:** `admin` / `admin123` (created via test data setup)

### Enhanced Admin Dashboard
- **Real-time Statistics:** Total users, courses, enrollments, and study groups
- **Quick Actions:** Direct access to create courses and send notifications
- **Platform Analytics:** Courses by category, user growth metrics
- **System Overview:** Complete platform health and performance data

### Course Management
- **Create New Courses:** Full course creation with images, categories, and external URLs
- **Edit Existing Courses:** Update course details, images, and metadata
- **Bulk Operations:** 
  - Select multiple courses for batch actions
  - Activate/deactivate multiple courses at once
  - Delete multiple courses simultaneously
  - Select all/none functionality
- **Course Analytics:** View enrollment statistics and course performance
- **Status Management:** Activate or deactivate courses instantly

### User Management
- **Role Management:** Update user roles (Learner, Mentor, Admin, Superadmin)
- **User Overview:** View all users with profiles, points, and activity
- **Bulk User Operations:** Manage multiple users simultaneously
- **User Analytics:** Monitor user engagement and platform activity

### Notification System
- **Send Notifications:** Create and send notifications to user groups
- **Target Groups:** Send to all users, learners, mentors, or admins
- **Notification History:** Track sent notifications and responses
- **Real-time Delivery:** Instant notification delivery system

### Platform Analytics
- **Comprehensive Metrics:** User growth, course popularity, engagement rates
- **Category Breakdown:** Courses by category and skill level distribution
- **Performance Monitoring:** Platform usage statistics and trends
- **Export Capabilities:** Data export for further analysis

### Advanced Features
- **Real-time Updates:** Live data refresh after all operations
- **Responsive Design:** Full mobile and tablet support
- **Error Handling:** Comprehensive error management with user feedback
- **Security:** Role-based access control and secure API endpoints

## Free Courses Integration

### External Course Providers
The platform integrates courses from:
- **Coursera**: University-level courses from top institutions
- **edX**: Courses from universities like MIT, Harvard, and Berkeley
- **Khan Academy**: Free courses on various subjects including math, science, and humanities

### Features
- Browse thousands of free courses
- Filter by provider, category, skill level
- Search courses by title or description
- Direct enrollment links to external platforms
- Course ratings and enrollment statistics

### API Endpoints
- `GET /api/free-courses/` - Fetch free courses with filtering options
- Query parameters: `provider`, `category`, `skill_level`, `search`

## API Documentation

The API is documented using DRF schema. Access it at `/api/schema/` when the server is running.

### Key Endpoints
- `GET /api/free-courses/` - Fetch free courses with filtering
- `POST /api/courses/` - Create new courses (admin only)
- `GET /api/users/` - User management
- `POST /api/notifications/` - Send notifications (admin only)
- `GET /api/public-stats/` - Platform statistics

## Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Find process using port 8000
netstat -ano | findstr :8000
# Kill the process (replace PID)
taskkill /PID <PID> /F
```

**Database Connection Issues:**
```bash
# Reset database
python manage.py flush
python populate_db.py
```

**Frontend Build Issues:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Permission Errors:**
- Ensure you're running commands in the correct directory
- Check that virtual environment is activated
- Verify admin credentials are correct

### Getting Help
- Check the terminal output for detailed error messages
- Verify all prerequisites are installed
- Ensure ports 8000 (backend) and 6002 (frontend) are available

## Deployment

Use the provided Docker setup for production deployment.

1. Build and run with Docker Compose:
   ```bash
   docker-compose up --build
   ```

### Development vs Production

**Development Setup:**
- Uses SQLite database (no additional setup required)
- Includes test data population script
- Hot reload enabled for frontend
- Debug mode enabled

**Production Setup:**
- PostgreSQL database recommended
- Redis for caching and background tasks
- Environment variables properly configured
- Static files served via web server

### Environment Configuration

Create a `.env` file in the backend directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
REDIS_URL=redis://localhost:6379
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Make your changes.
4. Run tests and ensure everything works.
5. Commit your changes (`git commit -m 'Add amazing feature'`).
6. Push to the branch (`git push origin feature/amazing-feature`).
7. Open a Pull Request.

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint configuration for JavaScript/React
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure responsive design for all new components

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built to address South Africa's youth unemployment crisis
- Inspired by the need for accessible education and mentorship
- Thanks to all contributors and the open-source community
- Special thanks to platforms providing free educational content

## Contact

For questions or support, please contact the development team.

---

**Happy Learning! 🎓**

*Empowering South Africa's youth through education, mentorship, and community.*
