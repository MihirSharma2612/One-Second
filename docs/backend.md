# Backend foundation

One Next.js app owns route handlers, validation, services, and Prisma access. No separate Express server. Customer-facing UI remains the approved demo; the new catalogue API is not yet wired into page components or cart inventory. Do not interpret demo checkout as a persisted order.

## Delivered interfaces

- `GET /api/products`: paginated public catalogue.
- `GET /api/products/:slug`: active product details, images and active variants; missing or unpublished products return 404.
- `GET /api/health`: application liveness only, not database readiness.

List query parameters: `q`, `category` (slug, e.g. `new-drop` or `tees`), `size`, `color` (hex value from catalogue), `minPricePaise`, `maxPricePaise`, `inStock` (`true`/`false`), `sort` (`newest`, `price-asc`, `price-desc`, `name`), `page`, and `pageSize`. Page size is capped at 48. Unknown keys, duplicate keys, invalid ranges, and invalid values return 400. Availability is evaluated across variants matching the selected size/colour; `false` means none of those variants has positive stock.

List response: `{ products, total, page, pageSize, source }`. Details response: `{ product }`. Prices are integers in paise; `149900` means INR 1,499. Errors use `{ error: { code, message } }`. Database failures return 503 without exposing connection details. Only GET is implemented: there are no public product, order, customer or payment write endpoints.

`CATALOG_SOURCE=demo` uses labelled seed content. `CATALOG_SOURCE=database` requires `DATABASE_URL`; a database failure never falls back silently to demo data. The default remains demo until local database setup is completed.

## Database

The initial migration creates products, variants/SKUs/inventory, images, categories, product-category links, customers, addresses, orders, order-item snapshots, and payment records. Prices use integer paise. Unique provider identifiers and order idempotency keys prepare for later payment/order services; those services are not implemented yet. Prisma does not enforce business invariants such as non-negative money, address validation, or stock reservation here; future write services must enforce them inside transactions before being exposed.

This is an initial schema for an **empty, dedicated database**. The previous schema file was an unused prototype with no migration history or configured database in this project. Do not apply this migration to existing WooCommerce data or any database with these tables. Existing data requires a separate backup, schema comparison and migration/baseline plan.

### Persistent local setup

Use Node.js 22. Create a new MySQL database named `one_second_local` and a dedicated local user. Put its connection URL in an ignored `.env` file; never commit real passwords. Copy the field names from `.env.example`, then choose `CATALOG_SOURCE=database` when ready to test the API.

```sh
npm run db:validate
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

The seed is restricted to loopback hosts and database names `one_second_local` or `one_second_test`. Repeating it creates missing demo records without overwriting existing prices or stock. It is not a production import tool. Production photo/catalogue imports will be a separate workflow.

### Disposable backend verification on this Mac

```sh
npm run test:mysql-local
```

Requires Homebrew `mysqld`, `mysql` and `mysqladmin`. The script checks port 33307 is free, creates an isolated MySQL data directory under `/private/tmp`, migrates twice, seeds twice, verifies database reads and transactions, and runs all existing quality gates with database-backed APIs. It stops its own server and removes only that temporary test database. Existing MySQL data directories and services are not used. This tests the installed local MySQL version; GitHub Actions independently uses MySQL 8.0.

Initial-migration rollback is **not** a DROP script: switch back to demo mode and leave the dedicated database intact. Restore a verified backup if needed. Never run `prisma migrate reset` or drop production tables as part of release rollback.

## Using CI/CD for ongoing work

1. Make changes on a feature branch, not `main`.
2. Run local checks; push `staging` for staging CI or open a pull request from a feature branch.
3. GitHub Actions runs the quality gates and an isolated MySQL 8.0 service. It never accesses a live database.
4. Inspect failed steps; fix the branch and push again. Require the **Quality gates** check through branch protection before merging.
5. Merge only after approval. The temporary Hostinger app currently auto-deploys `main`; the original WordPress site is separate. Publishing `staging` does not switch the Hostinger app's configured branch. Hostinger push-triggered deployment is not intrinsically gated by Actions, so deploy only protected branches or deploy manually after checks pass.

## Staging handoff

The first staging release provides read-only catalogue APIs. Start in `CATALOG_SOURCE=demo` until the dedicated staging database connection and migrations have been verified. Database credentials belong only in private environment variables, never in Git or screenshots. Do not use the existing WordPress database or enable unrestricted remote database access.

Creating a database in Hostinger does not connect this application or run migrations. Verify connection permissions and the exact empty staging database before applying `prisma migrate deploy`. The current seed intentionally refuses remote databases; a separately reviewed staging import is still required before expecting demo products from database-backed APIs. No migrations or imports run automatically during `npm run build`.

After deploying staging, check `/api/products` and inspect its `source` field. `demo` is not evidence of database connectivity. An empty database-backed catalogue may legitimately return zero products after migration but before import. `/api/health` proves application liveness only. Customer pages still use their original static catalogue.

## Next backend slices

1. Connect storefront pages and cart to catalogue variants without changing approved layouts.
2. Implement guest checkout with server-priced totals, transactional inventory reservation, shipping validation and idempotency.
3. Add Auth.js credentials support with password hashing, verification/reset and server-side authorization; then protected admin product/order operations.
4. Add Razorpay test orders/signatures/idempotent webhooks and configurable COD. Then transactional Resend emails, tracking and returns.
5. Add production rate limits, consent, coupons, audit events and deployment readiness checks. Resolve dependency advisories before production.

No account, order, payment, email, admin or Hostinger integration is claimed complete by this foundation.

References: [Next.js route handlers](https://nextjs.org/docs/app/getting-started/route-handlers), [Prisma 6 migration workflows](https://www.prisma.io/docs/orm/v6/prisma-migrate/workflows/development-and-production).
