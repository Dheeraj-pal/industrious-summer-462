const API_BASE_URL = 'http://localhost:3030';

// DOM elements
let mainContainer;
let cartContent;
let cartTotals;
let couponSection;
let couponMessage;
let checkoutBtn;
let loadingOverlay;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  mainContainer = document.getElementById('container');
  cartContent = document.getElementById('cart-content');
  cartTotals = document.getElementById('cart-totals');
  couponSection = document.getElementById('coupon-section');
  couponMessage = document.getElementById('coupon-message');
  checkoutBtn = document.getElementById('checkout-btn');
  
  // Create loading overlay if it doesn't exist
  if (!document.getElementById('loading-overlay')) {
    loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    loadingOverlay.innerHTML = `
      <div class="spinner-container">
        <div class="spinner-border text-warning" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
    document.body.appendChild(loadingOverlay);
  } else {
    loadingOverlay = document.getElementById('loading-overlay');
  }
  
  // Add event listeners
  document.getElementById('apply-coupon-btn').addEventListener('click', applyCoupon);
  checkoutBtn.addEventListener('click', proceedToCheckout);
  
  // Load cart data
  loadCart();
});

/**
 * Load cart data from the API
 */
async function loadCart() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  
  try {
    showLoading();
    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.items || !data.items.length) {
      renderEmptyCart();
      return;
    }
    
    renderCart(data.items[0]);
  } catch (err) {
    console.error('Error loading cart:', err);
    renderError(err.message);
  } finally {
    hideLoading();
  }
}

/**
 * Render empty cart message
 */
function renderEmptyCart() {
  mainContainer.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="empty-cart-container">
        <i class="fa fa-shopping-cart fa-4x text-muted mb-3"></i>
        <h3>Your cart is empty</h3>
        <p class="text-muted">Looks like you haven't added any items to your cart yet.</p>
        <a href="index.html" style="background-color: #feef02;" class="btn mt-3">Continue Shopping</a>
      </div>
    </div>
  `;
  
  cartTotals.innerHTML = '';
  couponSection.style.display = 'none';
}

/**
 * Render error message
 */
