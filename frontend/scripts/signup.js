document.querySelector("form").addEventListener("submit", async function(event) {
  event.preventDefault();
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const phone = document.getElementById("phone").value.trim();

  if (!firstName || !lastName || !email || !password || !phone) {
    if (window.componentUtils && window.componentUtils.showToast) {
      window.componentUtils.showToast('All fields are required', 'error');
    } else {
      alert('All fields are required');
    }
    return;
  }

  const payload = { firstName, lastName, email, password, phone };

  try {
    const response = await fetch('http://localhost:3030/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (response.ok && data.statusCode === 201 && data.data && data.data.access_token) {
      localStorage.setItem('token', data.data.access_token);
      if (window.componentUtils && window.componentUtils.showToast) {
        window.componentUtils.showToast('Signup successful! Redirecting...', 'success');
      }
      setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    } else {
      const msg = data.message || 'Signup failed';
      if (window.componentUtils && window.componentUtils.showToast) {
        window.componentUtils.showToast(msg, 'error');
      } else {
        alert(msg);
      }
    }
  } catch (err) {
    if (window.componentUtils && window.componentUtils.showToast) {
      window.componentUtils.showToast('Network error. Please try again.', 'error');
    } else {
      alert('Network error. Please try again.');
    }
  }
});


let cart_items = JSON.parse(localStorage.getItem("cart_items")) || [];
let loginUser = JSON.parse(localStorage.getItem("loginUser")) || null;
let sumCount = 0;

let displayCartCount = () => {
  let total_cart_item = document.getElementById("total-cart-item");
  if (loginUser == null) {
    total_cart_item.innerText = sumCount;
  } else {
    if (cart_items.length > 0) {
      let elements = cart_items.filter((ele) => {
        if (loginUser.email == ele.email) return ele;
      });

      for (let i = 0; i < elements.length; i++) {
        let x = elements[i].cartItems;
        for (let j = 0; j < x.length; j++) {
          sumCount += x[j].count;
        }
      }
      total_cart_item.innerText = sumCount;
    } else {
      total_cart_item.innerText = sumCount;
    }
  }
};
displayCartCount();

