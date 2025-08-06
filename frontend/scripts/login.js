document.querySelector("form").addEventListener("submit", async function(event) {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("inpass").value;

  if (!email || !password) {
    if (window.componentUtils && window.componentUtils.showToast) {
      window.componentUtils.showToast('Email and password are required', 'error');
    } else {
      alert('Email and password are required');
    }
    return;
  }

  const payload = { email, password };

  try {
    const response = await fetch('http://localhost:3030/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (response.ok && data.statusCode === 201 && data.data && data.data.access_token) {
      localStorage.setItem('token', data.data.access_token);
      if (window.componentUtils && window.componentUtils.showToast) {
        window.componentUtils.showToast('Login successful! Redirecting...', 'success');
      }
      setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    } else {
      const msg = data.message || 'Login failed';
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
