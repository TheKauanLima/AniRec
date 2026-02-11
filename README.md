# Anime Recommendation Website

A full-stack web application that recommends anime using the Jikan.moe API.

## Tech Stack

- **Frontend**: React
- **Backend**: Node.js + Express (CLEAN Architecture)
- **Database**: PostgreSQL
- **Cache**: Redis
- **Containerization**: Docker & Docker Compose

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development without Docker)

### Quick Start with Docker

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Start all services:
   ```bash
   docker-compose up
   ```
4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

### Local Development (without Docker)

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## Project Structure

```
├── backend/          # Node.js Backend (CLEAN Architecture)
├── frontend/         # React Frontend
├── docker-compose.yml
└── .env
```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/recommendations` - Get personalized recommendations
- `GET /api/anime/:id` - Get anime details
- `POST /api/watchlist` - Add to watchlist
- `POST /api/ratings` - Rate an anime

## Features

- User authentication
- Personalized anime recommendations
- Search and filter anime
- Personal watchlist
- Rating system
- Caching for optimal performance

## License
