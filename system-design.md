Dự Án: Freelance Project Platform (Mô Hình Microservices)1. TỔNG QUAN HỆ THỐNG1.1. Mục tiêuXây dựng nền tảng kết nối Client (người thuê) và Freelancer (người nhận việc) theo kiến trúc Microservices và Event-Driven Architecture. Hệ thống quản lý toàn bộ vòng đời của một công việc: Đăng tin, Đấu thầu, Tạo hợp đồng, Ký quỹ (Escrow), Nghiệm thu theo từng giai đoạn (Milestone) và Giải ngân tự động.1.2. Tech Stack lựa chọnFrontend: Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons, Axios.Backend Framework: NestJS (Node.js/TypeScript) cấu trúc theo mô hình Monorepo.Database: MySQL 8.0 (Áp dụng pattern Database-per-service).Message Broker: RabbitMQ 3 (AMQP protocol, Topic Exchange).Caching & Rate Limiting: Redis.Hạ tầng cục bộ: Docker & Docker Compose.2. KIẾN TRÚC HỆ THỐNG & BOUNDED CONTEXTS                                [ CLIENT / BROWSER ]
                                         │
                                         ▼
                            ┌────────────────────────┐
                            │      NEXT.JS UI        │
                            └────────────┬───────────┘
                                         │ (HTTP REST / JWT)
                                         ▼
                            ┌────────────────────────┐
                            │   API GATEWAY (NestJS) │
                            │ (Auth Guard, Routing)  │
                            └────────────┬───────────┘
                                         │
         ┌───────────────────┬───────────┴───────────┬───────────────────┐
         │ (HTTP/TCP)        │ (HTTP/TCP)            │ (HTTP/TCP)        │ (HTTP/TCP)
         ▼                   ▼                       ▼                   ▼
┌─────────────────┐ ┌─────────────────┐     ┌─────────────────┐ ┌─────────────────┐
│  Auth & User    │ │Project Service  │     │Contract Service │ │Payment Service  │
│    Service      │ │                 │     │                 │ │                 │
└────────┬────────┘ └────────┬────────┘     └────────┬────────┘ └────────┬────────┘
         ▼                   ▼                       ▼                   ▼
    [(auth_db)]        [(project_db)]          [(contract_db)]     [(payment_db)]
                             │                       │                   │
                             └───────────────────────┼───────────────────┘
                                                     │ (Publish Events)
                                                     ▼
                                           ┌───────────────────┐
                                           │  RABBITMQ BROKER  │
                                           └─────────┬─────────┘
                                                     │ (Consume Events)
                                                     ▼
                                           ┌───────────────────┐
                                           │Notification Worker│
                                           └───────────────────┘
2.1. Phân định trách nhiệm các ServiceAPI Gateway: Điểm đón nhận request duy nhất từ Frontend. Xác thực Access Token (JWT), kiểm tra quyền (Role Guard), giới hạn tần suất (Rate Limiting) và chuyển tiếp request đến các microservice nội bộ qua TCP/HTTP.Auth & User Service: Quản lý danh tính, phân quyền (CLIENT, FREELANCER, ADMIN), cấp phát/thu hồi JWT và Refresh Token.Project & Proposal Service: Đăng tải bài tuyển dụng, danh mục kỹ năng (Skills), tìm kiếm/lọc dự án, nộp và xét duyệt hồ sơ chào thầu (Proposals).Contract & Milestone Service: Quản lý vòng đời hợp đồng, cỗ máy trạng thái (State Machine) của từng Milestone, lưu vết nộp bài (Submissions).Payment Service: Quản lý ví người dùng (Wallets), giao dịch ký quỹ (Escrow Hold/Release), chống trùng lặp giao dịch (Idempotency).Notification Service (Worker): Service chạy nền, chỉ lắng nghe event từ RabbitMQ để gửi email và tạo thông báo in-app. Không mở cổng HTTP ra ngoài.3. THIẾT KẾ DỮ LIỆU (DATABASE SCHEMAS)Mỗi service sở hữu một Database logic riêng biệt trên MySQL 8.0, không sử dụng Foreign Key liên database.3.1. auth_db (Auth & User Service)SQLCREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE auth_db;

CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('CLIENT', 'FREELANCER', 'ADMIN') NOT NULL DEFAULT 'FREELANCER',
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE refresh_tokens (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    is_revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_refresh_tokens_user (user_id),
    CONSTRAINT fk_auth_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
3.2. project_db (Project & Proposal Service)SQLCREATE DATABASE IF NOT EXISTS project_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE project_db;

CREATE TABLE skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE projects (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    client_id CHAR(36) NOT NULL,              -- Logic ID từ auth_db
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    budget DECIMAL(12, 2) NOT NULL,
    status ENUM('DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
    version INT NOT NULL DEFAULT 1,           -- Optimistic Lock chống chọn trùng
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_projects_client (client_id),
    INDEX idx_projects_status (status)
) ENGINE=InnoDB;

CREATE TABLE project_skills (
    project_id CHAR(36) NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (project_id, skill_id),
    CONSTRAINT fk_ps_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_ps_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE proposals (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_id CHAR(36) NOT NULL,
    freelancer_id CHAR(36) NOT NULL,          -- Logic ID từ auth_db
    bid_amount DECIMAL(12, 2) NOT NULL,
    estimated_days INT NOT NULL,
    cover_letter TEXT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_project_freelancer (project_id, freelancer_id),
    INDEX idx_proposals_project (project_id),
    CONSTRAINT fk_prop_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;
3.3. contract_db (Contract & Milestone Service)SQLCREATE DATABASE IF NOT EXISTS contract_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE contract_db;

CREATE TABLE contracts (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    project_id CHAR(36) NOT NULL,             -- Logic ID từ project_db
    proposal_id CHAR(36) NOT NULL,            -- Logic ID từ project_db
    client_id CHAR(36) NOT NULL,              -- Logic ID từ auth_db
    freelancer_id CHAR(36) NOT NULL,          -- Logic ID từ auth_db
    total_amount DECIMAL(12, 2) NOT NULL,
    status ENUM('DRAFT', 'ACTIVE', 'COMPLETED', 'DISPUTED', 'TERMINATED') NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_contracts_client (client_id),
    INDEX idx_contracts_freelancer (freelancer_id)
) ENGINE=InnoDB;

CREATE TABLE milestones (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    contract_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    deadline DATETIME NULL,
    status ENUM('CREATED', 'FUNDED', 'SUBMITTED', 'REVISION_REQUESTED', 'APPROVED', 'PAID') NOT NULL DEFAULT 'CREATED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_milestones_contract (contract_id),
    CONSTRAINT fk_ms_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE submissions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    milestone_id CHAR(36) NOT NULL,
    notes TEXT NULL,
    attachment_urls JSON NULL,                -- Mảng link lưu file kết quả
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_subs_milestone (milestone_id),
    CONSTRAINT fk_subs_milestone FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE
) ENGINE=InnoDB;
3.4. payment_db (Payment Service)SQLCREATE DATABASE IF NOT EXISTS payment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE payment_db;

CREATE TABLE wallets (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL UNIQUE,         -- Logic ID từ auth_db
    available_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    escrow_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_wallet_available CHECK (available_balance >= 0.00),
    CONSTRAINT chk_wallet_escrow CHECK (escrow_balance >= 0.00)
) ENGINE=InnoDB;

CREATE TABLE transactions (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    wallet_id CHAR(36) NOT NULL,
    milestone_id CHAR(36) NULL,               -- Logic ID từ contract_db
    amount DECIMAL(12, 2) NOT NULL,
    fee_amount DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    type ENUM('DEPOSIT', 'ESCROW_HOLD', 'ESCROW_RELEASE', 'REFUND') NOT NULL,
    status ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tx_wallet (wallet_id),
    INDEX idx_tx_milestone (milestone_id),
    CONSTRAINT fk_tx_wallet FOREIGN KEY (wallet_id) REFERENCES wallets(id)
) ENGINE=InnoDB;

-- Bảng Idempotency: Chống thanh toán trùng lặp khi RabbitMQ retry
CREATE TABLE idempotency_records (
    `key` VARCHAR(255) PRIMARY KEY,           -- Mẫu: milestone_approved_{milestone_id}
    response_payload JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
4. CHI TIẾT CÁC SỰ KIỆN LIÊN DỊCH VỤ (EVENT-DRIVEN MATRIX)Mọi giao tiếp bất đồng bộ được thực hiện qua RabbitMQ Topic Exchange: freelance.topic.exchange.STTTên EventProducerConsumerPayload Thu GọnHành Động Khi Nhận1user.registeredAuth ServiceNotificationuserId, email, fullName, roleGửi email chào mừng.2proposal.submittedProject ServiceNotificationproposalId, projectId, clientId, bidAmountGửi thông báo đến Client.3proposal.acceptedProject ServiceContract Service, NotificationprojectId, proposalId, clientId, freelancerId, totalAmountTạo hợp đồng mới & tạo các Milestone mặc định.4contract.fundedPayment ServiceContract Service, NotificationcontractId, milestoneId, amountChuyển Milestone sang FUNDED. Cho phép nộp bài.5milestone.submittedContract ServiceNotificationcontractId, milestoneId, clientId, notesBáo Client vào nghiệm thu.6milestone.approvedContract ServicePayment Service, NotificationcontractId, milestoneId, freelancerId, payoutAmount, idempotencyKeyKích hoạt giải ngân tiền cọc từ ví Escrow sang ví Freelancer.7payment.completedPayment ServiceContract Service, NotificationtransactionId, contractId, milestoneId, netAmountChuyển Milestone sang PAID. Hoàn tất hợp đồng nếu hết milestone.8payment.failedPayment ServiceContract Service, NotificationcontractId, milestoneId, reasonCảnh báo lỗi giao dịch.5. CORE BUSINESS WORKFLOW & STATE MACHINES5.1. Vòng đời toàn diện của một công việcClient đăng bài dự án $\rightarrow$ Trạng thái dự án: OPEN.Freelancer nộp báo giá $\rightarrow$ Proposal: PENDING.Client duyệt Proposal:Project Service sử dụng Optimistic Locking để update Project thành IN_PROGRESS và Proposal thành ACCEPTED.Bắn event proposal.accepted.Contract Service nhận event $\rightarrow$ Tự động sinh Contract (status = DRAFT) và các Milestones (status = CREATED).Client nạp tiền bảo đảm (Ký quỹ):Payment Service trừ ví khả dụng của Client, nạp vào escrow_balance.Bắn event contract.funded $\rightarrow$ Contract Service đổi trạng thái Milestone thành FUNDED.Freelancer làm việc và nộp kết quả $\rightarrow$ Contract Service đổi trạng thái Milestone thành SUBMITTED, lưu mảng file/link vào bảng submissions.Client nghiệm thu:Nếu không đạt $\rightarrow$ Chuyển REVISION_REQUESTED.Nếu đạt $\rightarrow$ Chuyển APPROVED, bắn event milestone.approved.Payment Service nhận event:Kiểm tra bảng idempotency_records (nếu có rồi thì bỏ qua).Trừ escrow_balance của Client, cộng tiền cho ví Freelancer (trừ 10% phí nền tảng).Ghi nhận transaction thành công, lưu bản ghi idempotency, bắn event payment.completed.Contract Service cập nhật Milestone thành PAID.6. DANH MỤC API ENDPOINTS (QUA API GATEWAY: PORT 3000)Tất cả các endpoint bên dưới được client gọi thông qua API Gateway.Auth & User ServicePOST /api/auth/register: Đăng ký tài khoản (email, password, fullName, role).POST /api/auth/login: Đăng nhập, nhận Access Token & Refresh Token.POST /api/auth/refresh: Cấp mới Access Token.GET /api/users/profile: Lấy thông tin tài khoản hiện tại.Project & Proposal ServiceGET /api/projects: Tìm kiếm và lọc danh sách dự án (query theo skill, budget).POST /api/projects: Client tạo dự án mới (Yêu cầu Role: CLIENT).GET /api/projects/:id: Xem chi tiết dự án và danh sách proposals (nếu là chủ dự án).POST /api/projects/:id/proposals: Freelancer nộp báo giá (Yêu cầu Role: FREELANCER).PATCH /api/projects/:id/proposals/:proposalId/accept: Client chấp thuận báo giá.Contract & Milestone ServiceGET /api/contracts/:id: Lấy thông tin hợp đồng và danh sách milestones.POST /api/contracts/:id/milestones/:milestoneId/submit: Freelancer nộp sản phẩm.PATCH /api/contracts/:id/milestones/:milestoneId/approve: Client phê duyệt nghiệm thu.PATCH /api/contracts/:id/milestones/:milestoneId/reject: Client yêu cầu chỉnh sửa.Payment ServiceGET /api/payments/wallet: Xem số dư khả dụng và số dư ký quỹ.POST /api/payments/deposit: Nạp tiền vào ví.POST /api/payments/contracts/:id/fund: Client nạp tiền ký quỹ cho hợp đồng.GET /api/payments/transactions: Xem lịch sử giao dịch.7. CẤU TRÚC MONOREPO WORKSPACE (NESTJS)Plaintextfreelance-platform/
├── docker-compose.yml             # MySQL & RabbitMQ
├── init-scripts/
│   └── init.sql                   # Khởi tạo 4 databases tự động
├── frontend/                      # Ứng dụng Next.js (App Router)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/login/
│   │   │   ├── client/
│   │   │   └── projects/
│   │   └── types/
│   └── package.json
└── backend/                       # NestJS Monorepo
    ├── apps/
    │   ├── api-gateway/           # HTTP Routing, JWT Guard (Port 3000)
    │   ├── auth-service/          # Port TCP 4001
    │   ├── project-service/       # Port TCP 4002
    │   ├── contract-service/      # Port TCP 4003
    │   ├── payment-service/       # Port TCP 4004
    │   └── notification-service/  # Lắng nghe RabbitMQ
    ├── libs/
    │   └── shared/                # Thư viện dùng chung
    │       ├── src/
    │       │   ├── dto/           # CreateProjectDto, AcceptProposalDto...
    │       │   ├── events/        # ProposalAcceptedEvent, MilestoneApprovedEvent...
    │       │   ├── constants/     # Tên Event, Tên Service
    │       │   └── index.ts
    │       └── tsconfig.lib.json
    ├── nest-cli.json
    └── package.json
8. CÁC BIỆN PHÁP BẢO VỆ & RESILIENCE ĐƯỢC THIẾT KẾIdempotent Consumers: Sử dụng bảng idempotency_records tại Payment Service để chống double-spending (trả tiền 2 lần) khi RabbitMQ gửi lại message.Optimistic Locking: Sử dụng trường version trong bảng projects để ngăn chặn tranh chấp dữ liệu khi Client bấm duyệt nhiều lần hoặc mạng gửi 2 request song song.Database Check Constraints: Các ràng buộc CHECK (available_balance >= 0) và CHECK (escrow_balance >= 0) đảm bảo ví tiền không bao giờ bị âm ngay ở tầng database.Fire-and-forget Notification: Khi gửi email hoặc push notification, lỗi từ bên thứ ba (như dịch vụ gửi mail bị sập) được cô lập tại Notification Worker, hoàn toàn không ảnh hưởng đến luồng giao dịch thanh toán và hợp đồng.