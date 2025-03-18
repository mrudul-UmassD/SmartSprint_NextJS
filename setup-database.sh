#!/bin/bash

# SmartSprint Database Setup Script

echo "======================================"
echo "  SmartSprint Database Setup Script"
echo "======================================"
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js before running this script."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm before running this script."
    exit 1
fi

# Check if the required directory structure exists
if [ ! -d "scripts" ]; then
    echo "Creating scripts directory..."
    mkdir -p scripts
fi

# Check if MySQL is installed and running
echo "⚙️  Checking if MySQL is installed and running..."
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL command-line client not found."
    echo "Make sure MySQL is installed and added to your PATH."
    echo "You can still continue, but you'll need to provide the correct MySQL connection details."
else
    # Try connecting to MySQL
    if mysql -e "SELECT 1" &> /dev/null; then
        echo "✅ MySQL is running and accessible."
    else
        echo "⚠️  Could not connect to MySQL server."
        echo "Make sure MySQL is running and your credentials are correct."
    fi
fi

# Install required dependencies if not already installed
echo "⚙️  Checking and installing required dependencies..."
npm install --save mysql2 dotenv uuid bcrypt
npm install --save-dev inquirer@8.2.5

# Run the database setup script
echo "⚙️  Running database setup script..."
node scripts/setup-database.js

# Check if the script executed successfully
if [ $? -eq 0 ]; then
    echo "✅ Database setup completed successfully!"
else
    echo "❌ Database setup failed. Check the error messages above."
    exit 1
fi

echo
echo "======================================"
echo "  Setup Complete"
echo "======================================"
echo
echo "You can now start the application with:"
echo "npm run dev"
echo
echo "Default admin credentials:"
echo "Username: admin"
echo "Password: admin123" 