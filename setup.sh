#!/bin/bash

# Smart Attendance Management System - Setup Script
# This script helps you set up the project quickly

set -e

echo "======================================"
echo "Smart Attendance Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js 18 or higher from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js is installed ($(node --version))${NC}"

# Check if PostgreSQL is accessible
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠ PostgreSQL client not found${NC}"
    echo "Please ensure PostgreSQL is installed and running"
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo "Copying .env.example to .env..."
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}Please edit .env file with your configuration before proceeding${NC}"
    echo ""
    echo "Required configurations:"
    echo "  - DATABASE_URL"
    echo "  - JWT secrets"
    echo "  - AWS credentials"
    echo ""
    read -p "Have you configured .env file? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please configure .env file and run this script again"
        exit 1
    fi
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Generate Prisma Client
echo ""
echo "Generating Prisma Client..."
npm run prisma:generate

echo -e "${GREEN}✓ Prisma Client generated${NC}"

# Ask about database migration
echo ""
read -p "Do you want to run database migrations now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Running database migrations..."
    npm run prisma:migrate
    echo -e "${GREEN}✓ Database migrations completed${NC}"
else
    echo -e "${YELLOW}⚠ Skipped database migrations${NC}"
    echo "Run 'npm run prisma:migrate' when ready"
fi

# All done
echo ""
echo "======================================"
echo -e "${GREEN}Setup completed successfully!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Verify your .env configuration"
echo "2. Start development server: npm run dev"
echo "3. Check API health: http://localhost:3000/health"
echo ""
echo "Useful commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm start            - Start production server"
echo "  npm run prisma:studio - Open Prisma Studio"
echo ""
echo "Documentation:"
echo "  README.md           - Complete API documentation"
echo "  DEPLOYMENT.md       - Production deployment guide"
echo "  postman_collection.json - Postman API collection"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
