const axios = require('axios');

// Fortnite API Key should be in .env file
// For this demo we'll use a placeholder. In production, use process.env.FORTNITE_API_KEY
const FORTNITE_API_KEY = 'DEMO_KEY'; // Replace with your actual API key from a service like Fortnite-API.com

/**
 * Get Fortnite/Epic profile by username
 * @param {string} username - Epic Games username
 * @returns {Promise<Object>} - Profile data in standardized format
 */
async function getProfile(username) {
  try {
    // First look up the account ID by username using the Fortnite API
    const accountInfo = await getAccountId(username);
    
    if (!accountInfo) {
      throw new Error('Epic Games account not found');
    }
    
    // Get stats for the account
    const statsData = await getPlayerStats(accountInfo.accountId);
    
    // Return standardized profile data
    return {
      username: accountInfo.epicNickname || username,
      platform: 'Epic Games',
      avatar: accountInfo.avatar || 'https://via.placeholder.com/150',
      lastOnline: 'Not available via API',
      stats: {
        account: accountInfo.accountName,
        level: statsData.battlePass?.level || 'N/A',
        wins: formatStatValue(statsData.stats?.all?.overall?.wins),
        matches: formatStatValue(statsData.stats?.all?.overall?.matches),
        winRate: formatStatValue(statsData.stats?.all?.overall?.winRate, '%'),
        kd: formatStatValue(statsData.stats?.all?.overall?.kd),
      },
      // Include raw data for debugging or future expansion
      _rawData: {
        account: accountInfo,
        stats: statsData
      }
    };
  } catch (error) {
    console.error('Fortnite API error:', error);
    throw new Error('Failed to fetch Epic Games profile: ' + (error.message || 'Unknown error'));
  }
}

/**
 * Get account ID from username
 * @param {string} username - Epic Games username
 * @returns {Promise<Object|null>} - Account info or null if not found
 */
async function getAccountId(username) {
  try {
    const response = await axios.get(`https://fortnite-api.com/v2/stats/br/v2?name=${encodeURIComponent(username)}`, {
      headers: {
        'Authorization': FORTNITE_API_KEY
      }
    });
    
    if (response.data && response.data.data && response.data.data.account) {
      return {
        accountId: response.data.data.account.id,
        accountName: response.data.data.account.name,
        epicNickname: response.data.data.account.name
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting Epic account ID:', error);
    throw new Error('Failed to get Epic Games account');
  }
}

/**
 * Get player stats
 * @param {string} accountId - Epic account ID
 * @returns {Promise<Object>} - Player stats
 */
async function getPlayerStats(accountId) {
  try {
    const response = await axios.get(`https://fortnite-api.com/v2/stats/br/v2/${accountId}`, {
      headers: {
        'Authorization': FORTNITE_API_KEY
      }
    });
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return {};
  } catch (error) {
    console.error('Error getting Fortnite stats:', error);
    return {};
  }
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