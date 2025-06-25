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
      connectSrc: [
        "'self'",
        "wss://www.fit-nest.in",
        "ws://16.176.121.1",
        "ws://3.25.86.182:5000",
        "wss://3.25.86.182:5000",
        "http://3.25.86.182:5000",
        "http://3.25.86.182:3000",
        "https://api.razorpay.com",
        "https://lumberjack.razorpay.com"
      ],
      frameSrc: ["'self'", "https://checkout.razorpay.com", "https://api.razorpay.com"],
    },
  })
);

 

// Optionally configure Helmet for specific needs
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ["http://localhost:3000","http://localhost:3001" ,"https://fit-nest.onrender.com","http://3.25.86.182:3000", "http://3.25.86.182:5000"], credentials: true }));
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    razorpay_configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  });
});

// API health check with more details
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: 'connected', // You can add actual DB check here
    services: {
      razorpay: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET),
      email: !!process.env.EMAIL_USER,
      cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME
    }
  });
});

// Test endpoint for payment debugging
app.post('/api/Payment/test-order', async (req, res) => {
  try {
    const { amount = 100 } = req.body; // Default to ₹1 for testing
    
    const Razorpay = await import('razorpay');
    const razorpay = new Razorpay.default({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: 'test_' + Date.now(),
      notes: {
        test: true,
        environment: process.env.NODE_ENV
      }
    });

    res.status(200).json({
      success: true,
      message: 'Test order created successfully',
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status
      },
      config: {
        key_id: process.env.RAZORPAY_KEY_ID,
        environment: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error('Test order creation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      details: error.response?.data || null
    });
  }
});

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