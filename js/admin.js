// Admin Panel JavaScript

// DOM Elements
const loginPage = document.getElementById('login-page');
const adminDashboard = document.getElementById('admin-dashboard');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const pageTitle = document.getElementById('page-title');
const userEmail = document.getElementById('user-email');

// Navigation
const navLinks = document.querySelectorAll('.admin-nav a[data-page]');
const pages = document.querySelectorAll('.page-content');

// Product Modal Elements
const productModal = document.getElementById('product-modal');
const productForm = document.getElementById('product-form');
const productModalTitle = document.getElementById('product-modal-title');
const addProductBtn = document.getElementById('add-product-btn');
const closeProductModal = document.getElementById('close-product-modal');
const cancelProduct = document.getElementById('cancel-product');
const saveProductBtn = document.getElementById('save-product-btn');
const productIdInput = document.getElementById('product-id');
const imageUploadArea = document.getElementById('image-upload-area');
const productImageInput = document.getElementById('product-image-input');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const removeImageBtn = document.getElementById('remove-image');
const variantsEditor = document.getElementById('variants-editor');
const addVariantTypeBtn = document.getElementById('add-variant-type');

// Order Modal Elements
const orderModal = document.getElementById('order-modal');
const orderModalTitle = document.getElementById('order-modal-title');
const closeOrderModal = document.getElementById('close-order-modal');
const orderDetails = document.getElementById('order-details');
const orderModalFooter = document.getElementById('order-modal-footer');
const orderFilter = document.getElementById('order-filter');

// State
let currentImageFile = null;
let currentImageUrl = null;
let currentOrderId = null;

// ============================================
// AUTHENTICATION
// ============================================

function showLoginError(message) {
  loginError.textContent = message;
  loginError.style.display = 'block';
}

function hideLoginError() {
  loginError.style.display = 'none';
}

function setLoginLoading(loading) {
  loginBtn.disabled = loading;
  loginBtn.innerHTML = loading 
    ? '<div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>' 
    : '<i class="fas fa-sign-in-alt"></i> Sign In';
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideLoginError();
  setLoginLoading(true);

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await FirebaseService.signIn(email, password);
  } catch (error) {
    console.error('Login error:', error);
    let message = 'Login failed. Please try again.';
    if (error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      message = 'Invalid email or password.';
    }
    showLoginError(message);
    setLoginLoading(false);
  }
});

logoutBtn.addEventListener('click', async (e) => {
  e.preventDefault();
  await FirebaseService.signOut();
});

// Auth state listener
FirebaseService.onAuthStateChanged((user) => {
  if (user) {
    loginPage.style.display = 'none';
    adminDashboard.style.display = 'flex';
    userEmail.textContent = user.email;
    document.querySelector('.admin-user-avatar').textContent = user.email[0].toUpperCase();
    loadDashboardData();
  } else {
    loginPage.style.display = 'flex';
    adminDashboard.style.display = 'none';
  }
});

// ============================================
// NAVIGATION
// ============================================

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.dataset.page;
    
    // Update active nav
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    // Show page
    pages.forEach(p => p.style.display = 'none');
    document.getElementById(`page-${page}`).style.display = 'block';
    
    // Update title
    pageTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);
    
    // Load data
    if (page === 'dashboard') loadDashboardData();
    if (page === 'products') loadProducts();
    if (page === 'orders') loadOrders();
  });
});

// ============================================
// DASHBOARD
// ============================================

async function loadDashboardData() {
  try {
    const [products, orders] = await Promise.all([
      FirebaseService.getProducts(),
      FirebaseService.getOrders()
    ]);

    document.getElementById('stat-products').textContent = products.length;
    document.getElementById('stat-pending').textContent = orders.filter(o => o.status === 'pending').length;
    document.getElementById('stat-completed').textContent = orders.filter(o => o.status === 'completed').length;
    
    const revenue = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + (o.total || 0), 0);
    document.getElementById('stat-revenue').textContent = Cart.formatPrice(revenue);

    // Recent orders
    const recentOrders = orders.slice(0, 5);
    const tbody = document.getElementById('recent-orders-table');
    
    if (recentOrders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--muted-color);">No orders yet</td></tr>';
    } else {
      tbody.innerHTML = recentOrders.map(order => `
        <tr>
          <td>${order.orderNumber || 'N/A'}</td>
          <td>${order.customer?.name || 'Unknown'}</td>
          <td>${Cart.formatPrice(order.total || 0)}</td>
          <td><span class="status-badge status-${order.status}">${order.status}</span></td>
          <td>${formatDate(order.createdAt)}</td>
        </tr>
      `).join('');
    }
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

