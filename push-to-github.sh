#!/bin/bash

echo "=========================================="
echo "Rentala Platform - GitHub Push Script"
echo "=========================================="
echo ""

# Check if gh is authenticated
if gh auth status &>/dev/null; then
    echo "✅ GitHub CLI is authenticated"
    echo ""
    echo "Pushing to GitHub..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "=========================================="
        echo "✅ SUCCESS! Code pushed to GitHub"
        echo "=========================================="
        echo ""
        echo "View your repository at:"
        echo "https://github.com/BongaNkala/Rentala-Platform.M"
        echo ""
    else
        echo ""
        echo "❌ Push failed. Please check your credentials."
        echo ""
    fi
else
    echo "❌ GitHub CLI is not authenticated"
    echo ""
    echo "Please authenticate first:"
    echo "  gh auth login"
    echo ""
    echo "Or use a Personal Access Token:"
    echo "  git remote set-url origin https://BongaNkala:YOUR_TOKEN@github.com/BongaNkala/Rentala-Platform.M.git"
    echo "  git push -u origin main"
    echo ""
fi
