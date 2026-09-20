import { useContext } from 'react';
import { AuthContext } from './AuthContextInstance';

/**
 * Hook to access current authentication state and actions.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider component');
  }
  return context;
}
