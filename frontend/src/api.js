import CONFIG from './config.js';

/**
 * API Handlers for Gaming Platforms
 * Each handler follows the same pattern:
 * 1. Take a username parameter
 * 2. Make API calls to our backend, which handles external API requests
 * 3. Return a standardized profile object with data displayed in-app
 * 
 * Standard Profile Object Format:
 * {
 *   username: string,
 *   platform: string,
 *   profileUrl: string, // Only for "View Full Profile" button
 *   avatar: string (URL),
 *   lastOnline: string,
 *   stats: { [key: string]: string|number },
 *   additionalInfo: string (optional HTML content)
 * }
 */

// Helper function to get the API base URL based on environment
function getApiBaseUrl() {
  // In production, this would use the actual domain
  if (typeof window !== 'undefined') {
    const host = window.location.host;
    
    // For local development
    if (host.includes('localhost')) {
      return window.location.port === '8000' ? 'http://localhost:3000' : '';
    }
    
    // For production, use relative URLs
    return '';
  }
  
  return ''; // Default to relative URLs for API calls
}

const API_BASE_URL = getApiBaseUrl();

/**
 * Steam Profile Lookup - uses backend API endpoint
 * @param {string} username - Steam username or SteamID64
 * @returns {Promise<Object>} - Standardized profile object
 */
export async function getSteamProfile(username) {
  try {
    console.log('Getting Steam profile for:', username);
    
    // Use our backend API endpoint instead of CORS proxy
    const response = await fetch(`${API_BASE_URL}/api/steam/${encodeURIComponent(username)}`);
    
    if (!response.ok) {
      console.error('Steam API response not OK:', response.status, response.statusText);
      throw new Error(`Steam profile not found (${response.status})`);
    }
    
    const xmlText = await response.text();
    console.log('Steam API response received, length:', xmlText.length);
    
    if (xmlText.length < 50) {
      console.error('Steam API response too short:', xmlText);
      throw new Error('Invalid Steam profile data received');
    }
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Check if profile exists
    const error = xmlDoc.querySelector("error");
    if (error) {
      console.error('Steam profile error in XML:', error.textContent);
      throw new Error('Steam profile not found');
    }
    
    // Parse basic profile info
    const steamID64 = xmlDoc.querySelector("steamID64")?.textContent;
    const steamID = xmlDoc.querySelector("steamID")?.textContent;
    const avatarFull = xmlDoc.querySelector("avatarFull")?.textContent;
    const onlineState = xmlDoc.querySelector("onlineState")?.textContent;
    const memberSince = xmlDoc.querySelector("memberSince")?.textContent;
    const location = xmlDoc.querySelector("location")?.textContent;
    const realName = xmlDoc.querySelector("realname")?.textContent;
    const stateMessage = xmlDoc.querySelector("stateMessage")?.textContent;
    
    // If we don't even get a basic steamID, the profile doesn't exist
    if (!steamID && !steamID64) {
      console.error('Steam profile missing essential data');
      throw new Error('Steam profile data incomplete');
    }
    
    // Construct profile URL for direct link
    let profileUrl = isNaN(username) 
      ? `${CONFIG.PROFILE_URLS.STEAM}${encodeURIComponent(username)}` 
      : `${CONFIG.PROFILE_URLS.STEAM_ID}${encodeURIComponent(username)}`;
    
    // Try to get game info if available
    let gameInfo = {};
    const inGameInfo = xmlDoc.querySelector("inGameInfo");
    if (inGameInfo) {
      const gameName = inGameInfo.querySelector("gameName")?.textContent;
      const gameLink = inGameInfo.querySelector("gameLink")?.textContent;
      if (gameName) {
        gameInfo = {
          currentlyPlaying: gameName,
          gameLink: gameLink || null
        };
      }
    }
    
    console.log('Steam profile found:', steamID || username);
    
    return {
      username: steamID || username,
      platform: 'Steam',
      profileUrl: profileUrl,
      avatar: avatarFull || CONFIG.DEFAULT_AVATARS.STEAM,
      lastOnline: onlineState || 'Unknown',
      stats: {
        id: steamID64 || 'Not found',
        ...(memberSince ? { memberSince } : {}),
        ...(location ? { location } : {}),
        ...(realName ? { realName } : {}),
        ...(stateMessage ? { status: stateMessage } : {}),
        ...(gameInfo.currentlyPlaying ? { playing: gameInfo.currentlyPlaying } : {})
      },
      fetchType: 'full'
    };
  } catch (error) {
    console.error('Steam lookup error:', error);
    throw new Error(`Could not find Steam profile: ${error.message}`);
  }
}

