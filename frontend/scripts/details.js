document.addEventListener("DOMContentLoaded", function () {
  initializeProductDetails();
});

// Global variables
let cart_items = JSON.parse(localStorage.getItem("cart_items")) || [];
let loginUser = JSON.parse(localStorage.getItem("loginUser")) || null;
let currentProduct = null;
let currentQuantity = 1;

// Initialize product details page
async function initializeProductDetails() {
  try {
    // Get product ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
      console.error("No product ID found in URL");
      window.location.href = "index.html";
      return;
    }

    // Show loading state
    showLoadingState();

    // Fetch product details
    await fetchProductDetails(productId);

    // Initialize page components
    setupQuantityControls();
    setupCartHandlers();
    // displayCartCount();
    checkAuthState();
  } catch (error) {
    console.error("Error initializing product details:", error);
    showErrorState();
  }
}

// Show loading state
function showLoadingState() {
  document.getElementById("product-title").textContent = "Loading...";
  document.getElementById("price").textContent = "Loading...";
  document.getElementById("main-img").style.opacity = "0.5";
}

// Show error state
function showErrorState() {
  document.getElementById("product-title").textContent = "Product not found";
  document.getElementById("price").textContent = "N/A";
  document.getElementById("below-text").textContent =
    "Sorry, we couldn't load this product.";
}

