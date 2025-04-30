const axios = require('axios');

/**
 * Get Roblox profile by username
 * @param {string} username - Roblox username
 * @returns {Promise<Object>} - Profile data in standardized format
 */
async function getProfile(username) {
  try {
    // First get the user ID from username
    const userId = await getUserIdFromUsername(username);
    
    if (!userId) {
      throw new Error('User not found');
    }
    
    // Get user details
    const userDetails = await getUserDetails(userId);
    
    // Get user's last online status
    const lastOnline = await getLastOnline(userId);
    
    // Get user's game badges count (achievement-like stats)
    const badgesCount = await getBadgesCount(userId);
    
    // Get user's friends count
    const friendsCount = await getFriendsCount(userId);
    
    // Return standardized profile data
    return {
      username: userDetails.name,
      platform: 'Roblox',
      avatar: userDetails.avatar,
      lastOnline: lastOnline,
      stats: {
        displayName: userDetails.displayName || userDetails.name,
        friends: friendsCount,
        badges: badgesCount,
        created: formatCreatedDate(userDetails.created),
        ...(userDetails.description ? { bio: truncate(userDetails.description, 50) } : {})
      },
      // Include raw data for debugging or future expansion
      _rawData: {
        roblox: userDetails
      }
    };
  } catch (error) {
    console.error('Roblox API error:', error);
    throw new Error('Failed to fetch Roblox profile: ' + (error.message || 'Unknown error'));
  }
}

/**
 * Get user ID from username
 * @param {string} username - Roblox username
 * @returns {Promise<string|null>} - User ID or null if not found
 */
async function getUserIdFromUsername(username) {
  try {
    const response = await axios.post('https://users.roblox.com/v1/usernames/users', {
      usernames: [username],
      excludeBannedUsers: true
    });
    
    if (response.data.data && response.data.data.length > 0) {
      return response.data.data[0].id;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting Roblox user ID:', error);
    throw new Error('Failed to get Roblox user ID');
  }
}

/**
 * Get user details
 * @param {string} userId - Roblox user ID
 * @returns {Promise<Object>} - User details
 */
async function getUserDetails(userId) {
  try {
    // Get basic user info
    const userResponse = await axios.get(`https://users.roblox.com/v1/users/${userId}`);
    
    // Get thumbnail (avatar)
    const thumbnailResponse = await axios.get(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png`);
    
    let avatar = 'https://tr.rbxcdn.com/9f242fee04192a0f71d1ddb0d4cf32b6/420/420/Image/Png';  // Default avatar
    
    if (thumbnailResponse.data && thumbnailResponse.data.data && thumbnailResponse.data.data.length > 0) {
      avatar = thumbnailResponse.data.data[0].imageUrl;
    }
    
    return {
      ...userResponse.data,
      avatar: avatar
    };
  } catch (error) {
    console.error('Error getting Roblox user details:', error);
    throw new Error('Failed to get Roblox user details');
  }
}

/**
 * Get the last online status
 * @param {string} userId - Roblox user ID
 * @returns {Promise<string>} - Last online status
 */
async function getLastOnline(userId) {
  try {
    const response = await axios.post('https://presence.roblox.com/v1/presence/users', {
      userIds: [userId]
    });
    
    if (response.data && response.data.userPresences && response.data.userPresences.length > 0) {
      const presence = response.data.userPresences[0];
      
      if (presence.userPresenceType === 1) {
        return 'Online now';
      } else if (presence.userPresenceType === 2) {
        return 'In Game';
      } else if (presence.lastOnline) {
        return `Last online: ${new Date(presence.lastOnline).toLocaleString()}`;
      }
    }
    
    return 'Unknown';
  } catch (error) {
    console.error('Error getting Roblox last online status:', error);
    return 'Unknown';
  }
}

/**
 * Get badges count
 * @param {string} userId - Roblox user ID
 * @returns {Promise<number>} - Badges count
 */
async function getBadgesCount(userId) {
  try {
    const response = await axios.get(`https://badges.roblox.com/v1/users/${userId}/badges?limit=10&sortOrder=Desc`);
    
    if (response.data && response.data.totalCount !== undefined) {
      return response.data.totalCount;
    }
    
    return 0;
  } catch (error) {
    console.error('Error getting Roblox badges count:', error);
    return 0;
  }
}

/**
 * Get friends count
 * @param {string} userId - Roblox user ID
 * @returns {Promise<number>} - Friends count
 */
async function getFriendsCount(userId) {
  try {
    const response = await axios.get(`https://friends.roblox.com/v1/users/${userId}/friends/count`);
    
    if (response.data && response.data.count !== undefined) {
      return response.data.count;
    }
    
    return 0;
  } catch (error) {
    console.error('Error getting Roblox friends count:', error);
    return 0;
  }
}

/**
 * Format created date
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatCreatedDate(dateString) {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

/**
 * Truncate a string if it's too long
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated string
 */
function truncate(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

module.exports = {
  getProfile
}; 