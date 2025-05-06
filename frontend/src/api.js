import CONFIG from './config.js';

/**
 * API Handlers for Gaming Platforms
 * Each handler follows the same pattern:
 * 1. Take a username parameter
 * 2. Make public API calls or get data from tracker websites
 * 3. Return a standardized profile object
 * 
 * Standard Profile Object Format:
 * {
 *   username: string,
 *   platform: string,
 *   profileUrl: string,
 *   avatar: string (URL),
 *   lastOnline: string,
 *   stats: { [key: string]: string|number }
 * }
 */

/**
 * Steam Profile Lookup - uses public Steam API and community site
 * @param {string} username - Steam username or SteamID64
 * @returns {Promise<Object>} - Standardized profile object
 */
export async function getSteamProfile(username) {
  try {
    // First try to get public profile info from Steam community site (XML)
    let profileUrl = isNaN(username) 
      ? `${CONFIG.PROFILE_URLS.STEAM}${encodeURIComponent(username)}` 
      : `${CONFIG.PROFILE_URLS.STEAM_ID}${encodeURIComponent(username)}`;
    
    const response = await fetch(`${CONFIG.CORS_PROXY}${profileUrl}?xml=1`);
    
    if (!response.ok) {
      throw new Error('Steam profile not found');
    }
    
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Check if profile exists
    const error = xmlDoc.querySelector("error");
    if (error) {
      throw new Error('Steam profile not found');
    }
    
    // Parse basic profile info
    const steamID64 = xmlDoc.querySelector("steamID64")?.textContent;
    const steamID = xmlDoc.querySelector("steamID")?.textContent;
    const avatarFull = xmlDoc.querySelector("avatarFull")?.textContent;
    const onlineState = xmlDoc.querySelector("onlineState")?.textContent;
    const memberSince = xmlDoc.querySelector("memberSince")?.textContent;
    const location = xmlDoc.querySelector("location")?.textContent;
    
    return {
      username: steamID || username,
      platform: 'Steam',
      profileUrl: profileUrl,
      avatar: avatarFull || 'https://avatars.cloudflare.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
      lastOnline: onlineState || 'Unknown',
      stats: {
        id: steamID64 || 'Not found',
        ...(memberSince ? { memberSince } : {}),
        ...(location ? { location } : {})
      }
    };
  } catch (error) {
    console.error('Steam lookup error:', error);
    throw new Error('Could not find Steam profile');
  }
}

/**
 * Roblox Profile Lookup - uses public Roblox API
 * @param {string} username - Roblox username
 * @returns {Promise<Object>} - Standardized profile object
 */
export async function getRobloxProfile(username) {
  try {
    // Step 1: Get user ID from username using public API
    const userIdResponse = await fetch('https://users.roblox.com/v1/usernames/users', {
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
    
    // Step 2: Get user details
    const profileResponse = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    
    if (!profileResponse.ok) {
      throw new Error('Failed to fetch Roblox profile');
    }
    
    const profileData = await profileResponse.json();
    
    // Step 3: Get thumbnail for avatar
    const thumbnailResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png`);
    const thumbnailData = await thumbnailResponse.json();
    
    let avatarUrl = 'https://tr.rbxcdn.com/9f242fee04192a0f71d1ddb0d4cf32b6/420/420/Image/Png';  // Default
    
    if (thumbnailData.data && thumbnailData.data.length > 0) {
      avatarUrl = thumbnailData.data[0].imageUrl;
    }
    
    // Format data for display
    return {
      username: profileData.name,
      platform: 'Roblox',
      profileUrl: profileUrl,
      avatar: avatarUrl,
      lastOnline: 'Not available',
      stats: {
        displayName: profileData.displayName || profileData.name,
        created: new Date(profileData.created).toLocaleDateString(),
        ...(profileData.description ? { bio: truncate(profileData.description, 50) } : {})
      }
    };
  } catch (error) {
    console.error('Roblox lookup error:', error);
    throw new Error('Could not find Roblox profile');
  }
}

/**
 * Fortnite/Epic Games Profile Lookup - uses public Fortnite Tracker
 * @param {string} username - Epic Games username
 * @returns {Promise<Object>} - Standardized profile object
 */
export async function getFortniteProfile(username) {
  // Redirect to tracker site (can't get data directly due to CORS/captcha issues)
  const profileUrl = `${CONFIG.TRACKERS.FORTNITE}${encodeURIComponent(username)}`;
  
  return {
    username: username,
    platform: 'Epic Games',
    profileUrl: profileUrl,
    avatar: 'https://cdn2.unrealengine.com/15br-bplogo-battle-pass-red-blue-1024x1024-1025x1024-432870180.png',
    lastOnline: 'See profile on Fortnite Tracker',
    stats: {
      info: 'View detailed stats on Fortnite Tracker'
    }
  };
}

/**
 * Xbox Profile Lookup - redirect to official Xbox site
 * @param {string} gamertag - Xbox gamertag
 * @returns {Promise<Object>} - Standardized profile object
 */
export async function getXboxProfile(gamertag) {
  const profileUrl = `${CONFIG.PROFILE_URLS.XBOX}${encodeURIComponent(gamertag)}`;
  
  return {
    username: gamertag,
    platform: 'Xbox',
    profileUrl: profileUrl,
    avatar: 'https://www.xbox.com/etc.clientlibs/global/clientlibs/clientlib-xbox/resources/images/xbox-logo.png',
    lastOnline: 'See official profile',
    stats: {
      info: 'View your profile on the official Xbox site'
    }
  };
}

/**
 * Activision/CoD Profile Lookup - redirects to CoD Tracker
 * @param {string} username - Activision ID
 * @returns {Promise<Object>} - Standardized profile object
 */
export async function getActivisionProfile(username) {
  const profileUrl = `${CONFIG.TRACKERS.COD}${encodeURIComponent(username)}`;
  
  return {
    username: username,
    platform: 'Activision',
    profileUrl: profileUrl,
    avatar: 'https://www.callofduty.com/content/dam/activision/callofduty/global/fontscolors/cod-logo-white.png',
    lastOnline: 'See profile on CoD Tracker',
    stats: {
      info: 'View detailed stats on CoD Tracker'
    }
  };
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
  getActivisionProfile
}; 