# 🗺️ LỘ TRÌNH TRIỂN KHAI DỰ ÁN NỀN TẢNG FREELANCE (PROJECT ROADMAP)
> **Kiến trúc:** Microservices (NestJS + RabbitMQ + MariaDB + Redis + Next.js 14 App Router + TailwindCSS)  
> **Mục tiêu:** Xây dựng sản phẩm hoàn chỉnh chuẩn công nghiệp, thiết kế để gây ấn tượng mạnh với Nhà tuyển dụng & Tech Lead khi đưa vào CV.

---

## 📊 Bảng Theo Dõi Tiến Độ Tổng Quan (Project Status Matrix)

| Giai đoạn | Hạng mục / Tính năng | Công nghệ cốt lõi | Trạng thái | Điểm nhấn kỹ thuật |
| :--- | :--- | :--- | :---: | :--- |
| **Phase 1** | **Core Architecture & Identity** | NestJS, JWT, RBAC, API Gateway | ✅ Hoàn thành | Phân quyền Client / Freelancer, Gateway routing qua RabbitMQ RPC |
| **Phase 2** | **Project & Proposal Marketplace** | NestJS, Prisma, MariaDB | ✅ Hoàn thành | Đăng bài, lọc dự án, nộp hồ sơ thầu, duyệt hồ sơ tuyển dụng |
| **Phase 3** | **Contract & Escrow Milestones** | NestJS, RabbitMQ, Prisma | ✅ Hoàn thành | Ký quỹ Escrow an toàn, nộp bài, duyệt nghiệm thu & giải ngân tự động |
| **Phase 4** | **Revision Feedback & Termination** | NestJS, Transaction DB | ✅ Hoàn thành | Khách hàng yêu cầu sửa bài, cơ chế hủy hợp đồng & tự động hoàn cọc Escrow |
| **Phase 5** | **2-Way Reviews & Reputation** | MariaDB, Unique Constraint | ✅ Hoàn thành | Đánh giá 2 chiều (Client ↔ Freelancer), chống spam/double-review bằng DB lock |
| **Phase 6** | **Realtime Chat & Messaging** | Socket.IO, Redis Pub/Sub | 🟡 Đang chuẩn bị | Chat trao đổi trực tiếp giữa Client & Freelancer theo phòng dự án |
| **Phase 7** | **Advanced Search & Discovery** | Meilisearch / Elasticsearch | ⚪ Kế hoạch | Tìm kiếm full-text theo kỹ năng, khoảng ngân sách, xếp hạng uy tín |
| **Phase 8** | **Observability & Logging** | OpenTelemetry, Prometheus | ⚪ Kế hoạch | Distributed Tracing theo traceId qua từng microservice |
| **Phase 9** | **DevOps, Docker & CI/CD** | Docker, GitHub Actions | ⚪ Kế hoạch | Đóng gói container chuẩn multi-stage, pipeline tự động test & deploy |
| **Phase 10** | **Cloud Deployment & Live Demo** | AWS / VPS, Cloudflare, Nginx | ⚪ Kế hoạch | Public domain có HTTPS, demo trực tiếp cho nhà tuyển dụng xem |

---

## 🎯 Chi Tiết Từng Giai Đoạn Triển Khai (Phase-by-Phase Roadmap)

### ✅ Giai Đoạn 1: Nền Tảng Kiến Trúc & Định Danh (Completed)
- [x] Thiết lập kiến trúc Microservices với NestJS Monorepo và API Gateway tập trung.
- [x] Tích hợp Message Broker **RabbitMQ** điều phối giao tiếp giữa các services theo mô hình RPC & Event-Driven.
- [x] Xây dựng thư viện dùng chung `@app/shared` (DTOs, Constants, Patterns, RabbitMQ Config).
- [x] Cơ chế xác thực JWT, Refresh Token và phân quyền RBAC (`CLIENT`, `FREELANCER`, `ADMIN`).

