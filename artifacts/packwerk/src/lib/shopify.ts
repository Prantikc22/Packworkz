import catalog from "./shopify-catalog.generated.json";

type CheckoutDetails = {
  requestId: string;
  skuCode: string;
  quantity: number;
  artwork: string;
  delivery: string;
  email?: string;
  firstName?: string;
  address1?: string;
  city?: string;
  province?: string;
  zip?: string;
};

function base64Url(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function getShopifyVariant(skuCode: string, quantity: number) {
  const product = catalog.products[skuCode as keyof typeof catalog.products];
  return product?.variants.find((variant) => variant.quantity === quantity);
}

export function buildShopifyCheckoutUrl(details: CheckoutDetails) {
  const variant = getShopifyVariant(details.skuCode, details.quantity);
  if (!variant) return undefined;

  const properties = base64Url(JSON.stringify({
    "Packworkz request": details.requestId,
    "Packaging SKU": details.skuCode,
    Artwork: details.artwork,
    Delivery: details.delivery,
  }));
  const params = new URLSearchParams({ properties, ref: "packworkz-configurator" });
  if (details.email) params.set("checkout[email]", details.email);
  if (details.firstName) params.set("checkout[shipping_address][first_name]", details.firstName);
  if (details.address1) params.set("checkout[shipping_address][address1]", details.address1);
  if (details.city) params.set("checkout[shipping_address][city]", details.city);
  if (details.province) params.set("checkout[shipping_address][province]", details.province);
  if (details.zip) params.set("checkout[shipping_address][zip]", details.zip);
  params.set("checkout[shipping_address][country]", "India");
  return `${variant.cartUrl}?${params.toString()}`;
}
