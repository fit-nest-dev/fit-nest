import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import bodyParser from 'body-parser';
dotenv.config()
import authRoutes from './routes/AuthRoutes.js'
import userRoutes from './routes/UserRoutes.js'
import ProductRoutes from './routes/ProductRoutes.js'
import PaymentRoutes from './routes/Payment_routes.js'
import CartRoutes from './routes/Cart_Routes.js'
import OrderRoutes from './routes/Order_Routes.js'
import TrainerRoutes from './routes/TrainerRoutes.js'
import AdminRoutes from './routes/AdminRoutes.js'
import connectDB from "./db/connectDB.js";
import path from "path";
import cors from 'cors'
import rateLimit from "express-rate-limit";
import { app, io, server } from "./socket/socket.js";
import { scheduleEmailNotifications, UpdateMembershipStatus } from "./controllers/UserControllers.js";
import helmet from "helmet";
const PORT = process.env.PORT || 5000
scheduleEmailNotifications();
UpdateMembershipStatus();
const __dirname_temp=path.resolve();
const __dirname = path.join(__dirname_temp, '.');
console.log(__dirname);
// const limiter = rateLimit({
//     windowMs: 1 * 60 * 1000, // 1 minutes window
//     max: 100, // Allow 100 requests per window
//     message: `Too many requests from this IP,
//    please try again later`,
// });
// app.use(limiter);
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://checkout.razorpay.com"],
      imgSrc: ["'self'", "data:", "https://i.imgur.com", "https://firebasestorage.googleapis.com"],
      connectSrc: ["'self'", "https://api.razorpay.com", "https://lumberjack.razorpay.com"],
      frameSrc: ["'self'", "https://checkout.razorpay.com", "https://api.razorpay.com"],
    },
  })
);
 

// Optionally configure Helmet for specific needs
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ["http://localhost:3000","http://localhost:3001" ,"https://fit-nest.onrender.com","http://3.25.86.182:5000/"], credentials: true }));
app.use(bodyParser.json());
//middleware
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', ProductRoutes);
app.use('/api/Payment', PaymentRoutes);
app.use('/api/Cart', CartRoutes);
app.use('/api/Order', OrderRoutes);
app.use('/api/Trainer', TrainerRoutes);
app.use('/api/Admin', AdminRoutes);
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(path.resolve(), "frontend/dist")));
  app.get('*', (req, res) => {
    res.sendFile(path.join(path.resolve(), "frontend/dist", "index.html"));
  });
}
server.listen(PORT, () => {
  console.log(`hello ${PORT}`);
  connectDB();
})