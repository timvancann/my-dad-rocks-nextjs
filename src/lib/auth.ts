import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AzureADProvider from 'next-auth/providers/azure-ad';

// List of allowed email addresses
const allowedEmails = [
  'timvancann@gmail.com',
  'pacramer01@gmail.com',
  'lexheijden76@gmail.com'
];

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID as string,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
      tenantId: process.env.AZURE_AD_TENANT_ID
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      // Allow sign in only if the user's email is in the allowed list
      return user.email ? allowedEmails.includes(user.email) : false;
    },
    async redirect({ url, baseUrl }) {
      // Check if the URL is relative (starts with /)
      if (url.startsWith('/')) {
        // Redirect to the requested URL after sign-in
        return `${baseUrl}${url}`;
      }
      // If the URL is already absolute or empty, return it or fallback to baseUrl
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async session({ session, token }) {
      // Add user ID to the session
      if (session.user && token.sub) {
        session.user.id = token.sub;
        // @ts-ignore - Add provider to the session
        session.user.provider = token.provider;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  }
};
