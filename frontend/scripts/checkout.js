// Checkout Page JavaScript

// API Base URL
const API_BASE_URL = 'http://localhost:3030';

// DOM Elements
const shippingForm = document.getElementById('shipping-form');
const savedAddressesContainer = document.getElementById('saved-addresses-container');
const addNewAddressBtn = document.getElementById('add-new-address-btn');
const continueToPaymentBtn = document.getElementById('continue-to-payment-btn');
const backToShippingBtn = document.getElementById('back-to-shipping-btn');
const placeOrderBtn = document.getElementById('place-order-btn');
const shippingSection = document.getElementById('shipping-section');
const paymentSection = document.getElementById('payment-section');
const orderItemsContainer = document.getElementById('order-items');
const orderTotalsContainer = document.getElementById('order-totals');
const standardDeliveryPriceElement = document.getElementById('standard-delivery-price');

// Payment method radio buttons
const cardPaymentRadio = document.getElementById('cardPayment');
const upiPaymentRadio = document.getElementById('upiPayment');
const codPaymentRadio = document.getElementById('codPayment');

// Payment form containers
const cardPaymentForm = document.getElementById('card-payment-form');
const upiPaymentForm = document.getElementById('upi-payment-form');
const codPaymentForm = document.getElementById('cod-payment-form');

// State variables
let cart = null;
let selectedAddressId = null;
let deliveryOption = 'standard';
let paymentMethod = 'card';
let stripe = null;
let cardElement = null;
let states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
  // Populate state dropdown
  populateStateDropdown();
  
  // Initialize Stripe
  initializeStripe();
  
  // Load cart data
  await loadCart();
  
  // Load user addresses
  await loadUserAddresses();
  
  // Setup event listeners
  setupEventListeners();
});

// Populate state dropdown
function populateStateDropdown() {
  const stateSelect = document.getElementById('state');
  states.forEach(state => {
    const option = document.createElement('option');
    option.value = state;
    option.textContent = state;
    stateSelect.appendChild(option);
  });
}

// Initialize Stripe
function initializeStripe() {
  // Initialize Stripe with your publishable key
  stripe = Stripe('pk_test_51RtTRzIL97tio40MztHBq3IcqBsZzE3QqWw1bedF0g9wXbjy2qhYTnnfZ7hsFIryDfpdnB42Q799CBJJgyfqvjM100GTLm5eUr');
  
  // Create an instance of Elements
  const elements = stripe.elements();
  
  // Create the card Element
  cardElement = elements.create('card', {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    }
  });
  
  // Add an instance of the card Element into the `card-element` div
  cardElement.mount('#card-element');
  
  // Handle real-time validation errors from the card Element
  cardElement.on('change', function(event) {
    const displayError = document.getElementById('card-errors');
    if (event.error) {
      displayError.textContent = event.error.message;
    } else {
      displayError.textContent = '';
    }
  });
}

