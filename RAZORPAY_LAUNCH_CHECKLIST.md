# Razorpay launch checklist

1. Approve the launch price card only after at least two like-for-like written supplier quotes per instant-buy family, including freight, setup, wastage, GST treatment, and rejection allowance.
2. Add test-mode `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and a dedicated `RAZORPAY_WEBHOOK_SECRET` to the deployment environment.
3. In Razorpay, register `https://packworkz.com/api/payments/webhook` and enable `payment.captured` and `order.paid`.
4. Complete one successful test payment and verify the Packworkz order changes from `payment_pending` to `confirmed`.
5. Verify a failed or dismissed payment leaves the order in `payment_pending` and can be retried from the confirmation URL.
6. Verify an order above Rs 50,000 creates no Razorpay order and is marked `payment_confirmation_required` for the order desk.
7. Confirm Slack receives both the initial order plan and the captured-payment event.
8. Switch to live Razorpay keys only after KYC, settlement bank details, refund access, legal pages, and the production webhook are verified.
9. Rotate every credential previously shared through chat or screenshots before launch.

Packworkz is the order system of record. Razorpay receives only a server-created amount tied to a saved Packworkz reference; the browser cannot supply or alter the payable amount. Gateway keys alone do not complete launch readiness: the webhook, live-mode account, supplier-approved prices, and a real end-to-end payment must all pass.
