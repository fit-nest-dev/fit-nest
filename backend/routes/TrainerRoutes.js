import express from 'express'
import { ApproveByAdmin, CreateTrainer, deleteTrainer, GetAllAssignedTrainers, GetAllTrainers, GetAllTrainersMails, handleUpdateStatus, RateTrainer, RefundAfterPaymentAndRemove, removeTrainerFromMember, RemoveTrainerShift, requestForPayFromUser, RequestFromUserForTrainer, TrainersAssignedToUsers, UpdateTrainerAvailability, UpdateTrainerSalary, UpdateTrainerShift } from '../controllers/TrainerControllers.js';
import protectRoute from '../middleware/protectRoute.js';
const router = express.Router();
/**
 * This file contains all the routes related to the trainer operations
 * The operations include creating a trainer, deleting a trainer, getting all the trainers,
 * getting all the trainers assigned to a particular member, updating a trainer's salary,
 * updating a trainer's shift, removing a trainer's shift, getting all the trainer's mail,
 * updating a trainer's status, updating a trainer's availability, rating a trainer,
 * assigning a trainer to a member, approving a trainer, and requesting to pay a trainer
 */
router.get('/AllTrainers', protectRoute, GetAllTrainers);
router.put('/update-salary/:TrainerId', protectRoute, UpdateTrainerSalary);
router.put('/update-shift/:TrainerId', protectRoute, UpdateTrainerShift);
router.put('/remove-shift/:TrainerId', protectRoute, RemoveTrainerShift);
router.get('/AllMails', protectRoute, GetAllTrainersMails)
router.put('/update-status', protectRoute, handleUpdateStatus);
router.put(`/update-availability/:TrainerId`, protectRoute, UpdateTrainerAvailability);
router.put('/rate/:TrainerId/:UserId', protectRoute, RateTrainer);
router.put('/approve-trainer/:trainerId/:memberId', protectRoute, ApproveByAdmin);
router.put('/request-to-pay-for-user/:trainerId/:memberId', protectRoute, requestForPayFromUser);
router.put('/RemoveTrainer/:memberId/:trainerId', protectRoute, removeTrainerFromMember);
router.put('/remove-trainer-refund/:memberId/:trainerId', protectRoute, RefundAfterPaymentAndRemove);
router.get('/GetAssignedTrainers/:TrainerId', protectRoute, GetAllAssignedTrainers);
router.get('/trainers-assigned-to-user/:userId', protectRoute, TrainersAssignedToUsers)
router.post('/AddTrainer', protectRoute, CreateTrainer);
router.put('/request-trainer', protectRoute, RequestFromUserForTrainer);
router.delete('/delete-trainer/:TrainerID', protectRoute, deleteTrainer);
export default router