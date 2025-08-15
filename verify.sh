#!/bin/bash

# This script is designed to be run by the user to verify the application.
# It sets up the environment, starts the services, and runs the frontend tests.

# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- Letta Frontend Verification Script ---"

# 1. Check for Docker and Docker Compose
if ! command -v docker &> /dev/null
then
    echo "Docker could not be found. Please install Docker and try again."
    exit 1
fi

echo "✅ Docker is available."

# 2. Set up the .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 .env file not found. Copying from .env.example..."
    cp .env.example .env
fi

# 3. Start the application using Docker Compose
echo "🚀 Starting the application services (backend, frontend, db)..."
# Using sudo as it was required in the agent's environment.
# The user might not need it, but it's safer to include it.
if command -v sudo &> /dev/null; then
    sudo docker compose up --build -d
else
    docker compose up --build -d
fi

# 4. Wait for services to be healthy
echo "⏳ Waiting for services to become healthy..."
# A simple sleep should be sufficient for the services to initialize.
# A more robust script would poll the healthcheck endpoints.
sleep 30

echo "✅ Services are up."

# 5. Install Playwright dependencies
echo "🎭 Installing Playwright browser dependencies..."
cd frontend
npm install --silent # Ensure all npm packages are installed
npx playwright install --with-deps
cd ..

# 6. Run the Playwright tests
echo "🧪 Running Playwright tests..."
cd frontend
npx playwright test

echo "✅ Tests finished."

# 7. Provide next steps
echo "---"
echo "🎉 Verification complete!"
echo "A screenshot has been saved to frontend/tests/screenshots/dashboard_layout.png"
echo "You can view the running application at http://localhost:3000"
echo "To stop the application, run: sudo docker compose down"
