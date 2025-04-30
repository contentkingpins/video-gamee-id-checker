require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import platform services
const steamService = require('./services/steamService');
const robloxService = require('./services/robloxService');
const fortniteService = require('./services/fortniteService');
const xboxService = require('./services/xboxService');
const psnService = require('./services/psnService');
const activisionService = require('./services/activisionService');
const genericService = require('./services/genericService');

const app = express();
const PORT = process.env.PORT || 3000;

// Debug response middleware
app.use((req, res, next) => {
  // Log all incoming requests
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  
  // Store the original send method
  const originalSend = res.send;
  
  // Override the send method to log responses
  res.send = function(...args) {
    console.log(`[${new Date().toISOString()}] Response for ${req.method} ${req.url}: Status ${res.statusCode}`);
    return originalSend.apply(res, args);
  };
  
  next();
});

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight requests explicitly
app.options('*', cors());

app.use(express.json());

// Set default content type for all API responses
app.use('/api', (req, res, next) => {
  res.type('application/json');
  next();
});

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});

app.use('/api', apiLimiter);

// Explicit health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', version: '1.0.0', time: new Date().toISOString() });
});

// Routes
app.post('/api/profile', async (req, res) => {
  try {
    console.log('Profile request received:', req.body); // Debug log
    
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
        profileData = await xboxService.getProfile(username);
        break;
      case 'psn':
        profileData = await psnService.getProfile(username);
        break;
      case 'activision':
        profileData = await activisionService.getProfile(username);
        break;
      default:
        return res.status(400).json({ message: 'Unsupported platform' });
    }
    
    if (!profileData) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    console.log(`Found profile for ${username} on ${platform}`); // Debug log
    res.status(200).json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      message: error.message || 'An error occurred while fetching the profile'
    });
  }
});

// Echo endpoint for testing
app.post('/api/echo', (req, res) => {
  res.status(200).json({
    received: req.body,
    headers: req.headers,
    timestamp: new Date().toISOString()
  });
});

// Catch-all route for API 404s
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Serve frontend static files if configured
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '..', 'frontend');
  app.use(express.static(frontendPath));
  
  // SPA fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  // Ensure we send JSON response even for errors
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Node environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API accessible at: http://localhost:${PORT}/api`);
}); 