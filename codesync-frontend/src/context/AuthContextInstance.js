import { createContext } from 'react';

/**
 * Shared React Context instance for authentication.
 * Separated into its own module to comply with react-refresh component export rules.
 */
export const AuthContext = createContext(null);
