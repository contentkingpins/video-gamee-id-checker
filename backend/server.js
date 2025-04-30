require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Import platform services
const steamService = require('./services/steamService');
const robloxService = require('./services/robloxService');
const fortniteService = require('./services/fortniteService');
const genericService = require('./services/genericService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});

app.use('/api', apiLimiter);

// Routes
app.post('/api/profile', async (req, res) => {
  try {
    const { username, platform } = req.body;
    
    if (!username || !platform) {
      return res.status(400).json({ message: 'Username and platform are required' });
    }
    
    let profileData;
    
    // Call appropriate service based on platform
    switch (platform.toLowerCase()) {
      case 'steam':
        profileData = await steamService.getProfile(username);
        break;
      case 'roblox':
        profileData = await robloxService.getProfile(username);
        break;
      case 'epic':
        profileData = await fortniteService.getProfile(username);
        break;
      case 'xbox':
      case 'psn':
      case 'activision':
        profileData = await genericService.getProfile(username, platform);
        break;
      default:
        return res.status(400).json({ message: 'Unsupported platform' });
    }
    
    if (!profileData) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      message: error.message || 'An error occurred while fetching the profile'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 