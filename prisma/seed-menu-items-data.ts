export type MenuCategorySeed = {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
};

export type MenuProductSeed = {
  id: string;
  categoryId: string;
  sku: string;
  name: string;
  description: string;
  basePrice: number;
  compareAtPrice?: number;
  imagePath: string;
  prepTimeMinutes?: number;
  calories?: number;
  isFeatured?: boolean;
  isVegetarian?: boolean;
  spicyLevel?: number;
  sortOrder: number;
};

export const MENU_CATEGORIES: MenuCategorySeed[] = [
  {
    id: "menu-category-pasta",
    name: "Pasta",
    description: "Creamy and saucy pasta favorites",
    sortOrder: 1,
  },
  {
    id: "menu-category-pizza",
    name: "Pizza",
    description: "Oven-baked pizzas with fresh toppings",
    sortOrder: 2,
  },
  {
    id: "menu-category-burgers",
    name: "Sandwiches",
    description: "Juicy burgers and sandwiches stacked with flavor",
    sortOrder: 3,
  },
];

export const MENU_PRODUCTS: MenuProductSeed[] = [
  {
    id: "menu-product-beef-burger",
    categoryId: "menu-category-burgers",
    sku: "BURG-001",
    name: "Beef Burger",
    description: "Grilled beef patty with lettuce, tomato, and house sauce",
    basePrice: 890,
    imagePath: "/images/menu-items/beef-burger.png",
    prepTimeMinutes: 12,
    calories: 580,
    sortOrder: 1,
  },
  {
    id: "menu-product-classic-beef-burger",
    categoryId: "menu-category-burgers",
    sku: "BURG-002",
    name: "Classic Beef Burger",
    description: "All-time favorite beef burger with cheddar and pickles",
    basePrice: 949,
    compareAtPrice: 1099,
    imagePath: "/images/menu-items/classic-beef-burger.jpg",
    prepTimeMinutes: 12,
    calories: 620,
    isFeatured: true,
    sortOrder: 2,
  },
  {
    id: "menu-product-zinger-burger",
    categoryId: "menu-category-burgers",
    sku: "BURG-003",
    name: "Zinger Burger",
    description: "Crispy spiced chicken fillet with mayo and fresh slaw",
    basePrice: 799,
    imagePath: "/images/menu-items/zinger-burger.jpg",
    prepTimeMinutes: 10,
    calories: 540,
    spicyLevel: 2,
    sortOrder: 3,
  },
  {
    id: "menu-product-mighty-zinger-burger",
    categoryId: "menu-category-burgers",
    sku: "BURG-004",
    name: "Mighty Zinger Burger",
    description: "Double crispy fillet with extra cheese and fiery sauce",
    basePrice: 1099,
    imagePath: "/images/menu-items/mighty-zinger-burger.webp",
    prepTimeMinutes: 14,
    calories: 710,
    isFeatured: true,
    spicyLevel: 3,
    sortOrder: 4,
  },
  {
    id: "menu-product-classic-cheese-pizza",
    categoryId: "menu-category-pizza",
    sku: "PIZZA-001",
    name: "Classic Cheese Pizza",
    description: "Mozzarella and rich tomato sauce on a hand-tossed crust",
    basePrice: 1199,
    imagePath: "/images/menu-items/classic-cheese-pizza.jpg",
    prepTimeMinutes: 18,
    calories: 820,
    isVegetarian: true,
    sortOrder: 1,
  },
  {
    id: "menu-product-pepperoni-pizza",
    categoryId: "menu-category-pizza",
    sku: "PIZZA-002",
    name: "Pepperoni Pizza",
    description: "Classic pepperoni with melted cheese and herb crust",
    basePrice: 1349,
    imagePath: "/images/menu-items/pepperoni-pizza.jpg",
    prepTimeMinutes: 18,
    calories: 890,
    isFeatured: true,
    sortOrder: 2,
  },
  {
    id: "menu-product-red-sauce-pizza",
    categoryId: "menu-category-pizza",
    sku: "PIZZA-003",
    name: "Red Sauce Pizza",
    description: "Tangy red sauce base with mozzarella and Italian herbs",
    basePrice: 1249,
    imagePath: "/images/menu-items/red-sauce-pizza.jpg",
    prepTimeMinutes: 18,
    calories: 850,
    sortOrder: 3,
  },
  {
    id: "menu-product-chicken-fajita-pizza",
    categoryId: "menu-category-pizza",
    sku: "PIZZA-004",
    name: "Chicken Fajita Pizza",
    description: "Grilled chicken, peppers, and onions on a fajita-style pizza",
    basePrice: 1499,
    imagePath: "/images/menu-items/chicken-fajita-pizza.jpg",
    prepTimeMinutes: 20,
    calories: 910,
    spicyLevel: 1,
    sortOrder: 4,
  },
  {
    id: "menu-product-chicken-fajita-pasta",
    categoryId: "menu-category-pasta",
    sku: "PASTA-001",
    name: "Chicken Fajita Pasta",
    description: "Penne tossed with fajita chicken, peppers, and creamy sauce",
    basePrice: 1099,
    imagePath: "/images/menu-items/chicken-fajita-pasta.jpg",
    prepTimeMinutes: 16,
    calories: 680,
    spicyLevel: 1,
    sortOrder: 1,
  },
];
