const axios = require('axios');

// Tracker.gg API Key should be in .env file
// For this demo, we'll use a placeholder. In production, use process.env.TRACKER_API_KEY
const TRACKER_API_KEY = 'DEMO_KEY'; // Replace with your actual API key from Tracker.gg

/**
 * Get Activision/Call of Duty profile by username
 * @param {string} username - Activision/CoD username
 * @returns {Promise<Object>} - Profile data in standardized format
 */
async function getProfile(username) {
  try {
    // For Activision IDs with special characters, we need to encode properly
    const encodedUsername = encodeURIComponent(username);
    
    // First get the player's Warzone stats as a starting point
    // Different CoD titles can be queried similarly (like warzone, vanguard, modern-warfare, etc.)
    const warzoneStats = await getWarzoneStats('acti', encodedUsername);
    
    if (!warzoneStats) {
      throw new Error('Activision profile not found');
    }
    
    // You could fetch multiple game titles and aggregate the data
    // const vanguardStats = await getVanguardStats('acti', encodedUsername);
    // const mwStats = await getMWStats('acti', encodedUsername);
    
    // Return standardized profile data
    return {
      username: warzoneStats.platformInfo?.platformUserHandle || username,
      platform: 'Activision',
      avatar: warzoneStats.platformInfo?.avatarUrl || 'https://via.placeholder.com/150',
      lastOnline: 'Not available via API',
      stats: {
        // Basic CoD stats
        level: formatStatValue(warzoneStats.segments?.[0]?.stats?.level?.value),
        kd: formatStatValue(warzoneStats.segments?.[0]?.stats?.kdRatio?.value, 2),
        wins: formatStatValue(warzoneStats.segments?.[0]?.stats?.wins?.value),
        kills: formatStatValue(warzoneStats.segments?.[0]?.stats?.kills?.value),
        deaths: formatStatValue(warzoneStats.segments?.[0]?.stats?.deaths?.value),
        gamesPlayed: formatStatValue(warzoneStats.segments?.[0]?.stats?.gamesPlayed?.value),
        winRate: formatStatValue(warzoneStats.segments?.[0]?.stats?.wlRatio?.value, 2, '%')
      },
      // Include raw data for debugging or future expansion
      _rawData: {
        warzone: warzoneStats,
        // vanguard: vanguardStats,
        // mw: mwStats
      }
    };
  } catch (error) {
    console.error('Activision API error:', error);
    throw new Error('Failed to fetch Activision profile: ' + (error.message || 'Unknown error'));
  }
}

/**
 * Get Warzone stats
 * @param {string} platform - Platform (acti, psn, xbl, battlenet)
 * @param {string} username - Username
 * @returns {Promise<Object|null>} - Warzone stats or null if not found
 */
async function getWarzoneStats(platform, username) {
  try {
    const response = await axios.get(`https://public-api.tracker.gg/v2/warzone/standard/profile/${platform}/${username}`, {
      headers: {
        'TRN-Api-Key': TRACKER_API_KEY
      }
    });
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting Warzone stats:', error);
    throw new Error('Failed to get Warzone stats');
  }
}

/**
 * Get Vanguard stats (similar implementation as Warzone)
 * @param {string} platform - Platform (acti, psn, xbl, battlenet)
 * @param {string} username - Username
 * @returns {Promise<Object|null>} - Vanguard stats or null if not found
 */
async function getVanguardStats(platform, username) {
  try {
    const response = await axios.get(`https://public-api.tracker.gg/v2/vanguard/standard/profile/${platform}/${username}`, {
      headers: {
        'TRN-Api-Key': TRACKER_API_KEY
      }
    });
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting Vanguard stats:', error);
    return null; // Return null instead of throwing to allow other game stats to be fetched
  }
}

/**
 * Format stat value with specified precision and suffix
 * @param {*} value - Value to format
 * @param {number} precision - Decimal precision for numbers
 * @param {string} suffix - Optional suffix to add
 * @returns {string} - Formatted value
 */
function formatStatValue(value, precision = 0, suffix = '') {
  if (value === undefined || value === null) {
    return 'N/A';
  }
  
  if (typeof value === 'number') {
    return value.toFixed(precision) + suffix;
  }
  
  return value + suffix;
}

module.exports = {
  getProfile
}; 