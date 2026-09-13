# Multi-Tenant Slack — Enterprise Team Messaging Platform

> **One-line pitch for your resume:** "Built a Slack-style team messaging SaaS where multiple companies share one deployment but each sees only their own workspace, members, channels, and billing — with database-enforced isolation that prevents cross-tenant data leaks even if the application layer has a bug."

---

## 1. Problem Statement

### The core challenge
A single application serves many companies (tenants) from one database. Each company must see **only** its own workspace, its own members, its own channels/messages, and its own billing. The whole project answers one question: **can a request ever read a row that belongs to somebody else?**

### Why this is hard
Every data leak in this class of system is the same bug — a query that ran without a tenant scope. You cannot fix that with discipline alone. You fix it by making the unscoped query **impossible to write** through defence in depth.

### What this project proves
- You can reason about **multi-tenant isolation** at the database, repository, and API layers.
- You understand **idempotency** for payment webhooks (Razorpay/Stripe retry constantly).
- You can separate **membership** ("is this person in this workspace") from **authorization** ("may they do this action").
- You can build a production-grade system using **free, open-source tools only** (no paid SaaS required for the demo).

---

## 2. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Backend runtime | Node.js + Express 5 | Layered architecture, async-first, huge ecosystem |
| Database | MongoDB + Mongoose | Document model fits chat data; flexible schema evolution |
| Auth | JWT (`jsonwebtoken`) | Stateless, scalable, subdomain/workspace claim embeddable |
| Async jobs | BullMQ + Redis | Background email invites, notification fan-out, dashboard via Bull Board |
| Billing | Razorpay (test mode) | Indian payment gateway; webhook idempotency pattern |
| File storage | AWS S3 (free tier) | Image uploads in messages |
| Email | Nodemailer | Invite emails to teammates |
| Frontend | React + Vite | Fast HMR, modern tooling |
| UI | Tailwind CSS + shadcn/ui | Consistent, accessible components |
| HTTP client | Axios | Interceptors for auth + workspace context |
| Rich text | Custom editor | Message composition with formatting |

**Zero paid dependencies** — everything runs on free tiers or local services.

---

## 3. High-Level Architecture (HLD)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         React Frontend (Vite)                        │
│  Axios interceptors attach JWT + workspace context to every request │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Express API Gateway                          │
│                                                                     │
│  LAYER 0: authMiddleware            → verifies JWT, attaches req.user│
│  LAYER 1: resolveTenantMiddleware   → resolves Workspace from JWT    │
│                                      claim or subdomain, attaches    │
│                                      req.ctx = {workspaceId, userId, │
│                                      role}                           │
│  LAYER 4: permissionMiddleware      → checks role → action matrix    │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 Controllers → Services → Repositories                │
│                                                                     │
│  LAYER 2: tenantScopedRepository    → the ONLY path to MongoDB;     │
│                                      every read/write auto-filtered │
│                                      by workspaceId; misses → 404    │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       MongoDB (Mongoose)                             │
│                                                                     │
│  LAYER 3: Schema-level guard        → unique (workspaceId, userId)  │
│                                      index on Membership; required   │
│                                      workspaceId on every workspace- │
│                                      owned schema                    │
│                                      (MongoDB has no native RLS, so  │
│                                      this is the backstop)           │
└─────────────────────────────────────────────────────────────────────┘

