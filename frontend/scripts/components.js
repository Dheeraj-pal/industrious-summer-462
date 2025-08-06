/**
 * Component loader script
 * This script handles loading HTML components like navbar and footer
 */

// Function to load HTML component into a container
async function loadComponent(componentPath, containerId) {
  try {
    const response = await fetch(componentPath);
    if (!response.ok) {
      throw new Error(`Failed to load component: ${componentPath}`);
    }
    const html = await response.text();
    document.getElementById(containerId).innerHTML = html;

    // Dispatch an event to notify that the component has been loaded
    const event = new CustomEvent("componentLoaded", {
      detail: { id: containerId },
    });
    document.dispatchEvent(event);
  } catch (error) {
    console.error("Error loading component:", error);
  }
}

// Function to initialize all components
function initComponents() {
  return new Promise((resolve) => {
    const promises = [];

    // Load navbar if navbar-container exists
    const navbarContainer = document.getElementById("navbar-container");
    if (navbarContainer) {
      promises.push(
        loadComponent("components/navbar.html", "navbar-container")
      );
    }

    // Load footer if footer-container exists
    const footerContainer = document.getElementById("footer-container");
    if (footerContainer) {
      promises.push(
        loadComponent("components/footer.html", "footer-container")
      );
    }

    // If no components to load, resolve immediately
    if (promises.length === 0) {
      resolve();
      return;
    }

    // Wait for all components to load
    Promise.all(promises)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        console.error("Error loading components:", error);
        resolve(); // Resolve anyway to continue with the app
      });
  });
}

// Initialize components when DOM is loaded
document.addEventListener("DOMContentLoaded", initComponents);

// Re-initialize event handlers after components are loaded
document.addEventListener("componentLoaded", (event) => {
  if (event.detail.id === "navbar-container") {
    // Reinitialize navbar-specific event handlers
    initNavbarHandlers(event);
  } else if (event.detail.id === "footer-container") {
    // Reinitialize footer-specific event handlers
    initFooterHandlers();
  }
});

// Initialize navbar event handlers
function initNavbarHandlers(e) {
  // Check authentication status
  checkAuthStatus();

  // Setup search form
  const searchForm = document.querySelector("form.d-flex");
  if (searchForm) {
    searchForm.addEventListener("submit", handleSearch);
  }
  
  // Setup search functionality
  setupSearchFunctionality();
  
  // Setup signin dropdown functionality
  setupSigninDropdown();
  
  // Setup cart functionality
  setupCartFunctionality();
  
  // Initialize search functionality
  initSearch();
}

// Setup search functionality
function setupSearchFunctionality() {
  const searchIcon = document.querySelector(".search-icon-container");
  const searchContainer = document.querySelector(".search-container");
  const navbarCollapse = document.querySelector(".navbar-collapse");
  
  if (searchIcon && searchContainer && navbarCollapse) {
    searchIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      
      // For mobile view, ensure navbar is expanded to show search
      if (window.innerWidth < 992) {
        navbarCollapse.classList.add("show");
        searchContainer.classList.add("active");
        navbarCollapse.classList.add("search-active");
        
        // Clone the search input and append it to the navbar collapse
        const mobileSearchContainer = document.querySelector(".mobile-search-container");
        if (!mobileSearchContainer) {
          const clonedContainer = searchContainer.cloneNode(true);
          clonedContainer.classList.add("mobile-search-container");
          clonedContainer.classList.add("d-block");
          clonedContainer.classList.remove("d-none");
          clonedContainer.style.width = "100%";
          clonedContainer.style.margin = "10px 0";
          navbarCollapse.prepend(clonedContainer);
          
          // Focus on the cloned search input
          const searchInput = clonedContainer.querySelector("input");
          if (searchInput) {
            setTimeout(() => searchInput.focus(), 100);
            
            // Ensure the search input works
            searchInput.addEventListener("input", (e) => {
              const originalInput = searchContainer.querySelector("input");
              if (originalInput) {
                originalInput.value = e.target.value;
                originalInput.dispatchEvent(new Event("input"));
              }
            });
          }
        }
      } else {
        // Desktop behavior
        searchContainer.classList.toggle("active");
        
        // Focus on search input when shown
        if (searchContainer.classList.contains("active")) {
          const searchInput = searchContainer.querySelector("input");
          if (searchInput) {
            setTimeout(() => searchInput.focus(), 100);
          }
        }
      }
    });
    
    // Close search when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest("form.d-flex") && 
          !e.target.closest(".search-icon-container") && 
          !e.target.closest(".mobile-search-container")) {
        searchContainer.classList.remove("active");
        navbarCollapse.classList.remove("search-active");
        
        // Remove mobile search container if it exists
        const mobileSearchContainer = document.querySelector(".mobile-search-container");
        if (mobileSearchContainer) {
          mobileSearchContainer.remove();
        }
      }
    });
  }
}

