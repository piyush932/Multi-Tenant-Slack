import AWS from 'aws-sdk';

import { AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SECRET_ACCESS_KEY } from './serverConfig.js';

export const isS3Configured = Boolean(
  AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_REGION
);

if (isS3Configured) {
  AWS.config.update({
    region: AWS_REGION,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  });
} else {
  console.warn(
    '[awsConfig] AWS credentials not set — image upload (getPresignedUrlFromAWS) ' +
    'will respond with 501 instead of crashing. Text messaging works fine without this.'
  );
}

export const s3 = isS3Configured ? new AWS.S3() : null;