Side systems:
- Redis + BullMQ: background jobs (invite emails, notification fan-out)
- Razorpay: subscription billing per workspace, idempotent webhook handler
- AWS S3: file/image uploads referenced from messages
```

### Why four layers, not one?
1. **Layer 1 (resolveTenantMiddleware)** — resolves the workspace exactly once, from a source the client cannot forge (JWT claim or subdomain). A client-supplied `workspaceId` in body/query is an attack.
2. **Layer 2 (tenantScopedRepository)** — makes an unscoped query structurally impossible to write; there is no code path to the database that skips the workspace filter.
3. **Layer 3 (schema/index guard)** — assumes Layer 2 will someday have a bug anyway; enforces the same rule at the schema/index level so the database itself refuses the write.
4. **Layer 4 (permissionMiddleware)** — orthogonal to isolation; answers "may this role do this", not "does this data belong to them".

---

## 4. Data Model

| Collection | Key fields | Purpose |
|---|---|---|
| `users` | email (unique), passwordHash | Global identity, not workspace-scoped |
| `workspaces` | slug (unique), name, plan | **The tenant.** Everything else hangs off `workspaceId` |
| `memberships` | workspaceId, userId, role, unique(workspaceId,userId) | "Is this person in this workspace, and what can they do" |
| `invites` | workspaceId, email, role, token (unique), expiresAt, acceptedAt | Single-use, expiring invite links |
| `channels` | workspaceId, name | Existing — `workspaceId` required |
| `messages` | workspaceId, channelId, senderId, body, image | Existing — `workspaceId` required |
| `payments` | workspaceId, orderId, status, razorpay refs | Links Razorpay to a workspace |
| `webhookEvents` | providerEventId (unique), type, payload | Makes Razorpay webhook processing idempotent |

---

## 5. API Surface

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create user + JWT |
| POST | `/api/auth/login` | Authenticate, return JWT with optional `workspaceSlug` claim |

### Workspaces
| Method | Path | Description |
|---|---|---|
| POST | `/api/workspaces` | Create workspace + owner membership (transactional) |
| GET | `/api/workspaces/:id` | Get workspace details (requires membership) |
| GET | `/api/workspaces` | List workspaces user belongs to |

### Channels (workspace-scoped)
| Method | Path | Description |
|---|---|---|
| POST | `/api/channels` | Create channel in resolved workspace |
| GET | `/api/channels/:id` | Get channel by id (scoped; 404 if cross-workspace) |
| GET | `/api/channels` | List channels in resolved workspace |

### Messages (workspace-scoped)
| Method | Path | Description |
|---|---|---|
| POST | `/api/messages` | Create message in resolved workspace/channel |
| GET | `/api/messages/:id` | Get message by id (scoped; 404 if cross-workspace) |
| GET | `/api/channels/:channelId/messages` | List messages in channel (scoped) |

### Invites & Membership (new in this extension)
| Method | Path | Description |
|---|---|---|
| POST | `/api/workspaces/:workspaceId/invites` | Create single-use invite (owner/admin only) |
| POST | `/api/invites/:token/accept` | Redeem invite, create membership, set `acceptedAt` |
| PATCH | `/api/memberships/:id` | Change member role (owner only; last owner can't self-demote) |
| GET | `/api/workspaces/:workspaceId/members` | List members with roles |

### Payments (Razorpay)
| Method | Path | Description |
|---|---|---|
| POST | `/api/payments/order` | Create Razorpay order |
| POST | `/api/payments/capture` | Capture payment after frontend success |
| POST | `/api/payments/webhook` | Razorpay webhook (idempotent via `providerEventId`) |

### S3 (file uploads)
| Method | Path | Description |
|---|---|---|
| POST | `/api/s3/presigned-url` | Get presigned URL for image upload |

---

## 6. Security Mechanism — The Interview Pitch

### 1. Scope by workspace AND id, always
`tenantScopedRepository.forTenant(ctx).findById(Model, id)` does `findOne({ _id: id, workspaceId })`, not `findById(id)`. A miss returns `null` → the controller returns **404**, never 403 — a 403 would confirm the row exists in someone else's workspace.

### 2. No raw escape hatch
Controllers/services are expected to go through `tenantScopedRepository.js`, not call a Mongoose model directly for workspace-owned data.

### 3. Membership vs role
`Membership` answers "is this person in this workspace"; `ROLE_MATRIX` in `permissionMatrix.js` answers "may they do this" — checked in one `requirePermission()` middleware, not scattered `if` statements across handlers.

### 4. Idempotent billing
The Razorpay `providerEventId` is inserted first, inside the same transaction as the subscription-extension effect. A duplicate key error means "this is a replay" — return success without re-applying the effect. Payment providers retry constantly; this is the default case, not an edge case.

### 5. Last owner protection
`membershipService.changeRole()` blocks a role change if it would demote the only remaining owner of a workspace.

---

## 7. Live Demo Script (for interviews)

> Say this, then show it:
>
> "Log in as a member of Workspace A. Take a channel or message id and try it against Workspace B's context — clean `404`. Then, in a local/test build, bypass `tenantScopedRepository.js` and call the Mongoose model directly with a mismatched `workspaceId` — the unique `(workspaceId, userId)` membership index and the required `workspaceId` field still block or expose the inconsistency, because the schema itself enforces the invariant."

**Two independent layers failing safe is the whole pitch.**

---

## 8. Interview Q&A Prep

| Question | Strong answer |
|---|---|
| **"What happens under load?"** | "Membership lookups run on every request (Layer 1); index `{workspaceId:1, userId:1}` unique keeps that lookup O(log n) and it's the busiest query in the system — I'd measure p95 latency and quote the number rather than guessing." |
| **"Why MongoDB and not Postgres, given Postgres has native Row-Level Security?"** | "The base app was already MongoDB/Mongoose; the honest answer is that Mongo has no RLS equivalent, so the mitigation is a schema-level guard (unique indexes, required fields, and a single scoped repository) instead of a database-enforced policy — and that trade-off is explicitly documented here rather than hidden." |
| **"What would you change?"** | "Move Layer 3 from 'schema convention' to a real enforcement mechanism — e.g. a MongoDB Atlas trigger that rejects writes without `workspaceId`, or migrate the tenant/billing tables to a small Postgres instance specifically to get real RLS, while leaving messages/channels in Mongo." |
| **"How do you prevent replayed webhooks from double-charging?"** | "Insert the `providerEventId` first, inside the same transaction as the effect. On duplicate-key error, return 200 without re-applying. Razorpay/Stripe retry constantly; this is not an edge case." |
| **"What's the difference between membership and authorization?"** | "Membership answers 'is this person in this workspace'; authorization answers 'may they do this action'. I keep them separate: one `Membership` collection, one `ROLE_MATRIX` checked in one middleware." |

---

## 9. Local Setup (Free, No Paid Services)

1. **MongoDB**: local `mongod` or MongoDB Atlas free tier — set `DEV_DB_URL`.
2. **Redis**: local `redis-server` or Upstash free tier — used by BullMQ.
3. **Razorpay**: test-mode keys (free) for the billing/idempotency demo.
4. **AWS S3**: free-tier bucket, or skip and stub file upload for the demo.
5. `npm install && npm run dev` in both `Messaging-Slack-Backend-master/` and `Message-Slack-Frontend-master/`.

---

## 10. Known Limitations (Say These Out Loud)

- **MongoDB has no native Row-Level Security**; Layer 3 here is a schema/index convention, not a database-enforced policy the way Postgres RLS is.
- The permission matrix is static in code; a production system would likely move it to a DB-backed, editable table.
- `channel.js`/`message.js` were verified to have `workspaceId` required in this PR, but pre-existing documents may need a backfill script if any were created before this extension.

---

## 11. What This Project Proves About You

| Skill | Evidence in this repo |
|---|---|
| Multi-tenant SaaS design | Four-layer isolation, workspace-scoped queries, 404-not-403 rule |
| Database modeling | Unique compound indexes, required FK fields, idempotency table |
| Payment integration | Razorpay order/capture/webhook, idempotent event handling |
| Async job patterns | BullMQ + Redis for background invites/notifications |
| API design | Layered routes → controllers → services → repositories |
| Frontend architecture | Axios interceptors, atomic components, workspace context |
| Security mindset | JWT from subdomain/claim, no body/query tenant, replay protection |
| Production thinking | Idempotency, last-owner protection, explicit trade-off documentation |

---

## 12. Repository Structure

```
Multi-Tenant-Slack/
├─ Messaging-Slack-Backend-master/
│  ├─ src/
│  │  ├─ schema/          # Mongoose models (Channel, Message, Membership, Invite, etc.)
│  │  ├─ middlewares/     # auth, resolveTenant, permission
│  │  ├─ repositories/    # tenantScopedRepository, membershipRepository, inviteRepository
│  │  ├─ services/        # permissionMatrix, inviteService, membershipService, webhookIdempotencyService
│  │  ├─ controllers/     # channel, message, payment (idempotent), invite, membership, workspace, user
│  │  ├─ routes/v1/       # channel, message, payment, users, workspaces, invite.routes, membership.routes
│  │  ├─ config/          # db, redis, bullBoard, razorpay, aws, mail, server
│  │  ├─ queues/          # BullMQ queue definitions
│  │  ├─ producers/       # Job producers (inviteEmail, notifyMember)
│  │  ├─ processors/      # Job processors
│  │  └─ index.js         # Express app entry, middleware mounting
│  └─ package.json
├─ Message-Slack-Frontend-master/
│  ├─ src/
│  │  ├─ apis/            # auth, channels, messages, payments, s3, workspaces, invites, memberships
│  │  ├─ components/
│  │  │  ├─ atoms/        # Editor, MessageRenderer, SideBarItem, UserButton, etc.
│  │  │  └─ molecules/    # ChannelHeader, ChatInput, CreateChannelModal, CreateWorkspaceModal, InviteMemberModal, MembersPage
│  │  ├─ Routes.jsx       # React Router setup
│  │  └─ App.jsx          # Root component
│  └─ package.json
├─ README.md               # This file
└─ TENANT_ISOLATION.md     # Manual wiring checklist for existing controllers
```

---

## 13. Next Steps (If You Extend Further)

- Add a **workspace switcher** UI in the frontend (dropdown + axios interceptor that sets `workspaceSlug` claim).
- Add **subscription plans** (free vs pro) with feature gating in `permissionMatrix.js`.
- Add **audit logs** for role changes, invite sends, and billing events.
- Add **rate limiting** per workspace (Redis-based sliding window) to prevent abuse.
- Add **E2E tests** that prove cross-workspace isolation (login as tenant A, request tenant B's resource id → assert 404).

---

## License

MIT — free to use for learning and portfolio purposes.
