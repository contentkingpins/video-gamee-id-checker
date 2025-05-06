# Gamertag Checker

This application allows users to check their gaming profiles across multiple platforms (Steam, Roblox, Xbox, PlayStation, Epic Games, and Activision) with a single gamertag input.

## Dear Rippasats,

I've completed the transition from a CORS proxy-based solution to a proper Express.js backend that handles all gaming platform API requests. This solves our stability issues and provides a more reliable architecture. The application is now ready for AWS Amplify deployment with the following remaining steps:

### Final Deployment Checklist

1. **Push to GitHub Repository**
   ```bash
   git add .
   git commit -m "Implemented Express backend with API endpoints"
   git push origin main
   ```

2. **AWS Amplify Deployment**
   - Log in to AWS console and navigate to AWS Amplify
   - Create a new app → "Host web app"
   - Connect to our GitHub repository and select the main branch
   - In the build settings, ensure the amplify.yml file is being used
   - Add these environment variables:
     - `NODE_ENV`: `production`
     - `PORT`: `8080`
     - `ALLOWED_ORIGINS`: Update with our actual domain once known

3. **Custom Domain Setup**
   - After initial deployment, go to Domain Management in Amplify
   - Add our custom domain and configure DNS records
   - Update the `ALLOWED_ORIGINS` environment variable with our custom domain

4. **Post-Deployment Testing**
   - Verify all API endpoints are working
   - Test with multiple gamertags across platforms
   - Check for any CORS issues in the browser console

### Architecture Overview

The application now uses:

- **Frontend**: HTML/CSS/JS with Tailwind CSS for the UI
- **Backend**: Express.js server handling all API requests to gaming platforms
- **Deployment**: AWS Amplify for continuous deployment

### Key Files

- `frontend/server.js`: Main Express server with API endpoints
- `frontend/src/api.js`: Frontend API client that communicates with our backend
- `amplify.yml`: AWS Amplify configuration file
- `.ebextensions/nodecommand.config`: Configuration for alternative Elastic Beanstalk deployment

### Known Limitations

1. Some gaming platforms (Xbox, PlayStation, Activision) still don't provide full API access without authentication, so these sections display limited information with "View Full Profile" links.

2. Steam profiles occasionally change format, so we may need to update the XML parsing logic if any issues arise.

Let me know if you need any clarification or encounter any issues during deployment.

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

### Node.js Express Server on AWS Amplify

This application uses a Node.js Express server to handle API requests to gaming platforms, completely avoiding CORS issues. This is the most reliable deployment method.

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Configure environment variables in Amplify Console after deployment:
   - `NODE_ENV`: `production`
   - `PORT`: `8080`
   - `ALLOWED_ORIGINS`: Your domain names, comma-separated

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
2. Ensure the Express server is running on port 3000 locally or 8080 on Amplify
3. Check server logs for any API request failures
4. Make sure all dependencies are installed: `npm install`

For additional help, check the issues section of the GitHub repository or create a new issue.

## Tech Stack

- **Frontend**: HTML, CSS (with Tailwind CSS), JavaScript
- **APIs**: Direct integration with:
  - Steam API
  - Roblox API
  - Fortnite/Epic API
  - Xbox API (via OpenXBL)
  - Activision/Call of Duty API (via Tracker.gg)

## Project Structure

```
.
└── frontend/                # Frontend assets
    ├── index.html           # Main HTML file
    └── src/                 # Source files
        ├── api.js           # API handler functions for each platform
        ├── config.js        # Configuration including API keys
        ├── app.js           # Main application logic
        └── styles.css       # Custom styles
```

## Getting Started

### Prerequisites

- API keys for the gaming platforms you want to use:
  - Steam API key
  - Fortnite API key
  - OpenXBL API key (for Xbox)
  - Tracker.gg API key (for Call of Duty)
- CORS proxy for APIs that don't support cross-origin requests

### Installation

1. Clone the repository
2. Replace API keys in `frontend/src/config.js`:
   ```javascript
   STEAM_API_KEY: 'YOUR_STEAM_API_KEY',
   FORTNITE_API_KEY: 'YOUR_FORTNITE_API_KEY',
   // Other API keys...
   ```
3. Open `frontend/index.html` in your browser

## CORS Considerations

This implementation uses direct API calls from the browser, which may encounter CORS (Cross-Origin Resource Sharing) restrictions. There are several ways to handle this:

1. **Use a CORS proxy** (recommended for development):
   - The code includes a CORS proxy URL: `https://cors-anywhere.herokuapp.com/`
   - You may need to visit this URL first and request temporary access for testing
   - For production, set up your own CORS proxy or use a service like:
     - CloudFlare Workers
     - Netlify Functions
     - Vercel Serverless Functions

2. **Deploy to a platform that offers proxy functionality**:
   - Netlify, Vercel, and similar platforms offer proxy capabilities
   - Configure the proxy in your platform's settings

3. **Browser extensions for testing**:
   - Extensions like "CORS Unblock" can help during development
   - Not suitable for production use

## API Information

### Steam API
- Public endpoint: `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/`
- Documentation: https://developer.valvesoftware.com/wiki/Steam_Web_API

### Roblox API
- Endpoints:
  - `https://users.roblox.com/v1/usernames/users` - Convert username to ID
  - `https://users.roblox.com/v1/users/{userId}` - Get profile info
  - `https://thumbnails.roblox.com/v1/users/avatar` - Get avatar
  - `https://presence.roblox.com/v1/presence/users` - Get online status
- No API key required for public data

### Fortnite API
- Endpoint: `https://fortnite-api.com/v2/stats/br/v2?name={username}`
- Requires API key in Authorization header
- Documentation: https://fortnite-api.com/documentation

### Xbox API (via OpenXBL)
- Endpoint: `https://xbl.io/api/v2/account/profile/gamertag/{gamertag}`
- Requires API key in X-Authorization header
- Documentation: https://xbl.io/docs

### Activision/Call of Duty API (via Tracker.gg)
- Endpoint: `https://public-api.tracker.gg/v2/warzone/standard/profile/{platform}/{username}`
- Requires API key in TRN-Api-Key header
- Documentation: https://tracker.gg/developers/docs/titles/warzone

## License

MIT
