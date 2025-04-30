// Note: This service requires the psn-api package
// npm install psn-api
const { exchangeNpssoForCode, exchangeCodeForAccessToken, getUserTrophies, getUserTitles, getProfileFromUserName } = require('psn-api');

// PSN Auth credentials should be in .env file
// For security reasons, in production use process.env variables
const PSN_NPSSO = process.env.PSN_NPSSO || 'DEMO_NPSSO'; // Replace with your NPSSO token

/**
 * Get PlayStation profile by username
 * @param {string} username - PSN username
 * @returns {Promise<Object>} - Profile data in standardized format
 */
async function getProfile(username) {
  try {
    // Auth flow for PSN API
    const accessCode = await exchangeNpssoForCode(PSN_NPSSO);
    const authorization = await exchangeCodeForAccessToken(accessCode);
    
    // Fetch profile data
    const profileData = await getProfileFromUserName(authorization, username);
    
    if (!profileData) {
      throw new Error('PlayStation profile not found');
    }
    
    // Fetch trophies and games (titles) data if available
    let trophiesData = {};
    let titlesData = {};
    
    try {
      // Get account ID from profile
      const accountId = profileData.profile.accountId;
      
      // Get trophy summary
      trophiesData = await getUserTrophies(authorization, accountId);
      
      // Get recently played games
      titlesData = await getUserTitles(authorization, accountId);
    } catch (statsError) {
      console.error('Error fetching PSN stats:', statsError);
      // Continue without stats data if it fails
    }
    
    // Return standardized profile data
    return {
      username: profileData.profile.onlineId || username,
      platform: 'PlayStation',
      avatar: profileData.profile.avatarUrls?.[0]?.avatarUrl || 'https://via.placeholder.com/150',
      lastOnline: formatLastOnline(profileData.profile.lastOnlineDate),
      stats: {
        about: profileData.profile.aboutMe || 'No information provided',
        trophyLevel: formatStatValue(profileData.profile.trophySummary?.level),
        ...(trophiesData.trophies ? {
          platinum: formatStatValue(countTrophyType(trophiesData.trophies, 'platinum')),
          gold: formatStatValue(countTrophyType(trophiesData.trophies, 'gold')),
          silver: formatStatValue(countTrophyType(trophiesData.trophies, 'silver')),
          bronze: formatStatValue(countTrophyType(trophiesData.trophies, 'bronze'))
        } : {}),
        ...(titlesData.titles ? {
          recentlyPlayed: formatStatValue(titlesData.titles.length)
        } : {})
      },
      // Include raw data for debugging or future expansion
      _rawData: {
        profile: profileData,
        trophies: trophiesData,
        titles: titlesData
      }
    };
  } catch (error) {
    console.error('PSN API error:', error);
    throw new Error('Failed to fetch PlayStation profile: ' + (error.message || 'Unknown error'));
  }
}

/**
 * Count trophies by type
 * @param {Array} trophies - Trophies array
 * @param {string} type - Trophy type (platinum, gold, silver, bronze)
 * @returns {number} - Count of trophies of the specified type
 */
function countTrophyType(trophies, type) {
  if (!trophies || !Array.isArray(trophies)) {
    return 0;
  }
  
  return trophies.filter(trophy => trophy.trophyType === type).length;
}

/**
 * Format last online status
 * @param {string} lastOnlineDate - Last online date
 * @returns {string} - Formatted status
 */
function formatLastOnline(lastOnlineDate) {
  if (!lastOnlineDate) {
    return 'Unknown';
  }
  
  const date = new Date(lastOnlineDate);
  return date.toLocaleString();
}

/**
 * Format stat value
 * @param {*} value - Value to format
 * @returns {string} - Formatted value
 */
function formatStatValue(value) {
  if (value === undefined || value === null) {
    return 'N/A';
  }
  
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  
  return value;
}

module.exports = {
  getProfile
}; 