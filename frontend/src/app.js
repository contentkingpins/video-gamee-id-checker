document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('gamertag-form');
    const results = document.getElementById('results');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');

    // Backend API URL - dynamically determine the API URL based on environment
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api' 
        : `${window.location.protocol}//${window.location.hostname}/api`;

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
            // Call API
            const response = await fetch(`${API_URL}/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, platform })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch profile');
            }
            
            // Display results
            displayResults(data);
        } catch (err) {
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
}); 