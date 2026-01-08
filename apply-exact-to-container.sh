#!/bin/bash

echo "Applying exact whole-page styling to container..."

# Backup
cp tenants.html tenants.html.backup.exact-container

# Find the container line
container_line=164  # We know it's at line 164

# Apply the exact styling
sed -i "${container_line}s|<div class=\"container glass-medium\">|<div class=\"page-container\" style=\"font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 16px; color: var(--text-primary); line-height: 1.6; box-sizing: border-box; margin: 0; display: flex; min-height: 100vh; padding: var(--space-xl); margin-bottom: var(--space-xl); position: relative; overflow: hidden; background: rgba(255, 255, 255, 0.12) !important; backdrop-filter: blur(15px) saturate(180%) !important; border: 1px solid rgba(255, 255, 255, 0.18) !important; border-radius: var(--radius-lg) !important; box-shadow: 0 6px 25px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.1) !important; transition: all var(--transition-normal) !important;\">|" tenants.html

echo "✅ Applied exact styling to page container"
echo "✅ Container now has:"
echo "   - display: flex; min-height: 100vh"
echo "   - padding: var(--space-xl)"
echo "   - Glass effects with backdrop-filter"
echo "   - Proper box-shadow and border"
