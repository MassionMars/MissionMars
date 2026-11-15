@echo off
cd /d "%~dp0"
if exist dist (set dir=dist) else (set dir=site)
start "" http://localhost:8000
python -m http.server 8000 --directory %dir%
