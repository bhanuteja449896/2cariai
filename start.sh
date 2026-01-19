#!/bin/bash

echo "🏥 Starting Digital Health Wallet Application..."
echo ""

# Check if PostgreSQL credentials are set
if ! grep -q "npg_BLed2FWh9okV" backend/.env 2>/dev/null; then
    echo "⚠️  Warning: Database credentials may not be configured!"
    echo "Please update backend/.env with your database credentials."
    exit 1
fi

echo "✅ Database credentials configured"
echo ""

# Start backend
echo "🚀 Starting Backend Server (Port 5000)..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🚀 Starting Frontend Server (Port 3000)..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both servers are starting!"
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