// Load cart data
async function loadCart() {
  try {
    showLoading();
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html?redirect=checkout.html';
      return;
    }
    
    const response = await fetch(`${API_BASE_URL}/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = 'login.html?redirect=checkout.html';
        return;
      }
      throw new Error('Failed to load cart');
    }
    
    const data = await response.json();
    cart = data;
    
    // Update the UI with cart data
    updateOrderSummary();
  } catch (error) {
    console.error('Error loading cart:', error);
    showToast('error', 'Failed to load cart data. Please try again.');
  } finally {
    hideLoading();
  }
}

// Load user addresses
async function loadUserAddresses() {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const response = await fetch(`${API_BASE_URL}/addresses`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to load addresses');
    }
    
    const addresses = await response.json();
    renderAddresses(addresses.items);
  } catch (error) {
    console.error('Error loading addresses:', error);
    showToast('error', 'Failed to load addresses');
  }
}

// Render addresses
function renderAddresses(addresses) {
  if (!addresses || addresses.length === 0) {
    savedAddressesContainer.innerHTML = '<p>No saved addresses found.</p>';
    return;
  }
  
  savedAddressesContainer.innerHTML = '';
  addresses.forEach(address => {
    const addressElement = document.createElement('div');
    addressElement.className = 'saved-address';
    addressElement.dataset.addressId = address.id;
    
    if (address.isDefault) {
      addressElement.classList.add('selected');
      selectedAddressId = address.id;
    }
    
    addressElement.innerHTML = `
      <div class="d-flex justify-content-between">
        <div>
          <strong>${address.name}</strong>
          ${address.isDefault ? '<span class="badge bg-primary ms-2">Default</span>' : ''}
          <span class="badge bg-secondary ms-1">${address.type || 'Home'}</span>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" name="selectedAddress" id="address-${address.id}" 
            ${address.isDefault ? 'checked' : ''}>
        </div>
      </div>
      <p class="mb-1">${address.addressLine1}, ${address.addressLine2 ? address.addressLine2 + ', ' : ''}</p>
      <p class="mb-1">${address.city}, ${address.state} ${address.pincode}</p>
      <p class="mb-1">${address.country}</p>
      <p class="mb-0">${address.phone}</p>
      <div class="address-actions">
        <button class="btn btn-sm btn-outline-secondary edit-address-btn" data-address-id="${address.id}">Edit</button>
        <button class="btn btn-sm btn-outline-danger delete-address-btn" data-address-id="${address.id}">Delete</button>
        ${!address.isDefault ? `<button class="btn btn-sm btn-outline-primary set-default-btn" data-address-id="${address.id}">Set as Default</button>` : ''}
      </div>
    `;
    
    savedAddressesContainer.appendChild(addressElement);
  });
  
  // Add event listeners to address elements
  document.querySelectorAll('.saved-address').forEach(addressElement => {
    addressElement.addEventListener('click', function() {
      document.querySelectorAll('.saved-address').forEach(el => el.classList.remove('selected'));
      this.classList.add('selected');
      selectedAddressId = this.dataset.addressId;
      
      // Check the radio button
      const radio = this.querySelector('input[type="radio"]');
      radio.checked = true;
    });
  });
  
  // Add event listeners to edit and delete buttons
  document.querySelectorAll('.edit-address-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const addressId = this.dataset.addressId;
      editAddress(addressId);
    });
  });
  
  document.querySelectorAll('.delete-address-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const addressId = this.dataset.addressId;
      deleteAddress(addressId);
    });
  });
  
  // Add event listeners to set default buttons
  document.querySelectorAll('.set-default-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const addressId = this.dataset.addressId;
      setDefaultAddress(addressId);
    });
  });
}

// Edit address
async function editAddress(addressId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    // Get the address details
    const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get address details');
    }
    
    const address = await response.json();
    
    // Populate the form with address details
    document.getElementById('name').value = address.name || '';
    document.getElementById('addressLine1').value = address.addressLine1 || '';
    document.getElementById('addressLine2').value = address.addressLine2 || '';
    document.getElementById('landmark').value = address.landmark || '';
    document.getElementById('country').value = address.country || 'India';
    document.getElementById('state').value = address.state || '';
    document.getElementById('pincode').value = address.pincode || '';
    document.getElementById('phone').value = address.phone || '';
    document.getElementById('addressType').value = address.type || 'Home';
    
    // Show the form
    document.getElementById('address-selection').style.display = 'none';
    shippingForm.style.display = 'block';
    
    // Add a data attribute to the form to indicate editing
    shippingForm.dataset.editing = 'true';
    shippingForm.dataset.addressId = addressId;
    
    // Change the submit button text
    const submitBtn = document.getElementById('shipping-form-submit');
    if (submitBtn) {
      submitBtn.textContent = 'Update Address';
    }
  } catch (error) {
    console.error('Error editing address:', error);
    showToast('error', 'Failed to load address details');
  }
}

// Delete address
async function deleteAddress(addressId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const confirmed = confirm('Are you sure you want to delete this address?');
    if (!confirmed) return;
    
    const response = await fetch(`${API_BASE_URL}/addresses/${addressId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete address');
    }
    
    // Reload addresses
    await loadUserAddresses();
    showToast('success', 'Address deleted successfully');
  } catch (error) {
    console.error('Error deleting address:', error);
    showToast('error', 'Failed to delete address');
  }
}

