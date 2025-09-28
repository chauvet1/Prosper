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
import type * as analytics from "../analytics.js";
import type * as blog from "../blog.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as leads from "../leads.js";
import type * as portfolio from "../portfolio.js";
import type * as recommendations from "../recommendations.js";
import type * as scheduledFunctions from "../scheduledFunctions.js";

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
  analytics: typeof analytics;
  blog: typeof blog;
  crons: typeof crons;
  http: typeof http;
  leads: typeof leads;
  portfolio: typeof portfolio;
  recommendations: typeof recommendations;
  scheduledFunctions: typeof scheduledFunctions;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
