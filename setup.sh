#!/bin/bash
# Website Scraper Pro - Quick Setup Script

echo "🕷️  Website Scraper Pro - Setup"
echo "================================"
echo

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python version: $python_version"

# Create virtual environment
echo
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check if .env exists
if [ ! -f .env ]; then
    echo
    echo "⚠ .env file not found. Creating from template..."
    cp .env.example .env
    echo "✓ Created .env file"
    echo
    echo "⚠ IMPORTANT: Edit .env and add your API keys:"
    echo "   - OPENAI_API_KEY (required)"
    echo "   - SENDGRID_API_KEY (optional, for email)"
    echo
fi

# Create output directories
mkdir -p cache output

echo
echo "✅ Setup complete!"
echo
echo "Next steps:"
echo "1. Edit .env and add your OpenAI API key"
echo "2. Activate virtual environment: source venv/bin/activate"
echo "3. Run the scraper: python main.py"
echo
