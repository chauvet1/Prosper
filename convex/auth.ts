import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Legacy auth functions - these are now handled by WorkOS AuthKit
// Keeping for backward compatibility but they will return null/throw errors

export const signIn = action({
  args: {
    calledBy: v.optional(v.string()),
    params: v.optional(v.any()),
    provider: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    verifier: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // This function is deprecated - authentication is now handled by WorkOS AuthKit
    throw new Error("Authentication is now handled by WorkOS AuthKit. Use the frontend auth components instead.");
  },
});

export const signOut = action({
  args: {},
  handler: async (ctx, args) => {
    // This function is deprecated - authentication is now handled by WorkOS AuthKit
    throw new Error("Authentication is now handled by WorkOS AuthKit. Use the frontend auth components instead.");
  },
});

// Internal store function for legacy compatibility
export const store = mutation({
  args: {
    args: v.union(
      v.object({
        type: v.literal("signIn"),
        userId: v.id("users"),
        sessionId: v.optional(v.id("authSessions")),
        generateTokens: v.boolean(),
      }),
      v.object({
        type: v.literal("signOut"),
      }),
      v.object({
        type: v.literal("refreshSession"),
        refreshToken: v.string(),
      }),
      v.object({
        type: v.literal("verifyCodeAndSignIn"),
        params: v.any(),
        provider: v.optional(v.string()),
        verifier: v.optional(v.string()),
        allowExtraProviders: v.boolean(),
        generateTokens: v.boolean(),
      }),
      v.object({
        type: v.literal("verifier"),
      }),
      v.object({
        type: v.literal("verifierSignature"),
        verifier: v.string(),
        signature: v.string(),
      }),
      v.object({
        type: v.literal("userOAuth"),
        profile: v.any(),
        provider: v.string(),
        providerAccountId: v.string(),
        signature: v.string(),
      }),
      v.object({
        type: v.literal("createVerificationCode"),
        code: v.string(),
        provider: v.string(),
        expirationTime: v.number(),
        accountId: v.optional(v.id("authAccounts")),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
      }),
      v.object({
        type: v.literal("createAccountFromCredentials"),
        account: v.object({
          id: v.string(),
          secret: v.optional(v.string()),
        }),
        profile: v.any(),
        provider: v.string(),
        shouldLinkViaEmail: v.optional(v.boolean()),
        shouldLinkViaPhone: v.optional(v.boolean()),
      }),
      v.object({
        type: v.literal("retrieveAccountWithCredentials"),
        account: v.object({
          id: v.string(),
          secret: v.optional(v.string()),
        }),
        provider: v.string(),
      }),
      v.object({
        type: v.literal("modifyAccount"),
        account: v.object({
          id: v.string(),
          secret: v.string(),
        }),
        provider: v.string(),
      }),
      v.object({
        type: v.literal("invalidateSessions"),
        userId: v.id("users"),
        except: v.optional(v.array(v.id("authSessions"))),
      })
    ),
  },
  handler: async (ctx, { args }) => {
    // This function is deprecated - authentication is now handled by WorkOS AuthKit
    throw new Error("Authentication is now handled by WorkOS AuthKit. This function is no longer needed.");
  },
});
