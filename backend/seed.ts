import 'dotenv/config';
import { PrismaClient as AuthPrismaClient } from '@prisma/client/auth/index.js';
import { PrismaClient as ProjectPrismaClient } from '@prisma/client/project/index.js';
import { PrismaClient as UserPrismaClient } from '@prisma/client/user/index.js';
import { createPool } from 'mariadb';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASSWORD || 'qwertyuiop0';

const createDbPool = (database: string) =>
  createPool({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASS,
    database,
    allowPublicKeyRetrieval: true,
    connectionLimit: 10,
  });

const authPrisma = new AuthPrismaClient({ adapter: new PrismaMariaDb(createDbPool('auth_db') as any) });
const projectPrisma = new ProjectPrismaClient({ adapter: new PrismaMariaDb(createDbPool('project_db') as any) });
const userPrisma = new UserPrismaClient({ adapter: new PrismaMariaDb(createDbPool('user_db') as any) });

const CATEGORIES = [
  "Lập trình Web",
  "Lập trình Mobile",
  "Thiết kế UI/UX",
  "Thiết kế Đồ họa",
  "DevOps & Cloud",
  "Khoa học Dữ liệu & AI",
  "Marketing & SEO",
  "Blockchain"
];

const SKILLS = [
  "React", "Node.js", "Python", "NestJS", "TypeScript",
  "AWS", "Docker", "Figma", "UI/UX", "SEO",
  "React Native", "Flutter", "Swift", "Kotlin", "Go",
  "PostgreSQL", "MongoDB", "Redis", "RabbitMQ", "Kafka"
];

