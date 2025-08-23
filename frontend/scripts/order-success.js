// Order Success Page JavaScript

// API Base URL
const API_BASE_URL = 'http://localhost:3030';

// DOM Elements
const orderIdValue = document.getElementById('order-id-value');
const orderItemsContainer = document.getElementById('order-items');
const orderSummaryContainer = document.getElementById('order-summary');
const trackOrderBtn = document.getElementById('track-order-btn');

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
  // Get order ID and session ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');
  const sessionId = urlParams.get('session_id');
  
  if (orderId) {
    // Display order ID
    orderIdValue.textContent = orderId;
    
    // Load order details
    await loadOrderDetails(orderId);
  } else if (sessionId) {
    // Verify payment with Stripe session ID
    await verifyPayment(sessionId);
  } else {
    // No order ID or session ID provided
    orderIdValue.textContent = 'Not available';
    orderItemsContainer.innerHTML = '<p class="text-center">Order details not available.</p>';
  }
});

// Load order details
async function loadOrderDetails(orderId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html';
      return;
    }
    
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load order details');
    }
    
    const orderResponse = await response.json();
    const order = orderResponse.data || orderResponse; // Handle both response formats
    
    // Render order items
    renderOrderItems(order.items);
    
    // Render order summary
    renderOrderSummary(order);
    
    // Update track order button
    trackOrderBtn.href = `frontend/order-tracking.html?orderId=${orderId}`;
  } catch (error) {
    console.error('Error loading order details:', error);
    orderItemsContainer.innerHTML = '<p class="text-center text-danger">Failed to load order details. Please try again later.</p>';
  }
}

// Verify payment with Stripe session ID
async function verifyPayment(sessionId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'frontend/login.html';
      return;
    }
    
    // Get the pending order ID from localStorage if available
    const pendingOrderId = localStorage.getItem('pending_order_id');
    
    const response = await fetch(`${API_BASE_URL}/payments/verify?session_id=${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }
    
    const result = await response.json();
    console.log('Payment verification result:', result);
    
    // Extract order ID from the response
    // The API returns an items array with payment information
    let finalOrderId;
    
    if (result.items && result.items.length > 0) {
      const paymentInfo = result.items[0];
      finalOrderId = paymentInfo && paymentInfo.metadata && paymentInfo.metadata.orderId;
    } else if (result.metadata && result.metadata.orderId) {
      // Direct metadata access if items array is not present
      finalOrderId = result.metadata.orderId;
    }
    
    // Use the order ID from the response or fall back to the pending order ID
    finalOrderId = finalOrderId || pendingOrderId;
    
    if (!finalOrderId) {
      throw new Error('Order ID not found');
    }
    
    console.log('Final Order ID:', finalOrderId);
    
    // Display order ID
    orderIdValue.textContent = finalOrderId;
    
    // Load order details
    await loadOrderDetails(finalOrderId);
    
    // Update URL without reloading the page
    window.history.replaceState({}, document.title, `order-success.html?orderId=${finalOrderId}`);
    
    // Clear the pending order ID and session ID from localStorage
    localStorage.removeItem('pending_order_id');
    localStorage.removeItem('stripe_session_id');
  } catch (error) {
    console.error('Error verifying payment:', error);
    orderIdValue.textContent = 'Not available';
    orderItemsContainer.innerHTML = '<p class="text-center text-danger">Failed to verify payment. Please contact customer support.</p>';
  }
}

// Render order items
function renderOrderItems(items) {
  if (!items || items.length === 0) {
    orderItemsContainer.innerHTML = '<p class="text-center">No items in this order.</p>';
    return;
  }
  
  orderItemsContainer.innerHTML = items.map(item => {
    // Handle both data structures (item.product or item directly containing product info)
    const product = item.product || item;
    const productName = product.name || (product.product && product.product.name) || 'Product';
    const productImage = (product.images && product.images[0]) || 
                       (product.product && product.product.images && product.product.images[0]) || 
                       'images/no-product-found.png';
    
    return `
      <div class="order-item">
        <img src="${productImage}" alt="${productName}" class="order-item-image">
        <div class="order-item-details">
          <div class="order-item-name">${productName}</div>
          <div class="d-flex justify-content-between">
            <div class="order-item-price">₹${parseFloat(item.price).toFixed(2)}</div>
            <div class="order-item-quantity">Qty: ${item.quantity}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render order summary
function renderOrderSummary(order) {
  // Handle different property names in the order object
  const subtotal = order.subtotal || order.subTotal || 0;
  const totalTax = order.totalTax || order.tax || 0;
  const couponDiscount = order.couponDiscount || order.discount || 0;
  const deliveryCharge = order.deliveryCharge || order.shippingCost || 0;
  const totalAmount = order.totalAmount || order.total || 0;
  const paymentMethod = order.paymentMethod || 'Card';
  const paymentStatus = order.paymentStatus || 'PENDING';
  const orderStatus = order.status || 'PROCESSING';
  
  orderSummaryContainer.innerHTML = `
    <div class="d-flex justify-content-between mb-2">
      <span>Subtotal</span>
      <span>₹${parseFloat(subtotal).toFixed(2)}</span>
    </div>
    <div class="d-flex justify-content-between mb-2">
      <span>Tax</span>
      <span>₹${parseFloat(totalTax).toFixed(2)}</span>
    </div>
    ${couponDiscount > 0 ? `
    <div class="d-flex justify-content-between mb-2 text-success">
      <span>Coupon Discount</span>
      <span>-₹${parseFloat(couponDiscount).toFixed(2)}</span>
    </div>` : ''}
    <div class="d-flex justify-content-between mb-2">
      <span>Delivery</span>
      <span>₹${parseFloat(deliveryCharge).toFixed(2)}</span>
    </div>
    <hr>
    <div class="d-flex justify-content-between fw-bold">
      <span>Total</span>
      <span>₹${parseFloat(totalAmount).toFixed(2)}</span>
    </div>
    <div class="mt-3">
      <p class="mb-1"><strong>Payment Method:</strong> ${paymentMethod}</p>
      <p class="mb-1"><strong>Payment Status:</strong> <span class="badge ${paymentStatus === 'PAID' ? 'bg-success' : 'bg-warning'}"> ${paymentStatus}</span></p>
      <p class="mb-0"><strong>Order Status:</strong> <span class="badge bg-info">${orderStatus}</span></p>
    </div>
  `;
}