// DOM Elements
const loadingElement = document.getElementById("loading");
const errorElement = document.getElementById("error-message");
const contentElement = document.getElementById("category-content");
const categoryTitle = document.getElementById("category-title");
const categoryBreadcrumb = document.getElementById("category-breadcrumb");
const productsGrid = document.getElementById("products-grid");
const productsCount = document.getElementById("products-count");
const paginationElement = document.getElementById("pagination");

// State variables
let currentCategory = null;
let allProducts = [];
let pagination = {};
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 9;

// Helper function to get category ID from URL
function getCategoryIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

// Helper function to get category name from URL
function getCategoryNameFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("name");
}

function getSearchQueryFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("search");
}

// Fetch category data from API
async function loadCategoryData() {
  // Show loading state
  loadingElement.classList.remove("d-none");
  errorElement.classList.add("d-none");
  contentElement.classList.add("d-none");

  const categoryId = getCategoryIdFromUrl();
  const categoryName = getCategoryNameFromUrl();
  const search = getSearchQueryFromUrl();
  console.log(search)

  if (categoryId) {
    try {
      // For testing: Use mock data instead of API call
      const categoryResponse = await fetch(
        `http://localhost:3030/categories/${categoryId}`
      );
      if (!categoryResponse.ok) throw new Error("Failed to fetch category");
      currentCategory = await categoryResponse.json();
      // Mock category data
      currentCategory = {
        id: categoryId,
        name: categoryName || "Category",
        description: "Category description",
        isActive: true,
      };

      // Update page title and breadcrumb
      document.title = `${currentCategory.name} | Dollar Store`;
      categoryTitle.textContent = currentCategory.name;
      categoryBreadcrumb.textContent = currentCategory.name;

      // For testing: Use mock product data instead of API call
      await fetchProducts();

      // Hide loading, show content
      loadingElement.classList.add("d-none");
      contentElement.classList.remove("d-none");
    } catch (error) {
      console.error("Error loading category data:", error);
      showError(error.message);
    }
  } else if (search) {
    try {
      currentCategory = {
        id: 'search',
        name: search || "Search",
        description: `Search results for ${search}`,
        isActive: true,
      };

      // Update page title and breadcrumb
      document.title = `${currentCategory.name} | Dollar Store`;
      categoryTitle.textContent = currentCategory.name;
      categoryBreadcrumb.textContent = currentCategory.name;

      // For testing: Use mock product data instead of API call
      await fetchProducts();

      // Hide loading, show content
      loadingElement.classList.add("d-none");
      contentElement.classList.remove("d-none");
    } catch (error) {
      console.error("Error loading category data:", error);
      showError(error.message);
    }
  }

  
}

