#!/bin/bash

# FigFlix Setup Script

echo "🎬 Setting up FigFlix..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please add your TMDb API key to .env"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Install dependencies with Poetry
echo "📦 Installing dependencies with Poetry..."
poetry install

# Activate virtual environment and run migrations
echo ""
echo "🗄️  Setting up database..."
poetry run python manage.py makemigrations
poetry run python manage.py migrate

# Create superuser
echo ""
echo "👑 Creating admin superuser..."
echo "from accounts.models import User; User.objects.get_or_create(username='admin', defaults={'email': 'admin@figflix.com', 'role': 'admin', 'is_staff': True, 'is_superuser': True}); print('Admin user created/exists')" | poetry run python manage.py shell

# Collect static files
echo ""
echo "📁 Collecting static files..."
poetry run python manage.py collectstatic --noinput

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Add your TMDb API key to the .env file"
echo "2. Run: poetry run python manage.py runserver"
echo "3. Visit: http://localhost:8000"
echo ""
echo "Default admin credentials:"
echo "Username: admin"
echo "Password: (set via Django admin or createsuperuser)"
echo ""
echo "🎉 Happy coding!"
