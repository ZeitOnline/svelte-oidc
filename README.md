# svelte-oidc

## Installation

Install the package using your favourite package manager:

```bash
npm install zeitonline/svelte-oidc
```

## Usage

After setting up an OIDC server the package can be used in your Svelte component like this:

```svelte
<script>
  import { onMount } from 'svelte';
  import { oidc } from '@zeitonline/svelte-oidc';

  onMount(() => {
    oidc.manage({
      authority: "https://...",
      client_id: "foobar",
    });
  });
</script>

{#if oidc.loading}
  Loading…
{:else if oidc.isAuthenticated}
  Hello! :)
{:else}
  <button onclick={oidc.login}> Please login first! </button>
{/if}
```

## Session persistence

The session is stored in `sessionStorage` (the default of `oidc-client-ts`),
i.e. it is kept per tab and survives page reloads. On page load a still-valid
session is restored without contacting the identity provider; an expired one
is renewed silently (via refresh token if available, otherwise via a hidden
iframe). While the page is open, tokens are renewed automatically before they
expire.

If a project needs the session to be shared across browser tabs and survive
the browser being closed, pass a custom `userStore` to `oidc.manage()` to
store it in `localStorage` instead:

```js
import { WebStorageStateStore } from 'oidc-client-ts';

oidc.manage({
  authority: 'https://...',
  client_id: 'foobar',
  userStore: new WebStorageStateStore({ store: window.localStorage }),
});
```

## Re-authentication without losing state

When the session could not be renewed (e.g. after the IdP session ended),
`oidc.sessionExpired` becomes `true`. Call `oidc.loginPopup()` to
re-authenticate in a popup window — unlike `oidc.login()` this does not
navigate away, so unsaved page state is kept. Call it from a click handler,
otherwise browsers will block the popup:

```svelte
<button onclick={oidc.loginPopup}>Please login again</button>
```
