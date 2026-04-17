import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "admin@reports.edu" },
    select: { id: true, email: true, passwordHash: true },
  });
  console.log("User found:", user?.email);
  if (user) {
    const match = await bcrypt.compare("Admin@123", user.passwordHash);
    console.log("Password matches:", match);
  }
  await prisma.$disconnect();
}
main();
