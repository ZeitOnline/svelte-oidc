import type { User, UserManager, UserManagerSettings, UserProfile } from 'oidc-client-ts';

export type OidcManageArgs = UserManagerSettings;

export interface OidcState {
  manager: UserManager | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  idToken: string | null | undefined;
  userInfo: Partial<UserProfile>;
  error: Error | string | null;
  loading: boolean;
  /** true once the access token expired and could not be renewed silently */
  sessionExpired: boolean;
  manage(args: OidcManageArgs): Promise<void>;
  login(): Promise<void>;
  /** re-authenticate in a popup window without leaving (and losing) the current page */
  loginPopup(): Promise<User | null>;
}

export declare const oidc: OidcState;

export type { User, UserManager, UserManagerSettings, UserProfile };
