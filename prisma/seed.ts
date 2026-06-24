import {
  DiscountScope,
  DiscountType,
  PlatformRole,
  PrismaClient,
  TenantRole,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const vendorEmail = process.env.SEED_VENDOR_EMAIL;
  const vendorPassword = process.env.SEED_VENDOR_PASSWORD;

  if (!adminEmail || !adminPassword || !vendorEmail || !vendorPassword) {
    throw new Error(
      "Missing seed env vars: SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_VENDOR_EMAIL, SEED_VENDOR_PASSWORD",
    );
  }

  const adminPasswordHash = await hash(adminPassword, 12);
  const vendorPasswordHash = await hash(vendorPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Platform Admin",
      passwordHash: adminPasswordHash,
      platformRole: PlatformRole.SUPER_ADMIN,
    },
    create: {
      email: adminEmail,
      name: "Platform Admin",
      passwordHash: adminPasswordHash,
      platformRole: PlatformRole.SUPER_ADMIN,
    },
  });

  const tenant = await prisma.tenant.upsert({
    where: { slug: "fiestaa" },
    update: { name: "Fiestaa", status: "ACTIVE" },
    create: { slug: "fiestaa", name: "Fiestaa", status: "ACTIVE" },
  });

  await prisma.tenantDomain.upsert({
    where: { domain: "fiestaa.fiesta.io" },
    update: { tenantId: tenant.id, isPrimary: true, verified: true },
    create: {
      tenantId: tenant.id,
      domain: "fiestaa.fiesta.io",
      isPrimary: true,
      verified: true,
    },
  });

  const vendor = await prisma.user.upsert({
    where: { email: vendorEmail },
    update: {
      name: "Fiestaa Owner",
      passwordHash: vendorPasswordHash,
      platformRole: PlatformRole.VENDOR_OWNER,
    },
    create: {
      email: vendorEmail,
      name: "Fiestaa Owner",
      passwordHash: vendorPasswordHash,
      platformRole: PlatformRole.VENDOR_OWNER,
    },
  });

  await prisma.tenantMembership.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: vendor.id } },
    update: { role: TenantRole.OWNER },
    create: { tenantId: tenant.id, userId: vendor.id, role: TenantRole.OWNER },
  });

  const standardTax = await prisma.taxCategory.upsert({
    where: { id: "seed-tax-standard" },
    update: { tenantId: tenant.id, name: "Standard", rate: 0.08, isDefault: true },
    create: {
      id: "seed-tax-standard",
      tenantId: tenant.id,
      name: "Standard",
      rate: 0.08,
      isDefault: true,
    },
  });

  await prisma.discount.upsert({
    where: { id: "seed-discount-welcome10" },
    update: {
      tenantId: tenant.id,
      code: "WELCOME10",
      name: "Welcome 10% Off",
      description: "10% off your first order",
      type: DiscountType.PERCENTAGE,
      scope: DiscountScope.ORDER,
      value: 10,
      minOrderAmount: 15,
      maxDiscountAmount: 20,
      usageLimit: 1000,
      isActive: true,
      isAutomatic: false,
    },
    create: {
      id: "seed-discount-welcome10",
      tenantId: tenant.id,
      code: "WELCOME10",
      name: "Welcome 10% Off",
      description: "10% off your first order",
      type: DiscountType.PERCENTAGE,
      scope: DiscountScope.ORDER,
      value: 10,
      minOrderAmount: 15,
      maxDiscountAmount: 20,
      usageLimit: 1000,
      isActive: true,
      isAutomatic: false,
    },
  });

  await prisma.discount.upsert({
    where: { id: "seed-discount-burger5" },
    update: {
      tenantId: tenant.id,
      code: "BURGER5",
      name: "$5 Off Burgers",
      type: DiscountType.FIXED_AMOUNT,
      scope: DiscountScope.CATEGORY,
      value: 5,
      minOrderAmount: 10,
      isActive: true,
    },
    create: {
      id: "seed-discount-burger5",
      tenantId: tenant.id,
      code: "BURGER5",
      name: "$5 Off Burgers",
      type: DiscountType.FIXED_AMOUNT,
      scope: DiscountScope.CATEGORY,
      value: 5,
      minOrderAmount: 10,
      isActive: true,
    },
  });

  console.log("Seed complete:");
  console.log(`  Super admin: ${admin.email}`);
  console.log(`  Demo vendor: ${vendor.email} (tenant: ${tenant.slug})`);
  console.log(`  Tax category: ${standardTax.name}`);
  console.log("  Run npm run db:seed:menu-items to load the menu catalog.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