// Setup signin dropdown functionality
function setupSigninDropdown() {
  const signinDropdown = document.querySelector(".signin-dropdown");
  const mobileUserIcon = document.getElementById("mobile-user-icon");
  const signinTrigger = document.querySelector(".signin-trigger");
  
  if (!signinDropdown) return;
  
  // Setup mobile user icon
  if (mobileUserIcon) {
    mobileUserIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      
      // For mobile view, ensure navbar is expanded to show dropdown
      const navbarCollapse = document.querySelector(".navbar-collapse");
      if (window.innerWidth < 992 && navbarCollapse) {
        navbarCollapse.classList.add("show");
        
        // Clone the signin dropdown and append it to the navbar collapse
        let mobileSigninDropdown = document.querySelector(".mobile-signin-dropdown");
        
        if (!mobileSigninDropdown) {
          // Create a container for the mobile signin dropdown
          const mobileSigninContainer = document.createElement("div");
          mobileSigninContainer.className = "mobile-signin-dropdown mt-3 mb-3";
          mobileSigninContainer.style.width = "100%";
          
          // Clone the signin dropdown content
          const clonedDropdown = signinDropdown.cloneNode(true);
          clonedDropdown.classList.add("active");
          clonedDropdown.style.position = "static";
          clonedDropdown.style.display = "block";
          clonedDropdown.style.width = "100%";
          clonedDropdown.style.boxShadow = "none";
          clonedDropdown.style.border = "none";
          clonedDropdown.style.margin = "0";
          
          mobileSigninContainer.appendChild(clonedDropdown);
          navbarCollapse.appendChild(mobileSigninContainer);
          
          // Add event listeners to the cloned dropdown links
          const links = clonedDropdown.querySelectorAll("a");
          links.forEach(link => {
            link.addEventListener("click", (e) => {
              const href = link.getAttribute("href");
              if (href && href !== "javascript:void(0);") {
                window.location.href = href;
              }
            });
          });
        } else {
          // Toggle visibility if already exists
          mobileSigninDropdown.remove();
        }
      } else {
        // Desktop behavior - toggle the dropdown
        signinDropdown.classList.toggle("active");
        
        // Position the dropdown near the user icon
        if (signinDropdown.classList.contains("active")) {
          const rect = mobileUserIcon.getBoundingClientRect();
          signinDropdown.style.position = "fixed";
          signinDropdown.style.top = (rect.bottom + 10) + "px";
          signinDropdown.style.right = (window.innerWidth - rect.right) + "px";
          signinDropdown.style.zIndex = "1050";
        }
      }
    });
  }
  
  // Setup desktop signin trigger
  if (signinTrigger) {
    signinTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      signinDropdown.classList.toggle("active");
    });
  }
  
  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".user-icon-container") && 
        !e.target.closest(".signin-trigger") && 
        !e.target.closest(".signin-dropdown") && 
        !e.target.closest(".mobile-signin-dropdown") && 
        signinDropdown.classList.contains("active")) {
      signinDropdown.classList.remove("active");
      
      // Remove mobile signin dropdown if it exists
      const mobileSigninDropdown = document.querySelector(".mobile-signin-dropdown");
      if (mobileSigninDropdown) {
        mobileSigninDropdown.remove();
      }
    }
  });
}

// Setup cart functionality
function setupCartFunctionality() {
  // Setup cart links (both desktop and mobile)
  const cartLogo = document.getElementById("cartlogo");
  const mobileCartIcon = document.querySelector(".cart-icon-container");
  
  const handleCartClick = () => {
    //check user auth status
    if (!localStorage.getItem("token")) {
      window.location.href = "login.html";
      return;
    }
    window.location.href = "cart.html";
  };
  
  if (cartLogo) {
    cartLogo.addEventListener("click", handleCartClick);
  }
  
  if (mobileCartIcon) {
    mobileCartIcon.addEventListener("click", handleCartClick);
  }
}

// Initialize footer event handlers
function initFooterHandlers() {
  // Add any footer-specific event handlers here
}

