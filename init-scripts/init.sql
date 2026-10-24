-- ====================================================
-- FREELANCEX MICROSERVICES DATABASE INITIALIZATION SCRIPT
-- ====================================================

-- 1. Create independent databases per service
CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS user_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS project_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS contract_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS payment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS chat_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS notification_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Grant privileges for application user
GRANT ALL PRIVILEGES ON auth_db.* TO 'freelance_user'@'%';
GRANT ALL PRIVILEGES ON user_db.* TO 'freelance_user'@'%';
GRANT ALL PRIVILEGES ON project_db.* TO 'freelance_user'@'%';
GRANT ALL PRIVILEGES ON contract_db.* TO 'freelance_user'@'%';
GRANT ALL PRIVILEGES ON payment_db.* TO 'freelance_user'@'%';
GRANT ALL PRIVILEGES ON chat_db.* TO 'freelance_user'@'%';
GRANT ALL PRIVILEGES ON notification_db.* TO 'freelance_user'@'%';

FLUSH PRIVILEGES;
