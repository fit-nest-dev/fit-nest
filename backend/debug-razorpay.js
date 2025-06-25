import dotenv from 'dotenv';
dotenv.config();

// Debug script to check Razorpay configuration
console.log('=== Razorpay Configuration Check ===');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Set' : 'NOT SET');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);

if (process.env.RAZORPAY_KEY_ID) {
  console.log('Key ID starts with:', process.env.RAZORPAY_KEY_ID.substring(0, 8) + '...');
}

if (process.env.RAZORPAY_KEY_SECRET) {
  console.log('Key Secret length:', process.env.RAZORPAY_KEY_SECRET.length);
}

// Test Razorpay initialization
try {
  const Razorpay = await import('razorpay');
  const razorpay = new Razorpay.default({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  console.log('✅ Razorpay initialized successfully');
  
  // Test order creation
  try {
    const testOrder = await razorpay.orders.create({
      amount: 100, // ₹1 in paise
      currency: 'INR',
      receipt: 'test_' + Date.now(),
      notes: {
        test: true
      }
    });
    console.log('✅ Test order created successfully:', testOrder.id);
  } catch (orderError) {
    console.error('❌ Failed to create test order:', orderError.message);
    if (orderError.response) {
      console.error('Response data:', orderError.response.data);
    }
  }
  
} catch (initError) {
  console.error('❌ Failed to initialize Razorpay:', initError.message);
}

console.log('=== End Configuration Check ===');
