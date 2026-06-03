import type { MeatOption } from "@/lib/pricing";

export type MeatMenuItem = {
  name: MeatOption;
  slug: string;
  description: string;
  photoLabel: string;
};

export const MEAT_MENU_ITEMS: MeatMenuItem[] = [
  {
    name: "Carne Asada",
    slug: "carne-asada",
    description:
      "Grilled steak with deep char, warm spices, and a classic taqueria finish.",
    photoLabel: "Carne asada taco photo placeholder"
  },
  {
    name: "Chicken",
    slug: "chicken",
    description:
      "Tender marinated chicken built for bright salsa, cilantro, and lime.",
    photoLabel: "Chicken taco photo placeholder"
  },
  {
    name: "Al Pastor",
    slug: "al-pastor",
    description:
      "Adobo-marinated pork with smoky, sweet, and savory street-taco flavor.",
    photoLabel: "Al pastor taco photo placeholder"
  }
];

export const INCLUDED_SIDES = ["Rice", "Beans"] as const;
export const DRINK_OPTIONS = ["Horchata", "Jamaica"] as const;
