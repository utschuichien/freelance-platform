# 🌟 Lộ Trình & Quy Trình Triển Khai: Hệ Thống Đánh Giá & Nhận Xét 2 Chiều (2-Way Reviews & Ratings)

> **Mục tiêu:** Xây dựng tính năng đánh giá hai chiều (Khách hàng ↔ Freelancer) hoàn chỉnh chuẩn Upwork/Fiverr trên kiến trúc Microservices, tạo điểm nhấn kỹ thuật ấn tượng trong CV tuyển dụng.

---

## 📌 1. Tổng Quan Nghiệp Vụ (Business Flow)

```
[Hợp đồng Hoàn Thành (COMPLETED)]
         │
         ├──► Client đánh giá Freelancer (1 - 5 ⭐ + Nhận xét)
         │       └──► Thông báo realtime tới Freelancer
         │       └──► Cập nhật điểm uy tín hiển thị trên trang /freelancers
         │
         └──► Freelancer đánh giá Client (1 - 5 ⭐ + Nhận xét)
                 └──► Thông báo realtime tới Client
                 └──► Lưu lịch sử cộng tác vào hồ sơ Khách hàng
```

### 🔒 Quy tắc nghiệp vụ (Business Rules):
1. **Điều kiện kích hoạt:** Chỉ cho phép đánh giá khi Hợp đồng có trạng thái `status === 'COMPLETED'`.
2. **Bảo toàn tính duy nhất:** Mỗi bên chỉ được đánh giá **duy nhất 1 lần** cho mỗi hợp đồng (`@@unique([contractId, reviewerId])`).
3. **Người nhận tự động:** Hệ thống tự xác định `revieweeId` dựa trên vai trò:
   - Nếu Client đánh giá ➡️ `revieweeId` = `freelancerId`.
   - Nếu Freelancer đánh giá ➡️ `revieweeId` = `clientId`.

---

## 🗄️ 2. Thiết Kế Cơ Sở Dữ Liệu (Database Schema)

Bảng `reviews` đặt tại MariaDB `contract_db` liên kết trực tiếp với bảng `contracts`:

```prisma
model Review {
  id           String   @id @default(uuid()) @db.Char(36)
  contractId   String   @map("contract_id") @db.Char(36)
  reviewerId   String   @map("reviewer_id") @db.Char(36)
  revieweeId   String   @map("reviewee_id") @db.Char(36)
  reviewerRole String   @map("reviewer_role") @db.VarChar(20) // CLIENT | FREELANCER
  rating       Int      @db.TinyInt // 1 đến 5 sao
  comment      String?  @db.Text
  createdAt    DateTime @default(now()) @map("created_at")
  contract     Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)

  @@unique([contractId, reviewerId], name: "uq_contract_reviewer")
  @@map("reviews")
  @@index([contractId], name: "idx_reviews_contract")
  @@index([revieweeId], name: "idx_reviews_reviewee")
}
```

---

## 🚀 3. Quy Trình Triển Khai Chi Tiết Từng Bước

### Bước 1: Khai Báo Patterns & Constants (`@app/shared`)
1. **Patterns (`backend/libs/shared/src/patterns/contract.pattern.ts`)**:
   - `CREATE_REVIEW`: Tạo đánh giá mới.
   - `GET_CONTRACT_REVIEWS`: Lấy danh sách review theo hợp đồng.
   - `GET_USER_REVIEWS`: Lấy tất cả review của một User (kèm điểm Rating trung bình).
2. **RabbitMQ Constants (`backend/libs/shared/src/constants/rabbitmq.constants.ts`)**:
   - `REVIEW_SUBMITTED: 'notification.review.submitted'` (bắn event thông báo).

---

### Bước 2: Triển Khai Xử Lý Tại `contract-service`
1. **Tạo bảng `reviews` trong DB**: Đã tạo bảng thành công với Foreign Key và Unique Index.
2. **Viết Service Methods (`contract-service.service.ts`)**:
   - `createReview(data)`:
     - Kiểm tra hợp đồng tồn tại và `status === 'COMPLETED'`.
     - Xác thực `reviewerId` thuộc hợp đồng.
     - Kiểm tra đã đánh giá trước đó chưa (tránh trùng lặp).
     - Lưu bản ghi vào bảng `reviews`.
     - Bắn RabbitMQ Notification thông báo cho `revieweeId`.
   - `getContractReviews(contractId)`: Lấy các đánh giá trong hợp đồng.
   - `getUserReviews(userId)`: Lấy các đánh giá nhận được + tính trung bình sao.
3. **Controller (`contract-service.controller.ts`)**:
   - Đăng ký `@MessagePattern` cho 3 patterns trên.

---

### Bước 3: Điều Phối & Xác Thực Tại `api-gateway`
1. **Viết Endpoints (`contract.controller.ts`)**:
   - `POST /api/contracts/:id/reviews`:
     - `@UseGuards(AuthGuard)`: Lấy `userId` và `role` từ JWT token.
     - Nhận body `{ rating: number; comment?: string }`.
     - Gọi sang `contractClient` tạo review.
   - `GET /api/contracts/:id/reviews`: Xem các review của hợp đồng.
   - `GET /api/users/:userId/reviews`: Xem danh sách review của một freelancer/client.

---

### Bước 4: Xây Dựng Giao Diện Người Dùng (Frontend)
1. **Hook API (`frontend/src/hooks/api/useContracts.ts`)**:
   - `useCreateReview()`: Mutation gửi đánh giá.
2. **Component Modal Đánh Giá (`frontend/src/components/contracts/ReviewModal.tsx`)**:
   - Hiển thị 5 ngôi sao tương tác (Hover vàng sáng, click chọn điểm).
   - Textarea nhập lời nhận xét chân thực.
   - Hiển thị tên đối tác và tên cột mốc/dự án.
3. **Tích hợp vào Trang Chi Tiết Hợp Đồng (`contracts/[id]/page.tsx`)**:
   - Khi `contract.status === "COMPLETED"`:
     - Hiển thị Card **"Đánh giá & Nhận xét"**:
       - Nếu tôi chưa đánh giá ➡️ Nút **"Viết đánh giá đối tác"** mở `ReviewModal`.
       - Nếu tôi đã đánh giá ➡️ Hiển thị số sao + lời nhận xét của tôi.
       - Hiển thị nhận xét của đối tác gửi cho tôi (nếu đối tác đã viết).

---

## 💼 4. Điểm Nhấn Kỹ Thuật Khi Đưa Vào CV (CV Highlights)

Khi viết dự án này vào CV hoặc phỏng vấn với Tech Lead, hãy nhấn mạnh các ý sau:

1. **Composite Unique Constraint & Data Integrity:**
   - Sử dụng `@@unique([contractId, reviewerId])` ở tầng Database kết hợp kiểm tra nghiệp vụ ở Application Layer để triệt tiêu hoàn toàn lỗi Race Condition / Double Review.
2. **Decoupled Architecture & Event-Driven:**
   - Đánh giá được xử lý tại `contract-service`, sau đó phát sinh event qua **RabbitMQ Topic Exchange** để `notification-service` xử lý bất đồng bộ (Asynchronous) mà không làm nghẽn luồng HTTP request.
3. **Full Lifecycle Completeness (Business Maturity):**
   - Hoàn tất chu trình khép kín 100%: *Proposal ➡️ Escrow Hold ➡️ Milestone Submit ➡️ Revision Feedback ➡️ Escrow Release ➡️ Complete ➡️ 2-Way Rating*.