// Fetch product details from API
async function fetchProductDetails(productId) {
  try {
    const response = await fetch(`http://localhost:3030/products/${productId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.statusCode === 200 && data.items && data.items.length > 0) {
      currentProduct = data.items[0];
      displayProductDetails(currentProduct);
    } else {
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error("Error fetching product details:", error);
    showErrorState();
  }
}

// Display product details on the page
function displayProductDetails(product) {
  try {
    // Update product image
    const mainImg = document.getElementById("main-img");
    if (product.images && product.images.length > 0) {
      mainImg.src = product.images[0].secure_url || product.images[0];
    } else if (product.image) {
      mainImg.src = product.image.secure_url || product.image;
    } else {
      mainImg.src = "images/logo_mini.jpg"; // fallback image
    }
    mainImg.style.opacity = "1";
    mainImg.alt = product.name;

    if (product?.images?.length) {
      const mainImg = document.getElementById("main-img");
      const thumbContainer = document.getElementById("thumbnail-images");

      // Set main image
      mainImg.src = product.images[0].secure_url;

      // Create thumbnails
      product.images.forEach((imgSrc, index) => {
        const thumb = document.createElement("img");
        thumb.src = imgSrc.secure_url;
        thumb.className = "thumbnail img-thumbnail";
        thumb.style =
          "width: 120px; height: 120px; object-fit: cover; cursor: pointer";
        thumb.alt = `Product thumbnail ${index + 1}`;

        thumb.addEventListener("click", () => {
          mainImg.src = imgSrc.secure_url;
          document
            .querySelectorAll(".thumbnail")
            .forEach((t) => t.classList.remove("active"));
          thumb.classList.add("active");
        });

        if (index === 0) thumb.classList.add("active");
        thumbContainer.appendChild(thumb);
      });
    }

    // Update product title
    document.getElementById("product-title").textContent = product.name;

    // Update brand name (use category if no brand)
    const brandElement = document.getElementById("brand-name");
    if (product.brand) {
      brandElement.textContent = product.brand;
    } else if (product.category) {
      brandElement.textContent = product.category.name;
    }

    // Update pricing
    updatePricing(product);

    // Update description
    const descElement = document.getElementById("below-text");
    if (product.description) {
      descElement.textContent = product.description;
    } else {
      descElement.textContent = `High-quality ${product.name} from our ${
        product.category?.name || "featured"
      } collection.`;
    }

    // Update page title
    document.title = `${product.name} - Product Details`;

    // Update reviews placeholder
    document.getElementById("reviewss").textContent = "Write a review";
  } catch (error) {
    console.error("Error displaying product details:", error);
  }
}

document.getElementById("thumb-left").addEventListener("click", () => {
  document.getElementById("thumbnail-images").scrollBy({
    left: -150,
    behavior: "smooth",
  });
});

document.getElementById("thumb-right").addEventListener("click", () => {
  document.getElementById("thumbnail-images").scrollBy({
    left: 150,
    behavior: "smooth",
  });
});

// Update pricing display
function updatePricing(product) {
  const priceElement = document.getElementById("price");
  const price = parseFloat(product.price);
  const mrp = product.mrp ? parseFloat(product.mrp) : null;

  if (mrp && mrp > price) {
    // Show discounted price
    const discount = Math.round(((mrp - price) / mrp) * 100);
    priceElement.innerHTML = `
      <span class="current-price">₹${price.toFixed(2)}</span>
      <span class="original-price" style="text-decoration: line-through; color: #666; margin-left: 10px;">₹${mrp.toFixed(
        2
      )}</span>
      <span class="discount-badge" style="background: #e74c3c; color: white; padding: 2px 6px; border-radius: 3px; font-size: 12px; margin-left: 10px;">${discount}% OFF</span>
    `;
  } else {
    priceElement.innerHTML = `<span class="current-price">₹${price.toFixed(
      2
    )}</span>`;
  }
}

// Setup quantity controls
function setupQuantityControls() {
  const decBtn = document.getElementById("dec");
  const incBtn = document.getElementById("inc");
  const countDisplay = document.getElementById("count-num");

  // Initialize quantity
  countDisplay.textContent = currentQuantity;

  // Decrease quantity
  decBtn.addEventListener("click", () => {
    if (currentQuantity > 1) {
      currentQuantity--;
      countDisplay.textContent = currentQuantity;
    }
  });

  // Increase quantity
  incBtn.addEventListener("click", () => {
    if (currentQuantity < 99) {
      // reasonable limit
      currentQuantity++;
      countDisplay.textContent = currentQuantity;
    }
  });
}

// Setup cart-related event handlers
function setupCartHandlers() {
  // Add to cart button - remove any existing listeners first
  const addToCartBtn = document.getElementById("add-to-cart");
  // Clone the button to remove all event listeners
  const newAddToCartBtn = addToCartBtn.cloneNode(true);
  addToCartBtn.parentNode.replaceChild(newAddToCartBtn, addToCartBtn);
  // Add the event listener
  newAddToCartBtn.addEventListener("click", handleAddToCart);

  // View cart button
  document.getElementById("wishlist").addEventListener("click", () => {
    window.location.href = "cart.html";
  });

  // Buy now button
  document.getElementById("buy-it-now").addEventListener("click", handleBuyNow);
}

// Add product to cart logic
function addProductToCart(product, quantity) {
  // Find user's cart
  let userCartIndex = cart_items.findIndex(
    (item) => item.email === loginUser.email
  );

  if (userCartIndex !== -1) {
    // User has existing cart
    let userCart = cart_items[userCartIndex];
    let existingItemIndex = userCart.cartItems.findIndex(
      (item) => item.id === product.id
    );

    if (existingItemIndex !== -1) {
      // Product already in cart, update quantity
      userCart.cartItems[existingItemIndex].count += quantity;
    } else {
      // New product, add to cart
      userCart.cartItems.push({
        ...product,
        count: quantity,
      });
    }
  } else {
    // New user cart
    cart_items.push({
      email: loginUser.email,
      cartItems: [
        {
          ...product,
          count: quantity,
        },
      ],
    });
  }

  // Save to localStorage
  localStorage.setItem("cart_items", JSON.stringify(cart_items));
}

// Show add to cart success message
function showAddToCartSuccess() {
  const button = document.getElementById("add-to-cart");
  const originalText = button.textContent;

  button.textContent = "Added!";
  button.style.backgroundColor = "#28a745";

  setTimeout(() => {
    button.textContent = originalText;
    button.style.backgroundColor = "#feef02";
  }, 2000);
}

// Handle buy now
function handleBuyNow() {
  if (!currentProduct) {
    alert("Product information not available");
    return;
  }

  if (!loginUser) {
    alert("Please login to proceed with purchase");
    window.location.href = "signup.html";
    return;
  }

  // Add to cart first, then redirect to checkout
  addProductToCart(currentProduct, currentQuantity);
  localStorage.setItem("cart_items", JSON.stringify(cart_items));

  window.location.href = "checkout.html";
}

// // Display cart count
// function displayCartCount() {
//   const totalCartElement = document.getElementById("total-cart-item");
//   const wishlistElement = document.getElementById("wishlist");

//   let totalCount = 0;

//   if (loginUser && cart_items.length > 0) {
//     const userCart = cart_items.find(item => item.email === loginUser.email);
//     if (userCart && userCart.cartItems) {
//       totalCount = userCart.cartItems.reduce((sum, item) => sum + (item.count || 0), 0);
//     }
//   }

//   totalCartElement.textContent = totalCount > 0 ? totalCount : "Cart";
//   wishlistElement.textContent = `View my Cart${totalCount > 0 ? ` (${totalCount})` : ''}`;
// }

// Check authentication state
function checkAuthState() {
  const token = localStorage.getItem("token");
  const signInButton = document.getElementById("inoutbtn");

  if (token && loginUser) {
    // signInButton.textContent = "Logout";
    signInButton.addEventListener("click", handleLogout);
  } else {
    // signInButton.textContent = "SignIn";
  }
}

// Handle logout
function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("loginUser");
  window.location.reload();
}

// Utility function to get product ID from URL (for use in other scripts)
function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

// Export for use in other scripts if needed
window.productDetailsAPI = {
  getCurrentProduct: () => currentProduct,
  getCurrentQuantity: () => currentQuantity,
  getProductIdFromUrl,
};

// Local implementation of addToCart function
async function addToCart(productId, quantity = 1) {
  console.log("addToCart called with", productId, quantity);
  const token = localStorage.getItem("token");
  if (!token) {
    showToast("Please login to add items to cart.", "error");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1200);
    return;
  }
  try {
    const response = await fetch("http://localhost:3030/cart/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity }),
    });
    const data = await response.json();
    if (response.ok && (data.statusCode === 201 || data.statusCode === 200)) {
      showToast("Product added to cart successfully!", "success");
    } else if (response.status === 401) {
      showToast("Session expired. Please login again.", "error");
      setTimeout(() => {
        localStorage.removeItem("token");
        window.location.href = "login.html";
      }, 1200);
    } else {
      showToast(data.message || "Failed to add to cart.", "error");
    }
  } catch (err) {
    showToast("Network error. Please try again.", "error");
  }
}

// Local implementation of showToast function
function showToast(message, type = "info") {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container position-fixed top-0 end-0 p-3";
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toastEl = document.createElement("div");
  toastEl.className = `toast align-items-center text-white bg-${
    type === "success" ? "success" : type === "error" ? "danger" : "info"
  }`;
  toastEl.setAttribute("role", "alert");
  toastEl.setAttribute("aria-live", "assertive");
  toastEl.setAttribute("aria-atomic", "true");

  // Create toast content
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  // Add toast to container
  toastContainer.appendChild(toastEl);

  // Initialize and show toast
  const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
  toast.show();

  // Remove toast after it's hidden
  toastEl.addEventListener("hidden.bs.toast", () => {
    toastEl.remove();
  });
}

// Handle add to cart button click
let isAddingToCart = false; // Flag to prevent multiple calls
function handleAddToCart(event) {
  console.log("handleAddToCart called", event);
  if (event && typeof event.stopPropagation === "function") {
    event.stopPropagation();
  }

  // Prevent multiple simultaneous calls
  if (isAddingToCart) {
    console.log("Already adding to cart, ignoring duplicate call");
    return;
  }

  if (!currentProduct) {
    showToast("Product information not available", "error");
    return;
  }

  isAddingToCart = true;
  // Use the local addToCart function
  addToCart(currentProduct.id, currentQuantity).finally(() => {
    // Reset flag after operation completes (success or failure)
    isAddingToCart = false;
  });
}

// Render thumbnail carousel section
function renderProductThumbnail(section, index) {
  const carouselId = `carousel-${section.id}`;
  const images = section.metadata.images || [];

  let indicatorsHtml = "";
  let slidesHtml = "";

  images.forEach((image, i) => {
    indicatorsHtml += `
            <button type="button" data-bs-target="#${carouselId}" data-bs-slide-to="${i}" 
                    class="${i === 0 ? "active" : ""}" aria-current="${
      i === 0 ? "true" : "false"
    }" 
                    aria-label="Slide ${i + 1}"></button>
          `;

    slidesHtml += `
            <div class="carousel-item ${i === 0 ? "active" : ""}">
              <img style="cursor: pointer; max-height: 400px; width: 100%; object-fit: contain;" src="${
                image.url
              }" class="d-block banner-image" alt="Banner ${i + 1}" />
            </div>
          `;
  });

  return `
          <div class="container">
            <div id="${carouselId}" class="carousel slide dynamic-section" data-bs-ride="carousel">
              <div class="carousel-indicators">
                ${indicatorsHtml}
              </div>
              <div class="carousel-inner">
                ${slidesHtml}
              </div>
              <button style="z-index: 0;" class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Previous</span>
              </button>
              <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="visually-hidden">Next</span>
              </button>
            </div>
          </div>
        `;
}
