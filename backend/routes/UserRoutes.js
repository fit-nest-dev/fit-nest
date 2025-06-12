import express from "express";
import { calculateMembershipSales, ChangeAddress, changeRequest, EditUserDetails, getAllEmails, getAllFeebacks, getAllUsersMembershipDetails, getChangeRequests, getInactiveMembers, getUserById, getUserCurrentInfo, SendCustomMails, SubmitUserFeedback, workoutDietPdfRequest } from "../controllers/UserControllers.js";
import protectRoute from "../middleware/protectRoute.js";
const router = express.Router();
/**
 * This file contains all the routes related to the user operations
 * The operations include getting a user by id, getting all the membership details,
 * sending reminder mail, sending expired mail, getting all the emails,
 * sending custom mail, submitting a feedback, editing a user, getting all the feedbacks,
 * getting inactive members and calculating the sales from membership
 */
router.get('/GetUserById/:id', protectRoute, getUserById);
router.get('/MemberShipDetails', protectRoute, getAllUsersMembershipDetails);
router.get('/get-all-emails', protectRoute, getAllEmails);
router.post('/send-custom-mail', protectRoute, SendCustomMails);
router.post('/submit-feedback', protectRoute, SubmitUserFeedback);
router.put('/edit-user/:id', protectRoute, EditUserDetails);
router.get('/all-feedbacks', protectRoute, getAllFeebacks);
router.get('/inactive-members', protectRoute, getInactiveMembers);
router.get('/SalesFromMembership/:start_date/:end_date', protectRoute, calculateMembershipSales);
router.post('/workoutDietPdfReguest/:id', protectRoute, workoutDietPdfRequest)
router.get('/getChangeRequests', protectRoute, getChangeRequests);
router.get('/:id/current-info', protectRoute, getUserCurrentInfo);
router.post('/requestToChangeInfo', protectRoute, changeRequest);
router.put('/change-address/:id', protectRoute, ChangeAddress);
export default router;