import { SvelteURLSearchParams } from 'svelte/reactivity';
import { UserManager } from 'oidc-client-ts';

const setUser = user => {
  oidc.isAuthenticated = true;
  oidc.accessToken = user.access_token;
  oidc.idToken = user.id_token;
  oidc.userInfo = user.profile;
  oidc.sessionExpired = false;
};

const setup = args => {
  oidc.manager = new UserManager({
    // a redirect_uri in the settings is required for the popup and
    // silent-iframe signin flows; both can be overridden via args
    redirect_uri: `${window.location.origin}${window.location.pathname}`,
    ...args,
    response_type: 'code',
    scope: 'openid profile email',
    automaticSilentRenew: true,
  });

  oidc.manager.events.addUserLoaded(setUser);

  oidc.manager.events.addUserUnloaded(function () {
    oidc.isAuthenticated = false;
    oidc.idToken = null;
    oidc.accessToken = null;
    oidc.userInfo = {};
  });

  oidc.manager.events.addAccessTokenExpired(function () {
    oidc.sessionExpired = true;
  });

  oidc.manager.events.addSilentRenewError(function (e) {
    oidc.error = `SilentRenewError: ${e.message}`;
  });
};

export const oidc = $state({
  manager: null,
  isAuthenticated: false,
  accessToken: null,
  idToken: null,
  userInfo: {},
  error: null,
  loading: true,
  sessionExpired: false,

  manage: async args => {
    oidc.loading = true;
    try {
      if (oidc.manager === null) {
        setup(args);
      }
      const params = new SvelteURLSearchParams(window.location.search);
      if (params.has('error')) {
        oidc.error = new Error(params.get('error_description'));
      } else if (params.has('code') || params.has('state')) {
        // dispatches to the redirect, popup or silent-iframe callback,
        // depending on which flow initiated the signin;
        // only the redirect flow returns a user
        const user = await oidc.manager.signinCallback();
        if (user) {
          history.replaceState({ isRedirectCallback: true }, null, window.location.pathname);
        }
        oidc.error = null;
      } else if (!oidc.isAuthenticated) {
        const user = await oidc.manager.getUser();
        if (user && !user.expired) {
          setUser(user); // restore persisted session
        } else {
          try {
            await oidc.manager.signinSilent(); // try to refresh token
          } catch (e) {
            oidc.error = e.message;
          }
        }
      }
    } finally {
      oidc.loading = false;
    }
  },
  login: async () => {
    return oidc.manager.signinRedirect({ redirect_uri: window.location.href });
  },
  loginPopup: async () => {
    const user = await oidc.manager.signinPopup();
    oidc.error = null;
    return user;
  },
});