// ============================================
// PRODUCTS
// ============================================

async function loadProducts() {
  const tbody = document.getElementById('products-table');
  tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;"><div class="spinner"></div></td></tr>';

  try {
    const products = await FirebaseService.getProducts();
    
    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--muted-color);">No products yet. Click "Add Product" to create one.</td></tr>';
      return;
    }

    tbody.innerHTML = products.map(product => {
      const imageUrl = product.images?.[0] || product.image || 'https://via.placeholder.com/50x50?text=No+Image';
      const variantCount = product.variants ? Object.keys(product.variants).length : 0;
      
      return `
        <tr data-product-id="${product.id}">
          <td><img src="${imageUrl}" alt="${product.name}"></td>
          <td>${product.name}</td>
          <td>${Cart.formatPrice(product.price)}</td>
          <td>${variantCount} variant type(s)</td>
          <td>
            <div class="action-btns">
              <button class="action-btn edit" onclick="editProduct('${product.id}')" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn delete" onclick="deleteProduct('${product.id}')" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading products:', error);
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--error-color);">Failed to load products</td></tr>';
  }
}

// Open product modal
function openProductModal(product = null) {
  productForm.reset();
  variantsEditor.innerHTML = '';
  currentImageFile = null;
  currentImageUrl = null;
  imagePreview.style.display = 'none';
  imageUploadArea.style.display = 'block';

  if (product) {
    productModalTitle.textContent = 'Edit Product';
    productIdInput.value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-description').value = product.description || '';

    // Load image
    if (product.images?.[0] || product.image) {
      currentImageUrl = product.images?.[0] || product.image;
      previewImg.src = currentImageUrl;
      imagePreview.style.display = 'inline-block';
      imageUploadArea.style.display = 'none';
    }

    // Load variants
    if (product.variants) {
      for (const [name, values] of Object.entries(product.variants)) {
        addVariantType(name, values);
      }
    }
  } else {
    productModalTitle.textContent = 'Add Product';
    productIdInput.value = '';
  }

  productModal.classList.add('active');
}

function closeProductModalFn() {
  productModal.classList.remove('active');
}

addProductBtn.addEventListener('click', () => openProductModal());
closeProductModal.addEventListener('click', closeProductModalFn);
cancelProduct.addEventListener('click', closeProductModalFn);

// Click outside modal to close
productModal.addEventListener('click', (e) => {
  if (e.target === productModal) closeProductModalFn();
});

// Image upload
imageUploadArea.addEventListener('click', () => productImageInput.click());

imageUploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  imageUploadArea.style.borderColor = 'var(--primary-color)';
});

imageUploadArea.addEventListener('dragleave', () => {
  imageUploadArea.style.borderColor = 'var(--border-color)';
});

imageUploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  imageUploadArea.style.borderColor = 'var(--border-color)';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    handleImageFile(file);
  }
});

productImageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleImageFile(file);
});

function handleImageFile(file) {
  currentImageFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    imagePreview.style.display = 'inline-block';
    imageUploadArea.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

removeImageBtn.addEventListener('click', () => {
  currentImageFile = null;
  currentImageUrl = null;
  previewImg.src = '';
  imagePreview.style.display = 'none';
  imageUploadArea.style.display = 'block';
  productImageInput.value = '';
});

// Variants
function addVariantType(name = '', values = []) {
  const variantDiv = document.createElement('div');
  variantDiv.className = 'variant-type';
  variantDiv.innerHTML = `
    <div class="variant-type-header">
      <input type="text" class="form-control variant-type-name" placeholder="Variant name (e.g., Size, Color)" value="${name}" style="flex: 1;">
      <button type="button" class="btn btn-danger btn-sm remove-variant-type" style="margin-left: 0.5rem;">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="variant-values">
      ${values.map(v => `
        <span class="variant-value-tag">
          ${v}
          <span class="remove" onclick="this.parentElement.remove()">&times;</span>
        </span>
      `).join('')}
    </div>
    <div class="add-variant-value">
      <input type="text" placeholder="Add value (e.g., Small, Red)" class="variant-value-input">
      <button type="button" class="btn btn-secondary btn-sm add-value-btn">Add</button>
    </div>
  `;

  // Remove variant type
  variantDiv.querySelector('.remove-variant-type').addEventListener('click', () => {
    variantDiv.remove();
  });

  // Add value
  const valueInput = variantDiv.querySelector('.variant-value-input');
  const addValueBtn = variantDiv.querySelector('.add-value-btn');

  function addValue() {
    const value = valueInput.value.trim();
    if (value) {
      const tag = document.createElement('span');
      tag.className = 'variant-value-tag';
      tag.innerHTML = `${value}<span class="remove" onclick="this.parentElement.remove()">&times;</span>`;
      variantDiv.querySelector('.variant-values').appendChild(tag);
      valueInput.value = '';
    }
  }

  addValueBtn.addEventListener('click', addValue);
  valueInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addValue();
    }
  });

  variantsEditor.appendChild(variantDiv);
}

addVariantTypeBtn.addEventListener('click', () => addVariantType());

// Save product
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  saveProductBtn.disabled = true;
  saveProductBtn.innerHTML = '<div class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></div>';

  try {
    const productId = productIdInput.value;
    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const description = document.getElementById('product-description').value.trim();

    // Collect variants
    const variants = {};
    variantsEditor.querySelectorAll('.variant-type').forEach(variantDiv => {
      const variantName = variantDiv.querySelector('.variant-type-name').value.trim();
      if (variantName) {
        const values = [];
        variantDiv.querySelectorAll('.variant-value-tag').forEach(tag => {
          const value = tag.textContent.replace('×', '').trim();
          if (value) values.push(value);
        });
        if (values.length > 0) {
          variants[variantName] = values;
        }
      }
    });

    // Upload image if new file selected
    let imageUrl = currentImageUrl;
    if (currentImageFile) {
      const path = `products/${Date.now()}_${currentImageFile.name}`;
      imageUrl = await FirebaseService.uploadImage(currentImageFile, path);
    }

    const productData = {
      name,
      price,
      description,
      variants,
      images: imageUrl ? [imageUrl] : [],
      image: imageUrl || ''
    };

    if (productId) {
      await FirebaseService.updateProduct(productId, productData);
    } else {
      await FirebaseService.addProduct(productData);
    }

    closeProductModalFn();
    loadProducts();
    loadDashboardData();
  } catch (error) {
    console.error('Error saving product:', error);
    alert('Failed to save product. Please try again.');
  } finally {
    saveProductBtn.disabled = false;
    saveProductBtn.innerHTML = '<i class="fas fa-save"></i> Save Product';
  }
});

// Edit product
window.editProduct = async function(productId) {
  try {
    const product = await FirebaseService.getProduct(productId);
    if (product) {
      openProductModal(product);
    }
  } catch (error) {
    console.error('Error loading product:', error);
    alert('Failed to load product.');
  }
};

// Delete product
window.deleteProduct = async function(productId) {
  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    await FirebaseService.deleteProduct(productId);
    loadProducts();
    loadDashboardData();
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Failed to delete product.');
  }
};

// ============================================
// ORDERS
// ============================================

async function loadOrders(status = null) {
  const tbody = document.getElementById('orders-table');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;"><div class="spinner"></div></td></tr>';

  try {
    const orders = await FirebaseService.getOrders(status);
    
    if (orders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--muted-color);">No orders found</td></tr>';
      return;
    }

    tbody.innerHTML = orders.map(order => `
      <tr data-order-id="${order.id}">
        <td>${order.orderNumber || 'N/A'}</td>
        <td>
          <div>${order.customer?.name || 'Unknown'}</div>
          <small style="color: var(--muted-color);">${order.customer?.phone || ''}</small>
        </td>
        <td>${order.items?.length || 0} item(s)</td>
        <td>${Cart.formatPrice(order.total || 0)}</td>
        <td><span class="status-badge status-${order.status}">${order.status}</span></td>
        <td>${formatDate(order.createdAt)}</td>
        <td>
          <div class="action-btns">
            <button class="action-btn view" onclick="viewOrder('${order.id}')" title="View">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error loading orders:', error);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--error-color);">Failed to load orders</td></tr>';
  }
}

