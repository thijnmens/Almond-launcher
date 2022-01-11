@ECHO OFF
:BEGIN
CLS
ECHO Preparing project for build
rd /S /Q build 
rd /S /Q dist
del /S /Q src\Assets\Banners
del /S /Q src\Assets\Headers
del /S /Q src\Assets\Icons
copy /Y /V src\Assets\Banner_Default_600x900.jpg .\src\Assets\Banners\Banner_Default_600x900.jpg
copy /Y /V src\Assets\Header_Default_1920x620.jpg .\src\Assets\Headers\Header_Default_1920x620.jpg
copy /Y /V src\Assets\Icon_Default_64x64.jpg .\src\Assets\Icons\Icon_Default_64x64.jpg
CLS
CHOICE /N /C:12 /M "NPM (1) / Yarn (2)"%1
IF ERRORLEVEL ==2 GOTO YARN
IF ERRORLEVEL ==1 GOTO NPM
GOTO END
:YARN
yarn install & yarn build & npx electron-builder -p never --win
GOTO END
:NPM
npm i & npm run build & npx electron-builder -p never --win
:END
pause