// Set address as default
async function setDefaultAddress(addressId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const response = await fetch(`${API_BASE_URL}/addresses/${addressId}/default`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to set address as default');
    }
    
    // Reload addresses
    await loadUserAddresses();
    showToast('success', 'Address set as default successfully');
  } catch (error) {
    console.error('Error setting default address:', error);
    showToast('error', 'Failed to set address as default');
  }
}

// Update order summary
function updateOrderSummary() {
  if (!cart || !cart.items || cart.items.length === 0) {
    orderItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    orderTotalsContainer.innerHTML = '';
    return;
  }

  // Render order items
  orderItemsContainer.innerHTML = cart.items[0].items.map(item => {
    return `
      <div class="order-item">
        <img src="${item.product.images[0].secure_url || 'images/no-product-found.png'}" alt="${item.product.name}" class="order-item-image">
        <div class="order-item-details">
          <div class="order-item-name">${item.product.name}</div>
          <div class="d-flex justify-content-between">
            <div class="order-item-price">₹${parseFloat(item.price).toFixed(2)}</div>
            <div class="order-item-quantity">Qty: ${item.quantity}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  // Update standard delivery price
  standardDeliveryPriceElement.textContent = `₹${parseFloat(cart.deliveryCharge).toFixed(2)}`;

    const { subtotal, totalTax, totalSavings, totalMRP, couponDiscount, deliveryCharge, totalAmount } = cart.items[0].cartBreakdown;
  
  // Render order totals
  orderTotalsContainer.innerHTML = `
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
  `;
}

// Setup event listeners
function setupEventListeners() {
  // Add new address button
  addNewAddressBtn.addEventListener('click', () => {
    // Reset the form
    shippingForm.reset();
    shippingForm.classList.remove('was-validated');
    delete shippingForm.dataset.editing;
    delete shippingForm.dataset.addressId;
    
    // Show the shipping form
    document.getElementById('address-selection').style.display = 'none';
    shippingForm.style.display = 'block';
    
    // Change the submit button text
    const submitBtn = document.getElementById('shipping-form-submit');
    if (submitBtn) {
      submitBtn.textContent = 'Save Address';
    }
  });
  
  // Pincode input for auto-filling location
  const pincodeInput = document.getElementById('pincode');
  if (pincodeInput) {
    pincodeInput.addEventListener('blur', async () => {
      const pincode = pincodeInput.value.trim();
      if (pincode.length === 6) {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          
          const response = await fetch(`${API_BASE_URL}/addresses/location/${pincode}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch location data');
          }
          
          const {items: [firstItem]} = await response.json();
          // Auto-fill the location fields
          document.getElementById('country').value = firstItem.country || 'India';
          document.getElementById('state').value = firstItem.state || '';
          document.getElementById('city').value = firstItem.city || '';
          
          showToast('success', 'Location details fetched successfully');
        } catch (error) {
          console.error('Error fetching location:', error);
          showToast('error', 'Failed to fetch location details. Please enter manually.');
        }
      }
    });
  }
  
  // Shipping form submission
  shippingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!shippingForm.checkValidity()) {
      shippingForm.classList.add('was-validated');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = 'login.html?redirect=checkout.html';
        return;
      }
      
      // Get form data
      const name = document.getElementById('name').value;
      const addressLine1 = document.getElementById('addressLine1').value;
      const addressLine2 = document.getElementById('addressLine2').value;
      const landmark = document.getElementById('landmark').value;
      const country = document.getElementById('country').value;
      const state = document.getElementById('state').value;
      const city = document.getElementById('city') ? document.getElementById('city').value : '';
      const pincode = document.getElementById('pincode').value;
      const phone = document.getElementById('phone').value;
      const addressType = document.getElementById('addressType').value;
      const saveAddress = document.getElementById('save-address').checked;
      
      // Create address data
      const addressData = {
        name: name.trim(),
        phone,
        pincode,
        addressLine1,
        addressLine2,
        landmark: landmark || '',
        country,
        state,
        city: city || state, // If city field doesn't exist, use state as fallback
        type: addressType || 'Home',
        isDefault: saveAddress
      };
      
      let response;
      
      // Check if editing or creating
      if (shippingForm.dataset.editing === 'true' && shippingForm.dataset.addressId) {
        // Update existing address
        response = await fetch(`${API_BASE_URL}/addresses/${shippingForm.dataset.addressId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(addressData)
        });
      } else {
        // Create new address
        response = await fetch(`${API_BASE_URL}/addresses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(addressData)
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save address');
      }
      
      // Reload addresses
      await loadUserAddresses();
      
      // Hide the form and show the address selection
      document.getElementById('address-selection').style.display = 'block';
      shippingForm.style.display = 'none';
      
      showToast('success', 'Address saved successfully');
    } catch (error) {
      console.error('Error saving address:', error);
      showToast('error', error.message || 'Failed to save address');
    }
  });
  
  // Cancel button for address form
  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn btn-outline-secondary me-2';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => {
    // Hide the form and show the address selection
    document.getElementById('address-selection').style.display = 'block';
    shippingForm.style.display = 'none';
  });
  
  // Submit button for address form
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary';
  submitBtn.textContent = 'Save Address';
  submitBtn.id = 'shipping-form-submit';
  
  // Add buttons to form
  const formButtonsDiv = document.createElement('div');
  formButtonsDiv.className = 'd-flex justify-content-end mt-3';
  formButtonsDiv.appendChild(cancelBtn);
  formButtonsDiv.appendChild(submitBtn);
  shippingForm.appendChild(formButtonsDiv);
  
  // Continue to payment button
  continueToPaymentBtn.addEventListener('click', () => {
    // Validate shipping information
    if (!validateShippingInfo()) {
      return;
    }
    
    // Show payment section
    shippingSection.style.display = 'none';
    paymentSection.style.display = 'block';
    
    // Update progress steps
    document.querySelectorAll('.progress-step')[2].classList.add('active');
  });
  
  // Back to shipping button
  backToShippingBtn.addEventListener('click', () => {
    // Show shipping section
    shippingSection.style.display = 'block';
    paymentSection.style.display = 'none';
    
    // Update progress steps
    document.querySelectorAll('.progress-step')[2].classList.remove('active');
  });
  
  // Place order button
  placeOrderBtn.addEventListener('click', async () => {
    await placeOrder();
  });
  
  // Payment method radio buttons
  cardPaymentRadio.addEventListener('change', () => {
    paymentMethod = 'card';
    cardPaymentForm.style.display = 'block';
    upiPaymentForm.style.display = 'none';
    codPaymentForm.style.display = 'none';
  });
  
  upiPaymentRadio.addEventListener('change', () => {
    paymentMethod = 'upi';
    cardPaymentForm.style.display = 'none';
    upiPaymentForm.style.display = 'block';
    codPaymentForm.style.display = 'none';
  });
  
  codPaymentRadio.addEventListener('change', () => {
    paymentMethod = 'cod';
    cardPaymentForm.style.display = 'none';
    upiPaymentForm.style.display = 'none';
    codPaymentForm.style.display = 'block';
  });
  
  // Delivery option radio buttons
  document.querySelectorAll('input[name="deliveryOption"]').forEach(radio => {
    radio.addEventListener('change', function() {
      deliveryOption = this.value;
      updateDeliveryCharge();
    });
  });
}

