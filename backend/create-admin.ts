import { PrismaClient as AuthPrismaClient } from './node_modules/@prisma/client/auth/index.js';
import { PrismaClient as UserPrismaClient } from './node_modules/@prisma/client/user/index.js';
import * as bcrypt from 'bcrypt';
import { createPool } from 'mariadb';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const authPool = createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'qwertyuiop0',
  database: 'auth_db',
  allowPublicKeyRetrieval: true,
});
const authPrisma = new AuthPrismaClient({ adapter: new PrismaMariaDb(authPool as any) });

const userPool = createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'qwertyuiop0',
  database: 'user_db',
  allowPublicKeyRetrieval: true,
});
const userPrisma = new UserPrismaClient({ adapter: new PrismaMariaDb(userPool as any) });

async function main() {
  const email = 'admin@freelancex.com';
  const existingUser = await authPrisma.user.findUnique({ where: { email } });
  
  if (existingUser) {
    console.log('Admin already exists!');
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('admin123', salt);

  const admin = await authPrisma.user.create({
    data: {
      email,
      passwordHash,
      fullName: 'Super Admin',
      role: 'ADMIN',
      phoneNumber: '0123456789'
    }
  });

  console.log('Admin created in auth-service successfully!', admin.id);

  const profile = await userPrisma.userProfile.create({
    data: {
      userId: admin.id,
      fullName: admin.fullName,
      phoneNumber: admin.phoneNumber,
      kycStatus: 'VERIFIED'
    }
  });

  console.log('Admin profile created in user-service successfully!', profile.id);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await authPrisma.$disconnect();
    await userPrisma.$disconnect();
    await authPool.end();
    await userPool.end();
  });
