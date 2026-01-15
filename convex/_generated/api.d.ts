/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as bandMembers from "../bandMembers.js";
import type * as checklistItems from "../checklistItems.js";
import type * as gigs from "../gigs.js";
import type * as migration from "../migration.js";
import type * as practiceSessions from "../practiceSessions.js";
import type * as proposals from "../proposals.js";
import type * as setlists from "../setlists.js";
import type * as songs from "../songs.js";
import type * as storage from "../storage.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  bandMembers: typeof bandMembers;
  checklistItems: typeof checklistItems;
  gigs: typeof gigs;
  migration: typeof migration;
  practiceSessions: typeof practiceSessions;
  proposals: typeof proposals;
  setlists: typeof setlists;
  songs: typeof songs;
  storage: typeof storage;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