// Update delivery charge based on selected option
function updateDeliveryCharge() {
  if (!cart) return;
  
  const deliveryChargeElement = document.getElementById('delivery-charge');
  const totalAmountElement = document.getElementById('total-amount');
  
  let deliveryCharge = parseFloat(cart.deliveryCharge);
  if (deliveryOption === 'express') {
    deliveryCharge = 100.00; // Express delivery charge
  }
  
  // Update delivery charge display
  deliveryChargeElement.textContent = `₹${deliveryCharge.toFixed(2)}`;
  
  // Update total amount
  const subtotal = parseFloat(cart.subtotal);
  const tax = parseFloat(cart.totalTax);
  const couponDiscount = parseFloat(cart.couponDiscount) || 0;
  const totalAmount = subtotal + tax - couponDiscount + deliveryCharge;
  
  totalAmountElement.textContent = `₹${totalAmount.toFixed(2)}`;
}

// Validate shipping information
function validateShippingInfo() {
  // If an address is selected, return true
  if (selectedAddressId) {
    return true;
  }
  
  // Otherwise, validate the shipping form
  shippingForm.classList.add('was-validated');
  
  // Check required fields
  const name = document.getElementById('name').value;
  const addressLine1 = document.getElementById('addressLine1').value;
  const country = document.getElementById('country').value;
  const state = document.getElementById('state').value;
  const pincode = document.getElementById('pincode').value;
  const phone = document.getElementById('phone').value;
  const addressType = document.getElementById('addressType').value;
  
  if (!name || !addressLine1 || !country || !state || !pincode || !phone || !addressType) {
    showToast('error', 'Please fill in all required shipping information');
    return false;
  }
  
  return shippingForm.checkValidity();
}

