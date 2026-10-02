export type PreviewCategory = "clothing" | "shoes" | "bags" | "jewelry";

export type PreviewVariant = {
  id: string;
  label: string;
};

export type PreviewProduct = {
  id: string;
  slug: string;
  name: string;
  editLabel: string;
  category: PreviewCategory;
  categoryLabel: string;
  priceCents: number;
  compareAtPriceCents?: number;
  image: string;
  imageAlt: string;
  color: string;
  description: string;
  materials: string;
  care: string;
  variants: PreviewVariant[];
  isNew: boolean;
  isFeatured: boolean;
  isSale: boolean;
};

export type PreviewCollection = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
  productSlugs: string[];
};

export type PreviewStyleDirection = {
  slug: string;
  title: string;
  descriptor: string;
  description: string;
  image: string;
  imageAlt: string;
  productSlugs: string[];
};

export const PREVIEW_PRODUCTS: readonly PreviewProduct[] = [
  {
    id: "aaaaaaa1-aaaa-4aaa-8aaa-aaaaaaaaaaa1",
    slug: "the-evening-drape-gown",
    name: "The Evening Drape Gown",
    editLabel: "MARCADELE · CONCEPT EDIT",
    category: "clothing",
    categoryLabel: "Clothing",
    priceCents: 89000,
    image: "/images/marcadele-hero.jpg",
    imageAlt: "Editorial fashion image used for the Marcadele concept preview",
    color: "Midnight black",
    description: "A fluid evening silhouette imagined for the Marcadele presentation edit. This is illustrative catalog copy, not a product specification.",
    materials: "Material details to be confirmed for any future product.",
    care: "Care guidance to be confirmed for any future product.",
    variants: [
      { id: "11111111-1111-4111-8111-111111111111", label: "Sample size · S" },
      { id: "11111111-1111-4111-8111-111111111112", label: "Sample size · M" },
      { id: "11111111-1111-4111-8111-111111111113", label: "Sample size · L" },
    ],
    isNew: true,
    isFeatured: true,
    isSale: false,
  },
  {
    id: "aaaaaaa2-aaaa-4aaa-8aaa-aaaaaaaaaaa2",
    slug: "sculpted-top-handle-bag",
    name: "Sculpted Top-Handle Bag",
    editLabel: "MARCADELE · CONCEPT EDIT",
    category: "bags",
    categoryLabel: "Bags",
    priceCents: 64000,
    image: "/images/product-sculpted-bag.jpg",
    imageAlt: "Sculpted bag concept photographed against a warm neutral backdrop",
    color: "Dark cocoa",
    description: "A structured shape and considered proportions form the starting point for this imagined accessories story.",
    materials: "Material details to be confirmed for any future product.",
    care: "Care guidance to be confirmed for any future product.",
    variants: [{ id: "22222222-2222-4222-8222-222222222222", label: "Sample option · One size" }],
    isNew: true,
    isFeatured: true,
    isSale: false,
  },
  {
    id: "aaaaaaa3-aaaa-4aaa-8aaa-aaaaaaaaaaa3",
    slug: "noir-satin-heel",
    name: "Noir Satin Heel",
    editLabel: "MARCADELE · CONCEPT EDIT",
    category: "shoes",
    categoryLabel: "Shoes",
    priceCents: 42500,
    image: "/images/product-onyx-pump.jpg",
    imageAlt: "Black heel concept photographed against a soft neutral backdrop",
    color: "Onyx",
    description: "An evening shoe concept with a sculptural line, created as part of the visual direction for this preview.",
    materials: "Material details to be confirmed for any future product.",
    care: "Care guidance to be confirmed for any future product.",
    variants: [
      { id: "33333333-3333-4333-8333-333333333331", label: "Sample size · US 7" },
      { id: "33333333-3333-4333-8333-333333333332", label: "Sample size · US 8" },
      { id: "33333333-3333-4333-8333-333333333333", label: "Sample size · US 9" },
    ],
    isNew: false,
    isFeatured: true,
    isSale: false,
  },
  {
    id: "aaaaaaa4-aaaa-4aaa-8aaa-aaaaaaaaaaa4",
    slug: "sculptural-gold-drop-earrings",
    name: "Sculptural Gold Drop Earrings",
    editLabel: "MARCADELE · CONCEPT EDIT",
    category: "jewelry",
    categoryLabel: "Jewelry",
    priceCents: 28500,
    compareAtPriceCents: 34000,
    image: "/images/product-gold-earrings.jpg",
    imageAlt: "Gold-tone earrings concept photographed against a warm neutral backdrop",
    color: "Soft gold",
    description: "An expressive form and warm metallic finish imagined for a future jewelry edit. All product details shown here are placeholders.",
    materials: "Material details to be confirmed for any future product.",
    care: "Care guidance to be confirmed for any future product.",
    variants: [{ id: "44444444-4444-4444-8444-444444444444", label: "Sample option · One size" }],
    isNew: true,
    isFeatured: true,
    isSale: true,
  },
];

