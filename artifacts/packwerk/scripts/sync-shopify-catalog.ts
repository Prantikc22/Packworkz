import { basename, resolve } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { CATALOG_SKUS, getCatalogImage } from "../src/lib/catalog";

const API_VERSION = "2026-07";
const apply = process.argv.includes("--apply");
const reconcile = process.argv.includes("--reconcile");
const uploadImages = process.argv.includes("--upload-images");
const publish = process.argv.includes("--publish");
const store = process.env.SHOPIFY_STORE?.replace(/^https?:\/\//, "").replace(/\/$/, "");
const clientId = process.env.SHOPIFY_CLIENT_ID;
const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

if (!store || !clientId || !clientSecret) {
  throw new Error("SHOPIFY_STORE, SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET are required.");
}

type TokenResponse = {
  access_token?: string;
  expires_in?: number;
  scope?: string;
  error?: string;
  error_description?: string;
};

async function getAccessToken() {
  const response = await fetch(`https://${store}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: clientId, client_secret: clientSecret }),
  });
  const data = await response.json() as TokenResponse;
  if (!response.ok || !data.access_token) {
    throw new Error(`Shopify authentication failed: ${data.error_description || data.error || response.statusText}`);
  }
  return data.access_token;
}

async function graphql<T>(token: string, query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(`https://${store}/admin/api/${API_VERSION}/graphql.json`, {
    method: "POST",
    headers: { "content-type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json() as { data?: T; errors?: Array<{ message: string }> };
  if (!response.ok || payload.errors?.length || !payload.data) {
    throw new Error(payload.errors?.map((error) => error.message).join("; ") || `Shopify GraphQL request failed (${response.status})`);
  }
  return payload.data;
}

const token = await getAccessToken();
const installation = await graphql<{
  shop: { name: string; currencyCode: string };
  currentAppInstallation: { accessScopes: Array<{ handle: string }> };
}>(token, `query PackworkzShopifyAccess {
  shop { name currencyCode }
  currentAppInstallation { accessScopes { handle } }
}`);

const scopes = new Set(installation.currentAppInstallation.accessScopes.map((scope) => scope.handle));
const requiredScopes = ["read_products", "write_products"];
if (uploadImages) requiredScopes.push("read_files", "write_files");
if (publish) requiredScopes.push("read_publications", "write_publications");
const missingScopes = requiredScopes.filter((scope) => !scopes.has(scope));
if (missingScopes.length) {
  throw new Error(`Release and install an app version with these scopes before syncing: ${missingScopes.join(", ")}`);
}

const instantProducts = CATALOG_SKUS.filter((sku) => sku.publicBuyingPath === "instant");
console.log(`${apply ? "Applying" : "Dry run:"} ${instantProducts.length} instant-buy products to ${installation.shop.name} (${installation.shop.currencyCode}).`);
if (!apply) {
  console.log("No Shopify data changed. Re-run with --apply after reviewing the draft-product plan. Add --reconcile to archive stale Packworkz drafts.");
  process.exit(0);
}

const mutation = `mutation SyncPackworkzProduct($input: ProductSetInput!, $identifier: ProductSetIdentifiers) {
  productSet(synchronous: true, input: $input, identifier: $identifier) {
    product { id title handle status variants(first: 20) { nodes { id title price sku } } media(first: 10) { nodes { id alt } } }
    userErrors { field message }
  }
}`;

async function stageProductImage(token: string, imagePath: string) {
  const filename = basename(imagePath);
  const mimeType = /\.jpe?g$/i.test(filename) ? "image/jpeg" : "image/png";
  const staged = await graphql<{
    stagedUploadsCreate: {
      stagedTargets: Array<{ url: string; resourceUrl: string; parameters: Array<{ name: string; value: string }> }>;
      userErrors: Array<{ field?: string[]; message: string }>;
    };
  }>(token, `mutation StagePackworkzImage($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets { url resourceUrl parameters { name value } }
      userErrors { field message }
    }
  }`, { input: [{ filename, mimeType, httpMethod: "POST", resource: "PRODUCT_IMAGE" }] });

  const errors = staged.stagedUploadsCreate.userErrors;
  const target = staged.stagedUploadsCreate.stagedTargets[0];
  if (errors.length || !target) throw new Error(errors.map((error) => error.message).join("; ") || `No staged target for ${filename}`);

  const form = new FormData();
  for (const parameter of target.parameters) form.append(parameter.name, parameter.value);
  form.append("file", new Blob([readFileSync(imagePath)], { type: mimeType }), filename);
  const upload = await fetch(target.url, { method: "POST", body: form });
  if (!upload.ok) throw new Error(`Image upload failed for ${filename} (${upload.status})`);
  return target.resourceUrl;
}

let synced = 0;
const failures: Array<{ code: string; message: string }> = [];
const storefrontManifest: Record<string, {
  handle: string;
  productId: string;
  variants: Array<{ quantity: number; variantId: string; variantNumericId: string; price: string; cartUrl: string }>;
}> = {};
for (const sku of instantProducts) {
  const tiers = (sku.price_tiers || [])
    .filter((tier) => !sku.quote_threshold || tier.min_qty < sku.quote_threshold)
    .slice(0, 10);
  if (!tiers.length) {
    failures.push({ code: sku.code, message: "No publishable quantity tiers" });
    continue;
  }

  const quantityValues = tiers.map((tier) => ({ name: `${tier.min_qty.toLocaleString("en-IN")} ${sku.moq_unit}` }));
  const imagePath = resolve("public", getCatalogImage(sku).replace(/^\//, ""));
  let imageSource: string | undefined;
  if (uploadImages) {
    if (!existsSync(imagePath)) {
      failures.push({ code: sku.code, message: `Missing catalog image: ${imagePath}` });
      continue;
    }
    try {
      imageSource = await stageProductImage(token, imagePath);
    } catch (error) {
      failures.push({ code: sku.code, message: error instanceof Error ? error.message : String(error) });
      continue;
    }
  }

  const input = {
    title: sku.name,
    handle: sku.slug,
    descriptionHtml: `<p>${sku.description}</p><p><strong>Best for:</strong> ${sku.use_case}</p><p><strong>Standard specification:</strong> ${sku.standard_spec || "Confirmed before artwork approval"}</p><p>Prices exclude GST and delivery. Artwork is approved before production.</p>`,
    vendor: "Packworkz",
    productType: sku.category,
    status: publish ? "ACTIVE" : "DRAFT",
    tags: ["packworkz", sku.category, "instant-buy", sku.is_eco ? "lower-impact" : ""].filter(Boolean),
    productOptions: [{ name: "Order quantity", position: 1, values: quantityValues }],
    variants: tiers.map((tier) => ({
      optionValues: [{ optionName: "Order quantity", name: `${tier.min_qty.toLocaleString("en-IN")} ${sku.moq_unit}` }],
      price: (tier.unit_price * tier.min_qty).toFixed(2),
      sku: `${sku.code}-${tier.min_qty}`,
      taxable: true,
    })),
    ...(imageSource ? { files: [{ originalSource: imageSource, alt: `${sku.name} packaging by Packworkz`, contentType: "IMAGE" }] } : {}),
  };

  try {
    const result = await graphql<{
      productSet: { product?: { id: string; title: string; handle: string; variants: { nodes: Array<{ id: string; price: string; sku: string }> } }; userErrors: Array<{ field?: string[]; message: string }> };
    }>(token, mutation, { input, identifier: { handle: sku.slug } });
    if (result.productSet.userErrors.length || !result.productSet.product) {
      failures.push({ code: sku.code, message: result.productSet.userErrors.map((error) => error.message).join("; ") || "Unknown productSet error" });
    } else {
      synced += 1;
      storefrontManifest[sku.code] = {
        handle: result.productSet.product.handle,
        productId: result.productSet.product.id,
        variants: result.productSet.product.variants.nodes.map((variant) => {
          const quantity = Number(variant.sku.split("-").at(-1));
          const variantNumericId = variant.id.split("/").at(-1) || variant.id;
          return {
            quantity,
            variantId: variant.id,
            variantNumericId,
            price: variant.price,
            cartUrl: `https://${store}/cart/${variantNumericId}:1`,
          };
        }),
      };
      console.log(`[${synced}/${instantProducts.length}] ${sku.code} ${result.productSet.product.title}`);
    }
  } catch (error) {
    failures.push({ code: sku.code, message: error instanceof Error ? error.message : String(error) });
  }
}

let published = 0;
if (publish && failures.length === 0) {
  const publicationData = await graphql<{ publications: { nodes: Array<{ id: string; name: string }> } }>(token, `query PackworkzPublications {
    publications(first: 50) { nodes { id name } }
  }`);
  const onlineStore = publicationData.publications.nodes.find((publication) => /online store/i.test(publication.name));
  if (!onlineStore) throw new Error("Shopify Online Store publication was not found.");
  const publishMutation = `mutation PublishPackworkzProduct($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) { userErrors { field message } }
  }`;
  for (const product of Object.values(storefrontManifest)) {
    const result = await graphql<{ publishablePublish: { userErrors: Array<{ field?: string[]; message: string }> } }>(token, publishMutation, {
      id: product.productId,
      input: [{ publicationId: onlineStore.id }],
    });
    if (result.publishablePublish.userErrors.length) {
      failures.push({ code: product.handle, message: result.publishablePublish.userErrors.map((error) => error.message).join("; ") });
    } else {
      published += 1;
    }
  }
}

let archived = 0;
const archiveFailures: Array<{ handle: string; message: string }> = [];
if (reconcile && failures.length === 0) {
  const existing = await graphql<{
    products: { nodes: Array<{ id: string; handle: string; title: string; status: string; tags: string[] }> };
  }>(token, `query PackworkzInstantProducts {
    products(first: 250, query: "vendor:Packworkz tag:instant-buy") {
      nodes { id handle title status tags }
    }
  }`);

  const desiredHandles = new Set(instantProducts.map((sku) => sku.slug));
  const staleDrafts = existing.products.nodes.filter((product) => product.status === "DRAFT" && !desiredHandles.has(product.handle));
  const archiveMutation = `mutation ArchiveStaleProduct($product: ProductUpdateInput!) {
    productUpdate(product: $product) {
      product { id handle status }
      userErrors { field message }
    }
  }`;

  for (const product of staleDrafts) {
    const result = await graphql<{
      productUpdate: { product?: { id: string; handle: string; status: string }; userErrors: Array<{ field?: string[]; message: string }> };
    }>(token, archiveMutation, { product: { id: product.id, status: "ARCHIVED" } });
    if (result.productUpdate.userErrors.length || !result.productUpdate.product) {
      archiveFailures.push({
        handle: product.handle,
        message: result.productUpdate.userErrors.map((error) => error.message).join("; ") || "Unknown productUpdate error",
      });
      continue;
    }
    archived += 1;
    console.log(`[archive ${archived}/${staleDrafts.length}] ${product.title}`);
  }
}

if (failures.length === 0 && Object.keys(storefrontManifest).length) {
  writeFileSync(resolve("src/lib/shopify-catalog.generated.json"), `${JSON.stringify({ store, generatedAt: new Date().toISOString(), products: storefrontManifest }, null, 2)}\n`);
}

console.log(JSON.stringify({ synced, published, archived, failed: failures.length + archiveFailures.length, failures, archiveFailures }, null, 2));
if (failures.length || archiveFailures.length) process.exitCode = 1;
