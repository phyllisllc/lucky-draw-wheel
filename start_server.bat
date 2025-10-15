@echo off
cd /d "g:\GitHub\lucky-draw-wheel\client"
start http://localhost:8000
python -m http.server 8000