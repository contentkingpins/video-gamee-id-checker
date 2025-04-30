const axios = require('axios');

// OpenXBL API Key should be in .env file
// For this demo, we'll use a placeholder. In production, use process.env.OPENXBL_API_KEY
const OPENXBL_API_KEY = 'DEMO_KEY'; // Replace with your actual API key from OpenXBL

/**
 * Get Xbox profile by gamertag
 * @param {string} gamertag - Xbox gamertag
 * @returns {Promise<Object>} - Profile data in standardized format
 */
async function getProfile(gamertag) {
  try {
    // Fetch account information from OpenXBL
    const accountInfo = await getAccountInfo(gamertag);
    
    if (!accountInfo) {
      throw new Error('Xbox profile not found');
    }
    
    // Fetch additional stats if available
    const statsData = await getPlayerStats(gamertag);
    
    // Return standardized profile data
    return {
      username: accountInfo.gamertag || gamertag,
      platform: 'Xbox',
      avatar: accountInfo.displayPicRaw || accountInfo.gamerpic || 'https://via.placeholder.com/150',
      lastOnline: formatLastOnline(accountInfo.presenceState, accountInfo.lastSeen),
      stats: {
        gamerscore: formatStatValue(accountInfo.gamerScore),
        tenure: formatStatValue(accountInfo.xboxOneRep),
        status: accountInfo.presenceText || 'Offline',
        ...(accountInfo.location ? { location: accountInfo.location } : {}),
        ...(statsData.achievements ? { achievements: formatStatValue(statsData.achievements) } : {}),
        ...(statsData.followersCount ? { followers: formatStatValue(statsData.followersCount) } : {})
      },
      // Include raw data for debugging or future expansion
      _rawData: {
        account: accountInfo,
        stats: statsData
      }
    };
  } catch (error) {
    console.error('Xbox API error:', error);
    throw new Error('Failed to fetch Xbox profile: ' + (error.message || 'Unknown error'));
  }
}

/**
 * Get account information
 * @param {string} gamertag - Xbox gamertag
 * @returns {Promise<Object|null>} - Account info or null if not found
 */
async function getAccountInfo(gamertag) {
  try {
    // Using OpenXBL API endpoint for account profiles
    const response = await axios.get(`https://xbl.io/api/v2/account/profile/gamertag/${encodeURIComponent(gamertag)}`, {
      headers: {
        'X-Authorization': OPENXBL_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.profileUsers && response.data.profileUsers.length > 0) {
      return response.data.profileUsers[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error getting Xbox account:', error);
    throw new Error('Failed to get Xbox account information');
  }
}

/**
 * Get player stats (achievements, followers, etc.)
 * @param {string} gamertag - Xbox gamertag
 * @returns {Promise<Object>} - Player stats
 */
async function getPlayerStats(gamertag) {
  try {
    // This endpoint would typically retrieve achievements or other stats
    // Implementation may vary based on what data is available through the API
    const response = await axios.get(`https://xbl.io/api/v2/friends/stats/${encodeURIComponent(gamertag)}`, {
      headers: {
        'X-Authorization': OPENXBL_API_KEY,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data) {
      return response.data;
    }
    
    return {};
  } catch (error) {
    console.error('Error getting Xbox player stats:', error);
    return {};
  }
}

/**
 * Format last online status
 * @param {string} presenceState - Presence state
 * @param {string} lastSeen - Last seen timestamp
 * @returns {string} - Formatted status
 */
function formatLastOnline(presenceState, lastSeen) {
  if (presenceState === 'Online') {
    return 'Online now';
  }
  
  if (lastSeen) {
    return `Last online: ${new Date(lastSeen).toLocaleString()}`;
  }
  
  return 'Unknown';
}

/**
 * Format stat value with specified suffix
 * @param {*} value - Value to format
 * @param {string} suffix - Optional suffix to add
 * @returns {string} - Formatted value
 */
function formatStatValue(value, suffix = '') {
  if (value === undefined || value === null) {
    return 'N/A';
  }
  
  if (typeof value === 'number') {
    return value.toLocaleString() + suffix;
  }
  
  return value + suffix;
}

module.exports = {
  getProfile
}; 