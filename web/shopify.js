import { BillingInterval, ApiVersion } from '@shopify/shopify-api';
import { shopifyApp } from '@shopify/shopify-app-express';
import { SQLiteSessionStorage } from '@shopify/shopify-app-session-storage-sqlite';
import { restResources } from '@shopify/shopify-api/rest/admin/2024-07';
import dotenv from 'dotenv';
dotenv.config();

const DB_PATH = `${process.cwd()}/database.sqlite`;

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const billingConfig = {
  'My Shopify One-Time Charge': {
    // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
    amount: 5.0,
    currencyCode: 'USD',
    interval: BillingInterval.OneTime,
  },
};

const defaultScopes = [
  'read_channels',
  'read_locales',
  'read_themes',
  'read_orders',
  'unauthenticated_read_product_listings',
  'write_files',
  'write_products',
  'write_discounts',
  'write_metaobjects',
];

const extraScopes = ['write_products'];

const shopifyAppConfig = {
  api: {
    apiVersion: ApiVersion.January26,
    restResources,
    billing: undefined, // or replace with billingConfig above to enable example billing
  },
  auth: {
    path: '/api/auth',
    callbackPath: '/api/auth/callback',
  },
  webhooks: {
    path: '/api/webhooks',
  },
  // This should be replaced with your preferred storage strategy
  sessionStorage: new SQLiteSessionStorage(DB_PATH),
};

const shopify = shopifyApp({
  ...shopifyAppConfig,
  api: {
    ...shopifyAppConfig.api,
    scopes: defaultScopes,
  },
});

const extraShopify = shopifyApp({
  ...shopifyAppConfig,
  api: {
    ...shopifyAppConfig.api,
    scopes: [...defaultScopes, ...extraScopes],
  },
});

export default shopify;
export { extraShopify };

