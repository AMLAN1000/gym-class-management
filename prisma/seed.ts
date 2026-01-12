import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create Admin User
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@gym.com" },
    update: {},
    create: {
      email: "admin@gym.com",
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
      phone: "+1234567890",
    },
  });

  console.log("✅ Admin created:", admin.email);
  console.log("📧 Email: admin@gym.com");
  console.log("🔑 Password: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
