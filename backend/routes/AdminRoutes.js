import express from 'express'
import { AddNewMembershipPlan, AddNewResources, AddResources, CreateMember, DeleteMemberById, deletePDFRequest, DeleteResourceById, getAboutUs, getAllMembershipPlans, getAllResources, getDiscountCodes, getEvents, getFooterInfo, getHomeMEDIA, getSalesDataByProduct, getUserPlanPDFRequests, ModifyDiscountCodes, PostCustomMedia, putHomeMedia, saveEvents, saveLocations, saveSuggestedProducts, updateChangeRequest, UpdateFooterInfo, updateMembershipPlan, UpdateResourceById } from '../controllers/AdminControllers.js';
import protectRoute from '../middleware/protectRoute.js';
const router = express.Router();
// this file contains all the routes related to the admin operations
// the operations include creating a new user, deleting a user, getting all the membership plans,
// getting all the resources, updating a resource, adding a new resource, deleting a resource,
// getting sales data by product, saving suggested products, getting about us section data,
// getting footer info, getting home media, posting custom media, updating home media,
// saving events, saving locations, modifying discount codes, getting discount codes,
// getting events, getting sales data by membership, getting user plan pdf requests,
// deleting pdf request, updating a change request
router.post('/Create-Member', protectRoute, CreateMember)
router.delete('/Delete-Member/:id', protectRoute, DeleteMemberById);
router.get('/AllMembershipPlans', getAllMembershipPlans);
router.put('/UpdateMembershipPlan/:planId', protectRoute, updateMembershipPlan)
router.get('/AllResources', getAllResources);
router.put('/UpdateResource/:id', protectRoute, UpdateResourceById);
router.post('/AddResource', protectRoute, AddResources);
router.delete('/DeleteResource/:id', protectRoute, DeleteResourceById);
router.post('/AddNewResource', protectRoute, AddNewResources);
router.get('/getSalesDataByProduct/:startDate/:endDate', protectRoute, getSalesDataByProduct);
router.post('/save-suggested-products', protectRoute, saveSuggestedProducts);
router.get('/about-us', protectRoute, getAboutUs);
router.post('/save-locations', protectRoute, saveLocations);
router.get('/get-discount-codes', getDiscountCodes);
router.get('/get-footer-info', getFooterInfo);
router.put('/update-footer-info', protectRoute, UpdateFooterInfo);
router.post('/discount-codes', protectRoute, ModifyDiscountCodes);
router.get('/home-media', protectRoute, getHomeMEDIA);
router.put('/put-home-media', protectRoute, putHomeMedia);
router.post('/custom-media', protectRoute, PostCustomMedia);
router.post('/add-membership-plans', protectRoute, AddNewMembershipPlan);
router.patch('/change-requests/:id', protectRoute, updateChangeRequest);
router.get('/get-user-plan-pdf-requests', protectRoute, getUserPlanPDFRequests);
router.get('/get-events', protectRoute, getEvents);
router.post('/save-events', protectRoute, saveEvents);
router.delete('/delete-user-plan-pdf-request/:id', protectRoute, deletePDFRequest);
export default router