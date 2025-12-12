# 3D Gadgets Lab - Setup Guide

This guide will help you set up Firebase and EmailJS for your webshop.

## 1. Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** (or "Add project")
3. Enter project name: `3d-gadgets-lab` (or your preference)
4. Enable/disable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Click **"Email/Password"** and enable it
5. Click **"Save"**

### Step 3: Create Admin User

1. Go to **Authentication > Users** tab
2. Click **"Add user"**
3. Enter your admin email and password
4. Click **"Add user"**

### Step 4: Set Up Firestore Database

1. Go to **Build > Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select a location closest to you (e.g., `europe-west1`)
5. Click **"Enable"**

### Step 5: Configure Firestore Security Rules

1. In Firestore, go to **"Rules"** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products - anyone can read, only authenticated users can write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Orders - anyone can create, only authenticated users can read/update
    match /orders/{orderId} {
      allow create: if true;
      allow read, update: if request.auth != null;
      allow delete: if request.auth != null;
    }
    
    // Settings - only authenticated users
    match /settings/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

### Step 6: Set Up Firebase Storage

1. Go to **Build > Storage**
2. Click **"Get started"**
3. Choose **"Start in production mode"**
4. Click **"Next"** and then **"Done"**

### Step 7: Configure Storage Security Rules

1. In Storage, go to **"Rules"** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

### Step 8: Get Firebase Config

1. Go to **Project Settings** (gear icon next to "Project Overview")
2. Scroll down to **"Your apps"**
3. Click the **Web icon** (`</>`) to add a web app
4. Enter app nickname: `3D Gadgets Lab Web`
5. Click **"Register app"**
6. Copy the `firebaseConfig` object

### Step 9: Update Your Config

Open `js/firebase-config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",           // Your API key
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## 2. EmailJS Setup

### Step 1: Create EmailJS Account

1. Go to [EmailJS](https://www.emailjs.com/)
2. Click **"Sign Up Free"**
3. Create an account

### Step 2: Add Email Service

1. Go to **Email Services**
2. Click **"Add New Service"**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the connection steps
5. Note down your **Service ID** (e.g., `service_abc123`)

### Step 3: Create Email Templates

#### Template 1: Order Notification (for you)

1. Go to **Email Templates**
2. Click **"Create New Template"**
3. Configure:
   - **Template Name**: `Order Notification`
   - **To Email**: Your email address
   - **Subject**: `New Order: {{order_number}}`
   - **Content**:

```
New order received!

Order Number: {{order_number}}
Date: {{order_date}}

Customer Information:
- Name: {{customer_name}}
- Email: {{customer_email}}
- Phone: {{customer_phone}}
- Address: {{customer_address}}
- Notes: {{customer_notes}}

Order Items:
{{order_items}}

Total: {{order_total}}
```

4. Click **"Save"**
5. Note down the **Template ID** (e.g., `template_abc123`)

#### Template 2: Order Confirmation (for customer)

1. Create another template
2. Configure:
   - **Template Name**: `Order Confirmation`
   - **To Email**: `{{to_email}}`
   - **Subject**: `Order Confirmed - {{order_number}}`
   - **Content**:

```
Hi {{to_name}},

Great news! Your order has been confirmed.

Order Number: {{order_number}}

Your Items:
{{order_items}}

Total: {{order_total}}

Shipping Address:
{{shipping_address}}

We'll ship your order soon and notify you when it's on the way.

