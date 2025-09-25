# MovieMate 🎬

A modern, full-stack movie discovery and recommendation application built with React, Go, and The Movie Database (TMDB) API.

## ✨ Features

- **🎭 Movie Discovery**: Browse trending, top-rated, and new release movies
- **🤖 AI Recommendations**: Get personalized movie recommendations using AI
- **💬 AI Chat**: Interactive chatbot for movie suggestions and queries
- **📋 Watchlist**: Save movies and TV shows you want to watch
- **🔍 Advanced Search**: Search movies and TV shows with filters
- **👤 User Authentication**: Secure user registration and login
- **📱 Responsive Design**: Beautiful UI that works on all devices

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **Vite** - Fast build tool and dev server

### Backend
- **Go** - High-performance backend language
- **Gin** - Web framework for Go
- **GORM** - ORM for database operations
- **PostgreSQL** - Primary database
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing

### External APIs
- **The Movie Database (TMDB)** - Movie and TV show data
- **Google Gemini AI** - AI-powered recommendations and chat

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Go** (v1.19 or higher)
- **PostgreSQL** (v12 or higher)
- **TMDB API Key** - Get one at [TMDB](https://www.themoviedb.org/settings/api)


## 🎯 Key Features Explained

### AI-Powered Recommendations
- Uses Google Gemini AI to provide intelligent movie recommendations
- Analyzes user preferences and viewing history
- Suggests movies based on mood, genre, and similar titles

### Interactive Chat
- Real-time chat interface with AI assistant
- Ask questions about movies, get recommendations, or discuss preferences
- Powered by Google Gemini AI for natural conversations

### Watchlist Management
- Save movies and TV shows for later viewing
- Organize your personal collection
- Sync across devices with user authentication

### Advanced Search
- Search by title, genre, year, and more
- Real-time search suggestions
- Filter results by various criteria

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/profile` - Get user profile

### Movie Endpoints
- `GET /api/movies/trending` - Get trending movies
- `GET /api/movies/search` - Search movies
- `GET /api/movies/:id` - Get movie details

### Watchlist Endpoints
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist` - Remove from watchlist

### Chat Endpoints
- `POST /api/chat` - Send message to AI chat

## 📦 Deployment

### Render Deployment (Recommended)

MovieMate is optimized for deployment on [Render](https://render.com), a modern cloud platform.

#### Prerequisites
- Render account (free tier available)
- TMDB API key
- Google Gemini AI API key

#### Quick Deploy to Render

1. **Fork this repository** to your GitHub account

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository

3. **Configure Environment Variables**
   In your Render dashboard, add these environment variables:
   ```env
   # Backend Service
   GEMINI_API_KEY=your-gemini-api-key
   JWT_SECRET=your-super-secret-jwt-key
   
   # Frontend Service  
   VITE_TMDB_API_KEY=your-tmdb-api-key
   VITE_TMDB_READ_ACCESS_TOKEN=your-tmdb-read-access-token
   VITE_API_URL=https://your-backend-service.onrender.com
   ```

4. **Deploy**
   - Render will automatically detect the `render.yaml` configuration
   - It will create 3 services: Backend, Frontend, and PostgreSQL Database
   - Your app will be live at `https://your-frontend-service.onrender.com`

#### Services Created
- **Backend**: Go API server with PostgreSQL database
- **Frontend**: React app served as static files
- **Database**: Managed PostgreSQL instance

#### Manual Deployment (Alternative)
If you prefer manual setup:
1. Create a new Web Service for backend
2. Create a new Static Site for frontend  
3. Create a new PostgreSQL database
4. Configure environment variables manually

### Local Development with Docker

For local development, you can still use Docker:

```bash
# Development mode
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Made with ❤️ by [Hamza Haji]**
