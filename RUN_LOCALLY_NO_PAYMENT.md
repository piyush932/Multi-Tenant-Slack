# Run Locally Without Any Payment/AWS/Email Setup

This branch (`feature/local-dev-no-payment`) removes every hard requirement
on Razorpay, AWS S3, and Gmail so you can boot and test the **multi-tenant
isolation** feature end-to-end without spending anything or signing up for
any paid service. You only need **Node.js**, **MongoDB**, and **Redis** —
all free and local.

---

## What Changed in This Branch

| File | Change |
|---|---|
| `src/config/razorpayConfig.js` | Only creates a real Razorpay client if keys are set; exports `isPaymentConfigured` |
| `src/controllers/paymentController.js` | Payment routes return `501 Not Implemented` with a friendly message instead of crashing when unconfigured |
| `src/config/awsConfig.js` | Only creates a real S3 client if AWS creds are set; exports `isS3Configured` |
| `src/controllers/s3UploadGuard.patch.md` | One-line patch to add to your existing `getPresignedUrlFromAWS` (see file) |
| `src/config/mailConfig.js` | Falls back to `jsonTransport` (logs instead of sending) if no Gmail app password is set |
| `.env.example` (backend) | Real variable names confirmed from your `serverConfig.js`; payment/AWS/mail marked optional |
| `.env.example` (frontend) | Matches your provided hints (`VITE_BACKEND_API_URL`, `VITE_BACKEND_SOCKET_URL`, `VITE_RAZORPAY_KEY_ID`) |
| `RenderRazorpayPopup.guarded.jsx` | Shows a "Payments disabled" notice instead of a broken checkout popup when no key is set |

**Nothing about workspaces, channels, messages, invites, memberships, or
tenant isolation depends on any of these three services** — they only affect
payments, image upload, and outbound email.

---

## Prerequisites (All Free, Install Once)

| Tool | macOS | Windows/Linux |
|---|---|---|
| Node.js 18+ | `brew install node` | [nodejs.org](https://nodejs.org) installer |
| MongoDB Community | `brew install mongodb-community` | [MongoDB docs](https://www.mongodb.com/docs/manual/installation/) or use free Atlas cluster (no card) |
| Redis | `brew install redis` | [Redis docs](https://redis.io/docs/getting-started/installation/) or WSL |

Start both local services before running the app:
```bash
# Terminal 1
mongod --dbpath ~/data/db

# Terminal 2
redis-server
```

If you don't want to install MongoDB locally, use a free **MongoDB Atlas**
shared cluster (no credit card required for the free M0 tier) and put its
connection string in `DEV_DB_URL`.

---

## Step-by-Step: Backend

```bash
cd Messaging-Slack-Backend-master
npm install
cp .env.example .env
```

Edit `.env` — for local testing you only need these three filled in, everything else can stay blank:
```env
NODE_ENV=development
PORT=3000
DEV_DB_URL=mongodb://localhost:27017/slack-multi-tenant
JWT_SECRET=any-random-string-for-local-testing
JWT_EXPIRY=1d
REDIS_HOST=localhost
REDIS_PORT=6379
APP_LINK=http://localhost:3000

# Leave these blank — guarded, won't crash the app
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
AWS_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=
MAIL_ID=
MAIL_PASSWORD=
```

Run it:
```bash
npm run dev
```

You should see in the console:
```
[razorpayConfig] RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET not set — payment routes will respond with 501...
[awsConfig] AWS credentials not set — image upload will respond with 501...
[mailConfig] MAIL_ID/MAIL_PASSWORD not set — using jsonTransport...
Server listening on port 3000
Connected to MongoDB
```

These warnings are **expected and safe** — they confirm the guards are
working, not that something is broken.

---

## Step-by-Step: Frontend

```bash
cd Message-Slack-Frontend-master
npm install
cp .env.example .env
```

Edit `.env`:
```env
VITE_BACKEND_API_URL=http://localhost:3000/api/v1
VITE_BACKEND_SOCKET_URL=http://localhost:3000
VITE_RAZORPAY_KEY_ID=
```

Run it:
```bash
npm run dev
```

Open the printed URL (usually `http://localhost:5173`).

---

## Testing the Multi-Tenant Isolation (No Postman Needed — Use the UI)

1. **Sign up** as User A (e.g., `owner@acme.test`).
2. **Create Workspace A** — e.g., "Acme Inc".
3. Inside Workspace A, **create a channel** — e.g., "general".
4. **Send a text message** in that channel (skip image upload — it's disabled without AWS).
5. Open **Workspace switcher / create workspace again** and **create Workspace B** — e.g., "Beta LLC" — as the same User A (you'll be owner of both).
6. Create a channel in Workspace B too — e.g., "random".
7. **Open your browser's DevTools → Network tab.** Click into Workspace B's channel and copy its channel `_id` from the API response.
8. **Switch back to Workspace A** in the UI (or manually hit the API with Workspace A's context — see Postman method below).
9. Try to open/fetch that Workspace B channel ID while your active workspace context is Workspace A.
10. **Expected result: "Channel not found" (404)** — this is the isolation working. It must NOT say "Forbidden" and it must NOT return the channel's data.

### If you prefer Postman (more reliable for the exact proof)
Use the `Multi-Tenant-Slack.postman_collection.json` file from the previous branch (already in this repo), but update the collection's `baseUrl` variable to:
```
http://localhost:3000/api/v1
```
Then run requests 01→07 in order as documented in `TESTING_GUIDE.md`. Request 07 is the leak test and must return `404`.

---

## Testing Invites (No Real Email Needed)

1. As the owner of Workspace A, call `POST /api/v1/workspaces/:workspaceId/invites` with `{ "email": "teammate@test.com", "role": "member" }`.
2. The response includes the invite `token` directly — **you don't need to receive an email**, because the token is returned in the API response for exactly this reason.
3. Sign up as a second user (User B) in a separate browser/incognito window.
4. As User B, call `POST /api/v1/invites/:token/accept` with the token from step 2.
5. User B is now a member of Workspace A. Confirm by listing members: `GET /api/v1/workspaces/:workspaceId/members`.

Meanwhile, check your backend console — you'll see the invite email logged (via `jsonTransport`) instead of actually sent. That's expected.

---

## What Still Won't Work (By Design, and That's Fine)

| Feature | Why it's disabled | Does it block your resume demo? |
|---|---|---|
| Real payment checkout | No Razorpay keys | No — the isolation demo doesn't need billing to work |
| Image upload in messages | No AWS S3 keys | No — text messages fully demonstrate tenant isolation |
| Real invite emails | No Gmail credentials | No — invite token is returned directly in the API response |

If you later want to demo the idempotent-billing part of the project (the
"insert providerEventId first" pattern), Razorpay's **test mode** is free
and requires no card — sign up, grab `rzp_test_...` keys, and paste them
into `.env`. Everything else in this branch keeps working exactly the same
whether payments are configured or not.
