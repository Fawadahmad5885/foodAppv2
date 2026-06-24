import { Hero } from "@/components/storefront/hero";
import { MenuSection } from "@/components/storefront/menu-section";
import { getStorefrontMenu } from "@/lib/menu";

export default async function HomePage() {
  const menu = await getStorefrontMenu();

  return (
    <>
      <Hero />
      <MenuSection categories={menu.categories} combos={menu.combos} />
    </>
  );
}
