/**
 * Configuration for Gaming Profile Lookup
 * This version uses public endpoints and alternative methods
 * that don't require API keys where possible
 */

const CONFIG = {
  // Public endpoints and services
  CORS_PROXY: 'https://corsproxy.io/?',
  
  // Public profile URL patterns - for linking to official profiles
  PROFILE_URLS: {
    STEAM: 'https://steamcommunity.com/id/',
    STEAM_ID: 'https://steamcommunity.com/profiles/',
    XBOX: 'https://account.xbox.com/en-us/profile?gamertag=',
    ROBLOX: 'https://www.roblox.com/users/',
    EPIC: 'https://fortnitetracker.com/profile/all/',
    ACTIVISION: 'https://cod.tracker.gg/warzone/profile/'
  },
  
  // Public data sources
  TRACKERS: {
    COD: 'https://cod.tracker.gg/warzone/profile/',
    FORTNITE: 'https://fortnitetracker.gg/profile/',
    APEX: 'https://apex.tracker.gg/apex/profile/'
  }
};

// Don't modify exports
export default CONFIG;
