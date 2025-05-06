// Import API functions from api.js
import { getSteamProfile, getRobloxProfile, getFortniteProfile, getXboxProfile, getActivisionProfile } from './api.js';
import CONFIG from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('gamertag-form');
    const results = document.getElementById('results');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');

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
                    profileData = await getSteamProfile(username);
                    break;
                case 'roblox':
                    profileData = await getRobloxProfile(username);
                    break;
                case 'epic':
                    profileData = await getFortniteProfile(username);
                    break;
                case 'xbox':
                    profileData = await getXboxProfile(username);
                    break;
                case 'activision':
                    profileData = await getActivisionProfile(username);
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
                    
                    ${data.profileUrl ? `
                    <div class="mt-4">
                        <a href="${data.profileUrl}" target="_blank" 
                           class="bg-indigo-600 text-white px-4 py-2 rounded-md inline-block hover:bg-indigo-700 transition-colors">
                           View Full Profile
                        </a>
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