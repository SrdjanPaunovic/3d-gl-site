// Firebase Configuration Template
// Copy this file to firebase-config.js and fill in your credentials
// DO NOT commit firebase-config.js to git!

const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY",
  authDomain: "FIREBASE_PROJECT_ID.firebaseapp.com",
  projectId: "FIREBASE_PROJECT_ID",
  storageBucket: "FIREBASE_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "FIREBASE_SENDER_ID",
  appId: "FIREBASE_APP_ID",
  measurementId: "FIREBASE_MEASUREMENT_ID",
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