### ✅ Giai Đoạn 2: Sàn Dự Án & Hồ Sơ Chào Thầu (Completed)
- [x] Khách hàng đăng tin tuyển dụng, chọn loại ngân sách (Cố định / Theo giờ), kỹ năng yêu cầu.
- [x] Freelancer xem danh sách dự án, lọc theo mức giá, danh mục.
- [x] Freelancer gửi Proposal kèm báo giá, thời gian hoàn thành và thư ngỏ.
- [x] Khách hàng duyệt danh sách ứng viên và chấp thuận Proposal để tiến tới lập Hợp đồng.

### ✅ Giai Đoạn 3: Hợp Đồng & Ký Quỹ Escrow Theo Cột Mốc (Completed)
- [x] Khởi tạo Hợp đồng (`contracts`) tự động từ Proposal được phê duyệt.
- [x] Cơ chế **Smart Escrow Payment**: Tiền cọc được khóa bảo đảm tại `payment-service` trước khi bắt đầu công việc.
- [x] Quản lý vòng đời cột mốc: `CREATED` ➔ `FUNDED` ➔ `SUBMITTED` ➔ `APPROVED` ➔ `PAID`.
- [x] Freelancer nộp kết quả công việc kèm tệp đính kèm (`submissions`).
- [x] Client phê duyệt cột mốc: Hệ thống tự động giải ngân từ quỹ Escrow vào số dư khả dụng của ví Freelancer với Idempotency Key chống trừ tiền 2 lần.

### ✅ Giai Đoạn 4: Phản Hồi Chỉnh Sửa & Hủy Hợp Đồng Hoàn Tiền (Completed)
- [x] **Yêu cầu chỉnh sửa (`REQUEST_REVISION`)**: Client gửi phản hồi chi tiết yêu cầu Freelancer bổ sung sửa đổi khi sản phẩm chưa đạt.
- [x] **Hủy hợp đồng & Hoàn tiền (`TERMINATE_CONTRACT`)**:
  - Client có quyền đơn phương hủy hợp đồng nếu gặp vấn đề hợp tác.
  - Tự động tính toán số tiền của các cột mốc chưa giải ngân và hoàn trả lại 100% về ví Client ngay lập tức.
  - Chuyển trạng thái hợp đồng sang `TERMINATED` để lưu vết minh bạch.

### ✅ Giai Đoạn 5: Hệ Thống Đánh Giá & Nhận Xét 2 Chiều (Completed)
- [x] **2-Way Review Engine**: Sau khi hợp đồng `COMPLETED`, cả Client và Freelancer đều được để lại đánh giá (1 - 5 ⭐ kèm nhận xét).
- [x] **Database Integrity**: Đặt Composite Unique Constraint `@@unique([contractId, reviewerId])` ngăn chặn hoàn toàn race-condition hoặc spam nhiều lần review.
- [x] **Giao diện hiện đại**: Star Rating tương tác mượt mà, hiển thị nhận xét của cả 2 phía rõ ràng trên trang chi tiết hợp đồng.

---

## 🚀 Các Giai Đoạn Tiếp Theo Để Tối Ưu Hóa CV (Next Steps to Elevate CV)

### 🟡 Giai Đoạn 6: Realtime Chat & Project Communication Room
- **Mục tiêu:** Cho phép Khách hàng và Freelancer nhắn tin trao đổi trực tiếp theo thời gian thực mà không cần dùng ứng dụng bên thứ ba.
- **Các bước triển khai:**
  1. Xây dựng `chat-service` sử dụng **Socket.IO** và **Redis Adapter** để mở rộng cluster.
  2. Tạo phòng chat tự động khi hợp đồng được kích hoạt hoặc khi Client mở lời mời trao đổi Proposal.
  3. Hỗ trợ hiển thị trạng thái Online/Offline, "Đang soạn tin nhắn..." (Typing indicator), và thông báo tin nhắn chưa đọc.

### ⚪ Giai Đoạn 7: Tìm Kiếm & Lọc Nâng Cao (Search & Discovery)
- **Mục tiêu:** Nâng cao trải nghiệm tìm kiếm dự án và hồ sơ Freelancer với tốc độ phản hồi < 50ms.
- **Các bước triển khai:**
  1. Tích hợp công cụ tìm kiếm Full-text search (Meilisearch hoặc Elasticsearch).
  2. Đồng bộ dữ liệu dự án và hồ sơ ứng viên qua RabbitMQ CDC (Change Data Capture) hoặc Event Publishing.
  3. Lọc theo nhiều tiêu chí kết hợp: Khoảng lương, kỹ năng, số sao đánh giá trung bình, tỷ lệ hoàn thành dự án.

