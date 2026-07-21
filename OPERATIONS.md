# Operations

Copy `.env.example` to `.env`, replace every placeholder, and provision the database and dependencies explicitly. Run `cd backend && npm run migrate`, then return to the repository root and run `./start.sh`.

Startup is intentionally read-only: it does not install packages, create or seed databases, apply migrations, write credentials, or kill unrelated processes. A missing migration or secret stops startup. Use `npm test` in `backend` for the dependency-free workflow suite. Provider delivery rows are durable integration contracts only; an `acknowledged` receipt must come from a separately configured adapter. No banking, filing, valuation, or professional financial validation is implied.

Create users out of band with a tenant assignment. VC passwords must be scrypt hashes produced by `npm run hash-password -- '<password>'`. Rotate JWT/database secrets through the deployment secret manager, and back up both workflow and append-only audit tables before migrations.

The legacy seed is destructive, excluded from startup, and refuses to run unless `ALLOW_DESTRUCTIVE_DEMO_SEED=true`; use it only against an isolated disposable database.
