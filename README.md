# FigFlix - Movie Web Application

A comprehensive movie streaming platform built with **Django**, **Tailwind CSS**, and **vanilla JavaScript**, featuring TMDb API integration and AI-powered movie recommendations.

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![Django](https://img.shields.io/badge/Django-4.2-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### User Roles
- **Admin**: Upload movies, manage content, categorize by genre, access admin dashboard
- **User**: Register/login, set movie preferences, browse/search movies, rate & review, get AI recommendations

### Core Functionality
- 🎬 **Movie Management**: Admin can upload movies with posters, trailers, and metadata
- 🔍 **Smart Search**: Search movies by title, actor, director, or genre
- ⭐ **Ratings & Reviews**: Rate movies (1-5 stars) and leave detailed reviews
- 📊 **TMDb Integration**: Fetch movie data, posters, trailers, and genres from The Movie Database
- 🤖 **AI Recommendation Bot**: Chat-style widget that suggests movies based on user preferences and watch history
- 📺 **Watch History**: Track watched movies for personalized recommendations
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS

### Technology Stack
- **Backend**: Django 4.2, Django REST Framework
- **Frontend**: Tailwind CSS (CDN), Vanilla JavaScript
- **API Integration**: TMDb API
- **Database**: SQLite (development) / PostgreSQL (production-ready)
- **Authentication**: Django Authentication + JWT tokens
- **Dependency Management**: Poetry

---

## 📋 Table of Contents

- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Features Breakdown](#-features-breakdown)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🚀 Installation

### Prerequisites
- Python 3.10 or higher
- Poetry (for dependency management)
- TMDb API Key (free from [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api))

### Step 1: Clone the Repository
```bash
cd FigFlix
```

### Step 2: Install Dependencies with Poetry
```bash
# Install Poetry if you haven't already
curl -sSL https://install.python-poetry.org | python3 -

# Install project dependencies
poetry install

# Activate virtual environment
poetry shell
```

### Step 3: Set Up Environment Variables
Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```env
# Django Settings
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# TMDb API Configuration
TMDB_API_KEY=your-tmdb-api-key-here
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
```

**Get Your TMDb API Key:**
1. Sign up at [https://www.themoviedb.org/](https://www.themoviedb.org/)
2. Go to Settings → API
3. Request an API key (free for non-commercial use)
4. Copy your API key to the `.env` file

### Step 4: Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 5: Create a Superuser (Admin)
```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin account.

### Step 6: Sync Genres from TMDb (Optional but Recommended)
Start the development server first, then run:

```bash
# In another terminal, with virtual environment activated
curl -X POST http://localhost:8000/api/movies/genres/sync/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Or sync genres via Django shell:
```python
python manage.py shell

from movies.tmdb_service import tmdb_service
from movies.models import Genre

genres = tmdb_service.get_genres()
for genre_data in genres:
    Genre.objects.get_or_create(
        tmdb_id=genre_data['id'],
        defaults={'name': genre_data['name']}
    )
```

### Step 7: Collect Static Files (for Production)
```bash
python manage.py collectstatic --noinput
```

---

## ⚙️ Configuration

### TMDb API Endpoints Used

The application uses the following TMDb API endpoints:

| Endpoint | Purpose |
|----------|---------|
| `/search/movie` | Search movies by title |
| `/movie/popular` | Get popular movies |
| `/movie/top_rated` | Get top-rated movies |
| `/movie/{id}` | Get movie details |
| `/movie/{id}/videos` | Get movie trailers |
| `/movie/{id}/credits` | Get cast and crew |
| `/genre/movie/list` | Get genre list |
| `/discover/movie` | Discover movies with filters |

**Image URLs:**
- Poster: `https://image.tmdb.org/t/p/w500/{poster_path}`
- Backdrop: `https://image.tmdb.org/t/p/w500/{backdrop_path}`

---

## 🏃 Running the Application

### Development Server
```bash
python manage.py runserver
```

The application will be available at:
- **Frontend**: [http://localhost:8000](http://localhost:8000)
- **Admin Panel**: [http://localhost:8000/admin](http://localhost:8000/admin)
- **API Root**: [http://localhost:8000/api](http://localhost:8000/api)

### Default URLs
- Login: `/login/`
- Register: `/register/`
- Dashboard: `/dashboard/`
- Browse Movies: `/movies/`
- Admin Upload: `/admin/upload/`

---

## 📚 API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/register/
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepass123",
  "password_confirm": "securepass123",
  "preferences": {
    "favorite_genres": ["Action", "Thriller"],
    "favorite_actors": ["Tom Hanks", "Meryl Streep"],
    "preferred_languages": ["English"],
    "min_rating": 7.0
  }
}
```

#### Login (JWT)
```http
POST /api/login/
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepass123"
}

Response:
{
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token"
}
```

### Movie Endpoints

#### Get Movies (Local Collection)
```http
GET /api/movies/?genre=Action&search=inception&page=1
```

#### Search TMDb
```http
GET /api/movies/tmdb/search/?q=Inception&page=1
```

#### Get Popular Movies from TMDb
```http
GET /api/movies/tmdb/popular/?page=1
```

#### Import Movie from TMDb
```http
POST /api/movies/tmdb/{tmdb_id}/import/
Authorization: Bearer {access_token}
```

### Review Endpoints

#### Create/Update Review
```http
POST /api/reviews/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "movie": 1,
  "rating": 5,
  "review_text": "Amazing movie!"
}
```

#### Get Movie Reviews
```http
GET /api/reviews/movie/{movie_id}/
```

### Recommendation Endpoints

#### Get Personalized Recommendations
```http
GET /api/recommendations/?limit=10
Authorization: Bearer {access_token}
```

#### Get Similar Movies
```http
GET /api/recommendations/similar/{movie_id}/?limit=5
```

#### Chat with AI Bot
```http
POST /api/recommendations/chat/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "message": "Recommend me some action movies"
}

Response:
{
  "user_message": {...},
  "bot_response": {
    "message": "Based on your preferences, I recommend: ..."
  }
}
```

---

## 📁 Project Structure

```
FigFlix/
├── figflix/                 # Main project settings
│   ├── settings.py         # Django settings
│   ├── urls.py             # Root URL configuration
│   └── wsgi.py
│
├── accounts/               # User authentication & profiles
│   ├── models.py          # User, UserPreference models
│   ├── views.py           # Login, register, dashboard views
│   ├── api_views.py       # API endpoints for auth
│   ├── serializers.py     # DRF serializers
│   └── urls.py
│
├── movies/                 # Movie management
│   ├── models.py          # Movie, Genre, WatchHistory models
│   ├── views.py           # Movie list, detail views
│   ├── api_views.py       # Movie CRUD, TMDb integration APIs
│   ├── tmdb_service.py    # TMDb API service layer
│   ├── serializers.py
│   └── urls.py
│
├── reviews/                # Ratings & reviews
│   ├── models.py          # Review model
│   ├── api_views.py       # Review CRUD APIs
│   ├── serializers.py
│   └── urls.py
│
├── recommendations/        # AI recommendation engine
│   ├── models.py          # ChatMessage model
│   ├── api_views.py       # Recommendation & chat APIs
│   ├── recommendation_engine.py  # AI logic
│   ├── serializers.py
│   └── urls.py
│
├── templates/              # HTML templates
│   ├── base.html          # Base template with Tailwind
│   ├── accounts/          # Auth templates
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── dashboard.html
│   │   └── profile.html
│   └── movies/            # Movie templates
│       ├── movie_list.html
│       ├── movie_detail.html
│       └── admin_upload.html
│
├── static/                 # Static files
│   └── js/                # Vanilla JavaScript
│       ├── api.js         # API client utility
│       ├── register.js
│       ├── dashboard.js
│       ├── movie_list.js
│       ├── movie_detail.js
│       ├── profile.js
│       └── admin_upload.js
│
├── media/                  # Uploaded files (posters, etc.)
├── manage.py
├── pyproject.toml         # Poetry dependencies
├── .env.example           # Environment variables template
└── README.md
```

---

## 🎯 Features Breakdown

### 1. User Authentication
- **Registration**: Users can register with username, email, password, and optional movie preferences
- **Login**: Session-based + JWT token authentication
- **Role-based Access**: Admin vs. User roles with different permissions
- **User Preferences**: Store favorite genres, actors, languages for personalized recommendations

### 2. Movie Management
- **Admin Upload**: Admins can manually upload movies with:
  - Title, description, release year, runtime
  - Poster image upload
  - Trailer URL (YouTube)
  - Genre categorization
  - Cast and director information

- **TMDb Import**: Admins can search TMDb and import movies directly to the local database

### 3. Movie Discovery
- **Browse**: View all movies in a responsive grid
- **Search**: Real-time search by title, actor, or director
- **Filter**: Filter by genre, year, rating
- **Sort**: Sort by popularity, rating, or recently added
- **TMDb Integration**: Browse popular and top-rated movies from TMDb

### 4. Reviews & Ratings
- **Star Rating**: Rate movies from 1-5 stars
- **Review Text**: Leave detailed reviews
- **Average Rating**: Display average rating from all user reviews
- **Edit/Delete**: Users can update or delete their own reviews

### 5. AI Recommendation System
- **Personalized Recommendations**: Based on:
  - User's favorite genres (from preferences)
  - Watch history
  - Highly rated movies by the user

- **Chatbot Interface**: Interactive chat widget that:
  - Responds to movie requests ("recommend action movies")
  - Understands mood-based queries ("scary movies")
  - Provides movie suggestions with ratings

- **Similar Movies**: Shows related movies on detail pages

### 6. Watch History
- Tracks movies users have watched
- Used for personalized recommendations
- Displayed on dashboard

---

## 🌐 Deployment

### Production Checklist

1. **Update Settings**:
   ```python
   # figflix/settings.py
   DEBUG = False
   ALLOWED_HOSTS = ['yourdomain.com', 'www.yourdomain.com']
   ```

2. **Use PostgreSQL** (recommended for production):
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'figflix_db',
           'USER': 'your_db_user',
           'PASSWORD': 'your_db_password',
           'HOST': 'localhost',
           'PORT': '5432',
       }
   }
   ```

3. **Collect Static Files**:
   ```bash
   python manage.py collectstatic
   ```

4. **Set Up Web Server**: Use Gunicorn + Nginx
   ```bash
   pip install gunicorn
   gunicorn figflix.wsgi:application --bind 0.0.0.0:8000
   ```

5. **Environment Variables**: Never commit `.env` to version control

### Deployment Platforms
- **Heroku**: Use `Procfile` and configure `DATABASE_URL`
- **Railway**: Auto-detects Django projects
- **DigitalOcean**: Deploy on a VPS with Nginx + Gunicorn
- **AWS/GCP**: Use managed services (RDS for database, S3 for media files)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is open-source and available under the MIT License.

---

## 🙏 Acknowledgments

- **TMDb**: Movie data provided by [The Movie Database (TMDb)](https://www.themoviedb.org/)
- **Tailwind CSS**: Styling framework
- **Django**: Web framework
- **Django REST Framework**: API development

---

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Happy Coding! 🎬🍿**