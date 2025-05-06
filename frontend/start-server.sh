#!/bin/bash
# Script to start the Express.js server for AWS Amplify

# Make the script executable if needed
chmod +x start-server.sh

# Navigate to the frontend directory where server.js is located
cd "$(dirname "$0")"

# Log startup information
echo "Starting Express server from $(pwd)"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

# Start the Node.js server
node server.js 