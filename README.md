# Gamertag Checker

A frontend web application that allows users to check gaming profiles across different platforms (Steam, Xbox, PlayStation, Epic Games, Roblox, Activision).

## Features

- Check gaming profiles across multiple platforms
- View profile information like avatar, last online time, and game stats
- Clean, responsive UI that works on mobile devices
- Client-side implementation with direct API calls

## Tech Stack

- **Frontend**: HTML, CSS (with Tailwind CSS), JavaScript
- **APIs**: Direct integration with:
  - Steam API
  - Roblox API
  - Fortnite API

## Project Structure

```
.
└── frontend/           # Frontend assets
    ├── index.html      # Main HTML file
    └── src/            # Source files
        ├── app.js      # JavaScript logic with direct API calls
        └── styles.css  # Custom styles
```

## Getting Started

### Prerequisites

- API keys for Steam and Fortnite APIs
- CORS proxy for APIs that don't support cross-origin requests

### Installation

1. Clone the repository
2. Replace API keys in `frontend/src/app.js`:
   ```javascript
   const STEAM_API_KEY = 'YOUR_STEAM_API_KEY';
   const FORTNITE_API_KEY = 'YOUR_FORTNITE_API_KEY';
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

## License

MIT
