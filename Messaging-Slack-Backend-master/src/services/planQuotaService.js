// USAGE QUOTAS BY PLAN — reuses the same "one matrix, one check point"
// philosophy as permissionMatrix.js, but for RESOURCE LIMITS instead of
// ACTIONS. A free workspace can't spin up unlimited channels/members just
// because nothing stops it at the query layer.
export const PLAN_LIMITS = {
  free: { maxMembers: 5, maxChannels: 3 },
  pro: { maxMembers: 100, maxChannels: 50 },
};

export function getLimitsForPlan(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export function assertUnderLimit(currentCount, plan, limitKey, resourceName) {
  const limits = getLimitsForPlan(plan);
  const max = limits[limitKey];
  if (currentCount >= max) {
    throw Object.assign(
      new Error(`${resourceName} limit reached for the "${plan}" plan (max ${max}). Upgrade to add more.`),
      { statusCode: 403 }
    );
  }
}