function renderError(message) {
  cartContent.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="error-container">
        <i class="fa fa-exclamation-triangle fa-4x text-danger mb-3"></i>
        <h3>Oops! Something went wrong</h3>
        <p class="text-muted">${message || 'An error occurred while loading your cart.'}</p>
        <button class="btn btn-warning mt-3" onclick="loadCart()">Try Again</button>
      </div>
    </div>
  `;
  
  cartTotals.innerHTML = '';
  couponSection.style.display = 'none';
}

/**
 * Show loading overlay
 */
function showLoading() {
  loadingOverlay.style.display = 'flex';
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  loadingOverlay.style.display = 'none';
}

/**
 * Show toast notification
 */
function showToast(type, message) {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast element
  const toastId = 'toast-' + Date.now();
  const toast = document.createElement('div');
  toast.className = `toast align-items-center ${type === 'error' ? 'bg-danger' : 'bg-success'} text-white border-0`;
  toast.id = toastId;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  // Initialize and show the toast
  const bsToast = new bootstrap.Toast(toast, { autohide: true, delay: 3000 });
  bsToast.show();
  
  // Remove toast after it's hidden
  toast.addEventListener('hidden.bs.toast', () => {
    toast.remove();
  });
}

/**
 * Render the cart with items and totals
 */
function renderCart(cart) {
  if (!cart.items || !cart.items.length) {
    renderEmptyCart();
    return;
  }
  
  // Render cart items
  cartContent.innerHTML = '';
  cart.items.forEach(item => {
    const product = item.product;
    const img = product.images && product.images.length ? product.images[0].secure_url.trim() : 'images/no-product-found.png';
    const subtotal = (parseFloat(item.price) * item.quantity).toFixed(2);
    const savings = item.savings > 0 ? `<div class="text-success small">You save: ₹${item.savings.toFixed(2)}</div>` : '';
    
    const itemElement = document.createElement('div');
    itemElement.className = 'col-12 mb-3 p-3 border rounded bg-white cart-item';
    itemElement.innerHTML = `
      <div class="row">
        <div class="col-md-3 col-4 mb-3">
          <img src="${img}" alt="${product.name}" class="img-fluid" style="max-height:100%;object-fit:contain;">
        </div>
        <div class="col-md-9 col-8 mb-3">
          <div class="d-flex justify-content-between align-items-start">
            <h5 class="product-name">${product.name}</h5>
            <button class="btn btn-sm btn-outline-danger remove-item" data-item-id="${item.id}">
              <i class="fa fa-trash-o" aria-hidden="true"></i>
            </button>
          </div>
          <div class="text-muted small mb-2">${product.brand || ''}</div>
          
          <div class="d-flex flex-wrap align-items-center mb-2">
            <div class="price-display me-3">
              <span class="current-price fw-bold">₹${parseFloat(item.price).toFixed(2)}</span>
              ${+item.mrp > +item.price ? `<span class="original-price text-muted text-decoration-line-through small ms-2">₹${parseFloat(item.mrp).toFixed(2)}</span>` : ''}
            </div>
            ${savings}
          </div>
          
          <div class="d-flex justify-content-between align-items-center mt-3">
            <div id="counter" class="quantity-controls d-flex align-items-center">
              <button id="dec" class="btn btn-sm btn-outline-secondary decrease-qty" data-item-id="${item.id}">-</button>
              <span id="count-num" class="mx-2 quantity-display">${item.quantity}</span>
              <button id="inc" class="btn btn-sm btn-outline-secondary increase-qty" data-item-id="${item.id}">+</button>
            </div>
            <div class="subtotal fw-bold">Subtotal: ₹${subtotal}</div>
          </div>
          
          <div class="gst-details small text-muted mt-2">
            <span>GST Rate: ${item.gstRate || 0}%</span>
            <span class="ms-3">GST Amount: ₹${item.taxAmount ? parseFloat(item.taxAmount).toFixed(2) : '0.00'}</span>
          </div>
        </div>
      </div>
    `;
    
    cartContent.appendChild(itemElement);
    
    // Add event listeners for quantity controls and remove button
    itemElement.querySelector('.decrease-qty').addEventListener('click', () => updateQuantity(item.id, Math.max(1, item.quantity - 1)));
    itemElement.querySelector('.increase-qty').addEventListener('click', () => updateQuantity(item.id, item.quantity + 1));
    itemElement.querySelector('.remove-item').addEventListener('click', () => removeItem(item.id));
  });
  
  // Render cart totals
  renderCartTotals(cart);
  
  // Show coupon section
  couponSection.style.display = 'block';

  // Update applied coupon display
  document.getElementById('coupon-code').value = '';
  const appliedCouponElement = document.getElementById('applied-coupon');

  if (cart.couponCode) {
    appliedCouponElement.innerHTML = `
      <div class="applied-coupon-container p-2 bg-light rounded d-flex justify-content-between align-items-center">
        <div>
          <span class="badge bg-success me-2">Applied</span>
          <span class="fw-bold">${cart.couponCode}</span>
        </div>
        <button class="btn btn-sm btn-outline-danger" id="remove-coupon-btn">Remove</button>
      </div>
    `;
    document.getElementById('remove-coupon-btn').addEventListener('click', removeCoupon);
    couponMessage.innerHTML = '';
  } else {
    appliedCouponElement.innerHTML = '';
    couponMessage.innerHTML = '';
  }
}

/**
 * Render cart totals section
 */
function renderCartTotals(cart) {
  const { subtotal, totalTax, totalSavings, totalMRP, couponDiscount, deliveryCharge, totalAmount } = cart.cartBreakdown;

  cartTotals.innerHTML = `
    <div class="card">
      <div class="card-body">
        <h5 class="card-title mb-3">Order Summary</h5>
        <div class="d-flex justify-content-between mb-2">
          <span>MRP Total</span>
          <span>₹${parseFloat(totalMRP).toFixed(2)}</span>
        </div>
        <div class="d-flex justify-content-between mb-2">
          <span>Subtotal</span>
          <span>₹${parseFloat(subtotal).toFixed(2)}</span>
        </div>
        <div class="d-flex justify-content-between mb-2">
          <span>Tax</span>
          <span>₹${parseFloat(totalTax).toFixed(2)}</span>
        </div>
        ${totalSavings > 0 ? `
        <div class="d-flex justify-content-between mb-2 text-success">
          <span>Savings</span>
          <span>-₹${parseFloat(totalSavings).toFixed(2)}</span>
        </div>` : ''}
        ${couponDiscount > 0 ? `
        <div class="d-flex justify-content-between mb-2 text-success">
          <span>Coupon Discount</span>
          <span>-₹${parseFloat(couponDiscount).toFixed(2)}</span>
        </div>` : ''}
        ${deliveryCharge > 0 ? `
        <div class="d-flex justify-content-between mb-2">
          <span>Delivery Charge</span>
          <span>₹${parseFloat(deliveryCharge).toFixed(2)}</span>
        </div>` : ''}
        <hr>
        <div class="d-flex justify-content-between fw-bold">
          <span>Total</span>
          <span>₹${parseFloat(totalAmount).toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Update item quantity
 */
async function updateQuantity(itemId, quantity) {
  const token = localStorage.getItem('token');
  if (!token) return;
  
  try {
    showLoading();
    const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update quantity');
    }
    
    // Reload cart to show updated data
    loadCart();
  } catch (err) {
    console.error('Error updating quantity:', err);
    showToast('error', err.message);
  } finally {
    hideLoading();
  }
}

/**
 * Remove item from cart
 */
async function removeItem(itemId) {
  if (!confirm('Are you sure you want to remove this item from your cart?')) return;
  
  const token = localStorage.getItem('token');
  if (!token) return;
  
  try {
    showLoading();
    const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove item');
    }
    
    // Reload cart to show updated data
    loadCart();
    showToast('success', 'Item removed from cart');
  } catch (err) {
    console.error('Error removing item:', err);
    showToast('error', err.message);
  } finally {
    hideLoading();
  }
}

/**
 * Apply coupon to cart
 */
async function applyCoupon() {
  const couponCode = document.getElementById('coupon-code').value.trim();
  if (!couponCode) {
    showToast('error', 'Please enter a coupon code');
    return;
  }
  
  const token = localStorage.getItem('token');
  if (!token) return;
  
  try {
    showLoading();
    const response = await fetch(`${API_BASE_URL}/cart/apply-coupon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ couponCode })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to apply coupon');
    }

    // Reload cart to show updated data
    loadCart();
    showToast('success', 'Coupon applied successfully');
  } catch (err) {
    console.error('Error applying coupon:', err);
    showToast('error', err.message);
  } finally {
    hideLoading();
  }
}

/**
 * Remove coupon from cart
 */
async function removeCoupon() {
  const token = localStorage.getItem('token');
  if (!token) return;
  
  try {
    showLoading();
    const response = await fetch(`${API_BASE_URL}/cart/remove-coupon`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove coupon');
    }
    
    // Reload cart to show updated data
    loadCart();
    showToast('success', 'Coupon removed successfully');
  } catch (err) {
    console.error('Error removing coupon:', err);
    showToast('error', err.message);
  } finally {
    hideLoading();
  }
}

/**
 * Proceed to checkout
 */
function proceedToCheckout() {
  window.location.href = 'checkout.html';
}