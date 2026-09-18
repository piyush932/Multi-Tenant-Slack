# Resolved

The guard described here has now been applied directly to
`messageController.js` in this branch — no manual step needed.
`getPresignedUrlFromAWS` now checks `isS3Configured` from `awsConfig.js`
before calling S3, and returns `501` with a clear message when AWS
credentials are not set, instead of crashing.
