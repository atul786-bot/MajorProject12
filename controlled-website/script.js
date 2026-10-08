document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById('status-message');

  function setStatus(msg, statusClass = '') {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = 'status-box ' + statusClass;
  }

  // Initial load notification
  setStatus('Page loaded successfully. Ready for automation.', 'success');

  // 1. Login Action
  const loginBtn = document.getElementById('login-button');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      const usernameInput = document.getElementById('username');
      const username = usernameInput ? usernameInput.value.trim() : '';
      if (username) {
        setStatus(`Logged in successfully as: ${username}`, 'success');
      } else {
        setStatus('Logged in successfully with default user', 'success');
      }
    });
  }

  // 2. Product Selection & Add to Cart
  const addCartBtn = document.getElementById('add-cart-button');
  if (addCartBtn) {
    addCartBtn.addEventListener('click', () => {
      const selectEl = document.getElementById('product-select');
      const selectedProduct = selectEl ? selectEl.value : '';
      if (selectedProduct) {
        setStatus(`Added "${selectedProduct}" to shopping cart!`, 'success');
      } else {
        setStatus('Added default product to shopping cart!', 'success');
      }
    });
  }

  // 3. Search Catalog
  const searchBtn = document.getElementById('search-button');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const searchInput = document.getElementById('search-input');
      const resultsBox = document.getElementById('search-results');
      const query = searchInput ? searchInput.value.trim() : '';

      if (query) {
        const msg = `Found 3 items matching "${query}"`;
        if (resultsBox) resultsBox.textContent = msg;
        setStatus(`Search completed for: "${query}"`, 'success');
      } else {
        if (resultsBox) resultsBox.textContent = 'Please enter a search keyword.';
        setStatus('Search query submitted (empty)', 'success');
      }
    });
  }

  // 4. Checkout Action
  const checkoutBtn = document.getElementById('checkout-button');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      const nameInput = document.getElementById('checkout-name');
      const name = nameInput ? nameInput.value.trim() : 'Customer';
      setStatus(`Order placed successfully for ${name}! Order #ORD-${Math.floor(1000 + Math.random() * 9000)}`, 'success');
    });
  }

  // 5. Healing Target Action
  const healedCartBtn = document.getElementById('add-cart-button-new') || document.getElementById('add-cart-button-old');
  if (healedCartBtn) {
    healedCartBtn.addEventListener('click', () => {
      setStatus('Action triggered via Healed Target Element (#add-cart-button-new)!', 'healing');
    });
  }
});