// Check authentication status
function checkAuthStatus() {
  const token = localStorage.getItem("token");
  const inoutbtn = document.getElementById("inoutbtn");
  const signinLogoutItem = document.getElementById("signin-logout-item");
  const signinLogoutLink = document.getElementById("signin-logout-link");
  const savedAddressesItem = document.getElementById("saved-addresses-item");
  
  if (!inoutbtn) return;
  
  if (token) {
    // Update dropdown items
    if (signinLogoutLink) {
      signinLogoutLink.textContent = "Logout";
      signinLogoutLink.href = "#";
      signinLogoutLink.onclick = function(e) {
        e.preventDefault();
        logout();
      };
    }
    
    // Show saved addresses option when logged in
    if (savedAddressesItem) {
      savedAddressesItem.style.display = "block";
    }
  } else {
    // Update dropdown items
    if (signinLogoutLink) {
      signinLogoutLink.textContent = "Sign In";
      signinLogoutLink.href = "login.html";
      signinLogoutLink.onclick = null;
    }
    
    // Hide saved addresses option when logged out
    if (savedAddressesItem) {
      savedAddressesItem.style.display = "none";
    }
  }
}

// Logout function
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  if (window.componentUtils && window.componentUtils.showToast) {
    window.componentUtils.showToast("Logged out successfully", "success");
  }
  checkAuthStatus();
  setTimeout(() => {
    window.location.href = "index.html";
  }, 500);
}

// Handle search form submission
function handleSearch(event) {
  event.preventDefault();
  const searchInput = document.querySelector(".navbar-search");
  if (!searchInput) return;

  const searchTerm = searchInput.value.trim();

  if (searchTerm) {
    window.location.href = `search.html?q=${encodeURIComponent(searchTerm)}`;
  }
}

// Show toast notification
function showToast(message, type = "info") {
  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className =
      "toast-container position-fixed bottom-0 end-0 p-3";
    document.body.appendChild(toastContainer);
  }

  // Create toast element
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

  // Initialize and show toast
  const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
  bsToast.show();

  // Remove toast after it's hidden
  toast.addEventListener("hidden.bs.toast", () => {
    toast.remove();
  });
}

// Centralized Add to Cart function
async function addToCart(productId, quantity = 1) {
  // No event.stopPropagation here!
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

// Export functions for use in other scripts
window.componentUtils = {
  checkAuthStatus,
  logout,
  handleSearch,
  showToast,
  initComponents,
  // addToCart removed to prevent duplicate API calls
};

// Also export initComponents directly for easier access
window.initComponents = initComponents;

// Explicitly set window.addToCart to undefined to prevent any global usage
window.addToCart = undefined;

// Also ensure componentUtils.addToCart is undefined to prevent any usage
window.componentUtils.addToCart = undefined;

// Search functionality implementation
function setupSearchAPI() {
  // Define search API function in window scope to avoid redeclaration
  window.searchAPI = async (query, quick = true) => {
    try {
      const response = await fetch(`http://localhost:3030/products/search?q=${encodeURIComponent(query)}&page=1&limit=10&quick=${quick}`);
      if (!response.ok) throw new Error('Search failed');
      return await response.json();
    } catch (err) {
      console.error('Search error:', err);
      return { items: [] };
    }
  };

  // Define render function in window scope
  window.renderSearchResults = (results, container) => {
    container.innerHTML = results.items.map(item => 
      '<div class="search-result-item" data-id="' + item.id + '" onclick="handleSearchResultClick(\'' + item.id + '\')">' +
        '<div class="fw-500">' + item.name + '</div>' +
        '<small  class="text-muted search-result-item-category-name">' + item.category.name + '</small>' +
      '</div>'
    ).join('');
  };
}

// Search input handling
function initSearch() {
  // Only initialize once
  if (window.searchInitialized) return;
  window.searchInitialized = true;
  
  // Setup search API if not already set up
  if (!window.searchAPI) {
    setupSearchAPI();
  }
  
  const searchInput = document.getElementById('navbarSearchInput');
  const resultsContainer = document.querySelector('.search-results');
  
  if (!searchInput || !resultsContainer) {
    console.error('Search elements not found');
    return;
  }
  
  let searchTimeout;
  
  searchInput.addEventListener('input', async (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    console.log('query',query)
    if (query.length < 2) {
      resultsContainer.classList.remove('active');
      return;
    }
    
    searchTimeout = setTimeout(async () => {
      const { items } = await window.searchAPI(query);
      resultsContainer.classList.toggle('active', items.length > 0);
      window.renderSearchResults({ items }, resultsContainer);
    }, 300);
  });

  // Handle enter key
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = e.target.value.trim();
      if (query) {
        window.location.href = `category.html?search=${encodeURIComponent(query)}&quick=false`;
      }
    }
  });

  // Hide results on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      resultsContainer.classList.remove('active');
    }
  });
}

window.handleSearchResultClick = function(productId) {
  window.location.href = 'details.html?id=' + encodeURIComponent(productId);
};