/**
 * Roblox Profile Lookup - uses backend API
 * @param {string} username - Roblox username
 * @returns {Promise<Object>} - Standardized profile object
 */
export async function getRobloxProfile(username) {
  try {
    // Step 1: Get user ID from username using our backend API
    const userIdResponse = await fetch(`${API_BASE_URL}/api/roblox/usernames`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        usernames: [username],
        excludeBannedUsers: true
      })
    });
    
    if (!userIdResponse.ok) {
      throw new Error('Roblox user not found');
    }
    
    const userData = await userIdResponse.json();
    
    if (!userData.data || userData.data.length === 0) {
      throw new Error('Roblox user not found');
    }
    
    const userId = userData.data[0].id;
    const profileUrl = `${CONFIG.PROFILE_URLS.ROBLOX}${userId}`;
    
    // Step 2: Get user details from our backend API
    const profileResponse = await fetch(`${API_BASE_URL}/api/roblox/users/${userId}`);
    
    if (!profileResponse.ok) {
      throw new Error('Failed to fetch Roblox profile');
    }
    
    const profileData = await profileResponse.json();
    
    // Step 3: Get thumbnail for avatar from our backend API
    const thumbnailResponse = await fetch(`${API_BASE_URL}/api/roblox/thumbnails/${userId}`);
    const thumbnailData = await thumbnailResponse.json();
    
    let avatarUrl = CONFIG.DEFAULT_AVATARS.ROBLOX;
    
    if (thumbnailData.data && thumbnailData.data.length > 0) {
      avatarUrl = thumbnailData.data[0].imageUrl;
    }
    
    // Step 4: Try to get friends count from our backend API
    let friendsCount = 'Not available';
    try {
      const friendsResponse = await fetch(`${API_BASE_URL}/api/roblox/friends/${userId}/count`);
      if (friendsResponse.ok) {
        const friendsData = await friendsResponse.json();
        friendsCount = friendsData.count.toString();
      }
    } catch (err) {
      console.warn('Could not fetch Roblox friends count:', err);
    }
    
    // Format data for display
    return {
      username: profileData.name,
      platform: 'Roblox',
      profileUrl: profileUrl,
      avatar: avatarUrl,
      lastOnline: 'Not available from API',
      stats: {
        displayName: profileData.displayName || profileData.name,
        created: new Date(profileData.created).toLocaleDateString(),
        id: userId,
        friends: friendsCount,
        ...(profileData.description ? { bio: truncate(profileData.description, 50) } : {})
      },
      fetchType: 'full'
    };
  } catch (error) {
    console.error('Roblox lookup error:', error);
    throw new Error(`Could not find Roblox profile: ${error.message}`);
  }
}

/**
 * Fortnite/Epic Games Profile Lookup - attempts to get data from API
 * @param {string} username - Epic Games username
 * @returns {Promise<Object>} - Standardized profile object
 */
export async function getFortniteProfile(username) {
  try {
    // First, attempt to check if user exists via a CORS-friendly endpoint
    // Direct API access is limited, so we'll provide basic info
    const profileUrl = `${CONFIG.TRACKERS.FORTNITE}${encodeURIComponent(username)}`;
    
    // Since we can't directly access the Fortnite API from the front-end,
    // we'll create a profile card with basic information
    return {
      username: username,
      platform: 'Epic Games',
      profileUrl: profileUrl,
      avatar: CONFIG.DEFAULT_AVATARS.EPIC,
      lastOnline: 'Info unavailable from API',
      stats: {
        username: username,
        platform: 'Epic Games / Fortnite',
        accountType: 'Epic Account',
        note: 'Epic Games keeps profile data private'
      },
      additionalInfo: `
        <div class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p class="text-sm text-amber-800">Epic Games doesn't provide public API access to player data.</p>
          <p class="text-sm mt-1">To view your Fortnite stats, click the "View Full Profile" button below.</p>
        </div>
      `,
      fetchType: 'limited'
    };
  } catch (error) {
    console.error('Epic Games lookup error:', error);
    throw new Error('Could not find Epic Games profile');
  }
}

