import { StatusCodes } from "http-status-codes";

import razorpay, { isPaymentConfigured } from '../config/razorpayConfig.js';
import { CURRENCY, RECEIPT_SECRET } from "../config/serverConfig.js";
import { createPaymentService, updatePaymentStatusService } from "../services/paymentService.js";
import { internalErrorResponse, successResponse } from "../utils/common/responseObjects.js";

export const createOrderController = async (req, res) => {
    if (!isPaymentConfigured) {
        return res
            .status(StatusCodes.NOT_IMPLEMENTED)
            .json(internalErrorResponse({
                message: 'Payments are disabled in local/demo mode. Set RAZORPAY_KEY_ID ' +
                         'and RAZORPAY_KEY_SECRET in .env to enable this feature.'
            }));
    }
    try {
        const options = {
            amount: req.body.amount,
            currency: CURRENCY,
            receipt: RECEIPT_SECRET
        };
        const order = await razorpay.orders.create(options);
        console.log(order);
        await createPaymentService(order.id, order.amount);
        return res
            .status(StatusCodes.CREATED)
            .json(successResponse(order, 'Order created successfully'));
    } catch (error) {
        console.log('Error in createOrderController', error);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(internalErrorResponse(error));
    }
};

export const capturePaymentController = async (req, res) => {
    if (!isPaymentConfigured) {
        return res
            .status(StatusCodes.NOT_IMPLEMENTED)
            .json(internalErrorResponse({
                message: 'Payments are disabled in local/demo mode.'
            }));
    }
    try {
        console.log('Request body', req.body);
        await updatePaymentStatusService(
            req.body.orderId,
            req.body.status,
            req.body.paymentId,
            req.body.signature
        );
        return res
            .status(StatusCodes.OK)
            .json(successResponse(null, 'Payment status updated successfully'));
    } catch (error) {
        console.log('Error in capturePaymentController', error);
        return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json(internalErrorResponse(error));
    }
};
