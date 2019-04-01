#!/bin/bash
docker run --rm --name=camerasdiscovery -p 8000:8000 --network host saurabhshandy/camerasdiscovery
docker run -rm --name=mredis -p 6379:6379 redis
# docker run --rm --name=arena-ui -p 4567:4567 arena-ui

