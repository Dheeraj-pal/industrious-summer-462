$(".refresh-carousel-div").owlCarousel({
  loop: true,
  margin: 10,
  nav: true,
  dots: false,
  responsive: {
    0: {
      items: 1,
    },
    600: {
      items: 3,
    },
    1000: {
      items: 5,
    },
  },
});

let token = localStorage.getItem("token");
// console.log(token)
if(token){
    let txt = document.querySelector(".signintxt");
    txt.innerText = "Logout"
    if(txt.innerText == "Logout"){
        document.getElementById("inoutbtn").addEventListener("click", cleardata)

        function cleardata(event){
            localStorage.removeItem("token")
        }
    }
}

// Add to Cart function for index.js
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

// Toast notification function
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
