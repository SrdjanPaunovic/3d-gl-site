// Admin Panel JavaScript

// DOM Elements - using optional chaining for safety
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
const imagesGallery = document.getElementById('images-gallery');
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
let productImages = []; // Array of { file: File|null, url: string, isMain: boolean, linkedVariants: [{type, value}] }
let currentOrderId = null;

// ============================================
// GLOBAL FUNCTIONS (must be defined early)
// ============================================

// Edit product - defined globally early
window.editProduct = async function(productId) {
  console.log('Editing product:', productId);
  try {
    const product = await FirebaseService.getProduct(productId);
    console.log('Product loaded:', product);
    if (product) {
      openProductModal(product);
    } else {
      console.error('Product not found:', productId);
      alert('Product not found.');
    }
  } catch (error) {
    console.error('Error loading product:', error);
    alert('Failed to load product: ' + error.message);
  }
};

// Delete product - defined globally early
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

// View order - defined globally early  
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
    const order = await FirebaseService.getOrder(orderId);
    if (!order) return;

    await FirebaseService.updateOrderStatus(orderId, 'approved');

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
      // Handle both old format (array of strings) and new format (array of objects)
      let imageUrl = 'https://via.placeholder.com/50x50?text=No+Image';
      if (product.images && product.images.length > 0) {
        const firstImg = product.images[0];
        imageUrl = typeof firstImg === 'string' ? firstImg : firstImg.url;
      } else if (product.image) {
        imageUrl = product.image;
      }
      
      // Build variant info with color swatches
      let variantInfo = '';
      if (product.variants && Object.keys(product.variants).length > 0) {
        const variantParts = [];
        for (const [name, values] of Object.entries(product.variants)) {
          const isColor = name.toLowerCase() === 'color' || name.toLowerCase() === 'boja';
          if (isColor) {
            // Show color swatches
            const swatches = values.map(v => {
              const colorHex = typeof v === 'object' ? v.colorHex : '';
              if (colorHex) {
                return `<span class="variant-color-swatch-mini" style="background-color: ${colorHex};" title="${typeof v === 'object' ? v.value : v}"></span>`;
              }
              return '';
            }).filter(s => s).join('');
            if (swatches) {
              variantParts.push(`<span class="variant-info-colors">${swatches}</span>`);
            } else {
              variantParts.push(`${name}: ${values.length}`);
            }
          } else {
            variantParts.push(`${name}: ${values.length}`);
          }
        }
        variantInfo = variantParts.join(' | ');
      } else {
        variantInfo = 'No variants';
      }
      
      return `
        <tr data-product-id="${product.id}">
          <td><img src="${imageUrl}" alt="${product.name}"></td>
          <td>${product.name}</td>
          <td>${Cart.formatPrice(product.price)}</td>
          <td>${variantInfo}</td>
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
  productImages = [];
  renderImagesGallery();

  if (product) {
    productModalTitle.textContent = 'Edit Product';
    productIdInput.value = product.id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-description').value = product.description || '';

    // Load images with their variant links
    if (product.images && product.images.length > 0) {
      // Check if images is new format (array of objects) or old format (array of strings)
      product.images.forEach((img, index) => {
        if (typeof img === 'string') {
          // Old format - just URL
          productImages.push({
            file: null,
            url: img,
            isMain: index === 0,
            linkedVariants: []
          });
        } else {
          // New format - object with url and linkedVariants
          productImages.push({
            file: null,
            url: img.url,
            isMain: img.isMain || index === 0,
            linkedVariants: img.linkedVariants || []
          });
        }
      });
    } else if (product.image) {
      // Fallback to single image
      productImages.push({
        file: null,
        url: product.image,
        isMain: true,
        linkedVariants: []
      });
    }

    // Load variants first so they're available for linking
    if (product.variants) {
      for (const [name, values] of Object.entries(product.variants)) {
        addVariantType(name, values);
      }
    }

    renderImagesGallery();
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

// Image upload - multiple files
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
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  handleImageFiles(files);
});

productImageInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  handleImageFiles(files);
  productImageInput.value = ''; // Reset to allow re-selecting same files
});

function handleImageFiles(files) {
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (e) => {
      productImages.push({
        file: file,
        url: e.target.result, // Data URL for preview
        isMain: productImages.length === 0, // First image is main by default
        linkedVariants: []
      });
      renderImagesGallery();
    };
    reader.readAsDataURL(file);
  });
}

// Get current variants from the editor
function getCurrentVariants() {
  const variants = {};
  variantsEditor.querySelectorAll('.variant-type').forEach(variantDiv => {
    const variantName = variantDiv.querySelector('.variant-type-name').value.trim();
    if (variantName) {
      const values = [];
      variantDiv.querySelectorAll('.variant-value-tag').forEach(tag => {
        const value = tag.dataset.value || tag.querySelector('.variant-value-name')?.textContent.trim();
        const colorHex = tag.dataset.colorHex || '';
        const priceModifier = parseFloat(tag.dataset.priceModifier) || 0;
        
        if (value) {
          values.push({
            value,
            colorHex,
            priceModifier
          });
        }
      });
      if (values.length > 0) {
        variants[variantName] = values;
      }
    }
  });
  return variants;
}

// Render images gallery
function renderImagesGallery() {
  imagesGallery.innerHTML = '';
  
  productImages.forEach((img, index) => {
    const item = document.createElement('div');
    item.className = `gallery-item ${img.isMain ? 'is-main' : ''}`;
    item.dataset.index = index;

    const variants = getCurrentVariants();
    const variantOptions = [];
    for (const [type, values] of Object.entries(variants)) {
      values.forEach(v => {
        // Handle both old format (string) and new format (object)
        const value = typeof v === 'string' ? v : v.value;
        variantOptions.push({ type, value });
      });
    }

    const linkedVariantsHTML = img.linkedVariants.map((lv, lvIndex) => `
      <span class="gallery-item-variant-tag">
        ${lv.type}: ${lv.value}
        <span class="remove" data-img-index="${index}" data-lv-index="${lvIndex}">&times;</span>
      </span>
    `).join('');

    item.innerHTML = `
      <img src="${img.url}" alt="Product image ${index + 1}">
      <div class="gallery-item-actions">
        ${!img.isMain ? `<button type="button" class="gallery-item-btn set-main" title="Set as main image" data-index="${index}">
          <i class="fas fa-star"></i>
        </button>` : ''}
        <button type="button" class="gallery-item-btn remove" title="Remove image" data-index="${index}">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="gallery-item-info">
        ${img.isMain ? '<div class="gallery-item-main-badge">Main Image</div>' : ''}
        <div class="gallery-item-variants">
          ${linkedVariantsHTML || '<span style="color: var(--muted-color); font-size: 0.65rem;">No variants linked</span>'}
        </div>
        ${variantOptions.length > 0 ? `
          <button type="button" class="link-variant-btn" data-index="${index}">
            <i class="fas fa-link"></i> Link to variant
          </button>
          <div class="variant-link-dropdown" data-index="${index}">
            <h4>Select variant to link:</h4>
            ${variantOptions.map(opt => {
              const isLinked = img.linkedVariants.some(lv => lv.type === opt.type && lv.value === opt.value);
              return `
                <label class="variant-link-option">
                  <input type="checkbox" 
                         data-img-index="${index}" 
                         data-type="${opt.type}" 
                         data-value="${opt.value}"
                         ${isLinked ? 'checked' : ''}>
                  ${opt.type}: ${opt.value}
                </label>
              `;
            }).join('')}
          </div>
        ` : ''}
      </div>
    `;

    imagesGallery.appendChild(item);
  });

  // Add event listeners
  imagesGallery.querySelectorAll('.gallery-item-btn.remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      const wasMain = productImages[index].isMain;
      productImages.splice(index, 1);
      // If removed image was main, set first image as main
      if (wasMain && productImages.length > 0) {
        productImages[0].isMain = true;
      }
      renderImagesGallery();
    });
  });

  imagesGallery.querySelectorAll('.gallery-item-btn.set-main').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(btn.dataset.index);
      productImages.forEach((img, i) => {
        img.isMain = i === index;
      });
      renderImagesGallery();
    });
  });

  // Variant linking
  imagesGallery.querySelectorAll('.link-variant-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = btn.dataset.index;
      const dropdown = imagesGallery.querySelector(`.variant-link-dropdown[data-index="${index}"]`);
      // Close all other dropdowns
      imagesGallery.querySelectorAll('.variant-link-dropdown.active').forEach(d => {
        if (d !== dropdown) d.classList.remove('active');
      });
      dropdown.classList.toggle('active');
    });
  });

  imagesGallery.querySelectorAll('.variant-link-dropdown input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const imgIndex = parseInt(checkbox.dataset.imgIndex);
      const type = checkbox.dataset.type;
      const value = checkbox.dataset.value;
      
      if (checkbox.checked) {
        // Add link
        productImages[imgIndex].linkedVariants.push({ type, value });
      } else {
        // Remove link
        productImages[imgIndex].linkedVariants = productImages[imgIndex].linkedVariants.filter(
          lv => !(lv.type === type && lv.value === value)
        );
      }
      renderImagesGallery();
    });
  });

  // Remove variant link
  imagesGallery.querySelectorAll('.gallery-item-variant-tag .remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const imgIndex = parseInt(btn.dataset.imgIndex);
      const lvIndex = parseInt(btn.dataset.lvIndex);
      productImages[imgIndex].linkedVariants.splice(lvIndex, 1);
      renderImagesGallery();
    });
  });
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.variant-link-dropdown') && !e.target.closest('.link-variant-btn')) {
    document.querySelectorAll('.variant-link-dropdown.active').forEach(d => d.classList.remove('active'));
  }
});

// Helper function to create variant value tag HTML
function createVariantValueTagHTML(variantData, isColorVariant = false) {
  const { value, colorHex, priceModifier } = variantData;
  const colorSwatch = colorHex ? `<span class="variant-color-swatch" style="background-color: ${colorHex};" title="${colorHex}"></span>` : '';
  const priceLabel = priceModifier ? `<span class="variant-price-modifier">${priceModifier > 0 ? '+' : ''}${priceModifier} RSD</span>` : '';
  
  return `
    <span class="variant-value-tag" 
          data-value="${value}" 
          data-color-hex="${colorHex || ''}" 
          data-price-modifier="${priceModifier || 0}">
      ${colorSwatch}
      <span class="variant-value-name">${value}</span>
      ${priceLabel}
      <span class="remove">&times;</span>
    </span>
  `;
}

// Helper to attach remove listener to variant value tags
function attachVariantTagRemoveListener(tag) {
  tag.querySelector('.remove').addEventListener('click', () => {
    tag.remove();
    renderImagesGallery();
  });
}

// Variants
function addVariantType(name = '', values = []) {
  const variantDiv = document.createElement('div');
  variantDiv.className = 'variant-type';
  
  // Check if this is a color variant (for styling purposes)
  const isColorVariant = name.toLowerCase() === 'color' || name.toLowerCase() === 'boja';
  
  // Handle both old format (array of strings) and new format (array of objects)
  const normalizedValues = values.map(v => {
    if (typeof v === 'string') {
      return { value: v, colorHex: '', priceModifier: 0 };
    }
    return { value: v.value || v, colorHex: v.colorHex || '', priceModifier: v.priceModifier || 0 };
  });
  
  variantDiv.innerHTML = `
    <div class="variant-type-header">
      <input type="text" class="form-control variant-type-name" placeholder="Variant name (e.g., Size, Color)" value="${name}" style="flex: 1;">
      <button type="button" class="btn btn-danger btn-sm remove-variant-type" style="margin-left: 0.5rem;">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="variant-values">
      ${normalizedValues.map(v => createVariantValueTagHTML(v, isColorVariant)).join('')}
    </div>
    <div class="add-variant-value">
      <div class="add-variant-value-row">
        <input type="text" placeholder="Value name (e.g., Small, Red)" class="variant-value-input">
        <input type="color" class="variant-color-input" title="Pick color (for color variants)" value="#4e8df5">
        <input type="number" placeholder="Price +/-" class="variant-price-input" title="Price modifier (e.g., 100 or -50)">
        <button type="button" class="btn btn-secondary btn-sm add-value-btn">Add</button>
      </div>
    </div>
  `;
  
  // Update variant type class when name changes (for color vs non-color styling)
  const nameInput = variantDiv.querySelector('.variant-type-name');
  nameInput.addEventListener('input', () => {
    const isColor = nameInput.value.toLowerCase() === 'color' || nameInput.value.toLowerCase() === 'boja';
    variantDiv.classList.toggle('is-color-variant', isColor);
    renderImagesGallery();
  });
  if (isColorVariant) {
    variantDiv.classList.add('is-color-variant');
  }

  // Remove variant type - also refresh gallery to update linking options
  variantDiv.querySelector('.remove-variant-type').addEventListener('click', () => {
    variantDiv.remove();
    renderImagesGallery();
  });

  // Attach remove listeners to existing value tags
  variantDiv.querySelectorAll('.variant-value-tag').forEach(tag => {
    attachVariantTagRemoveListener(tag);
  });

  // Add value
  const valueInput = variantDiv.querySelector('.variant-value-input');
  const colorInput = variantDiv.querySelector('.variant-color-input');
  const priceInput = variantDiv.querySelector('.variant-price-input');
  const addValueBtn = variantDiv.querySelector('.add-value-btn');

  function addValue() {
    const value = valueInput.value.trim();
    if (value) {
      const isColor = variantDiv.classList.contains('is-color-variant');
      const colorHex = colorInput.value || '';
      const priceModifier = parseFloat(priceInput.value) || 0;
      
      const variantData = { value, colorHex: isColor ? colorHex : '', priceModifier };
      const tagHTML = createVariantValueTagHTML(variantData, isColor);
      
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = tagHTML;
      const tag = tempDiv.firstElementChild;
      
      attachVariantTagRemoveListener(tag);
      variantDiv.querySelector('.variant-values').appendChild(tag);
      
      // Reset inputs
      valueInput.value = '';
      priceInput.value = '';
      colorInput.value = '#4e8df5';
      
      // Refresh gallery to show new variant in linking options
      renderImagesGallery();
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
    const variants = getCurrentVariants();

    // Upload new images and prepare images array
    const uploadedImages = [];
    
    for (const img of productImages) {
      let imageUrl = img.url;
      
      // If it's a new file (has file property and url is data URL), upload it
      if (img.file && img.url.startsWith('data:')) {
        const path = `products/${Date.now()}_${img.file.name}`;
        imageUrl = await FirebaseService.uploadImage(img.file, path);
      }
      
      uploadedImages.push({
        url: imageUrl,
        isMain: img.isMain,
        linkedVariants: img.linkedVariants
      });
    }

    // Sort so main image is first
    uploadedImages.sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0));

    const productData = {
      name,
      price,
      description,
      variants,
      images: uploadedImages,
      // Keep legacy 'image' field for backwards compatibility
      image: uploadedImages.length > 0 ? uploadedImages[0].url : ''
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

closeOrderModal.addEventListener('click', closeOrderModalFn);
orderModal.addEventListener('click', (e) => {
  if (e.target === orderModal) closeOrderModalFn();
});

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