Thank you for shopping with 3D Gadgets Lab!
```

3. Click **"Save"**
4. Note down the **Template ID**

### Step 4: Get Public Key

1. Go to **Account**
2. Find your **Public Key** (starts with something like `user_...` or just a string)

### Step 5: Update Your Config

Open `js/emailjs-config.js` and update:

```javascript
const EMAILJS_CONFIG = {
  publicKey: 'YOUR_PUBLIC_KEY',
  serviceId: 'YOUR_SERVICE_ID',
  orderNotificationTemplateId: 'YOUR_ORDER_NOTIFICATION_TEMPLATE_ID',
  orderConfirmationTemplateId: 'YOUR_ORDER_CONFIRMATION_TEMPLATE_ID'
};
```

---

## 3. Hosting Options

### Option A: Firebase Hosting (Recommended)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize in your project folder:
   ```bash
   firebase init hosting
   ```

4. Select your project
5. Set public directory to `.` (current directory)
6. Configure as single-page app: **No**
7. Deploy:
   ```bash
   firebase deploy --only hosting
   ```

Your site will be available at `https://your-project.web.app`

### Option B: Netlify

1. Go to [Netlify](https://netlify.com)
2. Drag and drop your project folder
3. Your site is live!

### Option C: Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project folder
3. Follow the prompts

---

## 4. Testing Checklist

- [ ] Admin login works at `/admin/`
- [ ] Can add products with images and variants
- [ ] Products display on shop page
- [ ] Can add items to cart
- [ ] Checkout form submits successfully
- [ ] You receive email notification for new orders
- [ ] Customer receives confirmation when you approve order

---

## 5. Troubleshooting

### "Permission denied" errors
- Check Firestore and Storage security rules
- Make sure you're logged in as admin in the admin panel

### Images not uploading
- Check Storage rules
- Verify file size is under 5MB

### Emails not sending
- Verify EmailJS credentials
- Check browser console for errors
- EmailJS free tier: 200 emails/month

### Products not loading
- Check browser console for Firebase errors
- Verify Firebase config values are correct

---

## Cloudflare Pages Deployment

### Step 1: Connect Repository

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages**
3. Click **"Create application"** → **"Pages"** → **"Connect to Git"**
4. Authorize and select your GitHub repository
5. Click **"Begin setup"**

### Step 2: Configure Build Settings

| Setting | Value |
|---------|-------|
| **Project name** | `3d-gadgets-lab` (or your preference) |
| **Production branch** | `main` |
| **Build command** | `npm run build` |
| **Build output directory** | `/` (root) |

### Step 3: Add Environment Variables

Click **"Add variable"** for each of these:

**Firebase Variables:**
| Variable Name | Value |
|--------------|-------|
| `FIREBASE_API_KEY` | `AIzaSyBte_rsRxmsl-dCcV4ERa2vcjt0yL1dIxM` |
| `FIREBASE_AUTH_DOMAIN` | `dgadgetlab-shop.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `dgadgetlab-shop` |
| `FIREBASE_STORAGE_BUCKET` | `dgadgetlab-shop.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | `307656144120` |
| `FIREBASE_APP_ID` | `1:307656144120:web:8e1ea7c4d2a73c2baab70d` |
| `FIREBASE_MEASUREMENT_ID` | `G-N9SXRCGPJ9` |

**EmailJS Variables:**
| Variable Name | Value |
|--------------|-------|
| `EMAILJS_SERVICE_ID` | Your EmailJS service ID |
| `EMAILJS_TEMPLATE_ID` | Your customer template ID |
| `EMAILJS_ADMIN_TEMPLATE_ID` | Your admin template ID |
| `EMAILJS_PUBLIC_KEY` | Your EmailJS public key |

### Step 4: Deploy

1. Click **"Save and Deploy"**
2. Wait for the build to complete
3. Your site will be available at `https://your-project.pages.dev`

### Step 5: Add Custom Domain (Optional)

1. In your Pages project, go to **"Custom domains"**
2. Click **"Set up a custom domain"**
3. Enter your domain (e.g., `shop.3dgadgetslab.com`)
4. Follow DNS configuration instructions

### Updating Environment Variables

To update variables after initial setup:
1. Go to your Pages project → **Settings** → **Environment variables**
2. Edit the variables as needed
3. Trigger a new deployment for changes to take effect

---

## Need Help?

1. Check browser developer console (F12) for errors
2. Verify all configuration values are correct
3. Make sure Firebase project has billing enabled for production use (free tier is generous)

