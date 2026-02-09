/**
 * Email Templates
 * Standardized HTML templates for different email scenarios.
 */

const COMPANY_NAME = "TRUEGUT";
const PRIMARY_COLOR = "#d97706"; // amber-600
const LOGO_URL = "https://res.cloudinary.com/fermentaa/image/upload/v1/logo.png"; // Replace with actual logo URL

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; border-bottom: 3px solid ${PRIMARY_COLOR}; background-color: #fff; }
    .logo { font-size: 24px; font-weight: bold; color: ${PRIMARY_COLOR}; text-decoration: none; }
    .content { background-color: #fff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .button { display: inline-block; padding: 12px 24px; background-color: ${PRIMARY_COLOR}; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 20px; }
    .alert { color: #dc2626; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { text-align: left; padding: 10px; border-bottom: 1px solid #eee; }
    th { color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="#" class="logo">${COMPANY_NAME}</a>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
      <p>This is an automated message, please do not reply directly.</p>
    </div>
  </div>
</body>
</html>
`;

export const passwordResetTemplate = (resetUrl, isUser = true) => baseTemplate(`
  <h2>Password Reset Request</h2>
  <p>Hello,</p>
  <p>We received a request to reset your password for your ${isUser ? 'customer' : 'admin'} account.</p>
  <p>Click the button below to reset it. This link will expire in 1 hour.</p>
  <div style="text-align: center;">
    <a href="${resetUrl}" class="button">Reset Password</a>
  </div>
  <p>If you didn't ask for this, you can ignore this email.</p>
`);

export const passwordChangedTemplate = () => baseTemplate(`
  <h2>Password Changed</h2>
  <p>Hello,</p>
  <p>Your password has been successfully changed.</p>
  <p>If this wasn't you, please contact support immediately.</p>
`);

export const welcomeTemplate = (name) => baseTemplate(`
  <h2>Welcome to ${COMPANY_NAME}!</h2>
  <p>Hi ${name},</p>
  <p>We're thrilled to have you on board. Your account has been successfully created.</p>
  <p>Start exploring our fresh collection today!</p>
  <div style="text-align: center;">
    <a href="#" class="button">Start Shopping</a>
  </div>
`);

export const stockAlertTemplate = (productName, variantName, currentStock, threshold) => baseTemplate(`
  <h2 class="alert">Low Stock Alert</h2>
  <p>The following item has fallen below the stock threshold:</p>
  <table>
    <tr>
      <th>Product</th>
      <td>${productName}</td>
    </tr>
    <tr>
      <th>Variant</th>
      <td>${variantName}</td>
    </tr>
    <tr>
      <th>Current Stock</th>
      <td><strong>${currentStock}</strong></td>
    </tr>
    <tr>
      <th>Threshold</th>
      <td>${threshold}</td>
    </tr>
  </table>
  <div style="text-align: center;">
    <a href="#" class="button">Manage Inventory</a>
  </div>
`);

export const restockRequestTemplate = (productName, requestedQuantity, requestedBy) => baseTemplate(`
  <h2>New Restock Request</h2>
  <p>A restock request has been submitted.</p>
  <table>
    <tr>
      <th>Product</th>
      <td>${productName}</td>
    </tr>
    <tr>
      <th>Quantity Needed</th>
      <td>${requestedQuantity}</td>
    </tr>
    <tr>
      <th>Requested By</th>
      <td>${requestedBy}</td>
    </tr>
  </table>
  <div style="text-align: center;">
    <a href="#" class="button">View Requests</a>
  </div>
`);

export const orderConfirmationTemplate = (order) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td>${item.productName} - ${item.variantName}</td>
      <td>${item.quantity}</td>
      <td>₹${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  return baseTemplate(`
    <h2>Order Confirmed!</h2>
    <p>Hi ${order.customerName},</p>
    <p>Thank you for your order. We're getting it ready!</p>
    <p><strong>Order ID:</strong> ${order.orderId}</p>
    
    <h3>Order Summary</h3>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="text-align: right; font-weight: bold;">Total:</td>
          <td style="font-weight: bold;">₹${order.totalAmount.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
    
    <div style="text-align: center;">
      <a href="#" class="button">View Order</a>
    </div>
  `);
};

export const shipmentTemplate = (order) => {
  const isShiprocket = order.deliveryDetails.mode === 'Shiprocket';
  const trackingLink = isShiprocket
    ? `https://shiprocket.co/tracking/${order.deliveryDetails.awbCode}`
    : order.deliveryDetails.trackingUrl || '#';

  const courierName = isShiprocket ? 'Shiprocket Partner' : order.deliveryDetails.courierName;
  const trackingId = isShiprocket ? order.deliveryDetails.awbCode : order.deliveryDetails.trackingId;

  return baseTemplate(`
    <h2>Your Order has Shipped! 🚚</h2>
    <p>Hi ${order.customer.name},</p>
    <p>Great news! Your order has been dispatched and is on its way to you.</p>
    
    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #4b5563;">Shipment Details</h3>
      <table style="margin: 0;">
        <tr>
          <td style="border: none; padding: 5px 0; color: #6b7280;">Order ID:</td>
          <td style="border: none; padding: 5px 0; font-weight: bold;">${order._id.toString().slice(-8).toUpperCase()}</td>
        </tr>
        <tr>
          <td style="border: none; padding: 5px 0; color: #6b7280;">Courier:</td>
          <td style="border: none; padding: 5px 0; font-weight: bold;">${courierName}</td>
        </tr>
        <tr>
          <td style="border: none; padding: 5px 0; color: #6b7280;">Tracking ID:</td>
          <td style="border: none; padding: 5px 0; font-weight: bold;">${trackingId || 'N/A'}</td>
        </tr>
      </table>
    </div>

    ${trackingId ? `
      <div style="text-align: center;">
        <a href="${trackingLink}" class="button">Track Shipment</a>
      </div>
    ` : ''}

    <p style="font-size: 14px; color: #6b7280;">Note: Tracking information may take up to 24 hours to update.</p>
  `);
};
