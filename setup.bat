@echo off
REM FigFlix Setup Script for Windows

echo 🎬 Setting up FigFlix...
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  Creating .env file from .env.example...
    copy .env.example .env
    echo ✅ .env file created. Please add your TMDb API key to .env
    echo.
) else (
    echo ✅ .env file already exists
)

REM Install dependencies with Poetry
echo 📦 Installing dependencies with Poetry...
poetry install

REM Run migrations
echo.
echo 🗄️  Setting up database...
poetry run python manage.py makemigrations
poetry run python manage.py migrate

REM Create superuser
echo.
echo 👑 Creating admin superuser...
poetry run python manage.py shell -c "from accounts.models import User; User.objects.get_or_create(username='admin', defaults={'email': 'admin@figflix.com', 'role': 'admin', 'is_staff': True, 'is_superuser': True})"

REM Collect static files
echo.
echo 📁 Collecting static files...
poetry run python manage.py collectstatic --noinput

echo.
echo ✅ Setup complete!
echo.
echo 📝 Next steps:
echo 1. Add your TMDb API key to the .env file
echo 2. Run: poetry run python manage.py runserver
echo 3. Visit: http://localhost:8000
echo.
echo Default admin credentials:
echo Username: admin
echo Password: (set via createsuperuser command)
echo.
echo 🎉 Happy coding!
pause
