#!/bin/bash

echo "⏳ Building the React app..."
npm run build

echo "🚀 Uploading build folder to server..."
scp -r ./build/* root@139.59.29.107:/var/www/react-app

echo "🔁 Restarting PM2 on server..."
ssh root@139.59.29.107 "pm2 reload react-app"

echo "✅ Deployment complete!"