/**
 * Xbox Profile Lookup - provides basic profile info
 * @param {string} gamertag - Xbox gamertag
 * @returns {Promise<Object>} - Standardized profile object
 */
export async function getXboxProfile(gamertag) {
  try {
    // Xbox Live doesn't offer public API access without authentication
    // We'll provide basic profile information with a link to Xbox profile
    const profileUrl = `${CONFIG.PROFILE_URLS.XBOX}${encodeURIComponent(gamertag)}`;
    
    // Check if gamertag exists by checking for error responses
    // Xbox doesn't provide an easy public way to validate gamertags
    
    return {
      username: gamertag,
      platform: 'Xbox',
      profileUrl: profileUrl,
      avatar: CONFIG.DEFAULT_AVATARS.XBOX,
      lastOnline: 'Info unavailable from API',
      stats: {
        gamertag: gamertag,
        platform: 'Xbox Live',
        note: 'Xbox requires authentication for player data'
      },
      additionalInfo: `
        <div class="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
          <p class="text-sm text-green-800">Xbox Live data requires Microsoft authentication.</p>
          <p class="text-sm mt-1">To view your Xbox profile, click the "View Full Profile" button below.</p>
        </div>
      `,
      fetchType: 'limited'
    };
  } catch (error) {
    console.error('Xbox profile lookup error:', error);
    throw new Error('Could not find Xbox profile');
  }
}

/**
 * PlayStation Network Profile Lookup
 * @param {string} psnId - PSN ID
 * @returns {Promise<Object>} - Standardized profile object
 */
export async function getPSNProfile(psnId) {
  try {
    // PSN doesn't offer public API access without authentication
    // We'll provide basic profile information with a link to PSN profile
    const profileUrl = `${CONFIG.PROFILE_URLS.PSN}${encodeURIComponent(psnId)}`;
    
    return {
      username: psnId,
      platform: 'PlayStation',
      profileUrl: profileUrl,
      avatar: CONFIG.DEFAULT_AVATARS.PSN,
      lastOnline: 'Info unavailable from API',
      stats: {
        psnId: psnId,
        platform: 'PlayStation Network',
        note: 'PSN requires authentication for player data'
      },
      additionalInfo: `
        <div class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p class="text-sm text-blue-800">PlayStation Network data requires Sony authentication.</p>
          <p class="text-sm mt-1">To view your PSN profile, click the "View Full Profile" button below.</p>
        </div>
      `,
      fetchType: 'limited'
    };
  } catch (error) {
    console.error('PSN profile lookup error:', error);
    throw new Error('Could not find PlayStation profile');
  }
}

/**
 * Activision/CoD Profile Lookup - uses public endpoints
 * @param {string} username - Activision ID
 * @returns {Promise<Object>} - Standardized profile object
 */
export async function getActivisionProfile(username) {
  try {
    // For CoD/Activision, we'll try to get some basic profile information
    // without redirecting, using the public endpoints
    
    // We'll need the profile URL for the "View Full Profile" button
    const profileUrl = `${CONFIG.TRACKERS.COD}${encodeURIComponent(username)}`;
    
    // Since we can't directly access the Activision API from the front-end,
    // we'll create a profile card with basic information
    return {
      username: username,
      platform: 'Activision',
      profileUrl: profileUrl,
      avatar: CONFIG.DEFAULT_AVATARS.ACTIVISION,
      lastOnline: 'Info unavailable from API',
      stats: {
        username: username,
        platform: 'Call of Duty / Warzone',
        accountType: 'Activision Account',
        note: 'Activision keeps profile data private'
      },
      additionalInfo: `
        <div class="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-md">
          <p class="text-sm text-orange-800">Activision doesn't provide public API access to player data.</p>
          <p class="text-sm mt-1">To view your Call of Duty stats, click the "View Full Profile" button below.</p>
        </div>
      `,
      fetchType: 'limited'
    };
  } catch (error) {
    console.error('Activision profile error:', error);
    throw new Error('Could not find Activision profile');
  }
}

/**
 * Utility functions
 */
function truncate(str, maxLength) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
}

export default {
  getSteamProfile,
  getRobloxProfile,
  getFortniteProfile,
  getXboxProfile,
  getPSNProfile,
  getActivisionProfile
}; 