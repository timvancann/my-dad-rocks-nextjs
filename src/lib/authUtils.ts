import { Session } from 'next-auth';

// Define a type for the supported auth providers
export type AuthProvider = 'google' | 'azure-ad' | 'unknown';

/**
 * Determines the authentication provider used by examining the session data
 * 
 * @param session The NextAuth session object
 * @returns The identified provider or 'unknown' if it can't be determined
 */
export function getAuthProvider(session: Session | null): AuthProvider {
  if (!session || !session.user) {
    return 'unknown';
  }

  // Different providers store unique identifiers in different ways
  // For Google accounts, emails typically end with gmail.com
  if (session.user.email?.endsWith('@gmail.com')) {
    return 'google';
  }
  
  // For Microsoft accounts, check for common Microsoft domains
  // This is a simplistic approach - in a real app you might have more robust checks
  if (session.user.email?.match(/@(outlook|hotmail|live|msn|microsoft)\.com$/)) {
    return 'azure-ad';
  }

  // If the provider isn't easily identifiable from the email
  // We'd need to modify the auth configuration to include provider info in the token/session
  
  return 'unknown';
}

/**
 * Returns the display name for a provider
 */
export function getProviderDisplayName(provider: AuthProvider): string {
  switch (provider) {
    case 'google':
      return 'Google';
    case 'azure-ad':
      return 'Microsoft';
    default:
      return 'Unknown';
  }
}