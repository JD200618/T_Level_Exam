@echo off
setlocal
cd /d %~dp0\..\frontend
call npm.cmd install
call npm.cmd run dev
