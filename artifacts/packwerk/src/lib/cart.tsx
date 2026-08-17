import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CatalogSku } from "@/lib/catalog";
import { COMMERCE_PRODUCTS, LAUNCH_PROMOTION_CODE, calculateCommerceCartEstimate } from "@workspace/commerce";
import { calculateOrderEstimate } from "@/lib/pricing";
import { getCatalogImage, requiresQuote } from "@/lib/catalog";

export type CartItem = {
  id: string;
  skuCode: string;
  slug: string;
  productName: string;
  category: string;
  image: string;
  quantity: number;
  quantityUnit: string;
  sizeCode: string;
  sizeLabel: string;
  variantSelections: Record<string, string>;
  customSpecs: Record<string, string>;
  artworkOption: "upload" | "design" | "none";
  artworkFileUrl?: string;
  deliveryOption: "standard" | "blitz" | "warehouse";
  sampleOption: "express" | "standard" | "none";
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  count: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const STORAGE_KEY = "packworkz_cart_v1";
const CartContext = createContext<CartContextValue | null>(null);

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function createDefaultCartItem(sku: CatalogSku, quantity = sku.moq): CartItem | null {
  if (sku.publicBuyingPath !== "instant" || requiresQuote(sku, quantity)) return null;
  const commerce = COMMERCE_PRODUCTS[sku.code];
  const size = commerce?.sizes[0];
  if (!size) return null;
  const variantSelections = Object.fromEntries(sku.variants.map((variant) => [variant.key, variant.options[0]]));
  return {
    id: `${sku.code}:${size.code}:${JSON.stringify(variantSelections)}`,
    skuCode: sku.code,
    slug: sku.slug,
    productName: sku.name,
    category: sku.category,
    image: getCatalogImage(sku),
    quantity,
    quantityUnit: sku.moq_unit,
    sizeCode: size.code,
    sizeLabel: size.label,
    variantSelections,
    customSpecs: {},
    artworkOption: "upload",
    deliveryOption: "standard",
    sampleOption: "none",
  };
}

export function createConfiguredCartItem(
  sku: CatalogSku,
  configuration: {
    quantity: number;
    sizeCode: string;
    variantSelections: Record<string, string>;
    customSpecs?: Record<string, string>;
    artworkOption: CartItem["artworkOption"];
    artworkFileUrl?: string;
    deliveryOption: CartItem["deliveryOption"];
    sampleOption?: CartItem["sampleOption"];
  },
): CartItem | null {
  const managedItem = sku.publicBuyingPath !== "instant" || requiresQuote(sku, configuration.quantity);
  const size = COMMERCE_PRODUCTS[sku.code]?.sizes.find((item) => item.code === configuration.sizeCode);
  if (!size && !managedItem) return null;
  const identity = JSON.stringify({
    size: size?.code || configuration.sizeCode || "managed",
    variants: configuration.variantSelections,
    specs: configuration.customSpecs || {},
    artwork: configuration.artworkOption,
    artworkFile: configuration.artworkFileUrl || "",
  });
  return {
    id: `${sku.code}:${identity}`,
    skuCode: sku.code,
    slug: sku.slug,
    productName: sku.name,
    category: sku.category,
    image: getCatalogImage(sku),
    quantity: configuration.quantity,
    quantityUnit: sku.moq_unit,
    sizeCode: size?.code || configuration.sizeCode || "",
    sizeLabel: size?.label || "Custom specification",
    variantSelections: configuration.variantSelections,
    customSpecs: configuration.customSpecs || {},
    artworkOption: configuration.artworkOption,
    artworkFileUrl: configuration.artworkFileUrl,
    deliveryOption: configuration.deliveryOption,
    sampleOption: configuration.sampleOption || "none",
  };
}

export function getCartCheckoutDecision(rows: Array<{ item: CartItem; sku: CatalogSku }>) {
  const cartEstimate = calculateCommerceCartEstimate(rows.map(({ item }) => ({
    skuCode: item.skuCode,
    quantity: item.quantity,
    sizeCode: item.sizeCode,
    artwork: item.artworkOption || "upload",
    delivery: item.deliveryOption || "standard",
    configuration: item.variantSelections,
    promotionCode: LAUNCH_PROMOTION_CODE,
  })));
  const hasManagedItem = rows.some(({ item, sku }) => (
    sku.publicBuyingPath !== "instant" || requiresQuote(sku, item.quantity)
  ));

  return {
    ...cartEstimate,
    eligible: cartEstimate.eligible && !hasManagedItem,
    reason: hasManagedItem ? "manual_review" as const : cartEstimate.reason,
    requiresQuote: hasManagedItem || !cartEstimate.eligible,
    hasManagedItem,
  };
}

export function getCartEstimate(item: CartItem, sku: CatalogSku) {
  return calculateOrderEstimate(sku, item.quantity, item.deliveryOption || "standard", item.artworkOption || "upload", item.sizeCode, {
    ...item.variantSelections,
    promotion_code: LAUNCH_PROMOTION_CODE,
  });
}

function formatConfigurationLabel(key: string) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function getCartConfigurationDetails(item: CartItem) {
  const details = [
    ...Object.entries(item.variantSelections || {}).map(([key, value]) => ({ label: formatConfigurationLabel(key), value })),
    ...Object.entries(item.customSpecs || {}).filter(([, value]) => Boolean(value)).map(([key, value]) => ({ label: formatConfigurationLabel(key), value })),
    { label: "Artwork", value: item.artworkOption === "design" ? "Design support" : item.artworkOption === "none" ? "No artwork" : "Artwork upload" },
    { label: "Delivery", value: item.deliveryOption === "blitz" ? "Priority" : item.deliveryOption === "warehouse" ? "SmartStock warehousing" : "Standard" },
  ];

  if (item.sampleOption && item.sampleOption !== "none") {
    details.push({ label: "Sample", value: item.sampleOption === "express" ? "Express sample" : "Standard sample" });
  }
  return details;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readCart);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    isOpen,
    count: items.length,
    addItem: (item) => {
      setItems((current) => {
        const existing = current.find((entry) => entry.id === item.id);
        return existing
          ? current.map((entry) => entry.id === item.id ? { ...entry, quantity: item.quantity } : entry)
          : [...current, item];
      });
      setIsOpen(true);
    },
    updateQuantity: (id, quantity) => setItems((current) => current.map((item) => item.id === id ? { ...item, quantity } : item)),
    removeItem: (id) => setItems((current) => current.filter((item) => item.id !== id)),
    clearCart: () => setItems([]),
    openCart: () => setIsOpen(true),
    closeCart: () => setIsOpen(false),
  }), [isOpen, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
