:start
@cmd /C "%~dp0\bdsx.bat"

git pull origin main

timeout 1
goto start