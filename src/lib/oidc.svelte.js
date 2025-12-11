import { SvelteURLSearchParams } from 'svelte/reactivity';
import { UserManager } from 'oidc-client-ts';

const setup = args => {
  oidc.manager = new UserManager({
    ...args,
    response_type: 'code',
    scope: 'openid profile email',
    automaticSilentRenew: true,
  });

  oidc.manager.events.addUserLoaded(function (user) {
    oidc.isAuthenticated = true;
    oidc.accessToken = user.access_token;
    oidc.idToken = user.id_token;
    oidc.userInfo = user.profile;
  });

  oidc.manager.events.addUserUnloaded(function () {
    oidc.isAuthenticated = false;
    oidc.idToken = null;
    oidc.accessToken = null;
    oidc.userInfo = {};
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

  manage: async args => {
    oidc.loading = true;
    try {
      if (oidc.manager === null) {
        setup(args);
      }
      const params = new SvelteURLSearchParams(window.location.search);
      if (params.has('error')) {
        oidc.error = new Error(params.get('error_description'));
      } else if (params.has('code')) {
        await oidc.manager.signinCallback();
        history.replaceState({ isRedirectCallback: true }, null, window.location.pathname);
        oidc.error = null;
      } else if (params.has('state')) {
        const response = await oidc.manager.signinCallback();
        console.log('oidc.signinCallback::response', response);
      } else if (!oidc.isAuthenticated) {
        try {
          await oidc.manager.signinSilent(); // try to refresh token
        } catch (e) {
          oidc.error = e.message;
        }
      }
    } finally {
      oidc.loading = false;
    }
  },
  login: async () => {
    return oidc.manager.signinRedirect({ redirect_uri: window.location.href });
  },
});
