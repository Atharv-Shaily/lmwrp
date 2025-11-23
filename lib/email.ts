import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your LiveMart OTP Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">LiveMart Verification</h2>
        <p>Your OTP verification code is:</p>
        <h1 style="color: #0284c7; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendOrderConfirmationEmail(
  email: string,
  orderNumber: string,
  orderDetails: any
): Promise<void> {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Order Confirmation - ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">Order Confirmed!</h2>
        <p>Thank you for your order. Your order number is: <strong>${orderNumber}</strong></p>
        <h3>Order Details:</h3>
        <ul>
          ${orderDetails.items.map((item: any) => `
            <li>${item.product.name} x ${item.quantity} - ₹${item.total}</li>
          `).join('')}
        </ul>
        <p><strong>Total: ₹${orderDetails.total}</strong></p>
        <p>We'll send you updates on your order status.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendDeliveryNotificationEmail(
  email: string,
  orderNumber: string,
  trackingNumber?: string
): Promise<void> {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Your Order ${orderNumber} Has Been Delivered`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">Order Delivered!</h2>
        <p>Your order <strong>${orderNumber}</strong> has been successfully delivered.</p>
        ${trackingNumber ? `<p>Tracking Number: <strong>${trackingNumber}</strong></p>` : ''}
        <p>Thank you for shopping with LiveMart!</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}






