// src/seeds/createAdmin.ts
import bcrypt from "bcrypt";
import { userRepository } from "../utils/Repositories";
import { UserRole } from "../utils/Enums";

export async function ensureAdminUserExists() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "changeme123";

  // check if admin already exists
  const existingAdmin = await userRepository.findOne({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("[seed] Admin user already exists:", adminEmail);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const adminUser = await userRepository.save({
    name: "Admin",
    email: adminEmail,
    passwordHash,
    role: UserRole.ADMIN, // or "ADMIN" depending on your enum
  });

  console.log("[seed] Admin user created:", adminUser.email);
}
