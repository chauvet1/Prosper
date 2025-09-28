/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ai from "../ai.js";
import type * as ai_system from "../ai_system.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as blog from "../blog.js";
import type * as crm from "../crm.js";
import type * as crons from "../crons.js";
import type * as customer_insights from "../customer_insights.js";
import type * as email_marketing from "../email_marketing.js";
import type * as http from "../http.js";
import type * as leads from "../leads.js";
import type * as market_intelligence from "../market_intelligence.js";
import type * as portfolio from "../portfolio.js";
import type * as recommendations from "../recommendations.js";
import type * as revenue_optimization from "../revenue_optimization.js";
import type * as scheduledFunctions from "../scheduledFunctions.js";
import type * as social_media from "../social_media.js";
import type * as users from "../users.js";
import type * as workos from "../workos.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  ai_system: typeof ai_system;
  analytics: typeof analytics;
  auth: typeof auth;
  blog: typeof blog;
  crm: typeof crm;
  crons: typeof crons;
  customer_insights: typeof customer_insights;
  email_marketing: typeof email_marketing;
  http: typeof http;
  leads: typeof leads;
  market_intelligence: typeof market_intelligence;
  portfolio: typeof portfolio;
  recommendations: typeof recommendations;
  revenue_optimization: typeof revenue_optimization;
  scheduledFunctions: typeof scheduledFunctions;
  social_media: typeof social_media;
  users: typeof users;
  workos: typeof workos;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
