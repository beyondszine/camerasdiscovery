#!/bin/bash

echo "this is from post-commit hook"
notify-send "POST-COMMIT HOOK: Building Docker now!"
docker build -t beyondszine/camerasdiscovery .
