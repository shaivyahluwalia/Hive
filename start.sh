#!/bin/bash

# Kill all spawned background processes when this script exits or is terminated
trap "kill 0" EXIT

echo "========================================================"
echo "      🚀 Hive: AI + Human Workforce Platform 🚀"
echo "========================================================"
echo ""

# 1. Start Backend API Server
echo "📦 Starting Express.js backend on http://127.0.0.1:5000..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# 2. Wait a brief moment for the backend to bind port 5000
sleep 2

# 3. Start Frontend Dev Server
echo "🎨 Starting Next.js frontend on http://localhost:3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "--------------------------------------------------------"
echo "✅ Hive is active!"
echo "👉 Frontend UI Portal: http://localhost:3000"
echo "👉 Backend REST API:   http://127.0.0.1:5000"
echo "👉 Demo admin credentials: admin@hive.com / password123"
echo "💡 Press [Ctrl + C] to stop all servers."
echo "========================================================"

# Keep script open and wait for subprocesses
wait
