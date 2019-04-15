#!/bin/bash
docker run --rm --name=mredis -p 6379:6379 -d redis
docker run --rm --name=camerasdiscovery -p 8000:8000 --network host saurabhshandy/camerasdiscovery
# docker run --rm --name=mnginx -v /home/beyond/github/camerasdiscovery/public/html:/usr/share/nginx/html -p 8008:80 nginx
