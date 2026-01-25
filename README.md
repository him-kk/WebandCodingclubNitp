# Web and Coding Club - Full Stack Application

A complete full-stack web application for a coding club with modern features including JWT authentication, Redis caching, AI chatbot, real-time messaging, and Docker containerization.

## 🚀 Features

### Frontend
- **React 18** with TypeScript
- **Three.js WebGL** fluid background effects
- **GSAP animations** with ScrollTrigger
- **Responsive design** with Tailwind CSS
- **Real-time messaging** with Socket.IO
- **Interactive components** with Framer Motion
- **Protected routes** with JWT authentication

### Backend
- **Node.js/Express** REST API
- **JWT authentication** with refresh tokens
- **Redis** for session management and caching
- **MongoDB** for data persistence
- **Socket.IO** for real-time communication
- **AI Chatbot** with OpenAI integration
- **Rate limiting** and security middleware
- **File upload** support with Multer

### Infrastructure
- **Docker** containerization
- **Nginx** reverse proxy and load balancer
- **Docker Compose** for easy deployment
- **Environment-based** configuration

## 🛠 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Three.js + React Three Fiber
- GSAP (animations)
- Framer Motion
- Axios (HTTP client)
- Socket.IO Client

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- Redis
- JWT
- Bcrypt.js (password hashing)
- Express Validator
- Socket.IO
- OpenAI API (AI chatbot)

### DevOps
- Docker + Docker Compose
- Nginx
- Git

## 📁 Project Structure

```
web-coding-club/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Database & Redis config
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── socket/         # Socket.IO handlers
│   │   └── server.ts       # Main server file
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── sections/       # Page sections
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Utility functions
│   │   └── App.tsx         # Main App component
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
│
├── nginx/                  # Nginx configuration
│   ├── nginx.conf
│   └── ssl/               # SSL certificates (optional)
│
├── docker-compose.yml      # Docker Compose setup
├── .env.example           # Environment variables example
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd web-coding-club
```

2. **Copy environment files**
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

3. **Edit environment variables**
```bash
# backend/.env
JWT_SECRET=your-super-secret-jwt-key-here
OPENAI_API_KEY=your-openai-api-key (optional)

# frontend/.env
VITE_API_URL=http://localhost:5000/api
```

4. **Start with Docker Compose**
```bash
docker-compose up -d
```

5. **Access the application**
- Frontend: http://localhost
- Backend API: http://localhost:5000
- MongoDB: localhost:27017
- Redis: localhost:6379

### Manual Development Setup

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
npm run dev
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/leaderboard` - Get leaderboard

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (admin/lead)
- `GET /api/events/:id` - Get single event
- `POST /api/events/:id/register` - Register for event

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Chatbot
- `POST /api/chatbot/message` - Send message to bot
- `GET /api/chatbot/history` - Get chat history
- `POST /api/chatbot/ai` - Send message to AI (requires OpenAI key)

### Resources
- `GET /api/resources/roadmaps` - Get learning roadmaps
- `GET /api/resources/tutorials` - Get tutorials
- `GET /api/resources/blog` - Get blog posts

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. **Access Token**: Short-lived token (7 days) stored in localStorage
2. **Refresh Token**: Used to get new access tokens
3. **Session Storage**: Sessions are stored in Redis
4. **Protected Routes**: Certain routes require authentication

## 🤖 AI Chatbot

The AI chatbot has two modes:

1. **Rule-based**: Uses predefined responses for common queries
2. **OpenAI-powered**: Uses GPT-3.5 for advanced conversations (requires API key)

Features:
- Natural language understanding
- Context-aware responses
- Conversation history
- Rate limiting (50 requests/hour per user)

## 📊 Points System

Users earn points for various activities:
- Contributing to projects: 50-500 points
- Attending events: 100-300 points
- Helping others: 25-100 points
- Winning hackathons: 1000+ points
- Mentoring: 200 points

User levels based on points:
- Beginner: 0-2499 points
- Intermediate: 2500-4999 points
- Advanced: 5000-7499 points
- Expert: 7500-9999 points
- Grandmaster: 10000+ points

## 🌐 Real-time Features

### Socket.IO Events
- `chat:message` - Real-time messaging
- `chat:typing` - Typing indicators
- `room:join/leave` - Room management
- `notifications:*` - Push notifications

### Redis Pub/Sub
- Leaderboard updates
- Event notifications
- Project updates

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Access container shell
docker exec -it webclub-backend sh
docker exec -it webclub-mongodb mongosh
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Express Validator
- **Password Hashing**: Bcrypt.js
- **CORS**: Configured for frontend
- **Content Security Policy**: XSS protection
- **File Upload Validation**: Size and type limits

## 📈 Performance Optimizations

- **Redis Caching**: API response caching
- **Database Indexes**: Optimized queries
- **Gzip Compression**: Reduced payload size
- **Image Optimization**: WebP format support
- **Lazy Loading**: Frontend components
- **Code Splitting**: Vite bundling

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/web-coding-club
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your-openai-key (optional)
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_NODE_ENV=development
```

## 🚀 Deployment

### Production Deployment
1. Update environment variables for production
2. Build Docker images: `docker-compose build`
3. Start services: `docker-compose up -d`
4. Configure SSL certificates in `nginx/ssl/`
5. Update Nginx config for HTTPS

### Cloud Deployment
The application can be deployed to:
- AWS (ECS, EC2, or Lambda)
- Google Cloud Platform
- Azure
- Digital Ocean
- Heroku
- Vercel (frontend only)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, please contact:
- Email: himanshu315tiwari@gmail.com



**Happy Coding! 🚀**
