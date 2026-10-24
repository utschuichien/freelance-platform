import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.CONTRACT_DATABASE_URL || "mysql://root:qwertyuiop0@127.0.0.1:3306/contract_db",
  },
})
