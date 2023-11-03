@echo off

set "distPath=backend/dist"

IF NOT EXIST %distPath% (
  echo The dist directory does not exist.
  echo Please make sure the path is correct or the backend was built 'npm run build'.
  echo After that build the frontend too and
  echo Copy the frontend dist directory content to the backend dist directory.
  pause
  exit /b
)

cd /d "%distPath%"

set DIR_PATH=img-new
node main.js
