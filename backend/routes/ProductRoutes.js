import express from 'express'
import { AddProduct, decrementProduct, decrementProductforguest, decrementProductforguestDescBox, deleteProduct, getAllProducts, getProductById, incrementProduct, UpdateProductById } from '../controllers/ProductController.js';
import protectRoute from '../middleware/protectRoute.js';
const router = express.Router();
/**
 * This file contains all the routes related to the products operations
 * The operations include adding a new product, getting all products,
 * deleting a product, incrementing a product in the cart,
 * decrementing a product in the cart, and updating a product
 */
router.get('/AllProducts', getAllProducts);
router.delete('/deleteProduct/:id', protectRoute, deleteProduct);
router.post('/AddProduct', protectRoute, AddProduct);
router.put('/incrementProduct/:id', protectRoute, incrementProduct);
router.put('/decrementProduct/:id', protectRoute, decrementProduct);
router.get('/product-by-id/:id', getProductById);
router.put('/UpdateProduct/:id', protectRoute, UpdateProductById);
// router.put('/incrementProduct-guest/:id', incrementProduct);
router.put('/decrementProduct-guest/:id', decrementProductforguest);
router.put('/decrementProduct-guestDescBox/:id', decrementProductforguestDescBox);
export default router;