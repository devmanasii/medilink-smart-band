// Maps Firebase auth error codes to user-friendly messages
export function getFirebaseAuthErrorMessage(error) {
  if (!error) return 'An unknown error occurred.';

  const errorMessages = {
    'auth/invalid-email': 'The email address is not valid. Please check and try again.',
    'auth/user-disabled': 'This account has been disabled. Contact support for help.',
    'auth/user-not-found': 'No account found with this email. Please sign up first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials.',
    'auth/email-already-in-use': 'An account with this email already exists. Try signing in instead.',
    'auth/weak-password': 'Password is too weak. Use at least 6 characters with a mix of letters and numbers.',
    'auth/too-many-requests': 'Too many failed attempts. Please wait a few minutes and try again.',
    'auth/network-request-failed': 'Network error. Check your internet connection and try again.',
    'auth/operation-not-allowed': 'Email/password sign-in is not enabled for this project. Contact the administrator.',
    'auth/missing-email': 'Please enter your email address.',
    'auth/internal-error': 'An internal error occurred. Please try again later.',
    'auth/invalid-api-key': 'Firebase API key is invalid. Check your environment configuration.',
    'auth/api-key-not-valid': 'Firebase API key is not valid. Check your environment configuration.',
    'auth/app-not-authorized': 'This app is not authorized to use Firebase Authentication. Check your Firebase project settings.',
    'auth/configuration-not-found': 'Firebase configuration not found. Check your environment variables.',
    'auth/unauthorized-domain': 'This domain is not authorized for Firebase operations. Add it in Firebase Console > Authentication > Settings > Authorized domains.',
    'auth/popup-closed-by-user': 'The popup was closed before completing the sign-in. Please try again.',
    'auth/cancelled-popup-request': 'The sign-in was cancelled. Please try again.',
  };

  if (error.code && errorMessages[error.code]) {
    return errorMessages[error.code];
  }

  if (error.code && error.code.startsWith('auth/')) {
    return error.message || `Authentication error: ${error.code}`;
  }

  return error.message || 'An unexpected error occurred. Please try again.';
}

// Checks if Firebase env vars are configured
export function isFirebaseConfigured() {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
}
