// Firebase Production Configuration
// This file should be used for production deployment

const firebaseConfig = {
  apiKey: "YOUR_PROD_API_KEY",
  authDomain: "your-prod-project.firebaseapp.com",
  projectId: "your-prod-project-id",
  storageBucket: "your-prod-project.firebasestorage.app",
  messagingSenderId: "YOUR_PROD_SENDER_ID",
  appId: "YOUR_PROD_APP_ID"
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

  async addProduct(data) {
    const docRef = await productsRef.add({
      ...data,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
  },

  async updateProduct(id, data) {
    await productsRef.doc(id).update({
      ...data,
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

  async createOrder(data) {
    const orderNumber = `ORD-${Date.now()}`;
    const docRef = await ordersRef.add({
      ...data,
      orderNumber,
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    return { id: docRef.id, orderNumber };
  },

  async updateOrderStatus(id, status) {
    await ordersRef.doc(id).update({
      status,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  },

  // Storage
  async uploadImage(file, path) {
    const ref = storage.ref(path);
    await ref.put(file);
    return await ref.getDownloadURL();
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
};

// Export for use in other files
window.FirebaseService = FirebaseService;

console.log("🚀 PRODUCTION MODE");
