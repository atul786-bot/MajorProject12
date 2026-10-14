/**
 * TechMart Electronics — Controlled Website Automation Script
 * Provides interactive behavior for e-commerce store demonstrations
 * while maintaining 100% compatibility with automated Selenium & Healenium tests.
 */
document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById('status-message');
  const cartCountEl = document.getElementById('cart-count');
  let cartCount = 0;

  function updateCart(delta = 1) {
    cartCount = Math.max(0, cartCount + delta);
    if (cartCountEl) {
      cartCountEl.textContent = String(cartCount);
    }
  }

  function setStatus(msg, statusClass = '') {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = 'status-box ' + statusClass;
  }

  // 1. Initial Page Load Notification (Verified by TC-WEB-001)
  setStatus('Page loaded successfully. Ready for automation.', 'success');

  // 2. User Authentication (Verified by TC-WEB-002)
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

  // 3. Product Selection & Add to Cart (Verified by TC-WEB-003 and TC-WEB-004)
  const addCartBtn = document.getElementById('add-cart-button');
  if (addCartBtn) {
    addCartBtn.addEventListener('click', () => {
      const selectEl = document.getElementById('product-select');
      const selectedProduct = selectEl ? selectEl.value : '';
      if (selectedProduct) {
        updateCart(1);
        setStatus(`Added "${selectedProduct}" to shopping cart!`, 'success');
      } else {
        updateCart(1);
        setStatus('Added default product to shopping cart!', 'success');
      }
    });
  }

  // Interactive Product Card "Add to Cart" Buttons
  const cardAddButtons = document.querySelectorAll('.card-add-btn');
  cardAddButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const product = btn.getAttribute('data-product');
      const selectEl = document.getElementById('product-select');
      if (selectEl && product) {
        selectEl.value = product;
      }
      if (addCartBtn) {
        addCartBtn.click();
      }
    });
  });

  // 4. Catalog Search (Verified by TC-WEB-005)
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

  // 5. Checkout & Order Placement (Verified by TC-WEB-006)
  const checkoutBtn = document.getElementById('checkout-button');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      const nameInput = document.getElementById('checkout-name');
      const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Customer';
      setStatus(`Order placed successfully for ${name}! Order #ORD-${Math.floor(1000 + Math.random() * 9000)}`, 'success');
      cartCount = 0;
      if (cartCountEl) {
        cartCountEl.textContent = '0';
      }
    });
  }

  // 6. Healenium Self-Healing Demonstration Target (Verified by TC-WEB-007)
  const healedCartBtn = document.getElementById('add-cart-button-new') || document.getElementById('add-cart-button-old');
  if (healedCartBtn) {
    healedCartBtn.addEventListener('click', () => {
      updateCart(1);
      setStatus('Action triggered via Healed Target Element (#add-cart-button-new)!', 'healing');
    });
  }
});
