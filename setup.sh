#!/bin/bash
# AdmitBridge — Docker Setup Script
# This script builds and starts all services using Docker Compose.

set -e

echo "🚀 AdmitBridge Docker Setup"
echo "=========================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    echo "   Install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available."
    echo "   Install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed."
echo ""

# Build and start all services
echo "🔨 Building and starting services..."
echo "   (This may take a few minutes on first run)"
echo ""

docker compose up --build -d

echo ""
echo "✅ All services are starting!"
echo ""
echo "📊 Services:"
echo "   Frontend:  http://localhost:5173"
echo "   Backend:   http://localhost:5001"
echo "   ML:        http://localhost:8000"
echo "   MongoDB:   mongodb://localhost:27017"
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check health
echo ""
echo "🏥 Health checks:"
if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
    echo "   ✅ Backend API is running"
else
    echo "   ⏳ Backend API is starting..."
fi

if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "   ✅ ML Service is running"
else
    echo "   ⏳ ML Service is starting..."
fi

if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "   ✅ Frontend is running"
else
    echo "   ⏳ Frontend is starting..."
fi

echo ""
echo "🌐 Open http://localhost:5173 in your browser"
echo ""
echo "📝 Demo Login Credentials:"
echo "   🎓 Student:    anu@gmail.com / password123"
echo "   💼 Consultant: priya@consultancy.com / priya123"
echo "   🛡️ Admin:      admin@admitbridge.com / password123"
echo ""
echo "🛑 To stop all services: docker compose down"
echo "🗑️  To stop and remove data: docker compose down -v"
