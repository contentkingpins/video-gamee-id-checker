document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('gamertag-form');
    const results = document.getElementById('results');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');

    // API keys - in production these should be protected with a proxy
    const STEAM_API_KEY = 'STEAM_API_KEY_HERE';
    const FORTNITE_API_KEY = 'FORTNITE_API_KEY_HERE';
    
    // CORS proxy URL - for APIs that don't support CORS
    const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form data
        const username = document.getElementById('username').value.trim();
        const platform = document.getElementById('platform').value;
        
        // Validate input
        if (!username || !platform) {
            showError('Please enter a username and select a platform');
            return;
        }
        
        // Show loading indicator
        hideResults();
        loading.classList.remove('hidden');
        
        try {
            let profileData;
            
            // Call appropriate API based on platform
            switch (platform.toLowerCase()) {
                case 'steam':
                    profileData = await fetchSteamProfile(username);
                    break;
                case 'roblox':
                    profileData = await fetchRobloxProfile(username);
                    break;
                case 'epic':
                    profileData = await fetchFortniteProfile(username);
                    break;
                default:
                    throw new Error('Unsupported platform');
            }
            
            // Display results
            displayResults(profileData);
        } catch (err) {
            console.error('API Error:', err);
            showError(err.message || 'An error occurred while fetching the profile');
        } finally {
            loading.classList.add('hidden');
        }
    });
    
    // Steam profile fetch
    async function fetchSteamProfile(username) {
        // Step 1: Resolve vanity URL if username is not a SteamID64
        let steamId = username;
        
        if (isNaN(username)) {
            try {
                // May need CORS proxy in production
                const vanityResponse = await fetch(`${CORS_PROXY}http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${STEAM_API_KEY}&vanityurl=${encodeURIComponent(username)}`);
                
                if (!vanityResponse.ok) {
                    throw new Error('Failed to resolve Steam username');
                }
                
                const vanityData = await vanityResponse.json();
                
                if (vanityData.response.success !== 1) {
                    throw new Error('Could not find Steam profile');
                }
                
                steamId = vanityData.response.steamid;
            } catch (error) {
                console.error('Steam Vanity URL error:', error);
                throw new Error('Failed to find Steam profile');
            }
        }
        
        // Step 2: Get player summary using SteamID64
        try {
            const summaryResponse = await fetch(`${CORS_PROXY}http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`);
            
            if (!summaryResponse.ok) {
                throw new Error('Failed to fetch Steam profile');
            }
            
            const summaryData = await summaryResponse.json();
            
            if (!summaryData.response.players || summaryData.response.players.length === 0) {
                throw new Error('Steam profile not found');
            }
            
            const playerData = summaryData.response.players[0];
            
            // Format data for display
            return {
                username: playerData.personaname,
                platform: 'Steam',
                avatar: playerData.avatarfull,
                lastOnline: formatLastOnline(playerData.lastlogoff),
                stats: {
                    status: formatSteamStatus(playerData.personastate),
                    ...(playerData.realname ? { name: playerData.realname } : {}),
                    ...(playerData.timecreated ? { created: formatAccountAge(playerData.timecreated) } : {})
                }
            };
        } catch (error) {
            console.error('Steam API error:', error);
            throw new Error('Failed to fetch Steam profile');
        }
    }
    
    // Roblox profile fetch
    async function fetchRobloxProfile(username) {
        try {
            // Step 1: Get user ID from username
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
                throw new Error('Failed to find Roblox user');
            }
            
            const userData = await userIdResponse.json();
            
            if (!userData.data || userData.data.length === 0) {
                throw new Error('Roblox user not found');
            }
            
            const userId = userData.data[0].id;
            
            // Step 2: Get user details
            // May need CORS proxy in production
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
            
            // Step 4: Get presence/online status
            let lastOnline = 'Unknown';
            try {
                const presenceResponse = await fetch('https://presence.roblox.com/v1/presence/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userIds: [userId]
                    })
                });
                
                if (presenceResponse.ok) {
                    const presenceData = await presenceResponse.json();
                    
                    if (presenceData.userPresences && presenceData.userPresences.length > 0) {
                        const presence = presenceData.userPresences[0];
                        
                        if (presence.userPresenceType === 1) {
                            lastOnline = 'Online now';
                        } else if (presence.userPresenceType === 2) {
                            lastOnline = 'In Game';
                        } else if (presence.lastOnline) {
                            lastOnline = `Last online: ${new Date(presence.lastOnline).toLocaleString()}`;
                        }
                    }
                }
            } catch (err) {
                console.warn('Could not fetch Roblox presence:', err);
                // Continue without presence data
            }
            
            // Format data for display
            return {
                username: profileData.name,
                platform: 'Roblox',
                avatar: avatarUrl,
                lastOnline: lastOnline,
                stats: {
                    displayName: profileData.displayName || profileData.name,
                    created: new Date(profileData.created).toLocaleDateString(),
                    ...(profileData.description ? { bio: truncate(profileData.description, 50) } : {})
                }
            };
        } catch (error) {
            console.error('Roblox API error:', error);
            throw new Error('Failed to fetch Roblox profile: ' + error.message);
        }
    }
    
    // Fortnite profile fetch
    async function fetchFortniteProfile(username) {
        try {
            // Use fortnite-api.com
            const response = await fetch(`https://fortnite-api.com/v2/stats/br/v2?name=${encodeURIComponent(username)}`, {
                headers: {
                    'Authorization': FORTNITE_API_KEY
                }
            });
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Fortnite player not found');
                }
                throw new Error('Failed to fetch Fortnite profile');
            }
            
            const data = await response.json();
            
            if (!data.data) {
                throw new Error('No data returned from Fortnite API');
            }
            
            // Get account and battle royale stats
            const account = data.data.account;
            const stats = data.data.stats?.all?.overall;
            
            // Format data for display
            return {
                username: account.name,
                platform: 'Fortnite',
                avatar: 'https://fortnite-api.com/images/cosmetics/br/cid_001_athena_commando_f_default/icon.png', // Default
                lastOnline: 'Not available via API',
                stats: {
                    level: formatValue(data.data.battlePass?.level),
                    wins: formatValue(stats?.wins),
                    winRate: formatValue(stats?.winRate, '%'),
                    kills: formatValue(stats?.kills),
                    kd: formatValue(stats?.kd)
                }
            };
        } catch (error) {
            console.error('Fortnite API error:', error);
            throw new Error('Failed to fetch Fortnite profile: ' + error.message);
        }
    }
    
    function displayResults(data) {
        // Hide error if it was shown
        error.classList.add('hidden');
        
        // Create profile card
        results.innerHTML = `
            <div class="bg-white rounded-lg shadow-md overflow-hidden profile-card">
                <div class="p-4 bg-indigo-50 border-b flex items-center">
                    <img src="${data.avatar || 'https://via.placeholder.com/80'}" 
                         alt="Profile Avatar" 
                         class="w-20 h-20 rounded-full avatar">
                    <div class="ml-4">
                        <h2 class="text-xl font-bold text-gray-800">${data.username}</h2>
                        <div class="flex items-center mt-1">
                            <span class="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-medium">
                                ${data.platform}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="p-4">
                    ${data.lastOnline ? `
                    <div class="mb-3">
                        <h3 class="text-sm font-medium text-gray-500">Last Online</h3>
                        <p class="text-gray-700">${data.lastOnline}</p>
                    </div>` : ''}
                    
                    ${data.stats && Object.keys(data.stats).length > 0 ? `
                    <div>
                        <h3 class="text-sm font-medium text-gray-500 mb-2">Stats</h3>
                        <div class="flex flex-wrap">
                            ${Object.entries(data.stats).map(([key, value]) => 
                                `<div class="stat-badge">
                                    <span class="font-semibold mr-1">${key}:</span> ${value}
                                </div>`
                            ).join('')}
                        </div>
                    </div>` : ''}
                </div>
            </div>
        `;
        
        // Show results
        results.classList.remove('hidden');
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        error.classList.remove('hidden');
        results.classList.add('hidden');
        loading.classList.add('hidden');
    }
    
    function hideResults() {
        results.classList.add('hidden');
        error.classList.add('hidden');
    }
    
    // Utility functions
    function formatLastOnline(timestamp) {
        if (!timestamp) return 'Unknown';
        
        const date = new Date(timestamp * 1000);
        return date.toLocaleString();
    }
    
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
    
    function formatSteamStatus(state) {
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
    
    function truncate(str, maxLength) {
        if (!str) return '';
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength) + '...';
    }
    
    function formatValue(value, suffix = '') {
        if (value === undefined || value === null) {
            return 'N/A';
        }
        
        if (typeof value === 'number') {
            return value.toLocaleString() + suffix;
        }
        
        return value + suffix;
    }
}); 