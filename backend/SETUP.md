# 🚀 Quick Setup Guide

Get DishDiaries backend running in 5 minutes!

## ⚡ Prerequisites

1. **Node.js** (v18+) - [Download here](https://nodejs.org/)
2. **MongoDB** - Choose one option below

## 📦 MongoDB Setup (Choose One)

### Option A: Local MongoDB (Recommended for Development)

**Windows:**
1. Download [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Install with default settings
3. MongoDB starts automatically

**macOS:**
```bash
# Install with Homebrew
brew install mongodb-community
brew services start mongodb-community
```

**Ubuntu/Linux:**
```bash
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
```

**Verify MongoDB is running:**
```bash
mongosh
# Should connect successfully
```

### Option B: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free account
3. Create a cluster
4. Get connection string
5. Use it in your `.env` file

## ⚙️ Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   # Copy the sample file
   cp env.sample .env
   
   # Edit .env file with your settings
   ```

4. **Basic .env file for local development:**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/dishdiaries
   JWT_SECRET=my-super-secret-key-for-development
   CORS_ORIGIN=http://localhost:3000
   ```

5. **Build and start:**
   ```bash
   npm run build
   npm run dev
   ```

6. **Test the server:**
   - Open: http://localhost:5000/health
   - Should see: `{"status":"healthy"...}`

## 🎯 Next Steps

1. **Start your Next.js frontend** (in another terminal)
2. **Backend runs on:** http://localhost:5000
3. **Frontend runs on:** http://localhost:3000
4. **Both communicate automatically**

## 🔧 Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check MongoDB connection
mongosh
```

## ❓ Common Issues

**Port 5000 in use?**
```bash
# Change PORT in .env file to 5001
PORT=5001
```

**MongoDB not connecting?**
```bash
# Make sure MongoDB is running
mongosh
# If it fails, start MongoDB service
```

**Frontend can't connect?**
- Make sure CORS_ORIGIN in .env matches your frontend URL
- Default: `CORS_ORIGIN=http://localhost:3000`

## 🎉 You're Ready!

Your backend is now running and ready to connect with your Next.js/React frontend!

**API endpoints available at:** http://localhost:5000/api

**Health check:** http://localhost:5000/health 