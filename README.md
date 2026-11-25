# Subbly plugins

Subbly marketplace with these plugins:

| Plugin | What it does |
| --- | --- |
| `plugins/subbly-web3forms` | Connects website forms to Web3Forms so submissions arrive by email. The shop enters its Form Access Key once; Subbly Builder then creates or connects forms. |

## Work on it

```bash
pnpm install
pnpm lint
```

`pnpm lint` must show 0 errors before each commit.

## Release

Bump `version` in `marketplace.json` and push to `main`. The bump is the only release trigger.