### ⚪ Giai Đoạn 8: Giám Sát Phân Tán (Observability & Tracing)
- **Mục tiêu:** Khẳng định năng lực làm chủ hệ thống phân tán cấp độ Senior.
- **Các bước triển khai:**
  1. Gắn **Correlation ID / Trace ID** xuyên suốt từ API Gateway qua từng microservice và Message Queue.
  2. Thiết lập thu thập Log tập trung bằng Winston / Pino chuyển về Grafana Loki.
  3. Dashboard theo dõi sức khỏe dịch vụ (Service Health, Message Queue Lag, API Response Time).

### ⚪ Giai Đoạn 9: Kiểm Thử & CI/CD Pipeline
- **Mục tiêu:** Đảm bảo độ ổn định và tiêu chuẩn kỹ thuật phần mềm chuyên nghiệp.
- **Các bước triển khai:**
  1. Viết Unit Test cho các nghiệp vụ cốt lõi (Escrow Release, Review Creation, State Transitions) bằng Jest.
  2. Viết E2E Test cho luồng chính (Ký hợp đồng ➔ Nộp bài ➔ Duyệt ➔ Rút tiền) bằng Playwright hoặc Supertest.
  3. Thiết lập GitHub Actions tự động kiểm tra Lint, Format, Build và Test trên mỗi Pull Request.

### ⚪ Giai Đoạn 10: Đóng Gói Container & Triển Khai Thực Tế (Live Demo)
- **Mục tiêu:** Cung cấp link Demo chạy thật và mã nguồn sạch sẽ cho nhà tuyển dụng trải nghiệm trực tiếp.
- **Các bước triển khai:**
  1. Tối ưu `docker-compose.production.yml` với multi-stage Dockerfile cho Frontend và các Microservices.
  2. Cấu hình Nginx Reverse Proxy hỗ trợ SSL Let's Encrypt, nén Brotli/Gzip, Cache tĩnh.
  3. Đưa website lên VPS (Ubuntu) kèm tài khoản demo mẫu (Tài khoản Client sẵn tiền, Freelancer có portfolio mẫu).

---

## 💼 Hướng Dẫn Mô Tả Dự Án Trong CV Tuyển Dụng

```markdown
### NỀN TẢNG FREELANCE MARKETPLACE TRÊN KIẾN TRÚC MICROSERVICES
**Vị trí:** Fullstack Developer (Backend-Heavy)  
**Công nghệ:** NestJS, Next.js 14, RabbitMQ, MariaDB, Prisma, Redis, Docker, TailwindCSS

**Mô tả:** Nền tảng kết nối việc làm Freelance chuẩn Upwork, giải quyết bài toán giao dịch an toàn giữa Khách hàng và Freelancer qua cơ chế Ký quỹ Escrow và đánh giá hai chiều.

**Đóng góp & Điểm sáng kỹ thuật:**
- Thiết kế hệ thống Microservices độc lập (Gateway, Auth, Project, Contract, Payment, Notification) giao tiếp qua RabbitMQ RPC & Event-Driven architecture.
- Xây dựng cơ chế **Smart Escrow Payment** bảo vệ dòng tiền: Tiền thầu được tạm khóa và chỉ giải ngân tự động khi khách hàng nghiệm thu cột mốc, áp dụng **Idempotency Keys** triệt tiêu lỗi giao dịch kép.
- Hiện thực hóa quy trình nghiệm thu đa trạng thái: Nộp bài, yêu cầu chỉnh sửa (Revision loop), và hủy hợp đồng tự động hoàn cọc an toàn.
- Phát triển hệ thống **Đánh giá 2 chiều (2-Way Reviews)** với Composite Unique Constraints ở tầng Database kết hợp Application Lock để chống race condition và spam đánh giá.
- Tối ưu hóa UI/UX với Next.js 14 App Router, Server Actions, TanStack React Query cache và TailwindCSS Dark Mode chuẩn hiện đại.
```
