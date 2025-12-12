// EmailJS Configuration Template
// Copy this file to emailjs-config.js and fill in your credentials
// DO NOT commit emailjs-config.js to git!

const EMAILJS_CONFIG = {
  serviceId: "YOUR_SERVICE_ID",
  templateId: "YOUR_TEMPLATE_ID",
  adminTemplateId: "YOUR_ADMIN_TEMPLATE_ID",
  publicKey: "YOUR_PUBLIC_KEY",
};

// Initialize EmailJS
emailjs.init(EMAILJS_CONFIG.publicKey);

// Email Service
const EmailService = {
  async sendOrderConfirmation(order) {
    try {
      const templateParams = {
        to_email: order.customer.email,
        to_name: order.customer.name,
        order_number: order.orderNumber,
        order_items: order.items
          .map(
            (item) =>
              `${item.name} (x${item.quantity}) - ${item.price.toLocaleString(
                "sr-RS"
              )} RSD`
          )
          .join("\n"),
        order_total: order.total.toLocaleString("sr-RS") + " RSD",
        shipping_address: `${order.customer.address}, ${order.customer.city} ${order.customer.zip}`,
      };

      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        templateParams
      );

      console.log("Order confirmation email sent");
      return true;
    } catch (error) {
      console.error("Failed to send order confirmation:", error);
      return false;
    }
  },

  async sendAdminNotification(order) {
    try {
      const templateParams = {
        order_number: order.orderNumber,
        customer_name: order.customer.name,
        customer_email: order.customer.email,
        customer_phone: order.customer.phone,
        order_items: order.items
          .map(
            (item) =>
              `${item.name} (x${item.quantity}) - ${item.price.toLocaleString(
                "sr-RS"
              )} RSD`
          )
          .join("\n"),
        order_total: order.total.toLocaleString("sr-RS") + " RSD",
        shipping_address: `${order.customer.address}, ${order.customer.city} ${order.customer.zip}`,
        customer_notes: order.customer.notes || "None",
      };

      await emailjs.send(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.adminTemplateId,
        templateParams
      );

      console.log("Admin notification email sent");
      return true;
    } catch (error) {
      console.error("Failed to send admin notification:", error);
      return false;
    }
  },
};

// Export for use in other files
window.EmailService = EmailService;