// Fetch products with filters
async function fetchProducts() {
  const categoryId = getCategoryIdFromUrl();
  const search = getSearchQueryFromUrl();
  
  // Get filter values
  const sortSelect = document.getElementById("sort-select");
  const sortValue = sortSelect.value;
  const inStockOnly = document.getElementById("in-stock-only").checked;
  const onSaleOnly = document.getElementById("on-sale-only").checked;
  const minPrice = parseFloat(document.getElementById("min-price").value) || 0;
  const maxPrice = parseFloat(document.getElementById("max-price").value) || "";

  // For testing: Comment out API call
  // Build query parameters
  let url = categoryId ? `http://localhost:3030/products?page=${currentPage}&limit=${productsPerPage}&categoryId=${categoryId}` : `http://localhost:3030/products/search?q=${search}&quick=false&page=${currentPage}&limit=${productsPerPage}`;

  // Add sorting
  if (sortValue !== "default") {
    if (sortValue === "price-low-high") {
      url += "&sortBy=price&sortOrder=asc";
    } else if (sortValue === "price-high-low") {
      url += "&sortBy=price&sortOrder=desc";
    } else if (sortValue === "name-a-z") {
      url += "&sortBy=name&sortOrder=asc";
    } else if (sortValue === "name-z-a") {
      url += "&sortBy=name&sortOrder=desc";
    }
  }

  // Add price range
  if (minPrice > 0) {
    url += `&minPrice=${minPrice}`;
  }
  if (maxPrice) {
    url += `&maxPrice=${maxPrice}`;
  }

  // Add stock filter
  if (inStockOnly) {
    url += "&inStock=true";
  }

  // Add sale filter
  if (onSaleOnly) {
    url += "&onSale=true";
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch products");

    const data = await response.json();

    allProducts = data.items || [];    
    pagination = data.pagination || {};
    filteredProducts = [...allProducts];
  } catch (error) {
    console.error("Error fetching products:", error);
    showError(error.message);
  }

  // For testing: Use mock data and apply filters directly
  try {
    // Filter the mock products based on the filter values
    filteredProducts = allProducts.filter((product) => {
      // Apply price filter
      if (minPrice > 0 && product.price < minPrice) return false;
      if (maxPrice && product.price > maxPrice) return false;

      // Apply stock filter
      if (inStockOnly && product.stock <= 0) return false;

      return true;
    });

    // Apply sorting
    if (sortValue !== "default") {
      if (sortValue === "price-low-high") {
        filteredProducts.sort((a, b) => a.price - b.price);
      } else if (sortValue === "price-high-low") {
        filteredProducts.sort((a, b) => b.price - a.price);
      } else if (sortValue === "name-a-z") {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortValue === "name-z-a") {
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
      }
    }

    // Update products display
    updateProductsDisplay();
  } catch (error) {
    console.error("Error fetching products:", error);
    showError(error.message);
  }
}

// Show error message
function showError(message) {
  loadingElement.classList.add("d-none");
  errorElement.classList.remove("d-none");
  contentElement.classList.add("d-none");
  console.error(message);
}

// Apply all filters and sorting
function applyFilters() {
  // Reset to first page
  currentPage = 1;

  // Fetch products with filters
  fetchProducts();
}

// Apply price filter
function applyPriceFilter() {
  applyFilters();
}

// Apply sorting
function applySorting() {
  // Fetch products with the new sort option
  fetchProducts();
}

// Reset all filters
function resetFilters() {
  // Reset filter inputs
  document.getElementById("in-stock-only").checked = false;
  document.getElementById("on-sale-only").checked = false;
  document.getElementById("min-price").value = "";
  document.getElementById("max-price").value = "";
  document.getElementById("sort-select").value = "default";

  // Reset to first page
  currentPage = 1;

  // Fetch products with reset filters
  fetchProducts();
}

// Update products display
function updateProductsDisplay() {
  // Update products count
  productsCount.textContent = `Showing ${filteredProducts.length} products`;

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = Math.min(
    startIndex + productsPerPage,
    filteredProducts.length
  );
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Clear products grid
  productsGrid.innerHTML = "";
  // Add products to grid
  if (currentProducts.length === 0) {
    productsGrid.innerHTML = `
      <div class="col-12 text-center py-5" style="width: 100%;">
        <img src="./images/no-product-found.png" width="50%" alt="No results" style="opacity: 0.6;">
      </div>
    `;
  } else {
    currentProducts.forEach((product) => {
      const productCard = createProductCard(product);
      productsGrid.appendChild(productCard);
    });
  }

  // Update pagination
  updatePagination(totalPages);
}

