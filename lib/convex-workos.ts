import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// WorkOS AuthKit integration with Convex
export class ConvexWorkOSIntegration {
  private convex: ConvexHttpClient;

  constructor() {
    this.convex = convex;
  }

  // Get user by WorkOS ID
  async getUserByWorkosId(workosId: string) {
    return await this.convex.query(api.workos.getUserByWorkosId, { workosId });
  }

  // Get user by email
  async getUserByEmail(email: string) {
    return await this.convex.query(api.workos.getUserByEmail, { email });
  }

  // Create or update user from WorkOS
  async upsertUser(userData: {
    workosId: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profilePictureUrl?: string;
    emailVerified: boolean;
  }) {
    return await this.convex.mutation(api.workos.upsertUser, userData);
  }

  // Update user role
  async updateUserRole(workosId: string, role: string) {
    return await this.convex.mutation(api.workos.updateUserRole, { workosId, role });
  }

  // Update user role by email
  async updateUserRoleByEmail(email: string, role: string) {
    return await this.convex.mutation(api.workos.updateUserRoleByEmail, { email, role });
  }

  // Update user preferences
  async updateUserPreferences(workosId: string, preferences: {
    theme?: string;
    language?: string;
    notifications?: boolean;
  }) {
    return await this.convex.mutation(api.workos.updateUserPreferences, { workosId, preferences });
  }

  // Get all users (admin only)
  async getAllUsers() {
    return await this.convex.query(api.workos.getAllUsers, {});
  }

  // Delete user
  async deleteUser(workosId: string) {
    return await this.convex.mutation(api.workos.deleteUser, { workosId });
  }
}

// Export singleton instance
export const convexWorkOS = new ConvexWorkOSIntegration();
