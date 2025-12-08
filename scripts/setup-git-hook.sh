#!/usr/bin/env sh
# Installs a local pre-commit hook that bumps src/main.js version and stages the change
set -e
HOOK_FILE=".git/hooks/pre-commit"

if [ ! -d .git ]; then
  echo "Error: .git directory not found. Initialize git first."
  exit 1
fi

mkdir -p .git/hooks
cat > "$HOOK_FILE" << 'EOF'
#!/usr/bin/env sh
# Auto-bump version in src/main.js before commit

# Run bump script; if it fails, abort commit
node scripts/bump-version.js
STATUS=$?
if [ $STATUS -ne 0 ]; then
  echo "Pre-commit: version bump failed"
  exit $STATUS
fi

# Stage the updated file so commit includes the bump
git add src/main.js

exit 0
EOF

chmod +x "$HOOK_FILE"
echo "Installed pre-commit hook at $HOOK_FILE"
