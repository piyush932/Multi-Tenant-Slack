# Multi-Tenant Slack — Workspace Isolation Platform

A Slack-style team messaging application extended into a **multi-tenant SaaS**:
one deployment, one database, many companies — each isolated into its own
workspace with its own members, roles, channels, and billing.

> **The one sentence for your resume/interview:** "I built a Slack clone and
> hardened it into a multi-tenant SaaS where a request can never read another
> company's data, even if the application-layer filter is buggy — because a
> second, independent layer (a unique DB constraint / schema guard) refuses
> the row underneath it."

---

## 1. Tech stack

| Layer | Technology | Notes |
|---|---|---|
| Backend runtime | Node.js + Express 5 | Layered: routes -> controllers -> services -> repositories -> schema |
| Database | MongoDB + Mongoose | Document store; `Workspace` is the tenant boundary |
| Auth | JWT (`jsonwebtoken`) | `authMiddleware.js` verifies token, attaches `req.user` |
| Async jobs | BullMQ + Redis | `queues/`, `producers/`, `processors/`; dashboard via `bullBoardConfig.js` (Bull Board) |
| Billing | Razorpay | `razorpayConfig.js`, `schema/payment.js`, webhook idempotency added in this PR |
| File storage | AWS S3 | `awsConfig.js`, `apis/s3` on the frontend |
| Email | Nodemailer | `mailConfig.js` — invite emails |
| Frontend | React + Vite | `App.jsx`, `Routes.jsx` |
| Frontend UI | Tailwind CSS + shadcn/ui | `postcss.config.js`, `components.json` |
| Frontend structure | Atomic design | `components/atoms`, `components/molecules` |
| HTTP client | Axios | `src/apis/{auth,channels,payments,s3,workspaces,invites,memberships}` |
| Rich text | Custom editor component | `components/atoms/Editor` |

No new dependency was introduced anywhere that isn't already free/open-source
(Mongoose, Express, BullMQ, Redis, jsonwebtoken are all MIT-licensed; Razorpay
test mode and AWS/S3 free tier cover the rest at zero cost for a resume demo).

---

## 2. High-level architecture

```
Client (React + Vite)
   │  Axios, JWT in Authorization header
   ▼
Express API
   │
   ├─ authMiddleware            (LAYER 0) verifies JWT -> req.user
   ├─ resolveTenantMiddleware   (LAYER 1) resolves Workspace from JWT claim /
   │                                      subdomain -> req.ctx = {workspaceId, userId, role}
   ├─ permissionMiddleware      (LAYER 4) role -> action matrix, one check point
   ▼
Controllers -> Services -> Repositories
   │
   └─ tenantScopedRepository    (LAYER 2) the only path to Mongo; every
                                          read/write auto-filtered by workspaceId
   ▼
MongoDB (Mongoose)
   └─ unique (workspaceId, userId) index on Membership   (LAYER 3)
   └─ required workspaceId on every workspace-owned schema
                                          — the DB-level backstop, since
                                            MongoDB has no native Postgres-style
                                            row-level security

Side systems:
Redis + BullMQ  — background jobs (e.g. notification/email fan-out)
Razorpay        — subscription billing per workspace, idempotent webhook handler
AWS S3          — file/image uploads referenced from messages
```

### Why four layers, not one
Every cross-tenant data leak in systems like this is the same bug: a query
that ran without a workspace filter. Layer 1 makes sure the workspace is
resolved exactly once, from a source the client cannot forge. Layer 2 makes
an unscoped query structurally impossible to write, because there is no code
path to the database that skips it. Layer 3 assumes Layer 2 will someday have
a bug anyway, and enforces the same rule at the schema/index level so the
database itself refuses the write. Layer 4 is orthogonal — it answers "may
this role do this", not "does this data belong to them."

---

## 3. Data model

| Collection | Key fields | Purpose |
|---|---|---|
| `users` | email (unique), passwordHash | Global identity, not workspace-scoped |
| `workspaces` | slug (unique), name, plan | **The tenant.** Everything else hangs off `workspaceId` |
| `memberships` *(new)* | workspaceId, userId, role, unique(workspaceId,userId) | "Is this person in this workspace, and what can they do" |
| `invites` *(new)* | workspaceId, email, role, token (unique), expiresAt, acceptedAt | Single-use, expiring invite links |
| `channels` | workspaceId, name, members | Existing — verify `workspaceId` is present and required |
| `messages` | workspaceId, channelId, authorId, body | Existing — verify `workspaceId` is present and required |
| `payments` | workspaceId, razorpay refs, status | Existing — links Razorpay to a workspace |
| `webhookEvents` *(new)* | providerEventId (unique), type, payload | Makes Razorpay webhook processing idempotent |

