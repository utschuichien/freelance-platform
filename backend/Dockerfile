# ==========================================
# Giai đoạn 1: Base image chuẩn
# ==========================================
FROM node:20-alpine AS base
WORKDIR /app
# Cài đặt libc6-compat (hỗ trợ các thư viện C/Prisma engines trên Alpine)
RUN apk add --no-cache libc6-compat

# ==========================================
# Giai đoạn 2: Cài đặt Dependencies để Build
# ==========================================
FROM base AS deps
WORKDIR /app

# Chỉ cài build tools (python/make/g++) ở tầng này nếu thực sự có native packages
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
RUN npm ci

# ==========================================
# Giai đoạn 3: Build Source Code
# ==========================================
FROM base AS builder
WORKDIR /app

ARG APP_NAME=api-gateway

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Nếu service dùng Prisma, mở comment dòng dưới để generate client trước khi build:
# RUN npx prisma generate --schema=apps/${APP_NAME}/prisma/schema.prisma

# Build đúng service được chỉ định
RUN npx nest build ${APP_NAME}

# Dọn dẹp devDependencies ngay tại đây, chỉ giữ lại production packages
RUN npm prune --omit=dev

# ==========================================
# Giai đoạn 4: Runtime tối giản & bảo mật
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Chuyển sang user không có quyền root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

ARG APP_NAME=api-gateway
ENV APP_NAME=${APP_NAME}

# Copy package.json và node_modules đã được lọc sạch devDependencies
COPY package.json ./
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Chỉ copy đúng thư mục bundle của service cần chạy
COPY --from=builder --chown=nestjs:nodejs /app/dist/apps/${APP_NAME} ./dist

USER nestjs

# Chạy trực tiếp file main.js bên trong thư mục dist đã copy
CMD ["node", "dist/main.js"]