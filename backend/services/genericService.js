/**
 * Generic service for platforms that don't have direct API support yet
 * This is a placeholder that can be expanded with actual APIs as they're added
 */

/**
 * Get generic profile by username and platform
 * @param {string} username - Username
 * @param {string} platform - Platform (xbox, psn, activision)
 * @returns {Promise<Object>} - Profile data in standardized format
 */
async function getProfile(username, platform) {
  try {
    // In a real implementation, this would call platform-specific APIs
    // For now, we'll just return mock data
    
    return {
      username: username,
      platform: formatPlatformName(platform),
      avatar: getPlatformDefaultAvatar(platform),
      lastOnline: 'API not implemented',
      stats: {
        note: 'Demo mode - API not yet implemented',
        platform: formatPlatformName(platform)
      }
    };
  } catch (error) {
    console.error(`${platform} API error:`, error);
    throw new Error(`Failed to fetch ${platform} profile: API not yet implemented`);
  }
}

/**
 * Format platform name for display
 * @param {string} platform - Platform code
 * @returns {string} - Formatted platform name
 */
function formatPlatformName(platform) {
  const platforms = {
    'xbox': 'Xbox',
    'psn': 'PlayStation',
    'activision': 'Activision'
  };
  
  return platforms[platform] || platform;
}

/**
 * Get default avatar for a platform
 * @param {string} platform - Platform
 * @returns {string} - URL to default avatar
 */
function getPlatformDefaultAvatar(platform) {
  const avatars = {
    'xbox': 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fpngimg.com%2Fuploads%2Fxbox%2Fxbox_PNG17.png',
    'psn': 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2F0%2F05%2FPlayStation_logo.svg%2F2000px-PlayStation_logo.svg.png',
    'activision': 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2F0%2F05%2FActivision_Logo.svg%2F1200px-Activision_Logo.svg.png'
  };
  
  return avatars[platform] || 'https://via.placeholder.com/150';
}

module.exports = {
  getProfile
}; 