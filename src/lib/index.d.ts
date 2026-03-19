import type { UserManager, UserManagerSettings, UserProfile } from 'oidc-client-ts';

export type OidcManageArgs = UserManagerSettings;

export interface OidcState {
  manager: UserManager | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  idToken: string | null | undefined;
  userInfo: Partial<UserProfile>;
  error: Error | string | null;
  loading: boolean;
  manage(args: OidcManageArgs): Promise<void>;
  login(): Promise<void>;
}

export declare const oidc: OidcState;

export type { UserManager, UserManagerSettings, UserProfile };
