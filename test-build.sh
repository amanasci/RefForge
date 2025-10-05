#!/bin/bash
# Test script to verify local Tauri builds work correctly
# This helps catch issues before they appear in CI/CD

set -e

echo "🧪 Testing RefForge Build Process"
echo "=================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js."
    exit 1
fi
echo "✅ Node.js: $(node --version)"

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm."
    exit 1
fi
echo "✅ npm: $(npm --version)"

if ! command -v rustc &> /dev/null; then
    echo "❌ Rust not found. Please install Rust."
    exit 1
fi
echo "✅ Rust: $(rustc --version)"

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔍 Type checking..."
npm run typecheck

echo ""
echo "🧹 Linting..."
npm run lint

echo ""
echo "🏗️  Building Next.js frontend..."
npm run build

echo ""
echo "🦀 Building Tauri app..."
npm run tauri build

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "📦 Artifacts should be in: src-tauri/target/release/bundle/"
echo ""
echo "Contents:"
ls -lh src-tauri/target/release/bundle/ 2>/dev/null || echo "No bundle directory found"
find src-tauri/target/release/bundle/ -type f -name "*.deb" -o -name "*.AppImage" -o -name "*.dmg" -o -name "*.msi" -o -name "*.exe" 2>/dev/null || echo "No artifacts found"
