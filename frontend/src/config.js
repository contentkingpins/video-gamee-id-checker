/**
 * Configuration for Gaming Profile Lookup
 * This version uses public endpoints and alternative methods
 * that don't require API keys
 */

const CONFIG = {
  // CORS Proxy configuration with fallbacks
  // In production, consider deploying your own CORS proxy or using environment variables
  CORS_PROXIES: [
    'https://corsproxy.org/?',
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url='
  ],
  
  // Get the active CORS proxy with fallback support
  get CORS_PROXY() {
    // In production, you could check a cookie or localStorage to see which proxy worked last
    return this.CORS_PROXIES[0];
  },
  
  // Public profile URL patterns - for linking to official profiles
  PROFILE_URLS: {
    STEAM: 'https://steamcommunity.com/id/',
    STEAM_ID: 'https://steamcommunity.com/profiles/',
    XBOX: 'https://account.xbox.com/en-us/profile?gamertag=',
    PSN: 'https://psnprofiles.com/',
    ROBLOX: 'https://www.roblox.com/users/',
    EPIC: 'https://fortnitetracker.com/profile/all/',
    ACTIVISION: 'https://cod.tracker.gg/warzone/profile/atvi/',
    MINECRAFT: 'https://namemc.com/profile/',
    GTA: 'https://socialclub.rockstargames.com/member/'
  },
  
  // Public data sources and tracker sites
  TRACKERS: {
    COD: 'https://cod.tracker.gg/warzone/profile/atvi/',
    FORTNITE: 'https://fortnitetracker.com/profile/all/',
    APEX: 'https://apex.tracker.gg/apex/profile/',
    VALORANT: 'https://tracker.gg/valorant/profile/riot/',
    OVERWATCH: 'https://overwatch.tracker.gg/profile/',
    PUBG: 'https://pubglookup.com/players/',
    RAINBOW6: 'https://r6.tracker.network/profile/'
  },
  
  // Default avatars for platforms missing profile images
  DEFAULT_AVATARS: {
    STEAM: 'https://avatars.cloudflare.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
    XBOX: 'https://www.xbox.com/etc.clientlibs/global/clientlibs/clientlib-xbox/resources/images/xbox-logo.png',
    PSN: 'https://image.api.playstation.com/cdn/avatar/default/default-avatar.png',
    ROBLOX: 'https://tr.rbxcdn.com/9f242fee04192a0f71d1ddb0d4cf32b6/420/420/Image/Png',
    EPIC: 'https://cdn2.unrealengine.com/15br-bplogo-battle-pass-red-blue-1024x1024-1025x1024-432870180.png',
    ACTIVISION: 'https://www.callofduty.com/content/dam/activision/callofduty/global/fontscolors/cod-logo-white.png',
    DEFAULT: 'https://via.placeholder.com/80'
  },
  
  // Client-side cache settings
  CACHE: {
    ENABLED: true,
    EXPIRE_TIME: 3600000 // 1 hour in milliseconds
  },

  // CORS production settings - use when deploying to a real domain
  PRODUCTION: {
    // For production, you'd set this to your specific domain(s)
    ALLOWED_ORIGINS: ['https://yourdomain.com', 'https://www.yourdomain.com'],
    
    // Whether to use direct API calls or CORS proxy based on environment
    USE_CORS_PROXY: true, // Change to false if you've implemented proper CORS on your backend/server
  }
};

// Don't modify exports
export default CONFIG;
