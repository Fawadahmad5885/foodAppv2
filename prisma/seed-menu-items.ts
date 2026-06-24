import { PrismaClient } from "@prisma/client";
import { MENU_CATEGORIES, MENU_PRODUCTS } from "./seed-menu-items-data";

const prisma = new PrismaClient();

const TENANT_SLUG = process.env.DEFAULT_TENANT_SLUG ?? "fiestaa";
const TAX_CATEGORY_ID = "seed-tax-standard";

async function clearMenuCatalog(tenantId: string) {
  await prisma.order.deleteMany({ where: { tenantId } });
  await prisma.combo.deleteMany({ where: { tenantId } });
  await prisma.product.deleteMany({ where: { tenantId } });
  await prisma.category.deleteMany({ where: { tenantId } });
  await prisma.modifierGroup.deleteMany({ where: { tenantId } });
  await prisma.tag.deleteMany({ where: { tenantId } });
  await prisma.allergen.deleteMany({ where: { tenantId } });
}

async function main() {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: TENANT_SLUG },
  });

  if (!tenant) {
    throw new Error(
      `Tenant "${TENANT_SLUG}" not found. Run the main seed first: npm run db:seed`,
    );
  }

  let taxCategory = await prisma.taxCategory.upsert({
    where: { id: TAX_CATEGORY_ID },
    update: { tenantId: tenant.id, name: "Standard", rate: 0.08, isDefault: true },
    create: {
      id: TAX_CATEGORY_ID,
      tenantId: tenant.id,
      name: "Standard",
      rate: 0.08,
      isDefault: true,
    },
  });

  await clearMenuCatalog(tenant.id);

  for (const category of MENU_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {
        tenantId: tenant.id,
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
        isActive: true,
      },
      create: {
        id: category.id,
        tenantId: tenant.id,
        name: category.name,
        description: category.description,
        sortOrder: category.sortOrder,
        isActive: true,
      },
    });
  }

  for (const item of MENU_PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { id: item.id },
      update: {
        tenantId: tenant.id,
        categoryId: item.categoryId,
        taxCategoryId: taxCategory.id,
        sku: item.sku,
        name: item.name,
        description: item.description,
        basePrice: item.basePrice,
        compareAtPrice: item.compareAtPrice,
        imageUrl: item.imagePath,
        prepTimeMinutes: item.prepTimeMinutes,
        calories: item.calories,
        isFeatured: item.isFeatured ?? false,
        isVegetarian: item.isVegetarian ?? false,
        spicyLevel: item.spicyLevel ?? 0,
        sortOrder: item.sortOrder,
        isActive: true,
      },
      create: {
        id: item.id,
        tenantId: tenant.id,
        categoryId: item.categoryId,
        taxCategoryId: taxCategory.id,
        sku: item.sku,
        name: item.name,
        description: item.description,
        basePrice: item.basePrice,
        compareAtPrice: item.compareAtPrice,
        imageUrl: item.imagePath,
        prepTimeMinutes: item.prepTimeMinutes,
        calories: item.calories,
        isFeatured: item.isFeatured ?? false,
        isVegetarian: item.isVegetarian ?? false,
        spicyLevel: item.spicyLevel ?? 0,
        sortOrder: item.sortOrder,
        isActive: true,
      },
    });

    await prisma.productImage.upsert({
      where: { id: `${item.id}-image` },
      update: {
        productId: product.id,
        url: item.imagePath,
        altText: item.name,
        isPrimary: true,
        sortOrder: 1,
      },
      create: {
        id: `${item.id}-image`,
        productId: product.id,
        url: item.imagePath,
        altText: item.name,
        isPrimary: true,
        sortOrder: 1,
      },
    });

    await prisma.productVariant.upsert({
      where: { id: `${item.id}-variant` },
      update: {
        productId: product.id,
        sku: item.sku,
        name: "Regular",
        price: item.basePrice,
        isDefault: true,
        sortOrder: 1,
      },
      create: {
        id: `${item.id}-variant`,
        productId: product.id,
        sku: item.sku,
        name: "Regular",
        price: item.basePrice,
        isDefault: true,
        sortOrder: 1,
      },
    });
  }

  console.log("Menu items seed complete:");
  console.log(`  Tenant: ${tenant.slug}`);
  console.log(`  Categories: ${MENU_CATEGORIES.length}`);
  console.log(`  Products: ${MENU_PRODUCTS.length}`);
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