// Create product card element
function createProductCard(product) {
  const col = document.createElement("div");
  col.className = "col";

  // Calculate discount percentage
  const discountPercentage =
    +product.mrp > +product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;
  // Get first image or placeholder
  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0].secure_url
      : "./images/placeholder.png";

  col.innerHTML = `
    <div class="item p-1">
      <div class="card product-card h-100 ${product.stock > 0 ? '' : 'out-of-stock'}" onclick="openProductDetails('${product.id}')">
          <img 
            src="${imageUrl}" 
            class="card-img-top product-image" 
            alt="${product.name}" 
            loading="lazy"
          >
        <div class="card-body d-flex flex-column">
          <h6 class="card-title product-name">${product.name}</h6>
          <p style="font-size: 12px; color: #444; font-weight:600" class="card-text flex-grow-1">${product.brand || "Brand"}</p>
          <p style="font-size: 12px; color: #666;" class="card-text flex-grow-1 category-name">${product.description}</p>
          <div class="mt-auto">
            <div class="d-flex align-items-center">
              <span class="product-price me-2">₹${product.price}</span>
              ${+product.mrp > +product.price ? `<span class="product-mrp">$${product.mrp}</span>` : ''}
            </div>
            ${discountPercentage > 0 ? `<small class="text-success">${discountPercentage}% OFF</small>` : ''}
            <div class="mt-2">
              ${product.stock > 0 ? 
                `<button style="background-color: #feef02; border-color: black; color: black;" class="btn btn-primary btn-sm w-100" onclick="handleAddToCart(event, '${product.id}')">
                  Add to Cart
                </button>`
                :
              ` <button class="btn btn-primary btn-sm w-100 out-of-stock-button">
                  Out Of Stock
                </button>`
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return col;
}

// Update pagination controls
function updatePagination(totalPages) {
  paginationElement.innerHTML = "";

  if (totalPages <= 1) {
    return;
  }

  // Previous button
  const prevLi = document.createElement("li");
  prevLi.className = `page-item ${currentPage === 1 ? "disabled" : ""}`;
  prevLi.innerHTML = `<button class="page-link" onclick="changePage(${
    currentPage - 1
  })" ${currentPage === 1 ? "disabled" : ""}>Previous</button>`;
  paginationElement.appendChild(prevLi);

  // Page numbers
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // Adjust start page if we're near the end
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // First page
  if (startPage > 1) {
    const firstLi = document.createElement("li");
    firstLi.className = "page-item";
    firstLi.innerHTML = `<button class="page-link" onclick="changePage(1)">1</button>`;
    paginationElement.appendChild(firstLi);

    if (startPage > 2) {
      const ellipsisLi = document.createElement("li");
      ellipsisLi.className = "page-item disabled";
      ellipsisLi.innerHTML = `<span class="page-link">...</span>`;
      paginationElement.appendChild(ellipsisLi);
    }
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    const pageLi = document.createElement("li");
    pageLi.className = `page-item ${i === currentPage ? "active" : ""}`;
    pageLi.innerHTML = `<button class="page-link" onclick="changePage(${i})">${i}</button>`;
    paginationElement.appendChild(pageLi);
  }

  // Last page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      const ellipsisLi = document.createElement("li");
      ellipsisLi.className = "page-item disabled";
      ellipsisLi.innerHTML = `<span class="page-link">...</span>`;
      paginationElement.appendChild(ellipsisLi);
    }

    const lastLi = document.createElement("li");
    lastLi.className = "page-item";
    lastLi.innerHTML = `<button class="page-link" onclick="changePage(${totalPages})">${totalPages}</button>`;
    paginationElement.appendChild(lastLi);
  }

  // Next button
  const nextLi = document.createElement("li");
  nextLi.className = `page-item ${
    currentPage === totalPages ? "disabled" : ""
  }`;
  nextLi.innerHTML = `<button class="page-link" onclick="changePage(${
    currentPage + 1
  })" ${currentPage === totalPages ? "disabled" : ""}>Next</button>`;
  paginationElement.appendChild(nextLi);
}

// Change page
function changePage(page) {
  currentPage = page;
  updateProductsDisplay();

  // Scroll to top of products section
  contentElement.scrollIntoView({ behavior: "smooth" });
}

// Open product details page
function openProductDetails(productId) {
  window.location.href = `details.html?id=${productId}`;
}

