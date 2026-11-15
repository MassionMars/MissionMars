#!/bin/sh
cd "$(dirname "$0")"
[ -d dist ] && dir=dist || dir=site
echo "Open http://localhost:8000"
python3 -m http.server 8000 --directory "$dir"
