@echo off
setlocal EnableExtensions DisableDelayedExpansion
echo Are you sure you want to deploy everything?
echo/
if exist "%SystemRoot%\System32\choice.exe" goto UseChoice

setlocal EnableExtensions EnableDelayedExpansion
:UseSetPrompt
set "UserChoice="
set /P "UserChoice=Are you sure [Y/N]? "
set "UserChoice=!UserChoice: =!"
if /I "!UserChoice!" == "N" endlocal & goto :EOF
if /I not "!UserChoice!" == "Y" goto UseSetPrompt
endlocal
goto Continue

:UseChoice
%SystemRoot%\System32\choice.exe /C YN /N /M "Are you sure [Y/N]?"
if not errorlevel 1 goto UseChoice
if errorlevel 2 goto :EOF

:Continue
echo/
echo Pushing to client...
echo/
git subtree push --prefix client\ heroku-frontend master
git subtree push --prefix server\ heroku-backend master
endlocal