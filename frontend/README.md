# Gamertag Checker

This application allows users to check their gaming profiles across multiple platforms (Steam, Roblox, Xbox, PlayStation, Epic Games, and Activision) with a single gamertag input.

## Table of Contents
- [Features](#features)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
  - [Node.js Express Server (Recommended)](#nodejs-express-server-recommended)
- [Troubleshooting](#troubleshooting)

## Features

- Search for gaming profiles across 6 major platforms with a single input
- Display profile information including avatars, online status, and game statistics when available
- Color-coded platform cards with platform-specific styling
- Error handling and user feedback
- Fast client-side caching to prevent redundant API calls
- Server-side API handling to avoid CORS issues entirely

## Local Development

To run the application locally for development:

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the Express server:
   ```bash
   npm start
   ```
5. Open your browser and navigate to `http://localhost:3000`

## Production Deployment

### Node.js Express Server (Recommended)

This application uses a Node.js Express server to handle API requests to gaming platforms, completely avoiding CORS issues. This is the most reliable deployment method.

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Configure environment variables (optional):
   ```bash
   # Create a .env file (optional)
   echo "PORT=3000" > .env
   echo "ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com" >> .env
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. For production deployment on services like Heroku, Railway, or Render:
   - Make sure to set the necessary environment variables in your deployment platform
   - Point your domain to the deployed application

## How It Works

This application uses a hybrid approach:

1. **Frontend**: Simple HTML/CSS/JS using Tailwind CSS for styling
2. **Backend**: Express server that handles API requests to gaming platforms
   
The backend acts as a proxy for requests to external gaming APIs like Steam and Roblox. This approach eliminates CORS issues since:

- The browser makes requests to your server (same origin)
- Your server makes requests to external APIs (server-to-server, not subject to browser CORS)
- Your server returns the data to the frontend

## Troubleshooting

If you encounter issues:

1. **Check the browser console** (F12) for detailed error messages
2. Ensure the Express server is running on port 3000
3. Check server logs for any API request failures
4. Make sure all dependencies are installed: `npm install`

For additional help, check the issues section of the GitHub repository or create a new issue. 