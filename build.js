// Build script for Cloudflare Pages
// Generates config files from environment variables

const fs = require('fs');
const path = require('path');

// Firebase config
const firebaseConfig = `// Firebase Configuration (Auto-generated)
const firebaseConfig = {
  apiKey: "${process.env.FIREBASE_API_KEY || ''}",
  authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || ''}",
  projectId: "${process.env.FIREBASE_PROJECT_ID || ''}",
  storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || ''}",
  messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID || ''}",
  appId: "${process.env.FIREBASE_APP_ID || ''}",
  measurementId: "${process.env.FIREBASE_MEASUREMENT_ID || ''}",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// Collection references
const productsRef = db.collection("products");
const ordersRef = db.collection("orders");
const settingsRef = db.collection("settings");

// Helper functions
const FirebaseService = {
  // Products
  async getProducts() {
    const snapshot = await productsRef.orderBy("createdAt", "desc").get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async getProduct(id) {
    const doc = await productsRef.doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async addProduct(product) {
    const docRef = await productsRef.add({
      ...product,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
  },

  async updateProduct(id, product) {
    await productsRef.doc(id).update({
      ...product,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  },

  async deleteProduct(id) {
    await productsRef.doc(id).delete();
  },

  // Orders
  async getOrders(status = null) {
    let query = ordersRef.orderBy("createdAt", "desc");
    if (status) {
      query = query.where("status", "==", status);
    }
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async getOrder(id) {
    const doc = await ordersRef.doc(id).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async createOrder(order) {
    const orderNumber = "ORD-" + Date.now().toString(36).toUpperCase();
    const docRef = await ordersRef.add({
      ...order,
      orderNumber,
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return { id: docRef.id, orderNumber };
  },

  async updateOrderStatus(id, status) {
    await ordersRef.doc(id).update({
      status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  },

  // Image upload
  async uploadImage(file, path) {
    const storageRef = storage.ref();
    const fileRef = storageRef.child(path);
    await fileRef.put(file);
    return await fileRef.getDownloadURL();
  },

  async deleteImage(url) {
    try {
      const storageRef = storage.refFromURL(url);
      await storageRef.delete();
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  },

  // Auth
  async signIn(email, password) {
    return await auth.signInWithEmailAndPassword(email, password);
  },

  async signOut() {
    return await auth.signOut();
  },

  onAuthStateChanged(callback) {
    return auth.onAuthStateChanged(callback);
  },

  getCurrentUser() {
    return auth.currentUser;
  },
};

// Export for use in other files
window.FirebaseService = FirebaseService;
window.db = db;
window.auth = auth;
window.storage = storage;
`;

// EmailJS config
const emailjsConfig = `// EmailJS Configuration (Auto-generated)
const EMAILJS_CONFIG = {
  serviceId: "${process.env.EMAILJS_SERVICE_ID || ''}",
  templateId: "${process.env.EMAILJS_TEMPLATE_ID || ''}",
  adminTemplateId: "${process.env.EMAILJS_ADMIN_TEMPLATE_ID || ''}",
  publicKey: "${process.env.EMAILJS_PUBLIC_KEY || ''}",
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
              \`\${item.name} (x\${item.quantity}) - \${item.price.toLocaleString("sr-RS")} RSD\`
          )
          .join("\\n"),
        order_total: order.total.toLocaleString("sr-RS") + " RSD",
        shipping_address: \`\${order.customer.address}, \${order.customer.city} \${order.customer.zip}\`,
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
              \`\${item.name} (x\${item.quantity}) - \${item.price.toLocaleString("sr-RS")} RSD\`
          )
          .join("\\n"),
        order_total: order.total.toLocaleString("sr-RS") + " RSD",
        shipping_address: \`\${order.customer.address}, \${order.customer.city} \${order.customer.zip}\`,
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
`;

// Write the files
fs.writeFileSync(path.join(__dirname, 'js', 'firebase-config.js'), firebaseConfig);
fs.writeFileSync(path.join(__dirname, 'js', 'emailjs-config.js'), emailjsConfig);

console.log('✅ Config files generated successfully!');
