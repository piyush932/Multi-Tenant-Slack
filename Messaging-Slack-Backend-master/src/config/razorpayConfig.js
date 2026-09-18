import razorpay from 'razorpay';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from './serverConfig.js';

const isConfigured = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);

let instance = null;
if (isConfigured) {
  instance = new razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn(
    '[razorpayConfig] RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET not set — payment ' +
    'routes will respond with 501 "Payments disabled in local mode" instead ' +
    'of calling Razorpay. This is expected for local/resume-demo testing.'
  );
}

export const isPaymentConfigured = isConfigured;
export default instance;
