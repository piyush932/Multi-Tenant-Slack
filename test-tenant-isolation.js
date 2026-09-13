/**
 * Minimal tenant isolation smoke test.
 * 
 * Prerequisites:
 * 1. Backend running on http://localhost:5000
 * 2. Two users created (userA, userB) with JWTs
 * 3. Two workspaces created (workspaceA, workspaceB)
 * 4. One channel in each workspace
 * 
 * Run:
 *   node test-tenant-isolation.js
 * 
 * Expected:
 * - GET /channels/:workspaceB_channel_id with userA's token → 404
 * - GET /channels/:workspaceA_channel_id with userA's token → 200
 */

const BASE_URL = 'http://localhost:5000/api';

const USER_A_TOKEN = 'JWT_OF_USER_A';
const USER_B_TOKEN = 'JWT_OF_USER_B';

const CHANNEL_A_ID = 'CHANNEL_ID_IN_WORKSPACE_A';
const CHANNEL_B_ID = 'CHANNEL_ID_IN_WORKSPACE_B';

async function test() {
  // 1. Cross-workspace leak test (MUST 404)
  const resLeak = await fetch(`${BASE_URL}/channels/${CHANNEL_B_ID}`, {
    headers: { 'Authorization': `Bearer ${USER_A_TOKEN}` }
  });
  console.log('Cross-workspace GET channelB as userA →', resLeak.status);
  if (resLeak.status !== 404) {
    console.error('FAIL: Expected 404, got', resLeak.status);
    process.exit(1);
  }

  // 2. Same-workspace access (MUST 200)
  const resOk = await fetch(`${BASE_URL}/channels/${CHANNEL_A_ID}`, {
    headers: { 'Authorization': `Bearer ${USER_A_TOKEN}` }
  });
  console.log('Same-workspace GET channelA as userA →', resOk.status);
  if (resOk.status !== 200) {
    console.error('FAIL: Expected 200, got', resOk.status);
    process.exit(1);
  }

  console.log('PASS: Tenant isolation working as expected');
}

test().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
