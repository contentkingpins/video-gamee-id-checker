#!/bin/bash
# Script to start the Express.js server for AWS Amplify

# Make the script executable
chmod +x start.sh

# Log environment info
echo "Starting Express server"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "ALLOWED_ORIGINS: $ALLOWED_ORIGINS"
echo "Current directory: $(pwd)"
echo "Listing files: $(ls -la)"

# Start the Node.js server
node frontend/server.js 