const PROJECT_TEMPLATES = [
  {
    title: "Xây dựng ứng dụng E-commerce với Next.js và NestJS",
    category: "Lập trình Web",
    desc: "Chúng tôi cần một hệ thống thương mại điện tử hoàn chỉnh. Backend dùng NestJS kiến trúc microservices. Frontend dùng Next.js App Router, SSR/SSG. Yêu cầu tích hợp cổng thanh toán VNPay và Momo.",
    budgetRange: [20000000, 50000000]
  },
  {
    title: "Thiết kế UI/UX cho ứng dụng Đặt xe công nghệ",
    category: "Thiết kế UI/UX",
    desc: "Cần tìm UX/UI Designer có kinh nghiệm làm app Mobile (iOS/Android). Thiết kế từ wireframe đến prototype hoàn chỉnh trên Figma. Phong cách hiện đại, tối giản và thân thiện với người dùng.",
    budgetRange: [10000000, 20000000]
  },
  {
    title: "Lập trình App Mobile Quản lý Tài chính cá nhân (Flutter)",
    category: "Lập trình Mobile",
    desc: "Viết ứng dụng mobile đa nền tảng bằng Flutter. Tính năng: ghi chép thu chi, vẽ biểu đồ báo cáo, nhắc nhở thanh toán hóa đơn. Có kết nối API với Backend đã có sẵn.",
    budgetRange: [15000000, 30000000]
  },
  {
    title: "Tối ưu hóa SEO và tốc độ tải trang cho Website Tin Tức",
    category: "Marketing & SEO",
    desc: "Website hiện tại đang load chậm và điểm Core Web Vitals thấp. Cần một chuyên gia SEO & Performance để tối ưu lại hình ảnh, cache, SSR và cấu trúc thẻ HTML để lên top Google.",
    budgetRange: [5000000, 15000000]
  },
  {
    title: "Viết script Python Cào Dữ Liệu (Web Scraping)",
    category: "Khoa học Dữ liệu & AI",
    desc: "Cần viết tool tự động vào một số trang web bất động sản để crawl data hằng ngày, lưu vào database PostgreSQL. Có sử dụng proxy để tránh bị block. Yêu cầu code sạch, dễ maintain.",
    budgetRange: [3000000, 8000000]
  },
  {
    title: "Setup CI/CD và Kubernetes trên AWS (DevOps)",
    category: "DevOps & Cloud",
    desc: "Hệ thống có 5 microservices. Cần chuyên gia DevOps viết Dockerfile, thiết lập Gitlab CI/CD và deploy lên cụm EKS trên AWS. Yêu cầu cấu hình Auto-scaling và Monitoring với Prometheus/Grafana.",
    budgetRange: [30000000, 60000000]
  },
  {
    title: "Lập trình Smart Contract cho dự án NFT (Solidity)",
    category: "Blockchain",
    desc: "Cần viết Smart Contract trên mạng Ethereum/Polygon cho một bộ sưu tập NFT. Có tính năng whitelist, minting với giá thay đổi theo thời gian. Yêu cầu đã từng có kinh nghiệm audit contract.",
    budgetRange: [40000000, 80000000]
  },
  {
    title: "Nâng cấp hệ thống Backend từ Monolithic sang Microservices",
    category: "Lập trình Web",
    desc: "Hệ thống cũ bằng Node.js Express quá tải. Cần tái cấu trúc sang NestJS + gRPC/RabbitMQ. Yêu cầu kinh nghiệm xử lý Distributed Transaction và Idempotency.",
    budgetRange: [50000000, 100000000]
  },
  {
    title: "Chạy quảng cáo Facebook & Google Ads cho SPA",
    category: "Marketing & SEO",
    desc: "Cần tìm Freelancer Marketing chạy ads tìm kiếm khách hàng cho cơ sở Spa mới mở. Ngân sách chạy ads 20tr/tháng. Phí dịch vụ thỏa thuận theo % hoặc cố định.",
    budgetRange: [4000000, 10000000]
  },
  {
    title: "Thiết kế Logo và Bộ nhận diện thương hiệu cho Startup",
    category: "Thiết kế Đồ họa",
    desc: "Startup về mảng EdTech. Cần thiết kế Logo mang tính hiện đại, bộ nhận diện gồm Namecard, Letterhead, áo thun, và guidelines chuẩn. Có ít nhất 3 concept để lựa chọn.",
    budgetRange: [5000000, 12000000]
  }
];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomItems<T>(arr: T[], n: number): T[] {
  const shuffled = arr.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

async function seed() {
  console.log("🚀 Bắt đầu quá trình Seeding dữ liệu...\n");
  const defaultPassword = await bcrypt.hash('password123', 10);

  // ----------------------------------------------------
  // 1. DỌN DẸP DỮ LIỆU CŨ TRƯỚC KHI TẠO MỚI
  // ----------------------------------------------------
  console.log("🧹 1. Đang dọn dẹp dữ liệu cũ...");
  try {
    await projectPrisma.milestone.deleteMany({});
    await projectPrisma.projectSkill.deleteMany({});
    await projectPrisma.proposal.deleteMany({});
    await projectPrisma.project.deleteMany({});
    console.log("   ✔ Đã xóa dữ liệu cũ trong project_db");

    await authPrisma.refreshToken.deleteMany({});
    await authPrisma.otp.deleteMany({});
    await authPrisma.user.deleteMany({});
    console.log("   ✔ Đã xóa dữ liệu cũ trong auth_db");

    await userPrisma.userProfile.deleteMany({});
    console.log("   ✔ Đã xóa dữ liệu cũ trong user_db");
  } catch (err) {
    console.warn("   ⚠️ Lưu ý khi dọn dẹp:", (err as any).message);
  }

  // ----------------------------------------------------
  // 2. TẠO TÀI KHOẢN ADMIN
  // ----------------------------------------------------
  console.log("\n👑 2. Đang tạo tài khoản Super Admin...");
  const adminId = uuidv4();
  const admin = await authPrisma.user.create({
    data: {
      id: adminId,
      email: 'admin@freelancex.com',
      passwordHash: defaultPassword,
      fullName: 'Super Admin FreelanceX',
      role: 'ADMIN',
      phoneNumber: '0901234567',
      isActive: true,
    }
  });

  await userPrisma.userProfile.create({
    data: {
      userId: admin.id,
      fullName: admin.fullName,
      phoneNumber: admin.phoneNumber,
      kycStatus: 'VERIFIED',
    }
  });
  console.log("   ✔ Admin tạo thành công: admin@freelancex.com | Mật khẩu: password123");

  // ----------------------------------------------------
  // 3. TẠO 10 CLIENTS
  // ----------------------------------------------------
  console.log("\n🏢 3. Đang tạo 10 Clients...");
  const clients: any[] = [];
  for (let i = 1; i <= 10; i++) {
    const id = uuidv4();
    const client = await authPrisma.user.create({
      data: {
        id,
        email: `client${i}@example.com`,
        passwordHash: defaultPassword,
        fullName: `Công Ty / Client ${i}`,
        role: 'CLIENT',
        isActive: true,
      }
    });
    clients.push(client);

    await userPrisma.userProfile.create({
      data: {
        userId: client.id,
        fullName: client.fullName,
        kycStatus: 'VERIFIED',
      }
    });
  }
  console.log("   ✔ Đã tạo 10 Clients (client1@example.com -> client10@example.com)");

  // ----------------------------------------------------
  // 4. TẠO 100 FREELANCERS
  // ----------------------------------------------------
  console.log("\n💻 4. Đang tạo 100 Freelancers...");
  for (let i = 1; i <= 100; i++) {
    const id = uuidv4();
    const freelancer = await authPrisma.user.create({
      data: {
        id,
        email: `freelancer${i}@example.com`,
        passwordHash: defaultPassword,
        fullName: `Freelancer Chuyên Nghiệp ${i}`,
        role: 'FREELANCER',
        isActive: true,
      }
    });

    await userPrisma.userProfile.create({
      data: {
        userId: freelancer.id,
        fullName: freelancer.fullName,
        hourlyRate: getRandomInt(200000, 1000000),
        kycStatus: 'VERIFIED',
      }
    });
  }
  console.log("   ✔ Đã tạo 100 Freelancers (freelancer1@example.com -> freelancer100@example.com)");

  // ----------------------------------------------------
  // 5. CHUẨN BỊ CATEGORIES & SKILLS TRONG PROJECT_DB
  // ----------------------------------------------------
  console.log("\n📂 5. Đang đồng bộ danh mục Ngành nghề (Categories)...");
  const categoryMap = new Map<string, number>();
  for (const catName of CATEGORIES) {
    const cat = await projectPrisma.category.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName }
    });
    categoryMap.set(catName, cat.id);
  }

  console.log("🛠️  Đang đồng bộ danh sách Kỹ năng (Skills)...");
  for (const skillName of SKILLS) {
    await projectPrisma.skill.upsert({
      where: { name: skillName.toUpperCase() },
      update: {},
      create: { name: skillName.toUpperCase() }
    });
  }
  const allSkills = await projectPrisma.skill.findMany();

  // ----------------------------------------------------
  // 6. TẠO 100 DỰ ÁN MẪU (MỖI CLIENT TẠO 10 DỰ ÁN)
  // ----------------------------------------------------
  console.log("\n📋 6. Đang tạo 100 Dự án thực tế (Projects)...");
  for (const client of clients) {
    for (let j = 0; j < 10; j++) {
      const template = PROJECT_TEMPLATES[getRandomInt(0, PROJECT_TEMPLATES.length - 1)];
      const categoryId = categoryMap.get(template.category) || null;
      const budget = getRandomInt(template.budgetRange[0], template.budgetRange[1]);
      const projectSkills = getRandomItems(allSkills, getRandomInt(2, 5));
      const daysToDeadline = getRandomInt(10, 60);
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + daysToDeadline);

      await projectPrisma.project.create({
        data: {
          clientId: client.id,
          title: template.title + ` (Mã: #${getRandomInt(1000, 9999)})`,
          description: template.desc,
          budget: budget,
          deadline: deadline,
          status: 'OPEN',
          categoryId: categoryId,
          skills: {
            create: projectSkills.map(skill => ({
              skill: { connect: { id: skill.id } }
            }))
          },
          milestones: {
            create: [
              {
                title: "Giai đoạn 1: Thiết kế / Lên kế hoạch",
                amount: Math.floor(budget * 0.3),
                order: 1
              },
              {
                title: "Giai đoạn 2: Phát triển / Triển khai",
                amount: Math.floor(budget * 0.5),
                order: 2
              },
              {
                title: "Giai đoạn 3: Bàn giao & Nghiệm thu",
                amount: Math.floor(budget * 0.2),
                order: 3
              }
            ]
          }
        }
      });
    }
  }

  console.log("\n========================================================");
  console.log("✅ QUÁ TRÌNH SEEDING HOÀN TẤT THÀNH CÔNG RỰC RỠ!");
  console.log("========================================================");
  console.log("👑 ADMIN:      admin@freelancex.com       | pass: password123");
  console.log("🏢 CLIENT:     client1@example.com        | pass: password123 (1 -> 10)");
  console.log("💻 FREELANCER: freelancer1@example.com    | pass: password123 (1 -> 100)");
  console.log("========================================================\n");
}

seed()
  .catch(e => {
    console.error("❌ Lỗi khi seed dữ liệu:", e);
  })
  .finally(async () => {
    await authPrisma.$disconnect();
    await projectPrisma.$disconnect();
    await userPrisma.$disconnect();
  });
