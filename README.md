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
