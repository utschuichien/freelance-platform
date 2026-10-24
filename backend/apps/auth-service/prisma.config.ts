import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.AUTH_DATABASE_URL || "mysql://root:qwertyuiop0@127.0.0.1:3306/auth_db",
  },
})
