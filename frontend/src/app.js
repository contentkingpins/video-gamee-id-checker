// Import API functions from api.js
import { getSteamProfile, getRobloxProfile, getFortniteProfile, getXboxProfile, getPSNProfile, getActivisionProfile } from './api.js';
import CONFIG from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - App initialized');
    const singleForm = document.getElementById('single-gamertag-form');
    const allResults = document.getElementById('all-results');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');
    const gamertagInput = document.getElementById('gamertag');

    // Cache to store previously looked up profiles
    const profileCache = {};

    singleForm.addEventListener('submit', async (e) => {
        console.log('Form submitted');
        e.preventDefault();
        
        // Get the gamertag from the form
        const gamertag = gamertagInput.value.trim();
        console.log('Gamertag entered:', gamertag);
        
        // Validate that a gamertag is entered
        if (!gamertag) {
            showError('Please enter a gamertag');
            return;
        }
        
        // Show loading indicator
        hideResults();
        loading.classList.remove('hidden');
        error.classList.add('hidden');
        
        // Create an array to hold all profile fetch promises
        const profilePromises = [];
        
        // Check the gamertag on all platforms
        const platforms = [
            { name: 'Steam', handler: getSteamProfile },
            { name: 'Roblox', handler: getRobloxProfile },
            { name: 'Epic Games', handler: getFortniteProfile },
            { name: 'Xbox', handler: getXboxProfile },
            { name: 'PlayStation', handler: getPSNProfile },
            { name: 'Activision', handler: getActivisionProfile }
        ];
        
        console.log('Starting API calls for all platforms');
        
        // Create a promise for each platform
        platforms.forEach(platform => {
            const cacheKey = `${platform.name.toLowerCase()}:${gamertag}`;
            console.log(`Checking ${platform.name} for gamertag: ${gamertag}`);
            
            if (profileCache[cacheKey]) {
                console.log(`Using cached result for ${platform.name}`);
                profilePromises.push(Promise.resolve(profileCache[cacheKey]));
            } else {
                profilePromises.push(
                    platform.handler(gamertag)
                        .then(profile => {
                            console.log(`${platform.name} profile fetched successfully:`, profile);
                            profileCache[cacheKey] = profile;
                            return profile;
                        })
                        .catch(err => {
                            console.error(`${platform.name} error:`, err);
                            return { 
                                error: true, 
                                platform: platform.name, 
                                message: err.message || 'Error fetching profile',
                                gamertag: gamertag 
                            };
                        })
                );
            }
        });
        
        try {
            console.log('Waiting for all profile promises to resolve');
            // Wait for all promises to resolve
            const profiles = await Promise.allSettled(profilePromises);
            console.log('All profiles fetched:', profiles);
            
            // Convert any rejected promises to error objects
            const finalProfiles = profiles.map((result, index) => {
                if (result.status === 'fulfilled') {
                    return result.value;
                } else {
                    console.error(`Promise rejected for ${platforms[index].name}:`, result.reason);
                    return {
                        error: true,
                        platform: platforms[index].name,
                        message: result.reason?.message || 'Failed to fetch profile',
                        gamertag: gamertag
                    };
                }
            });
            
            // Filter out profiles with errors unless all have errors
            const successfulProfiles = finalProfiles.filter(profile => !profile.error);
            console.log(`Found ${successfulProfiles.length} successful profiles`);
            
            if (successfulProfiles.length > 0) {
                // Display successful profiles first, then errors
                displayAllProfiles([
                    ...successfulProfiles,
                    ...finalProfiles.filter(profile => profile.error)
                ]);
            } else {
                // If no successful profiles, show all errors
                displayAllProfiles(finalProfiles);
                showError(`Could not find '${gamertag}' on any gaming platform. Please check the spelling and try again.`);
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
            showError('An error occurred while fetching profiles. Please check the console for details.');
        } finally {
            loading.classList.add('hidden');
        }
    });
    
    function displayAllProfiles(profiles) {
        console.log('Displaying profiles:', profiles);
        // Hide error if it was shown
        error.classList.add('hidden');
        
        // Clear existing results
        allResults.innerHTML = '';
        
        // Display each profile
        profiles.forEach(profile => {
            if (profile.error) {
                // Display error card for this platform
                console.log(`Showing error card for ${profile.platform}`);
                allResults.innerHTML += `
                    <div class="bg-red-50 rounded-lg shadow-md overflow-hidden profile-card">
                        <div class="p-4 bg-red-100 border-b">
                            <h2 class="text-xl font-bold text-red-800">${profile.platform}</h2>
                            <p class="text-sm text-red-600">Gamertag: ${profile.gamertag || ''}</p>
                        </div>
                        <div class="p-4">
                            <p class="text-red-700">${profile.message || 'Could not find profile'}</p>
                        </div>
                    </div>
                `;
            } else {
                // Create profile card with custom styling based on platform
                console.log(`Showing profile card for ${profile.platform}`);
                const platformColors = {
                    'Steam': 'indigo',
                    'Xbox': 'green',
                    'PlayStation': 'blue',
                    'Epic Games': 'amber',
                    'Roblox': 'gray',
                    'Activision': 'orange'
                };
                
                const color = platformColors[profile.platform] || 'indigo';
                
                // Create profile card
                allResults.innerHTML += `
                    <div class="bg-white rounded-lg shadow-md overflow-hidden profile-card">
                        <div class="p-4 bg-${color}-50 border-b flex items-center">
                            <img src="${profile.avatar || 'https://via.placeholder.com/80'}" 
                                 alt="Profile Avatar" 
                                 class="w-16 h-16 rounded-full avatar">
                            <div class="ml-4">
                                <h2 class="text-lg font-bold text-gray-800">${profile.username}</h2>
                                <div class="flex items-center mt-1">
                                    <span class="bg-${color}-100 text-${color}-800 px-2.5 py-1 rounded-full text-xs font-medium">
                                        ${profile.platform}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="p-4">
                            ${profile.lastOnline && profile.lastOnline !== 'Info unavailable from API' ? `
                            <div class="mb-3">
                                <h3 class="text-sm font-medium text-gray-500">Last Online</h3>
                                <p class="text-gray-700">${profile.lastOnline}</p>
                            </div>` : ''}
                            
                            ${profile.stats && Object.keys(profile.stats).length > 0 ? `
                            <div>
                                <h3 class="text-sm font-medium text-gray-500 mb-2">Stats</h3>
                                <div class="flex flex-wrap">
                                    ${Object.entries(profile.stats)
                                        .filter(([key]) => key !== 'note')
                                        .map(([key, value]) => 
                                            `<div class="stat-badge">
                                                <span class="font-semibold mr-1">${key}:</span> ${value}
                                            </div>`
                                        ).join('')}
                                </div>
                            </div>` : ''}
                            
                            ${profile.additionalInfo ? `
                            <div class="additional-info mt-3">
                                ${profile.additionalInfo}
                            </div>` : ''}
                            
                            ${profile.profileUrl ? `
                            <div class="mt-4">
                                <a href="${profile.profileUrl}" target="_blank" 
                                   class="bg-${color}-600 text-white px-4 py-2 rounded-md inline-block hover:bg-${color}-700 transition-colors text-sm">
                                   View Full Profile
                                </a>
                            </div>` : ''}
                        </div>
                    </div>
                `;
            }
        });
        
        // Show results
        console.log('Showing results div');
        allResults.classList.remove('hidden');
    }
    
    function showError(message) {
        console.log('Showing error:', message);
        errorMessage.textContent = message;
        error.classList.remove('hidden');
    }
    
    function hideResults() {
        console.log('Hiding results');
        allResults.classList.add('hidden');
    }
}); 