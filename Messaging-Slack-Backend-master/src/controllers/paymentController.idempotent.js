import { StatusCodes } from 'http-status-codes';
import { withIdempotency } from '../services/webhookIdempotencyService.js';
import instance from '../config/razorpayConfig.js';
import Payment from '../schema/payment.js';
import crypto from 'crypto';

export async function createOrder(req, res) {
  try {
    const { amount, currency } = req.body;
    const options = { amount, currency, receipt: `receipt_${Date.now()}` };
    const order = await instance.orders.create(options);
    return res.status(StatusCodes.CREATED).json({ success: true, data: order });
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
}

export async function captureOrder(req, res) {
  try {
    const { orderId, status, paymentId, signature } = req.body;
    const payment = await Payment.findOneAndUpdate(
      { orderId },
      { status, paymentId, razorpaySignature: signature },
      { new: true, upsert: true }
    );
    return res.status(StatusCodes.OK).json({ success: true, data: payment });
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
}

export async function razorpayWebhook(req, res) {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body;
    const providerEventId = event.payload?.payment?.entity?.id || event.id;

    const result = await withIdempotency(providerEventId, event.event, event, async (session) => {
      // Your existing webhook effect goes here (extend subscription, mark captured, etc.)
      // It will run exactly once per unique providerEventId.
      return { processed: true };
    });

    if (result.replayed) {
      return res.status(StatusCodes.OK).json({ success: true, replayed: true });
    }

    return res.status(StatusCodes.OK).json({ success: true, data: result.result });
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
}
