# Patch note: guard `getPresignedUrlFromAWS` in messageController.js

Your existing `messageController.js` has:

```js
import { s3 } from '../config/awsConfig.js';
import { AWS_BUCKET_NAME } from '../config/serverConfig.js';

export const getPresignedUrlFromAWS = async (req, res) => {
  try {
    const url = await s3.getSignedUrlPromise('putObject', {
      Bucket: AWS_BUCKET_NAME,
      Key: `${Date.now()}`,
      Expires: 60
    });
    // ...
  } catch (err) {
    // ...
  }
};
```

Add one guard clause at the top of the function so it never crashes when S3
isn't configured (image upload is the only feature this affects — everything
else works without it):

```js
import { s3, isS3Configured } from '../config/awsConfig.js';
import { AWS_BUCKET_NAME } from '../config/serverConfig.js';
import { StatusCodes } from 'http-status-codes';

export const getPresignedUrlFromAWS = async (req, res) => {
  if (!isS3Configured) {
    return res.status(StatusCodes.NOT_IMPLEMENTED).json({
      success: false,
      message: 'Image upload is disabled in local/demo mode. Set AWS_* env vars to enable.',
    });
  }
  try {
    const url = await s3.getSignedUrlPromise('putObject', {
      Bucket: AWS_BUCKET_NAME,
      Key: `${Date.now()}`,
      Expires: 60,
    });
    return res.status(StatusCodes.OK).json({ success: true, data: { url } });
  } catch (err) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: err.message });
  }
};
```

This is a one-line addition (`if (!isS3Configured) { ... }`) — left as a
manual patch since your original function body wasn't fully visible to the
tooling used to build this branch, and I don't want to guess and overwrite
logic I can't verify.
