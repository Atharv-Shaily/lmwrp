import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendOTPSMS(phone: string, otp: string): Promise<void> {
  try {
    await client.messages.create({
      body: `Your LiveMart OTP verification code is: ${otp}. This code expires in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
  } catch (error) {
    console.error('SMS sending failed:', error);
    // Fallback to email or log error
  }
}

export async function sendOrderConfirmationSMS(
  phone: string,
  orderNumber: string
): Promise<void> {
  try {
    await client.messages.create({
      body: `Your LiveMart order ${orderNumber} has been confirmed. We'll keep you updated on the delivery status.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
  } catch (error) {
    console.error('SMS sending failed:', error);
  }
}

export async function sendDeliveryNotificationSMS(
  phone: string,
  orderNumber: string
): Promise<void> {
  try {
    await client.messages.create({
      body: `Your LiveMart order ${orderNumber} has been delivered. Thank you for shopping with us!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
  } catch (error) {
    console.error('SMS sending failed:', error);
  }
}






