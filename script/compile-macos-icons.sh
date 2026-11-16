#!/bin/sh
# Compiles icon-logo.icon into the Assets.car that macOS 26 uses for the app
# icon. Needs Xcode 26 on a Mac; run script/generate-icons.mjs first.

set -e
cd "$(dirname "$0")/../app/static/logos"

for channel in prod dev; do
  out=$(mktemp -d)
  xcrun actool "$channel/icon-logo.icon" \
    --compile "$out" \
    --output-partial-info-plist "$out/partial.plist" \
    --app-icon icon-logo \
    --include-all-app-icons \
    --enable-on-demand-resources NO \
    --development-region en \
    --target-device mac \
    --platform macosx \
    --minimum-deployment-target 11.0
  cp "$out/Assets.car" "$channel/Assets.car"
  rm -rf "$out"
  echo "Wrote $channel/Assets.car"
done
