import { StatusCodes } from 'http-status-codes';
import razorpay, { isPaymentConfigured } from '../config/razorpayConfig.js';
import { CURRENCY } from '../config/serverConfig.js';

export const createOrder = async (req, res) => {
  if (!isPaymentConfigured) {
    return res.status(StatusCodes.NOT_IMPLEMENTED).json({
      success: false,
      message: 'Payments are disabled in local/demo mode. Set RAZORPAY_KEY_ID ' +
                'and RAZORPAY_KEY_SECRET in .env to enable this feature.',
    });
  }

  try {
    const { amount } = req.body;
    const options = {
      amount,
      currency: CURRENCY,
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    console.log(order);
    return res.status(StatusCodes.CREATED).json({ success: true, data: order });
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
};

export const captureOrder = async (req, res) => {
  if (!isPaymentConfigured) {
    return res.status(StatusCodes.NOT_IMPLEMENTED).json({
      success: false,
      message: 'Payments are disabled in local/demo mode.',
    });
  }

  try {
    const { orderId, status, paymentId, signature } = req.body;
    return res.status(StatusCodes.OK).json({
      success: true,
      data: { orderId, status, paymentId, signature },
    });
  } catch (err) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: err.message });
  }
};