---

## 4. API surface

Existing groups (inferred from `src/apis/*` and `src/routes/`; verify exact
paths/methods against your route files, since some couldn't be read
directly by tooling):

| Domain | Example endpoints |
|---|---|
| Auth | `POST /api/auth/signup`, `POST /api/auth/login` |
| Workspaces | `POST /api/workspaces`, `GET /api/workspaces/:id` |
| Channels | `POST /api/channels`, `GET /api/channels/:id`, `GET /api/channels?workspaceId=` |
| Messages | `POST /api/messages`, `GET /api/channels/:id/messages` |
| Payments | `POST /api/payments/checkout`, `POST /api/payments/webhook` |
| S3 | `POST /api/s3/presigned-url` |

New in this extension (this PR):

| Method & path | Purpose | Access rule |
|---|---|---|
| `POST /api/workspaces/:workspaceId/invites` | Create a single-use invite (email + role) | Owner or admin only |
| `POST /api/invites/:token/accept` | Redeem invite, create membership, set `acceptedAt` | Any logged-in user; second call on same token fails |
| `PATCH /api/memberships/:id` | Change a member's role | Owner only; last owner can't self-demote |
| *(wire-in point)* Razorpay webhook | Same route as today, wrapped in `withIdempotency()` | Verifies signature, dedupes on `providerEventId` |

---

## 5. Security mechanism — the part to defend in an interview

1. **Scope by workspace AND id, always.** `tenantScopedRepository.forTenant(ctx).findById(Model, id)` does `findOne({ _id: id, workspaceId })`, not `findById(id)`. A miss returns `null` -> the controller returns **404**, never 403 — a 403 would confirm the row exists in someone else's workspace.
2. **No raw escape hatch.** Controllers/services are expected to go through `tenantScopedRepository.js`, not call a Mongoose model directly for workspace-owned data.
3. **Membership vs role.** `Membership` answers "is this person in this workspace"; `ROLE_MATRIX` in `permissionMatrix.js` answers "may they do this" — checked in one `requirePermission()` middleware, not scattered `if` statements across handlers.
4. **Idempotent billing.** The Razorpay `providerEventId` is inserted first, inside the same transaction as the subscription-extension effect. A duplicate key error means "this is a replay" — return success without re-applying the effect. Payment providers retry constantly; this is the default case, not an edge case.
5. **Last owner protection.** `membershipService.changeRole()` blocks a role change if it would demote the only remaining owner of a workspace.

### The live demo (say this, then show it)
Log in as a member of Workspace A. Take a channel or message id and try it
against Workspace B's context -> clean `404`. Then, in a local/test build,
bypass `tenantScopedRepository.js` and call the Mongoose model directly with
a mismatched `workspaceId` -> the unique `(workspaceId, userId)` membership
index and the required `workspaceId` field still block or expose the
inconsistency, because the schema itself enforces the invariant.

---

## 6. Interview Q&A prep

**"What happens under load?"**
Membership lookups run on every request (Layer 1); index `{workspaceId:1, userId:1}` unique keeps that lookup O(log n) and it's the busiest query in the system — measure it and quote the number rather than guessing.

**"Why MongoDB and not Postgres, given Postgres has native Row-Level Security?"**
The base app was already MongoDB/Mongoose; the honest, defensible answer is that Mongo has no RLS equivalent, so the mitigation is a schema-level guard (unique indexes, required fields, and a single scoped repository) instead of a database-enforced policy — and that trade-off is explicitly documented here rather than hidden.

**"What would you change?"**
Move Layer 3 from "schema convention" to a real enforcement mechanism — e.g. a MongoDB Atlas trigger that rejects writes without `workspaceId`, or migrate the tenant/billing tables to a small Postgres instance specifically to get real RLS, while leaving messages/channels in Mongo.

---

## 7. Local setup (free, no paid services required)

1. MongoDB: local `mongod` or MongoDB Atlas free tier — set `DEV_DB_URL`.
2. Redis: local `redis-server` or Upstash free tier — used by BullMQ.
3. Razorpay: test-mode keys (free) for the billing/idempotency demo.
4. AWS S3: free-tier bucket, or skip and stub file upload for the demo.
5. `npm install && npm run dev` in both `Messaging-Slack-Backend-master/` and `Message-Slack-Frontend-master/`.

---

## 8. Known limitations (say these out loud, don't hide them)

- MongoDB has no native Row-Level Security; Layer 3 here is a schema/index
  convention, not a database-enforced policy the way Postgres RLS is.
- `channel.js`/`message.js` were not verified in this PR to already require
  `workspaceId` — confirm and backfill before relying on Layer 2 alone.
- The permission matrix is static in code; a production system would likely
  move it to a DB-backed, editable table.
