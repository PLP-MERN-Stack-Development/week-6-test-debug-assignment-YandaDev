@echo off
echo 🔍 Checking development environment setup...
echo.

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Node.js: 
    node --version
) else (
    echo ❌ Node.js not found. Please install Node.js v18 or higher.
    pause
    exit /b 1
)

REM Check pnpm
pnpm --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ pnpm: 
    pnpm --version
) else (
    echo ❌ pnpm not found. Installing pnpm...
    npm install -g pnpm
    pnpm --version >nul 2>&1
    if %errorlevel% == 0 (
        echo ✅ pnpm installed: 
        pnpm --version
    ) else (
        echo ❌ Failed to install pnpm. Please install manually: npm install -g pnpm
        pause
        exit /b 1
    )
)

REM Check MongoDB (optional)
mongod --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ MongoDB: 
    mongod --version | findstr "db version"
) else (
    echo ⚠️  MongoDB not found locally. Make sure you have MongoDB Atlas connection or install MongoDB locally.
)

echo.
echo 🚀 Environment setup complete! You can now run:
echo    pnpm run install-all  # Install all dependencies
echo    pnpm run dev          # Start development servers  
echo    pnpm test             # Run tests
pause
