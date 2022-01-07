@ECHO OFF
:BEGIN
CLS
CHOICE /N /C:12 /M "NPM (1) / Yarn (2)"%1
IF ERRORLEVEL ==2 GOTO YARN
IF ERRORLEVEL ==1 GOTO NPM
GOTO END
:YARN
yarn install
yarn build
npx electron-builder -p never --win
GOTO END
:NPM
npm i
npm run build
npx electron-builder -p never --win
:END
pause