// Place order
async function placeOrder() {
  try {
    showLoading();
    
    // Validate payment information
    if (!validatePaymentInfo()) {
      hideLoading();
      return;
    }
    
    // Validate that an address is selected
    if (!selectedAddressId) {
      showToast('error', 'Please select a delivery address');
      hideLoading();
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'login.html?redirect=checkout.html';
      return;
    }
    
    // Create order data
    const orderData = {
      addressId: selectedAddressId,
      paymentMethod: paymentMethod,
      deliveryOption: deliveryOption
    };
    
    // Create order
    const orderResponse = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    
    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      throw new Error(errorData.message || 'Failed to create order');
    }
    
    const orderResult = await orderResponse.json();
    
    // Handle payment based on selected method
    if (paymentMethod === 'card') {
      // Create payment session with Stripe
      const paymentResponse = await fetch(`${API_BASE_URL}/payments/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ order: orderResult })
      });
      
      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.message || 'Failed to create payment session');
      }
      
      const { url, sessionId } = await paymentResponse.json();
      
      // Store the sessionId in localStorage for verification later
      localStorage.setItem('stripe_session_id', sessionId);
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } else if (paymentMethod === 'upi') {
      // Handle UPI payment
      // For now, just redirect to success page
      window.location.href = `order-success.html?orderId=${orderResult.id}`;
    } else if (paymentMethod === 'cod') {
      // Handle COD payment
      // For now, just redirect to success page
      window.location.href = `order-success.html?orderId=${orderResult.id}`;
    }
  } catch (error) {
    console.error('Error placing order:', error);
    showToast('error', error.message || 'Failed to place order. Please try again.');
  } finally {
    hideLoading();
  }
}

// Validate payment information
function validatePaymentInfo() {
  if (paymentMethod === 'card') {
    // Validate card information
    const displayError = document.getElementById('card-errors');
    if (displayError.textContent) {
      return false;
    }
    return true;
  } else if (paymentMethod === 'upi') {
    // Validate UPI ID
    const upiId = document.getElementById('upiId').value;
    if (!upiId) {
      showToast('error', 'Please enter a valid UPI ID');
      return false;
    }
    return true;
  } else if (paymentMethod === 'cod') {
    // No validation needed for COD
    return true;
  }
  return false;
}

// Show loading spinner
function showLoading() {
  // Implement loading spinner
  console.log('Loading...');
}

// Hide loading spinner
function hideLoading() {
  // Implement loading spinner
  console.log('Loading complete');
}

// Show toast notification
function showToast(type, message) {
  // Implement toast notification
  alert(`${type.toUpperCase()}: ${message}`);
}