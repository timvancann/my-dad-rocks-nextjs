import type {
  Adapter,
  AdapterUser,
  AdapterSession,
  AdapterAccount,
} from "next-auth/adapters";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function ConvexAdapter(client: ConvexHttpClient): Adapter {
  return {
    async createUser(user: Omit<AdapterUser, "id">) {
      const id = await client.mutation(api.auth.createUser, {
        email: user.email!,
        name: user.name ?? undefined,
        image: user.image ?? undefined,
        emailVerified: user.emailVerified?.getTime(),
      });
      return {
        id,
        email: user.email!,
        name: user.name ?? null,
        image: user.image ?? null,
        emailVerified: user.emailVerified ?? null,
      } as AdapterUser;
    },

    async getUser(id: string) {
      const user = await client.query(api.auth.getUser, {
        id: id as Id<"users">,
      });
      if (!user) return null;
      return {
        id: user._id,
        email: user.email,
        name: user.name ?? null,
        image: user.image ?? null,
        emailVerified: user.emailVerified
          ? new Date(user.emailVerified)
          : null,
      } as AdapterUser;
    },

    async getUserByEmail(email: string) {
      const user = await client.query(api.auth.getUserByEmail, { email });
      if (!user) return null;
      return {
        id: user._id,
        email: user.email,
        name: user.name ?? null,
        image: user.image ?? null,
        emailVerified: user.emailVerified
          ? new Date(user.emailVerified)
          : null,
      } as AdapterUser;
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const user = await client.query(api.auth.getUserByAccount, {
        provider,
        providerAccountId,
      });
      if (!user) return null;
      return {
        id: user._id,
        email: user.email,
        name: user.name ?? null,
        image: user.image ?? null,
        emailVerified: user.emailVerified
          ? new Date(user.emailVerified)
          : null,
      } as AdapterUser;
    },

    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      await client.mutation(api.auth.updateUser, {
        id: user.id as Id<"users">,
        name: user.name ?? undefined,
        image: user.image ?? undefined,
        emailVerified: user.emailVerified?.getTime(),
      });
      return user as AdapterUser;
    },

    async deleteUser(userId: string) {
      await client.mutation(api.auth.deleteUser, {
        id: userId as Id<"users">,
      });
    },

    async linkAccount(account: AdapterAccount) {
      await client.mutation(api.auth.linkAccount, {
        userId: account.userId as Id<"users">,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token ?? undefined,
        access_token: account.access_token ?? undefined,
        expires_at: account.expires_at,
        token_type: account.token_type ?? undefined,
        scope: account.scope ?? undefined,
        id_token: account.id_token ?? undefined,
        session_state: (account.session_state as string) ?? undefined,
      });
      return account as AdapterAccount;
    },

    async unlinkAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
      await client.mutation(api.auth.unlinkAccount, {
        provider,
        providerAccountId,
      });
    },

    async createSession(session: { sessionToken: string; userId: string; expires: Date }) {
      await client.mutation(api.auth.createSession, {
        userId: session.userId as Id<"users">,
        sessionToken: session.sessionToken,
        expires: session.expires.getTime(),
      });
      return session as AdapterSession;
    },

    async getSessionAndUser(sessionToken: string) {
      const result = await client.query(api.auth.getSessionAndUser, {
        sessionToken,
      });
      if (!result) return null;
      return {
        session: {
          sessionToken: result.session.sessionToken,
          userId: result.session.userId,
          expires: new Date(result.session.expires),
        },
        user: {
          id: result.user._id,
          email: result.user.email,
          name: result.user.name ?? null,
          image: result.user.image ?? null,
          emailVerified: result.user.emailVerified
            ? new Date(result.user.emailVerified)
            : null,
        },
      };
    },

    async updateSession(session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">) {
      await client.mutation(api.auth.updateSession, {
        sessionToken: session.sessionToken,
        expires: session.expires?.getTime(),
      });
      return session as AdapterSession;
    },

    async deleteSession(sessionToken: string) {
      await client.mutation(api.auth.deleteSession, { sessionToken });
    },

    async createVerificationToken(token: { identifier: string; token: string; expires: Date }) {
      await client.mutation(api.auth.createVerificationToken, {
        identifier: token.identifier,
        token: token.token,
        expires: token.expires.getTime(),
      });
      return token;
    },

    async useVerificationToken({ identifier, token }: { identifier: string; token: string }) {
      const result = await client.mutation(api.auth.useVerificationToken, {
        identifier,
        token,
      });
      if (!result) return null;
      return {
        identifier: result.identifier,
        token: result.token,
        expires: new Date(result.expires),
      };
    },
  };
}
