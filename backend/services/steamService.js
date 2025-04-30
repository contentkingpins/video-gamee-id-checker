const axios = require('axios');

// Steam API Key should be in .env file
// const STEAM_API_KEY = process.env.STEAM_API_KEY;

// For the demo, we'll use a hardcoded key. In production, use process.env.STEAM_API_KEY
const STEAM_API_KEY = 'DEMO_KEY'; // Replace with your actual Steam API key

/**
 * Get Steam profile by username or SteamID
 * @param {string} identifier - Steam username or ID
 * @returns {Promise<Object>} - Profile data in standardized format
 */
async function getProfile(identifier) {
  try {
    // First determine if we have a vanity URL or a Steam ID
    let steamId = identifier;
    
    // If it's not a numeric SteamID, resolve the vanity URL
    if (isNaN(identifier)) {
      steamId = await resolveVanityURL(identifier);
    }
    
    // Fetch the player summary
    const response = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/`, {
      params: {
        key: STEAM_API_KEY,
        steamids: steamId
      }
    });

    // Check if we got valid data back
    const playerData = response.data?.response?.players?.[0];
    if (!playerData) {
      throw new Error('Steam profile not found');
    }

    // Get owned games for playtime stats
    const gamesData = await getPlayerGames(steamId);
    
    // Return standardized profile data
    return {
      username: playerData.personaname,
      platform: 'Steam',
      avatar: playerData.avatarfull,
      lastOnline: formatLastOnline(playerData.lastlogoff),
      stats: {
        status: formatStatus(playerData.personastate),
        games: gamesData.game_count || 0,
        ...(gamesData.mostPlayed ? { 'Most Played': gamesData.mostPlayed } : {}),
        ...(playerData.timecreated ? { 'Account Age': formatAccountAge(playerData.timecreated) } : {}),
      },
      // Include raw data for debugging or future expansion
      _rawData: {
        steam: playerData,
        games: gamesData
      }
    };
  } catch (error) {
    console.error('Steam API error:', error);
    throw new Error('Failed to fetch Steam profile: ' + (error.message || 'Unknown error'));
  }
}

/**
 * Resolve a vanity URL to a Steam ID
 * @param {string} vanityUrl - The vanity URL name
 * @returns {Promise<string>} - The resolved Steam ID
 */
async function resolveVanityURL(vanityUrl) {
  try {
    const response = await axios.get('http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/', {
      params: {
        key: STEAM_API_KEY,
        vanityurl: vanityUrl
      }
    });
    
    if (response.data.response.success !== 1) {
      throw new Error('Could not resolve vanity URL');
    }
    
    return response.data.response.steamid;
  } catch (error) {
    throw new Error('Failed to resolve Steam vanity URL: ' + (error.message || 'Unknown error'));
  }
}

/**
 * Get owned games for a player
 * @param {string} steamId - The Steam ID
 * @returns {Promise<Object>} - Games data
 */
async function getPlayerGames(steamId) {
  try {
    const response = await axios.get('http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/', {
      params: {
        key: STEAM_API_KEY,
        steamid: steamId,
        format: 'json',
        include_appinfo: 1,
        include_played_free_games: 1
      }
    });
    
    const gamesData = response.data?.response;
    
    if (!gamesData || !gamesData.games) {
      return { game_count: 0 };
    }
    
    // Find most played game
    let mostPlayedGame = null;
    let maxPlaytime = 0;
    
    gamesData.games.forEach(game => {
      if (game.playtime_forever > maxPlaytime) {
        maxPlaytime = game.playtime_forever;
        mostPlayedGame = game;
      }
    });
    
    const result = {
      game_count: gamesData.game_count,
    };
    
    if (mostPlayedGame) {
      result.mostPlayed = `${mostPlayedGame.name} (${Math.round(maxPlaytime / 60)} hours)`;
    }
    
    return result;
  } catch (error) {
    console.error('Error fetching player games:', error);
    return { game_count: 0 };
  }
}

/**
 * Format timestamp to last online string
 * @param {number} timestamp - Unix timestamp
 * @returns {string} - Formatted date string
 */
function formatLastOnline(timestamp) {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp * 1000);
  return date.toLocaleString();
}

/**
 * Format account age
 * @param {number} timestamp - Unix timestamp
 * @returns {string} - Formatted account age
 */
function formatAccountAge(timestamp) {
  if (!timestamp) return 'Unknown';
  
  const creationDate = new Date(timestamp * 1000);
  const now = new Date();
  
  const yearDiff = now.getFullYear() - creationDate.getFullYear();
  
  if (yearDiff < 1) {
    const monthDiff = now.getMonth() - creationDate.getMonth();
    return `${monthDiff} months`;
  }
  
  return `${yearDiff} years`;
}

/**
 * Format Steam persona state to a readable status
 * @param {number} state - Persona state value
 * @returns {string} - Readable status
 */
function formatStatus(state) {
  const states = {
    0: 'Offline',
    1: 'Online',
    2: 'Busy',
    3: 'Away',
    4: 'Snooze',
    5: 'Looking to Trade',
    6: 'Looking to Play'
  };
  
  return states[state] || 'Unknown';
}

module.exports = {
  getProfile
}; 