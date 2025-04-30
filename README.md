# Gamertag Checker

A full-stack web application that allows users to check gaming profiles across different platforms (Steam, Xbox, PlayStation, Epic Games, Roblox, Activision).

## Features

- Check gaming profiles across multiple platforms
- View profile information like avatar, last online time, and game stats
- Clean, responsive UI that works on mobile devices
- Easily extensible to support more gaming platforms

## Tech Stack

- **Frontend**: HTML, CSS (with Tailwind CSS), JavaScript
- **Backend**: Node.js with Express.js
- **APIs**: Steam, Roblox, Epic Games, Xbox, PlayStation, Activision
- **Deployment**: AWS Amplify ready

## Project Structure

```
.
├── amplify.yml         # AWS Amplify configuration
├── frontend/           # Frontend assets
│   ├── index.html      # Main HTML file
│   └── src/            # Source files
│       ├── app.js      # JavaScript logic
│       └── styles.css  # Custom styles
│
└── backend/            # Backend server
    ├── server.js       # Express server
    ├── env.example     # Example environment variables
    └── services/       # API integrations
        ├── steamService.js       # Steam API integration
        ├── robloxService.js      # Roblox API integration
        ├── fortniteService.js    # Fortnite/Epic API integration
        ├── xboxService.js        # Xbox API integration
        ├── psnService.js         # PlayStation API integration
        ├── activisionService.js  # Activision/CoD API integration
        └── genericService.js     # Other platforms (placeholder)
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- API keys for various gaming platforms:
  - Steam API key
  - Fortnite API key
  - OpenXBL API key (for Xbox)
  - NPSSO token (for PlayStation)
  - Tracker Network API key (for Activision/CoD)

### Local Installation

1. Clone the repository
2. Set up the backend:
   ```bash
   cd backend
   npm install
   ```
3. Create a `.env` file in the backend directory with your API keys:
   ```
   PORT=3000
   STEAM_API_KEY=your_steam_api_key
   FORTNITE_API_KEY=your_fortnite_api_key
   OPENXBL_API_KEY=your_openxbl_api_key
   PSN_NPSSO=your_psn_npsso_token
   TRACKER_API_KEY=your_tracker_network_api_key
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
5. Open the frontend in your browser:
   ```
   open frontend/index.html
   ```

## AWS Amplify Deployment

### Prerequisites

- AWS Account
- AWS Amplify CLI installed (optional for CLI deployment)

### Deployment Steps

1. Connect your GitHub repository to AWS Amplify
2. Amplify will automatically detect the `amplify.yml` configuration
3. Add all your API keys as environment variables in the Amplify Console:
   - `STEAM_API_KEY` - Your Steam API key
   - `FORTNITE_API_KEY` - Your Fortnite API key
   - `OPENXBL_API_KEY` - Your OpenXBL API key
   - `PSN_NPSSO` - Your PlayStation NPSSO token
   - `TRACKER_API_KEY` - Your Tracker Network API key
4. Deploy your application

Amplify will automatically build and deploy both the frontend and backend.

## API Information

### Steam API
- Get a Steam API key from: https://steamcommunity.com/dev/apikey
- Documentation: https://developer.valvesoftware.com/wiki/Steam_Web_API

### Roblox API
- Uses public APIs (no key required)
- Unofficial Documentation: https://roblox.fandom.com/wiki/Roblox_API

### Fortnite/Epic API
- Get a Fortnite API key from: https://fortnite-api.com/
- Documentation: https://fortnite-api.com/documentation

### Xbox API
- Get an OpenXBL API key from: https://xbl.io/
- Documentation: https://xbl.io/console

### PlayStation Network API
- Requires a NPSSO token for authentication
- Documentation: https://psn-api.achievements.app/
- npm package: https://www.npmjs.com/package/psn-api

### Activision/Call of Duty API
- Get a Tracker Network API key from: https://tracker.gg/developers
- Documentation: https://tracker.gg/developers/docs/titles/cod

## Adding New Platforms

To add support for a new gaming platform:

1. Create a new service file in `backend/services/`
2. Implement the `getProfile` function that returns data in the standardized format
3. Add the platform to the switch statement in `backend/server.js`

## License

MIT
