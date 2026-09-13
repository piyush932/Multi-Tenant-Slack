# Testing Guide — Multi-Tenant Slack

## Quick Start: Test Locally in 15 Minutes

### 1. Backend Setup

**Step 1:** Copy `.env.example` to `.env` in `Messaging-Slack-Backend-master/`:
```bash
cd Messaging-Slack-Backend-master
cp .env.example .env
```

**Step 2:** Fill in `.env`:
```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB (local or Atlas free tier)
DEV_DB_URL=mongodb://localhost:27017/slack-multi-tenant
# or: mongodb+srv://<user>:<pass>@cluster.mongodb.net/slack-multi-tenant?retryWrites=true

# JWT
JWT_SECRET=super-secret-jwt-key-change-in-prod
JWT_EXPIRES_IN=7d

# Redis (for BullMQ — can skip if not testing invites/notifications yet)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Razorpay (test mode — free, no live charges)
# Get keys from https://dashboard.razorpay.com/app/keys (test mode)
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Step 3:** Install and run:
```bash
npm install
npm run dev
# or: nodemon src/index.js
```

Backend should be running on `http://localhost:5000`.

---

### 2. Frontend Setup

**Step 1:** Copy `.env.example` to `.env` in `Message-Slack-Frontend-master/`:
```bash
cd Message-Slack-Frontend-master
cp .env.example .env
```

**Step 2:** Fill in `.env`:
```env
# Backend API base URL
VITE_API_BASE_URL=http://localhost:5000/api

# Razorpay test key ID (public, safe to commit)
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
```

**Step 3:** Install and run:
```bash
npm install
npm run dev
```

Frontend should be running on `http://localhost:5173`.

---

### 3. Test via Postman (Recommended for First Run)

**Step 1:** Import `Multi-Tenant-Slack.postman_collection.json` into Postman.

**Step 2:** Update collection variables:
- `baseUrl`: `http://localhost:5000/api` (already set)
- `tokenA`: JWT of user A (owner of both workspaces)
- `tokenB`: JWT of user B (invited member)
- `workspaceA_id`, `workspaceB_id`, `channelA_id`, `channelB_id`: Fill as you create resources

