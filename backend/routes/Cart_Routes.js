import express from "express";
import { AddProductToCart, AddProductToCartDescBox, AddProductToCartFromLocalStorage, DecrementProductFromCart, DeleteProductFromCart, DeleteProductFromCartAfterPlacingOrder, DeleteProductFromCartAfterPlacingOrderGuest, getCartProductsByUserId, PlaceLockOnItemsDuringPay, PlaceLockOnItemsDuringPayGuest, ReleaseLockDueToPaymentFailure, ReleaseLockDueToPaymentFailureGuest, validateCartStock } from "../controllers/CartControllers.js";
import protectRoute from "../middleware/protectRoute.js";
const router = express.Router();
/**
 * This file contains all the routes related to the cart operations
 * The operations include getting all the cart products for a user,
 * adding a product to the cart from local storage, decrementing a product in the cart,
 * deleting a product from the cart, and deleting a product from the cart after placing an order
 */
// router.get('/GetCartProducts/:AuthUserId', protectRoute, getCartProductsByUserId);
router.put('/AddToCart-from-local-storage/:AuthUserId/:ProductId', protectRoute, AddProductToCartFromLocalStorage);
router.put('/AddToCart/:AuthUserId/:ProductId', AddProductToCart);
router.put('/AddToCartDescBox/:AuthUserId/:ProductId', AddProductToCartDescBox);
router.post('/validate-stock', validateCartStock);
router.put('/DecrementCart/:AuthUserId/:ProductId', protectRoute, DecrementProductFromCart);
router.delete('/DeleteFromCart/:AuthUserId/:ProductId', protectRoute, DeleteProductFromCart);
router.delete('/DeleteFromCartAfterOrder/:AuthUserId/:ProductId', protectRoute, DeleteProductFromCartAfterPlacingOrder);
router.put('/DeleteFromCartAfterOrder-guest/:ProductId', DeleteProductFromCartAfterPlacingOrderGuest);
router.get('/GetCarts/:AuthUserId', protectRoute, getCartProductsByUserId);
router.put('/lockProductDuringPay/:ProductId/:AuthUserId', protectRoute, PlaceLockOnItemsDuringPay);
router.put('/releaseLockDueToPayFailure/:ProductId/:AuthUserId', protectRoute, ReleaseLockDueToPaymentFailure);
router.put('/lockProductDuringPay-guest/:ProductId', PlaceLockOnItemsDuringPayGuest);
router.put('/releaseLockDueToPayFailure-guest/:ProductId', ReleaseLockDueToPaymentFailureGuest);
export default router