orderFilter.addEventListener('change', () => {
  const status = orderFilter.value || null;
  loadOrders(status);
});

// View order
window.viewOrder = async function(orderId) {
  try {
    const order = await FirebaseService.getOrder(orderId);
    if (!order) return;

    currentOrderId = orderId;
    orderModalTitle.textContent = `Order ${order.orderNumber}`;

    orderDetails.innerHTML = `
      <div class="order-section">
        <h3><i class="fas fa-user"></i> Customer Information</h3>
        <div class="order-info-row">
          <span class="order-info-label">Name:</span>
          <span>${order.customer?.name || 'N/A'}</span>
        </div>
        <div class="order-info-row">
          <span class="order-info-label">Email:</span>
          <span>${order.customer?.email || 'N/A'}</span>
        </div>
        <div class="order-info-row">
          <span class="order-info-label">Phone:</span>
          <span>${order.customer?.phone || 'N/A'}</span>
        </div>
        <div class="order-info-row">
          <span class="order-info-label">Address:</span>
          <span>${order.customer?.address || 'N/A'}, ${order.customer?.city || ''} ${order.customer?.zip || ''}</span>
        </div>
        ${order.customer?.notes ? `
          <div class="order-info-row">
            <span class="order-info-label">Notes:</span>
            <span>${order.customer.notes}</span>
          </div>
        ` : ''}
      </div>

      <div class="order-section">
        <h3><i class="fas fa-box"></i> Order Items</h3>
        ${(order.items || []).map(item => `
          <div class="order-product-item">
            <img src="${item.image || 'https://via.placeholder.com/60x60?text=No+Image'}" alt="${item.name}">
            <div class="order-product-info">
              <div class="order-product-name">${item.name}</div>
              <div class="order-product-variant">${Cart.formatVariants(item.variants || {})}</div>
              <div>Quantity: ${item.quantity}</div>
            </div>
            <div class="order-product-price">${Cart.formatPrice(item.price * item.quantity)}</div>
          </div>
        `).join('')}
        <div class="order-info-row" style="margin-top: 1rem; font-weight: 600; font-size: 1.1rem;">
          <span>Total:</span>
          <span style="color: var(--primary-color);">${Cart.formatPrice(order.total || 0)}</span>
        </div>
      </div>

      <div class="order-section">
        <h3><i class="fas fa-info-circle"></i> Order Status</h3>
        <div class="order-info-row">
          <span class="order-info-label">Status:</span>
          <span class="status-badge status-${order.status}">${order.status}</span>
        </div>
        <div class="order-info-row">
          <span class="order-info-label">Order Date:</span>
          <span>${formatDate(order.createdAt)}</span>
        </div>
      </div>
    `;

    // Footer buttons based on status
    let footerHTML = '<button class="btn btn-secondary" onclick="closeOrderModalFn()">Close</button>';
    
    if (order.status === 'pending') {
      footerHTML = `
        <button class="btn btn-danger" onclick="updateOrderStatus('${orderId}', 'cancelled')">
          <i class="fas fa-times"></i> Cancel
        </button>
        <button class="btn btn-primary" onclick="approveOrder('${orderId}')">
          <i class="fas fa-check"></i> Approve & Notify Customer
        </button>
      `;
    } else if (order.status === 'approved') {
      footerHTML = `
        <button class="btn btn-secondary" onclick="closeOrderModalFn()">Close</button>
        <button class="btn btn-success" onclick="updateOrderStatus('${orderId}', 'completed')">
          <i class="fas fa-check-double"></i> Mark Completed
        </button>
      `;
    }
    
    orderModalFooter.innerHTML = footerHTML;
    orderModal.classList.add('active');
  } catch (error) {
    console.error('Error loading order:', error);
    alert('Failed to load order details.');
  }
};

