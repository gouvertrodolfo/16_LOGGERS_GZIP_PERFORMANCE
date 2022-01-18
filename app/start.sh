#!/bin/bash


pm2 start src/server.js --name=server1 --watch  -- --port 7001 --mode=fork

pm2 start src/server.js --name=server2 --watch  -- --port 7002 --mode=cluster

pm2 start src/server.js --name=server3 --watch  -- --port 7003 --mode=cluster

pm2 start src/server.js --name=server4 --watch  -i max -- --port 7004 --mode=cluster