export const PREVIEW_CATEGORIES: ReadonlyArray<{
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  image: string;
  imageAlt: string;
}> = [
  {
    slug: "clothing",
    title: "Clothing",
    eyebrow: "The wardrobe",
    description: "An imagined edit of expressive silhouettes and considered layers.",
    image: "/images/marcadele-hero.jpg",
    imageAlt: "Editorial campaign image for the clothing concept",
  },
  {
    slug: "bags",
    title: "Bags",
    eyebrow: "Form & function",
    description: "Sculptural shapes and distinctive proportions, explored in concept.",
    image: "/images/product-sculpted-bag.jpg",
    imageAlt: "Sculpted bag concept on a warm neutral backdrop",
  },
  {
    slug: "shoes",
    title: "Shoes",
    eyebrow: "A finishing touch",
    description: "A visual study in line, shape, and occasion dressing.",
    image: "/images/product-onyx-pump.jpg",
    imageAlt: "Black heel concept on a neutral backdrop",
  },
  {
    slug: "jewelry",
    title: "Jewelry",
    eyebrow: "The details",
    description: "Illustrative accents with a sculptural point of view.",
    image: "/images/product-gold-earrings.jpg",
    imageAlt: "Gold-tone earring concept on a warm neutral backdrop",
  },
];

export const PREVIEW_COLLECTIONS: readonly PreviewCollection[] = [
  {
    slug: "after-hours",
    title: "After Hours",
    subtitle: "LOOKBOOK 01 · CONCEPT",
    description: "A visual story in black, soft light, and expressive evening silhouettes.",
    image: "/images/marcadele-hero.jpg",
    imageAlt: "Eveningwear editorial image for an illustrative Marcadele lookbook",
    productSlugs: ["the-evening-drape-gown", "noir-satin-heel"],
  },
  {
    slug: "objects-of-form",
    title: "Objects of Form",
    subtitle: "LOOKBOOK 02 · CONCEPT",
    description: "A study of proportion and sculptural detail across imagined accessories.",
    image: "/images/product-sculpted-bag.jpg",
    imageAlt: "Sculpted bag concept for an illustrative Marcadele lookbook",
    productSlugs: ["sculpted-top-handle-bag", "sculptural-gold-drop-earrings"],
  },
];

export const PREVIEW_STYLE_DIRECTIONS: readonly PreviewStyleDirection[] = [
  {
    slug: "after-dark",
    title: "After Dark",
    descriptor: "Style direction · Concept",
    description: "Evening silhouettes, expressive shape, and considered finishing touches.",
    image: "/images/marcadele-hero.jpg",
    imageAlt: "Editorial image representing the After Dark style direction",
    productSlugs: ["the-evening-drape-gown", "noir-satin-heel"],
  },
  {
    slug: "sculptural-form",
    title: "Sculptural Form",
    descriptor: "Style direction · Concept",
    description: "A visual language built around strong outlines and tactile-looking forms.",
    image: "/images/product-sculpted-bag.jpg",
    imageAlt: "Sculpted bag concept representing the Sculptural Form style direction",
    productSlugs: ["sculpted-top-handle-bag", "sculptural-gold-drop-earrings"],
  },
  {
    slug: "the-finishing-touch",
    title: "The Finishing Touch",
    descriptor: "Style direction · Concept",
    description: "An illustrative edit of accessories designed to bring a look together.",
    image: "/images/product-gold-earrings.jpg",
    imageAlt: "Gold-tone earrings concept representing The Finishing Touch style direction",
    productSlugs: ["sculptural-gold-drop-earrings", "sculpted-top-handle-bag"],
  },
];

export const PREVIEW_NOTICE =
  "Presentation preview: products, imagery, options, and prices are illustrative only and are not available for sale.";

export function getPreviewProductBySlug(slug: string) {
  return PREVIEW_PRODUCTS.find((product) => product.slug === slug) ?? null;
}

export function getPreviewProductByVariantId(variantId: string) {
  return PREVIEW_PRODUCTS.find((product) => product.variants.some((variant) => variant.id === variantId)) ?? null;
}

export function getPreviewCategory(slug: string) {
  return PREVIEW_CATEGORIES.find((category) => category.slug === slug) ?? null;
}

export function getPreviewCollection(slug: string) {
  return PREVIEW_COLLECTIONS.find((collection) => collection.slug === slug) ?? null;
}

export function getPreviewStyleDirection(slug: string) {
  return PREVIEW_STYLE_DIRECTIONS.find((direction) => direction.slug === slug) ?? null;
}

export function formatPreviewUsd(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function findPreviewProducts(options: {
  category?: string;
  query?: string;
  sort?: string;
  newOnly?: boolean;
  saleOnly?: boolean;
} = {}) {
  const normalizedQuery = options.query?.trim().toLowerCase() ?? "";
  const results = PREVIEW_PRODUCTS.filter((product) => {
    const matchesCategory = !options.category || options.category === "all" || product.category === options.category;
    const matchesNew = !options.newOnly || product.isNew;
    const matchesSale = !options.saleOnly || product.isSale;
    const searchIndex = `${product.name} ${product.editLabel} ${product.categoryLabel} ${product.description}`.toLowerCase();
    const matchesQuery = !normalizedQuery || searchIndex.includes(normalizedQuery);
    return matchesCategory && matchesNew && matchesSale && matchesQuery;
  });

  if (options.sort === "price-asc") return results.sort((a, b) => a.priceCents - b.priceCents);
  if (options.sort === "price-desc") return results.sort((a, b) => b.priceCents - a.priceCents);
  if (options.sort === "name") return results.sort((a, b) => a.name.localeCompare(b.name));
  return results;
}
