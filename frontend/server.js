// Production-ready Express server with API endpoints
const express = require('express');
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
// AWS Amplify uses port 8080 by default
const PORT = process.env.PORT || (process.env.AWS_REGION ? 8080 : 3000);

// Determine allowed origins - in production you'd restrict this to your domain
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:8000'];

// Add AWS Amplify domain if deployed there
if (process.env.AWS_AMPLIFY_APP_ID) {
  const amplifyDomain = `https://${process.env.AWS_BRANCH || 'main'}.${process.env.AWS_AMPLIFY_APP_ID}.amplifyapp.com`;
  if (!allowedOrigins.includes(amplifyDomain)) {
    allowedOrigins.push(amplifyDomain);
  }
}

// Set up CORS properly
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Add JSON parsing middleware
app.use(express.json());

// API Endpoints
// ============================================================

// Steam profile endpoint
app.get('/api/steam/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const profileUrl = isNaN(username) 
      ? `https://steamcommunity.com/id/${encodeURIComponent(username)}?xml=1` 
      : `https://steamcommunity.com/profiles/${encodeURIComponent(username)}?xml=1`;
    
    console.log(`Fetching Steam profile: ${profileUrl}`);
    
    const response = await fetch(profileUrl);
    
    if (!response.ok) {
      return res.status(404).json({ error: 'Steam profile not found' });
    }
    
    const xmlText = await response.text();
    
    // Just pass the XML response back to the client
    res.header('Content-Type', 'text/xml');
    res.send(xmlText);
  } catch (error) {
    console.error('Steam API error:', error);
    res.status(500).json({ error: 'Failed to fetch Steam profile' });
  }
});

// Roblox profile endpoints
app.post('/api/roblox/usernames', async (req, res) => {
  try {
    const usernames = req.body.usernames || [];
    
    if (!usernames.length) {
      return res.status(400).json({ error: 'No usernames provided' });
    }
    
    const response = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        usernames,
        excludeBannedUsers: true
      })
    });
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Roblox API error' });
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Roblox API error:', error);
    res.status(500).json({ error: 'Failed to fetch Roblox usernames' });
  }
});

app.get('/api/roblox/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const response = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Roblox user not found' });
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Roblox API error:', error);
    res.status(500).json({ error: 'Failed to fetch Roblox user' });
  }
});

app.get('/api/roblox/thumbnails/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const response = await fetch(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png`);
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Roblox thumbnail not found' });
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Roblox API error:', error);
    res.status(500).json({ error: 'Failed to fetch Roblox thumbnail' });
  }
});

app.get('/api/roblox/friends/:userId/count', async (req, res) => {
  try {
    const { userId } = req.params;
    const response = await fetch(`https://friends.roblox.com/v1/users/${userId}/friends/count`);
    
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Roblox friends count not found' });
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Roblox API error:', error);
    res.status(500).json({ error: 'Failed to fetch Roblox friends count' });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// For SPA routing - always return index.html for unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Add health check endpoint for AWS - Amplify uses this to verify your app is running
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
  if (process.env.AWS_AMPLIFY_APP_ID) {
    console.log(`Running on AWS Amplify: ${process.env.AWS_AMPLIFY_APP_ID}`);
  }
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
}); 