**Step 3:** Run requests in order:
1. **01 — Create Workspace A** → save `workspaceA_id` from response
2. **02 — Create Workspace B** → save `workspaceB_id`
3. **03 — Create channel in Workspace A** → save `channelA_id`
4. **04 — Create channel in Workspace B** → save `channelB_id`
5. **05 — Invite member to Workspace A** → copy `token` from response
6. **06 — Accept invite** (paste token, use user B's JWT)
7. **07 — Cross-workspace leak test** → **MUST return 404** (this is the key test)
8. **08 — List members in Workspace A**
9. **09 — Change member role** (owner only)

**Expected outcome:**
- Request 07 returns `404 Not Found` (not `403 Forbidden`) — proves tenant isolation is working.
- All other requests succeed within their own workspace context.

---

### 4. Test via Node Script (Automated Smoke Test)

**Step 1:** Edit `test-tenant-isolation.js`:
```js
const USER_A_TOKEN = 'eyJhbGc...'; // JWT of user A
const USER_B_TOKEN = 'eyJhbGc...'; // JWT of user B (optional for this test)

const CHANNEL_A_ID = '64f1234567890abcdef12345'; // channel in workspace A
const CHANNEL_B_ID = '64f1234567890abcdef67890'; // channel in workspace B
```

**Step 2:** Run:
```bash
node test-tenant-isolation.js
```

**Expected output:**
```
Cross-workspace GET channelB as userA → 404
Same-workspace GET channelA as userA → 200
PASS: Tenant isolation working as expected
```

---

### 5. Test via Frontend UI (Full E2E)

**Step 1:** Sign up / log in as user A.

**Step 2:** Create two workspaces:
- "Acme Inc" (slug: `acme`)
- "Beta LLC" (slug: `beta`)

**Step 3:** In "Acme Inc" workspace:
- Create a channel "general-acme"
- Click "Invite teammate" → enter `teammate@acme.com`, role "member"
- Copy the invite link

**Step 4:** Sign up / log in as user B (or use an incognito window).

**Step 5:** Accept the invite → user B is now a member of "Acme Inc".

**Step 6:** In "Beta LLC" workspace (as user A):
- Create a channel "general-beta"

**Step 7:** Switch back to user A's session, try to access "general-beta" channel ID from "Acme Inc" context → should show "Channel not found" (404), not "Forbidden" (403).

---

## Manual Wiring Checklist (Do This Before Testing)

1. **Replace `v1Router.js`** with `v1Router.wired.js` content:
   ```bash
   cd Messaging-Slack-Backend-master/src/routes/v1
   mv v1Router.js v1Router.backup.js
   mv v1Router.wired.js v1Router.js
   ```

2. **Verify `channel.js` and `message.js` schemas** already have:
   ```js
   workspaceId: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'Workspace',
     required: [true, 'Workspace ID is required']
   }
   ```
   (You confirmed they do in your earlier message.)

3. **Optional but recommended:** Swap in the tenant-scoped controllers:
   ```bash
   # Backup originals
   mv src/controllers/channelController.js src/controllers/channelController.original.js
   mv src/controllers/messageController.js src/controllers/messageController.original.js

   # Use tenant-scoped versions
   mv src/controllers/channelController.tenantScoped.js src/controllers/channelController.js
   mv src/controllers/messageController.tenantScoped.js src/controllers/messageController.js
   ```

4. **Optional:** For idempotent webhook handling, wrap your existing Razorpay webhook logic inside `withIdempotency()` in `paymentController.js` (see `paymentController.idempotent.js` for the pattern).

---

## What to Test (Interview Demo Script)

### Scenario 1: Cross-Workspace Isolation
1. Log in as user A (owner of Workspace A and Workspace B).
2. Create `channel-A` in Workspace A, `channel-B` in Workspace B.
3. Copy `channel-B`'s ID.
4. In Workspace A context, try to GET `/channels/:channel-B-id`.
5. **Expected:** `404 Not Found` (not `403 Forbidden`).

### Scenario 2: Invite Flow
1. As owner of Workspace A, POST to `/workspaces/:workspaceA-id/invites` with `{ email, role }`.
2. Get back `{ token, expiresAt }`.
3. As a different user (user B), POST to `/invites/:token/accept`.
4. **Expected:** User B is now a member of Workspace A with the assigned role.
5. Try to accept the same token again → **Expected:** `409 Conflict` or `404` (token already used).

### Scenario 3: Last Owner Protection
1. As the only owner of Workspace A, try to PATCH your own membership role to "member".
2. **Expected:** `409 Conflict` with message "The last owner cannot demote themselves".

### Scenario 4: Idempotent Webhook (Razorpay)
1. Trigger a payment success webhook twice with the same `providerEventId`.
2. **Expected:** First call processes the effect, second call returns `200 OK` with `{ replayed: true }` and does NOT double-charge or double-extend the subscription.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `MongoServerError: E11000 duplicate key error` on invite accept | Normal — means the token was already used (partial unique index working). Return 409/404 to the user. |
| `401 Unauthorized` on workspace-scoped routes | Ensure `authMiddleware` runs BEFORE `resolveTenantMiddleware` in your route chain. |
| `404` on every workspace request | Check that `workspaceId` is being set in `req.ctx` — log `req.ctx` in a test route. |
| CORS errors from frontend | Ensure `FRONTEND_URL` in backend `.env` matches your frontend's origin, and CORS middleware allows it. |
| Redis connection refused | Either start `redis-server` locally or comment out BullMQ imports temporarily (invites/notifications won't work, but core isolation will). |

---

## Next Steps After Testing

1. Run the full Postman collection and save the JSON with filled variable values as a demo artifact.
2. Record a 60-second Loom video showing:
   - Two workspaces created.
   - A channel in each.
   - Cross-workspace GET returning 404.
   - Invite flow working.
3. Add the video link to your README under "Demo" section.
4. Deploy to a free tier (Render/Railway for backend, Vercel/Netlify for frontend) and update the Postman collection's `baseUrl` variable to the deployed URL.
