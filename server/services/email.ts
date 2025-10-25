import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export class EmailService {
  static async sendPaymentConfirmation(customerEmail: string, orderDetails: any) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: customerEmail,
      subject: 'Payment Confirmed - Rubikcon Games',
      html: `
        <h2>Payment Confirmed!</h2>
        <p>Your payment has been successfully processed.</p>
        <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
        <p><strong>Amount:</strong> ${orderDetails.amount}</p>
        <p><strong>Games:</strong> ${orderDetails.items.map(item => item.title).join(', ')}</p>
        <p>Thank you for your purchase!</p>
      `,
    };
    
    await transporter.sendMail(mailOptions);
  }

  static async sendAdminNotification(orderDetails: any) {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Order Received - Rubikcon Games',
      html: `
        <h2>New Order Alert!</h2>
        <p><strong>Order ID:</strong> ${orderDetails.orderId}</p>
        <p><strong>Customer:</strong> ${orderDetails.customerInfo.fullName}</p>
        <p><strong>Email:</strong> ${orderDetails.customerInfo.email}</p>
        <p><strong>Amount:</strong> ${orderDetails.total}</p>
        <p><strong>Items:</strong> ${orderDetails.items.map(item => `${item.title} (Qty: ${item.quantity})`).join(', ')}</p>
      `,
    };
    
    await transporter.sendMail(mailOptions);
  }
}