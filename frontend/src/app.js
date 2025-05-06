// Import API functions from api.js
import { getSteamProfile, getRobloxProfile, getFortniteProfile, getXboxProfile, getActivisionProfile } from './api.js';
import CONFIG from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    const multiForm = document.getElementById('multi-gamertag-form');
    const allResults = document.getElementById('all-results');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');

    // Cache to store previously looked up profiles
    const profileCache = {};

    multiForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get all gamertags from the form
        const steamUsername = document.getElementById('steam-username').value.trim();
        const xboxUsername = document.getElementById('xbox-username').value.trim();
        const psnUsername = document.getElementById('psn-username').value.trim();
        const epicUsername = document.getElementById('epic-username').value.trim();
        const robloxUsername = document.getElementById('roblox-username').value.trim();
        const activisionUsername = document.getElementById('activision-username').value.trim();
        
        // Validate that at least one username is entered
        if (!steamUsername && !xboxUsername && !psnUsername && !epicUsername && !robloxUsername && !activisionUsername) {
            showError('Please enter at least one username');
            return;
        }
        
        // Show loading indicator
        hideResults();
        loading.classList.remove('hidden');
        
        // Create an array to hold all profile fetch promises
        const profilePromises = [];
        
        // Add promises for each platform if username is provided
        if (steamUsername) {
            const cacheKey = `steam:${steamUsername}`;
            if (profileCache[cacheKey]) {
                profilePromises.push(Promise.resolve(profileCache[cacheKey]));
            } else {
                profilePromises.push(
                    getSteamProfile(steamUsername)
                        .then(profile => {
                            profileCache[cacheKey] = profile;
                            return profile;
                        })
                        .catch(err => {
                            console.error('Steam error:', err);
                            return { error: true, platform: 'Steam', message: err.message };
                        })
                );
            }
        }
        
        if (xboxUsername) {
            const cacheKey = `xbox:${xboxUsername}`;
            if (profileCache[cacheKey]) {
                profilePromises.push(Promise.resolve(profileCache[cacheKey]));
            } else {
                profilePromises.push(
                    getXboxProfile(xboxUsername)
                        .then(profile => {
                            profileCache[cacheKey] = profile;
                            return profile;
                        })
                        .catch(err => {
                            console.error('Xbox error:', err);
                            return { error: true, platform: 'Xbox', message: err.message };
                        })
                );
            }
        }
        
        if (psnUsername) {
            // Use Xbox as PSN handler for now as example
            const cacheKey = `psn:${psnUsername}`;
            if (profileCache[cacheKey]) {
                profilePromises.push(Promise.resolve(profileCache[cacheKey]));
            } else {
                const profile = {
                    username: psnUsername,
                    platform: 'PlayStation',
                    profileUrl: `https://psnprofiles.com/${encodeURIComponent(psnUsername)}`,
                    avatar: 'https://image.api.playstation.com/cdn/avatar/default/default-avatar.png',
                    lastOnline: 'See on PSN Profiles',
                    stats: {
                        info: 'View your profile on PSN Profiles'
                    }
                };
                profileCache[cacheKey] = profile;
                profilePromises.push(Promise.resolve(profile));
            }
        }
        
        if (epicUsername) {
            const cacheKey = `epic:${epicUsername}`;
            if (profileCache[cacheKey]) {
                profilePromises.push(Promise.resolve(profileCache[cacheKey]));
            } else {
                profilePromises.push(
                    getFortniteProfile(epicUsername)
                        .then(profile => {
                            profileCache[cacheKey] = profile;
                            return profile;
                        })
                        .catch(err => {
                            console.error('Epic error:', err);
                            return { error: true, platform: 'Epic Games', message: err.message };
                        })
                );
            }
        }
        
        if (robloxUsername) {
            const cacheKey = `roblox:${robloxUsername}`;
            if (profileCache[cacheKey]) {
                profilePromises.push(Promise.resolve(profileCache[cacheKey]));
            } else {
                profilePromises.push(
                    getRobloxProfile(robloxUsername)
                        .then(profile => {
                            profileCache[cacheKey] = profile;
                            return profile;
                        })
                        .catch(err => {
                            console.error('Roblox error:', err);
                            return { error: true, platform: 'Roblox', message: err.message };
                        })
                );
            }
        }
        
        if (activisionUsername) {
            const cacheKey = `activision:${activisionUsername}`;
            if (profileCache[cacheKey]) {
                profilePromises.push(Promise.resolve(profileCache[cacheKey]));
            } else {
                profilePromises.push(
                    getActivisionProfile(activisionUsername)
                        .then(profile => {
                            profileCache[cacheKey] = profile;
                            return profile;
                        })
                        .catch(err => {
                            console.error('Activision error:', err);
                            return { error: true, platform: 'Activision', message: err.message };
                        })
                );
            }
        }
        
        try {
            // Wait for all promises to resolve
            const profiles = await Promise.all(profilePromises);
            
            // Display all profiles
            displayAllProfiles(profiles);
        } catch (err) {
            console.error('Profile fetch error:', err);
            showError('An error occurred while fetching profiles');
        } finally {
            loading.classList.add('hidden');
        }
    });
    
    function displayAllProfiles(profiles) {
        // Hide error if it was shown
        error.classList.add('hidden');
        
        // Clear existing results
        allResults.innerHTML = '';
        
        // Display each profile
        profiles.forEach(profile => {
            if (profile.error) {
                // Display error card for this platform
                allResults.innerHTML += `
                    <div class="bg-red-50 rounded-lg shadow-md overflow-hidden profile-card">
                        <div class="p-4 bg-red-100 border-b">
                            <h2 class="text-xl font-bold text-red-800">${profile.platform} Error</h2>
                        </div>
                        <div class="p-4">
                            <p class="text-red-700">${profile.message || 'Could not find profile'}</p>
                        </div>
                    </div>
                `;
            } else {
                // Create profile card
                allResults.innerHTML += `
                    <div class="bg-white rounded-lg shadow-md overflow-hidden profile-card">
                        <div class="p-4 bg-indigo-50 border-b flex items-center">
                            <img src="${profile.avatar || 'https://via.placeholder.com/80'}" 
                                 alt="Profile Avatar" 
                                 class="w-16 h-16 rounded-full avatar">
                            <div class="ml-4">
                                <h2 class="text-lg font-bold text-gray-800">${profile.username}</h2>
                                <div class="flex items-center mt-1">
                                    <span class="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium">
                                        ${profile.platform}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="p-4">
                            ${profile.lastOnline ? `
                            <div class="mb-3">
                                <h3 class="text-sm font-medium text-gray-500">Last Online</h3>
                                <p class="text-gray-700">${profile.lastOnline}</p>
                            </div>` : ''}
                            
                            ${profile.stats && Object.keys(profile.stats).length > 0 ? `
                            <div>
                                <h3 class="text-sm font-medium text-gray-500 mb-2">Stats</h3>
                                <div class="flex flex-wrap">
                                    ${Object.entries(profile.stats).map(([key, value]) => 
                                        `<div class="stat-badge">
                                            <span class="font-semibold mr-1">${key}:</span> ${value}
                                        </div>`
                                    ).join('')}
                                </div>
                            </div>` : ''}
                            
                            ${profile.profileUrl ? `
                            <div class="mt-4">
                                <a href="${profile.profileUrl}" target="_blank" 
                                   class="bg-indigo-600 text-white px-4 py-2 rounded-md inline-block hover:bg-indigo-700 transition-colors text-sm">
                                   View Full Profile
                                </a>
                            </div>` : ''}
                        </div>
                    </div>
                `;
            }
        });
        
        // Show results
        allResults.classList.remove('hidden');
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        error.classList.remove('hidden');
        allResults.classList.add('hidden');
        loading.classList.add('hidden');
    }
    
    function hideResults() {
        allResults.classList.add('hidden');
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