window.closeOrderModalFn = function() {
  orderModal.classList.remove('active');
  currentOrderId = null;
};

closeOrderModal.addEventListener('click', closeOrderModalFn);
orderModal.addEventListener('click', (e) => {
  if (e.target === orderModal) closeOrderModalFn();
});

window.updateOrderStatus = async function(orderId, status) {
  try {
    await FirebaseService.updateOrderStatus(orderId, status);
    closeOrderModalFn();
    loadOrders(orderFilter.value || null);
    loadDashboardData();
  } catch (error) {
    console.error('Error updating order status:', error);
    alert('Failed to update order status.');
  }
};

window.approveOrder = async function(orderId) {
  try {
    // Get order details
    const order = await FirebaseService.getOrder(orderId);
    if (!order) return;

    // Update status
    await FirebaseService.updateOrderStatus(orderId, 'approved');

    // Send confirmation email to customer
    order.orderNumber = order.orderNumber || orderId;
    await EmailService.sendOrderConfirmation(order);

    alert('Order approved and confirmation email sent to customer!');
    closeOrderModalFn();
    loadOrders(orderFilter.value || null);
    loadDashboardData();
  } catch (error) {
    console.error('Error approving order:', error);
    alert('Failed to approve order. Please try again.');
  }
};

// ============================================
// UTILITIES
// ============================================

function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  
  let date;
  if (timestamp.toDate) {
    date = timestamp.toDate();
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
