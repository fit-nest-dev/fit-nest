import express from "express";
import { calculateTotalSales, CancelOrderByUser, EditDeliveryTime, EditOrderAddress, EditOrderStatus, fetchProductBuyCounts, GetAllOrdersFromDatabase, getMostAndLeastBoughtProducts, getOrderDetailsofGuest, GetOrdersOfParticularUser, GetParticularOrderById } from "../controllers/OrderControllers.js";
import protectRoute from "../middleware/protectRoute.js";
const router = express.Router();
/**
 * This file contains all the routes for orders
 * The routes are protected by middleware which verifies the user is authenticated
 * The routes are:
 *      - GET /order-details/:orderId/:AuthUserId - Get the details of a particular order by AuthUserId
 *      - GET /order-details-guest/:orderId - Get the details of a particular order by orderId
 *      - POST /GetAllOrders/:AuthUserId - Get all orders of a particular user
 *      - POST /AllOrders - Get all orders in the database
 *      - PUT /EditDeliveryTime/:OrderId - Edit the delivery time of an order
 *      - PUT /EditStatus/:OrderId - Edit the status of an order
 *      - PUT /UpdateOrderAddress/:OrderId - Edit the address of an order
 *      - PUT /CancelOrder/:OrderId - Cancel an order by a user
 *      - POST /calculateTotalSales - Calculate the total sales of all orders
 *      - POST /MostAndLeastBoughtProducts - Get the most and least bought products
 *      - POST /fetchProductBuyCounts - Get the number of times a product has been bought
 */
router.post('/order-details/:orderId/:AuthUserId', protectRoute, GetParticularOrderById);
router.get('/order-details-guest/:orderId', getOrderDetailsofGuest);
router.post('/GetAllOrders/:AuthUserId', GetOrdersOfParticularUser);
router.post('/AllOrders', GetAllOrdersFromDatabase);
router.put('/EditDeliveryTime/:OrderId', EditDeliveryTime);
router.put('/EditStatus/:OrderId', EditOrderStatus);
router.put('/UpdateOrderAddress/:OrderId', EditOrderAddress);
router.put('/CancelOrder/:OrderId', CancelOrderByUser)
router.get('/TotalSales/:startDate/:endDate', calculateTotalSales);
router.get('/products-buy-counts/:startDate/:endDate', fetchProductBuyCounts);
router.get('/Most-least-products/:startDate/:endDate', getMostAndLeastBoughtProducts);
export default router