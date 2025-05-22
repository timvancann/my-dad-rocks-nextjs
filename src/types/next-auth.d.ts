import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's unique identifier */
      id?: string;
      /** The authentication provider used (e.g., 'google', 'azure-ad') */
      provider?: string;
    } & DefaultSession['user'];
  }
}