@echo off
chcp 65001 > nul

echo ==========================================================
echo [*] KHOI DONG HE THONG FREELANCEX PLATFORM - 1-CLICK RUN
echo ==========================================================

@REM echo [0/9] Dang khoi dong ha tang Docker [MariaDB, RabbitMQ, Redis]...
@REM docker compose up -d

timeout /t 3 /nobreak > nul

echo [1/9] Dang khoi dong API Gateway [HTTP 3000]...
start "FreelanceX - API Gateway" cmd /k "cd /d backend && npm run start:dev api-gateway"
timeout /t 1 /nobreak > nul

echo [2/9] Dang khoi dong Auth Service [TCP 3001]...
start "FreelanceX - Auth Service" cmd /k "cd /d backend && npm run start:dev auth-service"
timeout /t 1 /nobreak > nul

echo [3/9] Dang khoi dong User Service [TCP 3004]...
start "FreelanceX - User Service" cmd /k "cd /d backend && npm run start:dev user-service"
timeout /t 1 /nobreak > nul

echo [4/9] Dang khoi dong Project Service...
start "FreelanceX - Project Service" cmd /k "cd /d backend && npm run start:dev project-service"
timeout /t 1 /nobreak > nul

echo [5/9] Dang khoi dong Contract Service [TCP 3005]...
start "FreelanceX - Contract Service" cmd /k "cd /d backend && npm run start:dev contract-service"
timeout /t 1 /nobreak > nul

echo [6/9] Dang khoi dong Payment Service...
start "FreelanceX - Payment Service" cmd /k "cd /d backend && npm run start:dev payment-service"
timeout /t 1 /nobreak > nul

echo [7/9] Dang khoi dong Notification Service [RabbitMQ Listener]...
start "FreelanceX - Notification Service" cmd /k "cd /d backend && npm run start:dev notification-service"
timeout /t 1 /nobreak > nul

echo [8/9] Dang khoi dong Chat Service [WebSocket]...
start "FreelanceX - Chat Service" cmd /k "cd /d backend && npm run start:dev chat-service"
timeout /t 1 /nobreak > nul

echo [9/9] Dang khoi dong Frontend [Next.js - Port 3002]...
start "FreelanceX - Frontend" cmd /k "cd /d frontend && npm run dev"

echo ==========================================================
echo [*] HOAN TAT! Toan bo he thong FreelanceX da san sang:
echo     - Frontend UI:        http://localhost:3002
echo     - API Gateway:        http://localhost:3000
echo     - RabbitMQ UI:        http://localhost:15672 [guest/guest]
echo ==========================================================
pause