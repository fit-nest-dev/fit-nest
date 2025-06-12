import express from "express"
import { changePasswordByOldPassword, changePasswordByOtp, CheckMail, login, loginAsAdmin, logout, ResetPassword, SaveNewPassword, SendOTP, SignUp, SignUpAfterPaymentForNewMembership, VerifyOTP } from "../controllers/AuthControllers.js";
import protectRoute from "../middleware/protectRoute.js";
//All routes related to authentication are defined here
//signup,login,logout,checkEmail,sendOTP,verifyOTP,forgotPassword,resetPassword,changePasswordByOldPassword and changePasswordByOTP
const router = express.Router();
router.post('/signup', SignUp);
router.post('/signup-after-pay-for-new-membership', SignUpAfterPaymentForNewMembership);
router.post('/logout', logout);
router.post('/login', login);
router.post('/login-admin', loginAsAdmin);
router.post('/check-email', CheckMail);
router.put('/save-new-password',SaveNewPassword);
router.post('/send-otp', SendOTP);
router.post('/verify-otp', VerifyOTP);
router.post('/reset-password', ResetPassword);
router.post('/changepasswordbyoldpassword/:id', protectRoute, changePasswordByOldPassword)
router.post('/changepasswordbyotp/:id', protectRoute, changePasswordByOtp)//will be used by frontend
export default router;