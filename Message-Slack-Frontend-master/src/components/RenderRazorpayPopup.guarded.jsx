import { useCaptureOrder } from "@/hooks/apis/payments/useCaptureOrder";
import { useEffect, useState } from "react";

const loadRazorpayScript = (src) => {
    return new Promise((res) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => res(true);
        script.onerror = () => res(false);
        document.body.appendChild(script);
    });
};

export const RenderRazorpayPopup = ({
    orderId,
    keyId,
    currency,
    amount,
}) => {
    const [disabled, setDisabled] = useState(false);
    const { captureOrderMutation } = useCaptureOrder();

    useEffect(() => {
        if (!keyId || !orderId) {
            setDisabled(true);
            console.warn('Razorpay disabled: no VITE_RAZORPAY_KEY_ID configured (expected for local/resume testing).');
            return;
        }

        const display = async (options) => {
            const scriptResponse = await loadRazorpayScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!scriptResponse) {
                console.log('Error in loading script');
                return;
            }

            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', async function (response) {
                console.log('Payment failed', response.error.code);
                await captureOrderMutation({
                    orderId: options.order_id,
                    status: 'failed',
                    paymentId: '',
                });
            });

            rzp.open();
        };

        display({
            key: keyId,
            amount,
            currency,
            name: "Multi-Tenant Slack",
            description: "Test Transaction",
            order_id: orderId,
            handler: async (response) => {
                await captureOrderMutation({
                    orderId: orderId,
                    status: 'success',
                    paymentId: response.razorpay_payment_id,
                    signature: response.razorpay_signature,
                });
            }
        });
    }, [orderId, keyId]);

    if (disabled) {
        return (
            <div style={{ padding: '8px 12px', background: '#fff3cd', color: '#856404', borderRadius: 4, fontSize: 13 }}>
                Payments are disabled in local/demo mode (no Razorpay key configured).
            </div>
        );
    }

    return null;
};