// This local addToCart function is deprecated and not used anymore
// We now use window.componentUtils.addToCart from components.js
// Keeping this function commented for reference
/*
function addToCart(event, productId) {
  // Prevent event bubbling to parent (which would navigate to product details)
  event.stopPropagation();

  // Find the product
  const product = allProducts.find((p) => p.id === productId);

  if (!product) {
    console.error("Product not found:", productId);
    return;
  }

  // Check if product is in stock
  if (product.stock <= 0) {
    showToast("Product is out of stock", "error");
    return;
  }

  // Get existing cart from localStorage
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Check if product is already in cart
  const existingProductIndex = cart.findIndex((item) => item.id === productId);

  if (existingProductIndex >= 0) {
    // Increment quantity
    cart[existingProductIndex].quantity += 1;
  } else {
    // Add new product to cart
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image:
        product.images && product.images.length > 0
          ? product.images[0]
          : "./images/placeholder.png",
      quantity: 1,
    });
  }

  // Save updated cart to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Show success message
  showToast(`${product.name} added to cart!`, "success");
}
*/

// Use the showToast function from components.js instead of defining it here
// This ensures consistency across the application
function showToast(message, type = "info") {
  // Use the componentUtils.showToast if available, otherwise fallback to local implementation
  if (window.componentUtils && window.componentUtils.showToast) {
    window.componentUtils.showToast(message, type);
    return;
  }
  
  // Fallback implementation (should not be needed if components.js is loaded properly)
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container position-fixed bottom-0 end-0 p-3";
    document.body.appendChild(toastContainer);
  }

  const toastId = `toast-${Date.now()}`;
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-white bg-${
    type === "success" ? "success" : type === "error" ? "danger" : "primary"
  }`;
  toast.id = toastId;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  toastContainer.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
  bsToast.show();
  toast.addEventListener("hidden.bs.toast", () => {
    toast.remove();
  });
}

// Handle search form submission
function handleSearch(event) {
  event.preventDefault();
  const searchInput = document.querySelector(".navbar-search");
  const searchTerm = searchInput.value.trim();

  if (searchTerm) {
    window.location.href = `search.html?q=${encodeURIComponent(searchTerm)}`;
  }
}

// Function to initialize the page
function initializePage() {
  // Load category data
  loadCategoryData();

  // Setup event listeners for filters
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", applySorting);
  }

  const inStockCheckbox = document.getElementById("in-stock-only");
  if (inStockCheckbox) {
    inStockCheckbox.addEventListener("change", applyFilters);
  }

  const onSaleCheckbox = document.getElementById("on-sale-only");
  if (onSaleCheckbox) {
    onSaleCheckbox.addEventListener("change", applyFilters);
  }

  const minPriceInput = document.getElementById("min-price");
  const maxPriceInput = document.getElementById("max-price");
  if (minPriceInput && maxPriceInput) {
    minPriceInput.addEventListener("change", applyPriceFilter);
    maxPriceInput.addEventListener("change", applyPriceFilter);
  }

  const resetButton = document.getElementById("reset-filters");
  if (resetButton) {
    resetButton.addEventListener("click", resetFilters);
  }
}

// Initialize page
document.addEventListener("DOMContentLoaded", initializePage);

// Local implementation of addToCart function
async function addToCart(productId, quantity = 1) {
  const token = localStorage.getItem('token');
  if (!token) {
    showToast('Please login to add items to cart.', 'error');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1200);
    return;
  }
  try {
    const response = await fetch('http://localhost:3030/cart/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity })
    });
    const data = await response.json();
    if (response.ok && (data.statusCode === 201 || data.statusCode === 200)) {
      showToast('Product added to cart successfully!', 'success');
    } else if (response.status === 401) {
      showToast('Session expired. Please login again.', 'error');
      setTimeout(() => {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
      }, 1200);
    } else {
      showToast(data.message || 'Failed to add to cart.', 'error');
    }
  } catch (err) {
    showToast('Network error. Please try again.', 'error');
  }
}

// Local implementation of showToast function
function showToast(message, type = 'info') {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'}`;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');

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
  toastEl.addEventListener('hidden.bs.toast', () => {
    toastEl.remove();
  });
}

// Robust handler for add to cart functionality
function handleAddToCart(event, productId) {
  if (event && typeof event.stopPropagation === 'function') {
    event.stopPropagation();
  }
  if (!productId) {
    showToast("Product information not available", "error");
    return;
  }
  // Use the local addToCart function
  addToCart(productId, 1);
}
