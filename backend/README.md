# DishDiaries Backend API

A complete Node.js + TypeScript backend for the DishDiaries recipe sharing platform with MongoDB, Socket.io, and comprehensive features.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with user registration, login, and profile management
- **Recipe Management**: CRUD operations for recipes with ingredients, instructions, and nutrition info
- **Social Features**: User following, recipe likes, comments, and collections
- **Real-time Updates**: Socket.io for live recipe updates, comments, and user activity
- **File Upload**: Image upload with Cloudinary integration and optimization
- **Security**: Rate limiting, input validation, CORS, helmet, and comprehensive error handling
- **Performance**: MongoDB indexing, compression, and caching support
- **Logging**: Structured logging with Winston
- **Production Ready**: Health checks and graceful shutdown

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   └── database.ts   # MongoDB connection setup
│   ├── controllers/      # Route controllers
│   │   └── authController.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # JWT authentication
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── validation.ts
│   ├── models/           # Mongoose models
│   │   ├── User.ts
│   │   ├── Recipe.ts
│   │   ├── Collection.ts
│   │   └── Notification.ts
│   ├── routes/           # Express routes
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   ├── recipeRoutes.ts
│   │   └── uploadRoutes.ts
│   ├── socket/           # Socket.io configuration
│   │   └── socketHandler.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   ├── logger.ts
│   │   └── cloudinary.ts
│   └── server.ts         # Main server file
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Installation Guide](#mongodb-setup)
- **npm** or **yarn** package manager

### MongoDB Setup

Choose one of the following options:

#### Option 1: Local MongoDB Installation

1. **Download and Install MongoDB:**
   - **Windows**: Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
   - **macOS**: `brew install mongodb-community`
   - **Ubuntu**: 
     ```bash
     sudo apt update
     sudo apt install mongodb
     ```

2. **Start MongoDB Service:**
   - **Windows**: MongoDB service starts automatically after installation
   - **macOS**: `brew services start mongodb-community`
   - **Ubuntu**: `sudo systemctl start mongodb`

3. **Verify MongoDB is running:**
   ```bash
   mongosh
   # Should connect to MongoDB shell
   ```

#### Option 2: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Use the Atlas connection string in your `.env` file

### Backend Setup

1. **Clone and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   Create a `.env` file in the backend directory:
   ```env
   # Environment
   NODE_ENV=development
   PORT=5000

   # Database (choose one)
   MONGODB_URI=mongodb://localhost:27017/dishdiaries
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dishdiaries

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRE=7d

   # Cloudinary (for image uploads - optional for development)
   CLOUDINARY_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # Frontend
   CORS_ORIGIN=http://localhost:3000

   # Security
   BCRYPT_SALT_ROUNDS=12
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   MAX_FILE_SIZE=5242880

   # Logging
   LOG_LEVEL=info
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Verify the server is running:**
   - Open http://localhost:5000/health
   - You should see a health check response

## 🌐 Frontend Integration (Next.js/React)

The backend is designed to work seamlessly with a Next.js/React frontend:

### Frontend Setup Steps:

1. **API Base URL Configuration:**
   ```javascript
   // In your Next.js app
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
   ```

2. **Axios Configuration:**
   ```javascript
   import axios from 'axios';

   const api = axios.create({
     baseURL: 'http://localhost:5000/api',
     withCredentials: true,
     headers: {
       'Content-Type': 'application/json',
     },
   });

   // Add auth token to requests
   api.interceptors.request.use((config) => {
     const token = localStorage.getItem('token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```

3. **Socket.io Client Setup:**
   ```javascript
   import { io } from 'socket.io-client';

   const socket = io('http://localhost:5000', {
     auth: {
       token: localStorage.getItem('token')
     }
   });
   ```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/follow/:id` - Follow user
- `DELETE /api/auth/unfollow/:id` - Unfollow user

### Users
- `GET /api/users/profile/:id` - Get user profile
- `GET /api/users/:id/recipes` - Get user's recipes
- `GET /api/users/:id/favorites` - Get user's favorite recipes

### Recipes
- `GET /api/recipes` - Get all recipes (with pagination and filters)
- `GET /api/recipes/:id` - Get recipe by ID
- `POST /api/recipes` - Create new recipe
- `PUT /api/recipes/:id` - Update recipe
- `DELETE /api/recipes/:id` - Delete recipe
- `POST /api/recipes/:id/like` - Like recipe
- `DELETE /api/recipes/:id/like` - Unlike recipe
- `POST /api/recipes/:id/comments` - Add comment
- `DELETE /api/recipes/:id/comments/:commentId` - Delete comment

### Upload
- `POST /api/upload/recipe-image` - Upload recipe image

### Health Check
- `GET /health` - Health check endpoint
- `GET /api` - API information

## 🔌 Socket.io Events

### Client to Server
- `join-recipe` - Join recipe room for real-time updates
- `leave-recipe` - Leave recipe room
- `like-recipe` - Real-time recipe like
- `add-comment` - Real-time comment addition
- `user-online` - User online status

### Server to Client
- `recipe-updated` - Recipe was updated
- `new-like` - New like on recipe
- `new-comment` - New comment on recipe
- `user-status` - User online/offline status
- `new-recipe` - New recipe from followed users

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

### Development Workflow

1. **Start MongoDB** (if using local installation)
2. **Start the backend:** `npm run dev`
3. **Start your Next.js frontend** in another terminal
4. **Both will run simultaneously:**
   - Backend: http://localhost:5000
   - Frontend: http://localhost:3000

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents API abuse and DOS attacks
- **Input Validation**: Joi validation for all inputs
- **CORS Configuration**: Properly configured for frontend domain
- **Helmet**: Security headers for Express
- **Password Hashing**: bcrypt with salt rounds
- **MongoDB Injection Protection**: Mongoose provides protection

## 📊 Database Schema

### User Schema
- Username, email, password (hashed)
- Avatar, bio, favorites, following/followers
- Email verification, account status
- Timestamps and virtual fields

### Recipe Schema
- Title, description, ingredients, instructions
- Prep/cook time, servings, difficulty, tags
- Image URL, author, likes, comments
- Nutrition info, public/private status
- Views, rating, timestamps

### Collection Schema
- Name, description, recipes array
- Author, public status, followers
- Timestamps

### Notification Schema
- Recipient, sender, type, entity ID
- Message, read status, timestamps

## 📝 API Response Format

All API responses follow this consistent format:

```json
{
  "success": boolean,
  "message": string,
  "data": object | array,
  "error": string,
  "meta": {
    "pagination": {
      "page": number,
      "limit": number,
      "total": number,
      "totalPages": number
    }
  }
}
```

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   ```
   Error: ECONNREFUSED localhost:27017
   ```
   **Solution:** Make sure MongoDB is running (`mongosh` to test)

2. **Port Already in Use:**
   ```
   Error: listen EADDRINUSE :::5000
   ```
   **Solution:** Change PORT in `.env` or kill the process using port 5000

3. **JWT Secret Error:**
   ```
   Error: JWT_SECRET environment variable is not defined
   ```
   **Solution:** Add JWT_SECRET to your `.env` file

4. **Build Errors:**
   ```
   TypeScript compilation errors
   ```
   **Solution:** Fix TypeScript errors or run `npm run build` to see detailed errors

### MongoDB Quick Commands

```bash
# Connect to MongoDB
mongosh

# Show databases
show dbs

# Use dishdiaries database
use dishdiaries

# Show collections
show collections

# Find all users
db.users.find()

# Find all recipes
db.recipes.find()
```

## 🚀 Production Deployment

For production deployment:

1. Set `NODE_ENV=production` in environment
2. Use a production MongoDB instance (MongoDB Atlas recommended)
3. Set secure JWT_SECRET
4. Configure proper CORS_ORIGIN for your domain
5. Set up proper logging and monitoring
6. Use a reverse proxy (nginx) in front of the Node.js app

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the health endpoint: `GET /health`
- Review logs for error details
- Ensure all environment variables are set
- Verify MongoDB connection with `mongosh`

---

**Built with ❤️ for the DishDiaries recipe sharing community** 