import express from 'express'
import { checkPaymentStatus, CreateOrderForMembership, CreateOrderForMultiple, CreateOrderForTrainer, requestRefund, VerifyPaymentForMembership, VerifyPaymentForMultiple, VerifyPaymentForPersonalTrainer } from '../controllers/Payment_Controllers.js';
import protectRoute from '../middleware/protectRoute.js';
const router = express.Router();
/**
 * This file contains all the routes related to the payment operations
 * the operations include creating an order for multiple items, creating an order for a trainer,
 * verifying a payment for a trainer, creating an order for a membership, verifying a payment for membership,
 * checking the status of orders, requesting a refund.
 */
router.post('/create-order-multiple', protectRoute, CreateOrderForMultiple);
router.post('/create-order-multiple-guest', CreateOrderForMultiple);
router.post('/verify-payment-for-multiple', protectRoute, VerifyPaymentForMultiple);
router.post('/verify-payment-for-multiple-guest', VerifyPaymentForMultiple);
router.post('/create-order-for-trainer', protectRoute, CreateOrderForTrainer);
router.post('/check-status-orders', protectRoute, checkPaymentStatus);
router.post('/check-status-orders-not-logged-in', checkPaymentStatus);
router.post('/verify-payment-for-trainer', protectRoute, VerifyPaymentForPersonalTrainer);
router.post('/create-order-for-membership', protectRoute, CreateOrderForMembership);
router.post('/verify-payment-for-membership', protectRoute, VerifyPaymentForMembership);
router.post('/request-refund', requestRefund);
router.post('/create-order-for-new-membership', CreateOrderForMembership);
router.post('/verify-payment-for-new-membership', VerifyPaymentForMembership);
export default router