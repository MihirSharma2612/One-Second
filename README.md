# One Second

Local Next.js storefront prototype. Checkout, catalogue, stock, and imagery are demo content. No real payment, customer account, or persisted checkout is connected.

Read the [backend foundation guide](docs/backend.md) for the new catalogue API, MySQL schema, local setup and database-enabled CI. Storefront pages still use demo data; database-backed order/payment workflows are not connected.

## Local checks

Use Node.js 22 (see `.nvmrc`).

```sh
nvm use
npm ci
npm run dev
```

Open http://localhost:3000. Run the same gates as GitHub Actions:

```sh
npm run check
```

This runs lint, unit tests, production build, typecheck, and production HTTP smoke tests. Smoke tests start a temporary server on port 3100 and stop it afterward. Keep that port free. Unit tests cover demo cart rules; HTTP checks cover rendered routes, not browser interactions or payments.

## CI

The GitHub Actions workflow runs on pull requests, pushes to `main` or `staging`, and manual dispatch. It uses `npm ci`, Node.js 22, read-only repository permissions, and no production secrets. Build failure blocks the quality job; it does not automatically block a merge until repository protection is configured.

Security status: the initial `npm audit` reports eight high-severity findings through Prisma/deepmerge-ts and ESLint's glob dependencies. The production-only audit still reports three Prisma-chain findings. These are unresolved; passing quality gates does not imply security approval. Review compatible dependency fixes separately before production. Do not run `npm audit fix --force` blindly or downgrade Next.js lint tooling to silence an advisory. Dependency auditing is not yet a CI gate.

One Second has its own local Git repository. Do not upload the parent AstraSentinel project. Create an empty private GitHub repository named `one-second` without an initial README, license, or gitignore. Then, from this folder:

```sh
git status --short
git add .
git commit -m "ci: establish storefront quality gates"
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the actual repository URL. Review staged files before committing. `.env` files, dependencies, and build outputs are ignored; `.env.example` is safe to track.

After the first successful CI run, configure a GitHub ruleset or branch protection for `main` and `staging`: require pull requests, require the **Quality gates** check, require branches to be up to date, and block force pushes and deletion. Confirm ruleset enforcement is supported by your GitHub plan; a workflow alone does not protect a branch.

## Hostinger delivery

CD is not connected yet. Use Hostinger's **Node.js Web App** GitHub integration, not legacy PHP Git deployment. First create a separate staging app on a temporary domain; leave the existing live store untouched.

Recommended settings:

- Dedicated repository with this directory as repository root.
- Framework: Next.js; Node.js: 22.
- Install: `npm ci`; build: `npm run build`; start: `npm run start` if a start-command field is shown.
- Staging deployment branch: `staging`; eventual production branch: `main`.
- Public demo setting: `NEXT_PUBLIC_STORE_MODE=demo` at build time. Never add real payment keys while this prototype is being reviewed.

Hostinger's auto-deployment starts on a push; it does not wait for a GitHub Actions job. Therefore enable auto-deployment only from a protected branch with required CI checks. Until those protections are enforced, deploy manually after CI passes. The first import may deploy immediately: use staging only.

Do not deploy production yet: account, tracking, returns, checkout services, final media, legal content, and payment validation remain incomplete. The demo cart is memory-only and resets on refresh.

## Release checks and rollback

For staging, confirm `/api/health` returns HTTP 200 with `status: ok`. This is application liveness only, not database or payment readiness. Check home, category, product, empty bag, and demo checkout on desktop/mobile. Inspect Hostinger runtime/build logs and HTTPS before approval.

Record each deployed commit. If a release fails, disable auto-deployment and redeploy the last reviewed commit using Hostinger's available redeploy controls. If selecting an old commit is unavailable, revert the bad release through a pull request, pass CI, and redeploy. No database migrations run in this workflow; future schema releases need a separate backup and rollback plan.

References: [GitHub Node.js CI](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs), [Hostinger Node.js deployment](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/).
