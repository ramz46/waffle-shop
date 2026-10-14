/**
 * Golden Crust: Crepe & Waffle Café
 * Main JavaScript Controller
 */

// Initialize state
const state = {
  theme: localStorage.getItem('gc_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
  dir: localStorage.getItem('gc_dir') || 'ltr',
  cart: JSON.parse(localStorage.getItem('gc_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('gc_wishlist') || '[]')
};

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initPageLoader();
  initTheme();
  initDirection();
  initNavDropdowns();
  initMobileNav();
  initCart();
  initWishlist();
  initLiveHours();
  initLucideIcons();
  initCustomizerStudio();
  initPairingMatchmaker();
  initMenuFilters();
  initIngredientModal();
  initCateringEstimator();
  initRecipeStudio();
  initTableReservation();
  initBatchCountdown();
  initIngredientExplorer();
  initPickupMode();
  initCateringOccasions();
  initScrollAnimations();
  initMobileBottomNav();
  initHeaderScroll();
  initMobileCustomizerBar();
  initPhoneInputs();
  initNameInputs();
  initAwwwardsAnimations();
  initInnerPagesAnimations();
  initFooterHomeRedirect();
});

// Initialize Lucide icons if available
function initLucideIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/* ============================================================
   0. Page Preloader / Loading Screen with Animated Logo
============================================================ */
function initPageLoader() {
  const loader = document.getElementById('page-preloader');
  if (!loader) return;

  const hideLoader = () => {
    if (loader.classList.contains('loaded')) return;
    loader.classList.add('loaded');
    setTimeout(() => {
      if (loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 500);
  };

  if (document.readyState === 'complete') {
    setTimeout(hideLoader, 150);
  } else {
    window.addEventListener('load', () => {
      setTimeout(hideLoader, 150);
    });
    // Fallback safety timeout so it never hangs
    setTimeout(hideLoader, 600);
  }
}

/* ============================================================
   1. Theme Management (Light / Dark)
============================================================ */
function initTheme() {
  const savedTheme = localStorage.getItem('gc_theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  applyTheme(initialTheme);

  // Auto-detect system theme updates if the user hasn't explicitly set a preference
  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      if (!localStorage.getItem('gc_theme')) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  } catch (e) {}

  // Attach event listeners to all theme toggle buttons
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('gc_theme', newTheme);
      applyTheme(newTheme);
      showToast(newTheme === 'dark' ? 'Dark mode enabled 🌙' : 'Light mode enabled ☀️', 'info');
    });
  });
}

function applyTheme(theme) {
  state.theme = theme;
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  }
  updateThemeIcons();
}

function updateThemeIcons() {
  const isDark = state.theme === 'dark';
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    const sunIcon = btn.querySelector('.sun-icon');
    const moonIcon = btn.querySelector('.moon-icon');
    if (sunIcon && moonIcon) {
      if (isDark) {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'inline-flex';
        btn.setAttribute('title', 'Dark Mode Active (Click to switch to Light Mode)');
        btn.setAttribute('aria-label', 'Switch to Light Mode');
      } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
        sunIcon.style.display = 'inline-flex';
        moonIcon.style.display = 'none';
        btn.setAttribute('title', 'Light Mode Active (Click to switch to Dark Mode)');
        btn.setAttribute('aria-label', 'Switch to Dark Mode');
      }
    } else if (btn.textContent && btn.textContent.includes('Theme')) {
      btn.innerHTML = isDark ? 'Theme 🌙 (Dark)' : 'Theme ☀️ (Light)';
    }
  });
}

/* ============================================================
   2. RTL Management
============================================================ */
function initDirection() {
  document.documentElement.setAttribute('dir', state.dir);
  updateRTLButtons();

  // Strip conflicting initial Tailwind translate classes on load
  document.querySelectorAll('#cart-drawer, #mobile-menu-drawer, .side-drawer').forEach(drawer => {
    drawer.classList.remove('translate-x-full', '-translate-x-full');
  });

  document.querySelectorAll('.rtl-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Temporarily disable all CSS transitions across DOM to completely prevent flicker
      document.documentElement.classList.add('disable-transitions');

      const currentDir = document.documentElement.getAttribute('dir') || 'ltr';
      const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
      state.dir = newDir;
      document.documentElement.setAttribute('dir', newDir);
      localStorage.setItem('gc_dir', newDir);
      updateRTLButtons();

      // Ensure any lingering Tailwind translate classes are cleaned up
      document.querySelectorAll('#cart-drawer, #mobile-menu-drawer, .side-drawer').forEach(drawer => {
        drawer.classList.remove('translate-x-full', '-translate-x-full');
      });

      // Force synchronous reflow so direction is applied with zero transitions
      void document.documentElement.offsetHeight;

      // Re-enable transitions cleanly on the next paint cycle
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.documentElement.classList.remove('disable-transitions');
        });
      });

      showToast(newDir === 'rtl' ? 'RTL Layout Active (العربية / עברית)' : 'LTR Layout Active', 'info');
    });
  });
}

function updateRTLButtons() {
  const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
  document.querySelectorAll('.rtl-toggle-btn span.rtl-text').forEach(el => {
    el.textContent = isRtl ? 'LTR' : 'RTL';
  });
}

/* ============================================================
   2.5 Navigation Dropdowns (Home Experience Switcher)
============================================================ */
function initNavDropdowns() {
  const containers = document.querySelectorAll('.dropdown-home-container');
  if (!containers.length) return;

  containers.forEach(container => {
    const toggleBtn = container.querySelector('.dropdown-toggle-btn');
    const menu = container.querySelector('.dropdown-home-menu');
    if (!toggleBtn) return;

    const toggle = () => {
      const isOpen = container.classList.contains('is-open');
      closeAllNavDropdowns();
      if (!isOpen) {
        container.classList.add('is-open');
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
    };

    // Click & Touch Toggle on Button
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggle();
    });

    // Handle Link Navigation inside Dropdown - Immediate & Reliable
    if (menu) {
      menu.querySelectorAll('.dropdown-home-item').forEach(link => {
        const navigateToPage = (e) => {
          e.stopPropagation();
          const href = link.getAttribute('href');
          if (href) {
            closeAllNavDropdowns();
            window.location.href = href;
          }
        };

        link.addEventListener('click', navigateToPage);
        link.addEventListener('touchend', (e) => {
          e.preventDefault();
          navigateToPage(e);
        });
      });
    }
  });

  function closeAllNavDropdowns() {
    containers.forEach(c => {
      c.classList.remove('is-open');
      const b = c.querySelector('.dropdown-toggle-btn');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }

  // Close when clicking or touching outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-home-container')) {
      closeAllNavDropdowns();
    }
  });

  document.addEventListener('touchend', (e) => {
    if (!e.target.closest('.dropdown-home-container')) {
      closeAllNavDropdowns();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllNavDropdowns();
    }
  });
}

/* ============================================================
   3. Mobile Navigation Drawer
============================================================ */
function initMobileNav() {
  const openBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('mobile-menu-close');
  const drawer = document.getElementById('mobile-menu-drawer');
  const backdrop = document.getElementById('mobile-menu-backdrop');

  if (!drawer) return;

  drawer.classList.remove('translate-x-full', '-translate-x-full');

  const openDrawer = () => {
    drawer.classList.add('is-open');
    drawer.classList.remove('translate-x-full', '-translate-x-full');
    if (backdrop) backdrop.classList.remove('opacity-0', 'pointer-events-none');
    document.body.classList.add('overflow-hidden');
    if (window.lenisInstance) window.lenisInstance.stop();
  };

  const closeDrawer = () => {
    drawer.classList.remove('is-open', 'translate-x-full', '-translate-x-full');
    if (backdrop) backdrop.classList.add('opacity-0', 'pointer-events-none');
    document.body.classList.remove('overflow-hidden');
    if (window.lenisInstance) window.lenisInstance.start();
  };

  if (openBtn) openBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
}

/* ============================================================
   4. Cart Management & Drawer
============================================================ */
function initCart() {
  updateCartUI();

  // Add to Cart Buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.add-to-cart-btn');
    if (btn) {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = parseFloat(btn.getAttribute('data-price') || '0');
      const img = btn.getAttribute('data-img');

      addToCart({ id, name, price, img });
    }
  });

  // Cart Drawer open/close listeners
  const openCartBtn = document.querySelectorAll('.open-cart-btn');
  const closeCartBtn = document.getElementById('close-cart-btn');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-backdrop');

  if (cartDrawer) {
    cartDrawer.classList.remove('translate-x-full', '-translate-x-full');
  }

  const openDrawer = () => {
    if (!cartDrawer) return;
    const mobileDrawer = document.getElementById('mobile-menu-drawer');
    const mobileBackdrop = document.getElementById('mobile-menu-backdrop');
    if (mobileDrawer && mobileDrawer.classList.contains('is-open')) {
      mobileDrawer.classList.remove('is-open', 'translate-x-full', '-translate-x-full');
      if (mobileBackdrop) mobileBackdrop.classList.add('opacity-0', 'pointer-events-none');
    }
    cartDrawer.classList.add('is-open');
    cartDrawer.classList.remove('translate-x-full', '-translate-x-full');
    if (cartBackdrop) cartBackdrop.classList.remove('opacity-0', 'pointer-events-none');
    document.body.classList.add('overflow-hidden');
    if (window.lenisInstance) window.lenisInstance.stop();
  };

  const closeDrawer = () => {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('is-open', 'translate-x-full', '-translate-x-full');
    if (cartBackdrop) cartBackdrop.classList.add('opacity-0', 'pointer-events-none');
    document.body.classList.remove('overflow-hidden');
    if (window.lenisInstance) window.lenisInstance.start();
  };

  openCartBtn.forEach(btn => btn.addEventListener('click', openDrawer));
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeDrawer);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeDrawer);

  // Close open drawers with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const mobileDrawer = document.getElementById('mobile-menu-drawer');
      const mobileBackdrop = document.getElementById('mobile-menu-backdrop');
      if (mobileDrawer && mobileDrawer.classList.contains('is-open')) {
        mobileDrawer.classList.remove('is-open', 'translate-x-full', '-translate-x-full');
        if (mobileBackdrop) mobileBackdrop.classList.add('opacity-0', 'pointer-events-none');
        document.body.classList.remove('overflow-hidden');
        if (window.lenisInstance) window.lenisInstance.start();
      }
      if (cartDrawer && cartDrawer.classList.contains('is-open')) {
        cartDrawer.classList.remove('is-open', 'translate-x-full', '-translate-x-full');
        if (cartBackdrop) cartBackdrop.classList.add('opacity-0', 'pointer-events-none');
        document.body.classList.remove('overflow-hidden');
        if (window.lenisInstance) window.lenisInstance.start();
      }
    }
  });

  // Cart item remove / adjust quantity
  document.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.remove-cart-item');
    if (removeBtn) {
      const id = removeBtn.getAttribute('data-id');
      removeFromCart(id);
    }

    const qtyInc = e.target.closest('.qty-inc');
    if (qtyInc) {
      const id = qtyInc.getAttribute('data-id');
      updateItemQty(id, 1);
    }

    const qtyDec = e.target.closest('.qty-dec');
    if (qtyDec) {
      const id = qtyDec.getAttribute('data-id');
      updateItemQty(id, -1);
    }
  });

  // Checkout button
  const checkoutBtn = document.getElementById('cart-checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (state.cart.length === 0) {
        showToast('Your box is empty! Add delicious items first.', 'warning');
        return;
      }
      showToast('Order confirmed! Fresh batter is heating up! 🧇✨', 'success');
      state.cart = [];
      saveCart();
      updateCartUI();
      closeDrawer();
    });
  }
}

function addToCart(item) {
  const existing = state.cart.find(i => i.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    state.cart.push({ ...item, qty: 1 });
  }
  saveCart();
  updateCartUI();

  // Trigger bounce animation on cart badges
  document.querySelectorAll('.cart-count-badge').forEach(badge => {
    badge.classList.remove('badge-pop');
    void badge.offsetWidth; // Force DOM reflow
    badge.classList.add('badge-pop');
  });

  showToast(`Added ${item.name} to your box! 🍓`, 'success');
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  saveCart();
  updateCartUI();
}

function updateItemQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  if (item) {
    item.qty += delta;
    if (item.qty <= 0) {
      removeFromCart(id);
      return;
    }
  }
  saveCart();
  updateCartUI();
}

function saveCart() {
  localStorage.setItem('gc_cart', JSON.stringify(state.cart));
}

function updateCartUI() {
  const totalCount = state.cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Update badges
  document.querySelectorAll('.cart-count-badge').forEach(el => {
    el.textContent = totalCount;
    if (totalCount > 0) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });

  // Update cart drawer items container
  const itemsContainer = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('cart-subtotal');
  const taxEl = document.getElementById('cart-tax');
  const totalEl = document.getElementById('cart-total');

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (taxEl) taxEl.textContent = `$${(subtotal * 0.08).toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${(subtotal * 1.08).toFixed(2)}`;

  // Floating Cart Bar controller (for menu & express page)
  const floatingBar = document.getElementById('floating-cart-bar');
  const floatingTotal = document.getElementById('floating-cart-total');
  if (floatingTotal) floatingTotal.textContent = `$${(subtotal * 1.08).toFixed(2)}`;
  if (floatingBar) {
    if (totalCount > 0) {
      floatingBar.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-10');
      floatingBar.classList.add('opacity-100', 'translate-y-0');
    } else {
      floatingBar.classList.add('opacity-0', 'pointer-events-none', 'translate-y-10');
      floatingBar.classList.remove('opacity-100', 'translate-y-0');
    }
  }

  if (itemsContainer) {
    if (state.cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="py-12 text-center text-gray-500 dark:text-dark-muted">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-honey/10 dark:bg-dark-border flex items-center justify-center text-2xl">
            🧇
          </div>
          <p class="font-medium">Your dessert box is empty</p>
          <p class="text-sm mt-1">Explore our crepes & golden waffles!</p>
        </div>
      `;
    } else {
      itemsContainer.innerHTML = state.cart.map(item => `
        <div class="flex items-center gap-3 p-3 bg-cream dark:bg-dark-surface rounded-xl border border-amber/15 dark:border-dark-border">
          <img src="${item.img || 'img/menu/belgian_berry_waffle.jpg'}" alt="${item.name}" class="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-sm text-espresso dark:text-dark-text truncate">${item.name}</h4>
            <div class="text-xs text-amber dark:text-dark-gold font-bold mt-0.5">$${(item.price * item.qty).toFixed(2)}</div>
            <div class="flex items-center gap-2 mt-1">
              <button data-id="${item.id}" class="qty-dec w-6 h-6 rounded bg-honey/20 dark:bg-dark-border hover:bg-honey/30 text-xs flex items-center justify-center font-bold">−</button>
              <span class="text-xs font-semibold px-1">${item.qty}</span>
              <button data-id="${item.id}" class="qty-inc w-6 h-6 rounded bg-honey/20 dark:bg-dark-border hover:bg-honey/30 text-xs flex items-center justify-center font-bold">+</button>
            </div>
          </div>
          <button data-id="${item.id}" class="remove-cart-item text-gray-400 hover:text-berry p-1" title="Remove">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      `).join('');
    }
  }
}

/* ============================================================
   4.5. Wishlist Management
============================================================ */
function initWishlist() {
  // Ensure every menu card has an interactive wishlist button
  document.querySelectorAll('.food-card, .menu-card').forEach(card => {
    const imgContainer = card.querySelector('.relative.overflow-hidden');
    if (imgContainer && !imgContainer.querySelector('.wishlist-btn')) {
      const addBtn = card.querySelector('.add-to-cart-btn') || card.querySelector('.inspect-item-btn');
      const id = card.getAttribute('data-id') || addBtn?.getAttribute('data-id') || addBtn?.getAttribute('data-name')?.toLowerCase().replace(/\s+/g, '-') || 'dish-' + Math.random().toString(36).substr(2, 5);

      const wishBtn = document.createElement('button');
      wishBtn.type = 'button';
      wishBtn.className = 'wishlist-btn';
      wishBtn.setAttribute('data-id', id);
      wishBtn.setAttribute('aria-label', 'Add to Wishlist');
      wishBtn.innerHTML = '<svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
      imgContainer.appendChild(wishBtn);
    }
  });

  updateWishlistUI();

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.wishlist-btn');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    const id = btn.getAttribute('data-id') || btn.closest('[data-id]')?.getAttribute('data-id') || 'item-fav';
    const index = state.wishlist.indexOf(id);

    if (index > -1) {
      state.wishlist.splice(index, 1);
      btn.classList.remove('is-active');
      btn.setAttribute('aria-label', 'Add to Wishlist');
      showToast('Removed from Wishlist 🤍', 'info');
    } else {
      state.wishlist.push(id);
      btn.classList.add('is-active');
      btn.setAttribute('aria-label', 'Remove from Wishlist');
      showToast('Saved to Wishlist ❤️', 'success');
      btn.classList.add('scale-125');
      setTimeout(() => btn.classList.remove('scale-125'), 250);
    }
    localStorage.setItem('gc_wishlist', JSON.stringify(state.wishlist));
    updateWishlistUI();
  });
}

function updateWishlistUI() {
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    const id = btn.getAttribute('data-id') || btn.closest('[data-id]')?.getAttribute('data-id');
    if (id && state.wishlist.includes(id)) {
      btn.classList.add('is-active');
      btn.setAttribute('aria-label', 'Remove from Wishlist');
    } else {
      btn.classList.remove('is-active');
      btn.setAttribute('aria-label', 'Add to Wishlist');
    }
  });
}

/* ============================================================
   5. Live Hours Indicator
============================================================ */
function initLiveHours() {
  const badgeContainer = document.querySelectorAll('.live-hours-status');
  if (badgeContainer.length === 0) return;

  const now = new Date();
  const currentHour = now.getHours();
  // Open 7:30 to 22:00 (10 PM)
  const isOpen = currentHour >= 7 && currentHour < 22;

  badgeContainer.forEach(el => {
    if (isOpen) {
      el.innerHTML = `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Open Now • Fresh Bakes Serving until 10:00 PM</span>
        </span>
      `;
    } else {
      el.innerHTML = `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          <span class="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>Closed Now • Opens 7:30 AM Tomorrow</span>
        </span>
      `;
    }
  });

  // Highlight current day in table
  const dayIndex = now.getDay(); // 0 is Sunday, 1 Monday, etc.
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayRow = document.getElementById(`hours-${days[dayIndex]}`);
  if (todayRow) {
    todayRow.classList.add('bg-honey/15', 'dark:bg-dark-border', 'font-bold');
  }
}

/* ============================================================
   6. Toast Notifications
============================================================ */
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  const bgStyles = type === 'success' ? 'bg-cocoa text-cream dark:bg-dark-card dark:text-dark-text border-honey/40' :
                   type === 'warning' ? 'bg-amber-600 text-white' :
                   'bg-espresso text-cream dark:bg-dark-surface dark:text-dark-text border-dark-border';

  toast.className = `toast px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-sm font-medium ${bgStyles}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="opacity-60 hover:opacity-100 ms-auto text-sm" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ============================================================
   7. Interactive Waffle & Crepe Builder Studio
============================================================ */
function initCustomizerStudio() {
  const customizer = document.getElementById('waffle-customizer');
  if (!customizer) return;

  const baseInputs = customizer.querySelectorAll('input[name="builder-base"]');
  const drizzleInputs = customizer.querySelectorAll('input[name="builder-drizzle"]');
  const toppingInputs = customizer.querySelectorAll('input[name="builder-topping"]');
  const previewName = document.getElementById('builder-preview-name');
  const previewPrice = document.getElementById('builder-preview-price');
  const previewDesc = document.getElementById('builder-preview-desc');
  const previewImg = document.getElementById('builder-preview-img');
  const previewCal = document.getElementById('builder-preview-cal');
  const emptyOverlay = document.getElementById('builder-empty-overlay');
  const addBtn = document.getElementById('builder-add-btn');
  const mobileBarName = document.getElementById('customizer-mobile-name');
  const mobileBarPrice = document.getElementById('customizer-mobile-price');
  const mobileBarImg = document.getElementById('customizer-mobile-img');
  const mobileAddBtn = document.getElementById('customizer-mobile-add-btn');

  let currentCheckedBase = null;
  let currentCheckedDrizzle = null;

  function calculateCustom() {
    const selectedBase = customizer.querySelector('input[name="builder-base"]:checked');
    const selectedDrizzle = customizer.querySelector('input[name="builder-drizzle"]:checked');
    const selectedToppings = [];
    let toppingsPrice = 0;
    let baseCal = 0;

    customizer.querySelectorAll('input[name="builder-topping"]:checked').forEach(cb => {
      toppingsPrice += parseFloat(cb.value);
      selectedToppings.push(cb.getAttribute('data-name'));
      baseCal += 60;
    });

    let drizzlePrice = 0;
    let drizzleName = '';
    if (selectedDrizzle && selectedDrizzle.value !== '0') {
      drizzlePrice = parseFloat(selectedDrizzle.value);
      drizzleName = selectedDrizzle.getAttribute('data-name');
      baseCal += 90;
    }

    // When NO base is selected yet
    if (!selectedBase) {
      const partialPrice = drizzlePrice + toppingsPrice;
      if (previewName) previewName.textContent = 'Craft Your Custom Pastry';
      if (previewPrice) previewPrice.textContent = partialPrice > 0 ? `$${partialPrice.toFixed(2)}` : '$0.00';

      let description = 'Select your artisan dough base above, then pair with warm tap drizzle and gourmet toppings to watch your creation take shape in real-time.';
      if (drizzleName || selectedToppings.length > 0) {
        const extras = [];
        if (drizzleName) extras.push(drizzleName);
        if (selectedToppings.length > 0) extras.push(selectedToppings.join(', '));
        description = `Selected options: ${extras.join(' + ')}. Now select your artisan dough style above to complete your pastry!`;
      }
      if (previewDesc) previewDesc.textContent = description;
      if (previewCal) previewCal.textContent = baseCal > 0 ? `~${baseCal} kcal • Select dough style` : 'Select options to begin';

      if (emptyOverlay) emptyOverlay.classList.remove('hidden');
      if (previewImg) previewImg.classList.add('opacity-75');

      if (addBtn) {
        addBtn.disabled = true;
        addBtn.classList.add('opacity-70', 'cursor-not-allowed');
        addBtn.innerHTML = '<span>Select a Dough Style to Begin</span> <span>🧇</span>';
      }
      if (mobileAddBtn) {
        mobileAddBtn.disabled = true;
        mobileAddBtn.classList.add('opacity-70', 'cursor-not-allowed');
      }
      if (mobileBarName) mobileBarName.textContent = drizzleName || 'Craft Custom Pastry';
      if (mobileBarPrice) mobileBarPrice.textContent = partialPrice > 0 ? `$${partialPrice.toFixed(2)}` : '$0.00';

      return null;
    }

    // Base is selected!
    if (emptyOverlay) emptyOverlay.classList.add('hidden');
    if (previewImg) previewImg.classList.remove('opacity-75');

    const basePrice = parseFloat(selectedBase.value);
    const baseName = selectedBase.getAttribute('data-name') || 'Custom Pastry';
    const baseImg = selectedBase.getAttribute('data-img') || 'img/menu/belgian_berry_waffle.jpg';
    baseCal += parseInt(selectedBase.getAttribute('data-cal') || '380');

    const totalPrice = basePrice + drizzlePrice + toppingsPrice;

    let description = baseName;
    if (drizzleName) description += ` with ${drizzleName}`;
    if (selectedToppings.length > 0) description += ` topped with ${selectedToppings.join(', ')}`;

    if (previewName) previewName.textContent = baseName;
    if (previewPrice) previewPrice.textContent = `$${totalPrice.toFixed(2)}`;
    if (previewDesc) previewDesc.textContent = description;
    if (previewImg && baseImg) {
      if (!previewImg.src.endsWith(baseImg)) {
        previewImg.src = baseImg;
        previewImg.classList.remove('preview-pop');
        void previewImg.offsetWidth;
        previewImg.classList.add('preview-pop');
      }
    }
    if (previewCal) previewCal.textContent = `~${baseCal} kcal • Custom Handcrafted`;

    // Enable Add button
    if (addBtn) {
      addBtn.disabled = false;
      addBtn.classList.remove('opacity-70', 'cursor-not-allowed');
      addBtn.innerHTML = '<span>Add Custom Creation to Box</span> <span>🧇✨</span>';
    }
    if (mobileAddBtn) {
      mobileAddBtn.disabled = false;
      mobileAddBtn.classList.remove('opacity-70', 'cursor-not-allowed');
    }
    if (mobileBarName) mobileBarName.textContent = baseName;
    if (mobileBarPrice) mobileBarPrice.textContent = `$${totalPrice.toFixed(2)}`;
    if (mobileBarImg && baseImg) mobileBarImg.src = baseImg;

    return {
      id: `custom-${Date.now()}`,
      name: `Custom ${baseName}`,
      price: totalPrice,
      img: baseImg
    };
  }

  // Toggle selection on dough base radios
  baseInputs.forEach(input => {
    input.addEventListener('click', () => {
      if (currentCheckedBase === input) {
        input.checked = false;
        currentCheckedBase = null;
      } else {
        currentCheckedBase = input;
      }
      calculateCustom();
    });
  });

  // Toggle selection on drizzle radios
  drizzleInputs.forEach(input => {
    input.addEventListener('click', () => {
      if (currentCheckedDrizzle === input) {
        input.checked = false;
        currentCheckedDrizzle = null;
      } else {
        currentCheckedDrizzle = input;
      }
      calculateCustom();
    });
  });

  // Topping checkboxes
  toppingInputs.forEach(input => {
    input.addEventListener('change', calculateCustom);
  });

  const handleCustomAdd = () => {
    const item = calculateCustom();
    if (!item) {
      showToast('Please select a dough & iron style first! 🧇', 'info');
      const step1 = customizer.querySelector('input[name="builder-base"]')?.closest('.space-y-3');
      if (step1) {
        step1.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    addToCart(item);
    const cartDrawer = document.getElementById('cart-drawer');
    const cartBackdrop = document.getElementById('cart-backdrop');
    if (cartDrawer) {
      cartDrawer.classList.add('is-open');
      cartDrawer.classList.remove('translate-x-full', '-translate-x-full');
      if (cartBackdrop) cartBackdrop.classList.remove('opacity-0', 'pointer-events-none');
      document.body.classList.add('overflow-hidden');
    }
  };

  if (addBtn) {
    addBtn.addEventListener('click', handleCustomAdd);
  }

  if (mobileAddBtn) {
    mobileAddBtn.addEventListener('click', handleCustomAdd);
  }

  // Explicitly reset all form inputs on page load & bfcache restoration
  function forceResetCustomizer() {
    baseInputs.forEach(input => {
      input.checked = false;
      input.removeAttribute('checked');
    });
    drizzleInputs.forEach(input => {
      input.checked = false;
      input.removeAttribute('checked');
    });
    toppingInputs.forEach(input => {
      input.checked = false;
      input.removeAttribute('checked');
    });
    currentCheckedBase = null;
    currentCheckedDrizzle = null;
    calculateCustom();
  }

  forceResetCustomizer();
  window.addEventListener('pageshow', forceResetCustomizer);
}

/* ============================================================
   8. Flavor Pairing Matchmaker Quiz
============================================================ */
function initPairingMatchmaker() {
  const container = document.getElementById('pairing-matchmaker');
  if (!container) return;

  const moodBtns = container.querySelectorAll('.pairing-mood-btn');
  const pairingFoodTitle = document.getElementById('pairing-food-title');
  const pairingFoodDesc = document.getElementById('pairing-food-desc');
  const pairingDrinkTitle = document.getElementById('pairing-drink-title');
  const pairingDrinkDesc = document.getElementById('pairing-drink-desc');
  const pairingChefNote = document.getElementById('pairing-chef-note');
  const pairingPrice = document.getElementById('pairing-price');
  const pairingAddBtn = document.getElementById('pairing-add-bundle-btn');

  const pairingData = {
    sweet: {
      food: 'Belgian Berry Crown Liege Waffle',
      foodDesc: 'Torched marshmallows, organic blackberry coulis, mascarpone cream.',
      drink: 'Ethiopian Geisha Light Pour-Over',
      drinkDesc: 'Floral jasmine notes with bergamot acidity cutting through rich caramelized pearl sugar.',
      note: 'The bright berry acidity of high-altitude Geisha coffee harmonizes perfectly with warm blackberry coulis.',
      price: 19.50,
      save: 'Save $2.00',
      foodPrice: 15.75,
      drinkPrice: 5.50,
      img: 'img/menu/belgian_berry_waffle.jpg'
    },
    fruit: {
      food: 'Meyer Lemon Curd & Lavender Silk Crepe',
      foodDesc: 'Normandy buckwheat crepe with Meyer lemon reduction and lavender sugar.',
      drink: 'Botanical Hibiscus & Rose Cold Brew Tea',
      drinkDesc: 'Hand-blended Egyptian hibiscus petals, rosehips, and a splash of sparkling tonic.',
      note: 'Tart citrus essential oils create an invigorating palate cleanser alongside fragrant floral tea.',
      price: 15.50,
      save: 'Save $1.75',
      foodPrice: 12.00,
      drinkPrice: 4.75,
      img: 'img/menu/lemon_curd_crepe.jpg'
    },
    savory: {
      food: 'Smoked Salmon & Truffle Ricotta Galette',
      foodDesc: '100% Brittany buckwheat with Norwegian salmon, capers, arugula, and dill.',
      drink: 'Double Shot Cortado with Oat Foam',
      drinkDesc: 'Velvety espresso with equal parts warm textured oat milk.',
      note: 'Rich truffle oils and delicate smoked fish need the creamy balance of a nutty, balanced Cortado.',
      price: 20.00,
      save: 'Save $2.25',
      foodPrice: 17.50,
      drinkPrice: 4.50,
      img: 'img/menu/smoked_salmon_galette.jpg'
    },
    energy: {
      food: 'Hot Honey Buttermilk Chicken Waffle',
      foodDesc: 'Malted crisp waffle, crispy tenders, and habanero wildflower honey.',
      drink: 'Madagascar Vanilla Nitro Cold Brew',
      drinkDesc: 'Steeped for 18 hours and charged with micro-bubbles of pure nitrogen.',
      note: 'Spicy honey heat demands the silky, cooling creaminess of cascading nitro cold brew.',
      price: 21.50,
      save: 'Save $2.50',
      foodPrice: 18.25,
      drinkPrice: 5.25,
      img: 'img/menu/fried_chicken_waffle.jpg'
    }
  };

  let currentPairing = pairingData.sweet;

  function setMood(moodKey) {
    const data = pairingData[moodKey] || pairingData.sweet;
    currentPairing = data;

    moodBtns.forEach(b => {
      if (b.getAttribute('data-mood') === moodKey) {
        b.classList.add('bg-amber', 'text-white', 'shadow');
        b.classList.remove('bg-white', 'dark:bg-dark-card', 'text-espresso', 'dark:text-dark-text');
      } else {
        b.classList.remove('bg-amber', 'text-white', 'shadow');
        b.classList.add('bg-white', 'dark:bg-dark-card', 'text-espresso', 'dark:text-dark-text');
      }
    });

    if (pairingFoodTitle) pairingFoodTitle.textContent = data.food;
    if (pairingFoodDesc) pairingFoodDesc.textContent = data.foodDesc;
    if (pairingDrinkTitle) pairingDrinkTitle.textContent = data.drink;
    if (pairingDrinkDesc) pairingDrinkDesc.textContent = data.drinkDesc;
    if (pairingChefNote) pairingChefNote.textContent = `“${data.note}”`;
    if (pairingPrice) pairingPrice.textContent = `$${data.price.toFixed(2)}`;
  }

  moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setMood(btn.getAttribute('data-mood'));
    });
  });

  if (pairingAddBtn) {
    pairingAddBtn.addEventListener('click', () => {
      addToCart({
        id: `pairing-${Date.now()}`,
        name: `Pairing Bundle: ${currentPairing.food} + ${currentPairing.drink}`,
        price: currentPairing.price,
        img: currentPairing.img
      });
    });
  }
}

/* ============================================================
   9. Menu Filter & Live Search Controller
============================================================ */
function initMenuFilters() {
  const searchInput = document.getElementById('menu-search-input');
  const catBtns = document.querySelectorAll('.cat-btn');
  const dietBtns = document.querySelectorAll('.diet-filter-btn');
  const itemsGrid = document.getElementById('menu-items-grid');
  const countBadge = document.getElementById('menu-count-badge');

  if (!itemsGrid) return;

  const cards = itemsGrid.querySelectorAll('.menu-card');

  let activeCat = 'all';
  let activeDiet = new Set();
  let searchTerm = '';

  function applyFilters() {
    let visibleCount = 0;

    cards.forEach(card => {
      const cardCat = card.getAttribute('data-category') || '';
      const cardDiet = card.getAttribute('data-diet') || '';
      const cardText = card.textContent.toLowerCase();

      // Category check
      const matchesCat = (activeCat === 'all' || cardCat.includes(activeCat));

      // Diet check (all active diet tags must be satisfied)
      let matchesDiet = true;
      activeDiet.forEach(diet => {
        if (!cardDiet.includes(diet)) matchesDiet = false;
      });

      // Search term check
      const matchesSearch = !searchTerm || cardText.includes(searchTerm);

      if (matchesCat && matchesDiet && matchesSearch) {
        card.classList.remove('hidden');
        card.classList.add('flex');
        card.style.animation = 'none';
        void card.offsetHeight;
        const delay = Math.min(visibleCount * 35, 300);
        card.style.animation = `menuCardIn 0.42s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms both`;
        visibleCount++;
      } else {
        card.classList.add('hidden');
        card.classList.remove('flex');
        card.style.animation = 'none';
      }
    });

    if (countBadge) {
      countBadge.textContent = `Showing ${visibleCount} of ${cards.length} creations`;
    }

    const emptyState = document.getElementById('menu-empty-state');
    if (emptyState) {
      if (visibleCount === 0) {
        emptyState.classList.remove('hidden');
      } else {
        emptyState.classList.add('hidden');
      }
    }
  }

  // Category buttons
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => {
        b.classList.remove('bg-amber', 'text-white', 'shadow', 'active', 'border-amber');
        b.classList.add('bg-white', 'dark:bg-dark-card', 'text-espresso', 'dark:text-dark-text', 'border-amber/20');
      });
      btn.classList.add('bg-amber', 'text-white', 'shadow', 'active', 'border-amber');
      btn.classList.remove('bg-white', 'dark:bg-dark-card', 'text-espresso', 'dark:text-dark-text', 'border-amber/20');
      
      activeCat = btn.getAttribute('data-cat') || 'all';
      applyFilters();
    });
  });

  // Dietary filter buttons (toggleable pills)
  dietBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const diet = btn.getAttribute('data-diet');
      if (activeDiet.has(diet)) {
        activeDiet.delete(diet);
        btn.classList.remove('ring-2', 'ring-amber', 'font-black');
      } else {
        activeDiet.add(diet);
        btn.classList.add('ring-2', 'ring-amber', 'font-black');
      }
      applyFilters();
    });
  });

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      applyFilters();
    });
  }

  // Reset all filters button
  const resetBtn = document.getElementById('reset-filters-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      searchTerm = '';
      if (searchInput) searchInput.value = '';
      activeCat = 'all';
      activeDiet.clear();
      catBtns.forEach(b => {
        if (b.getAttribute('data-cat') === 'all') {
          b.classList.add('bg-amber', 'text-white', 'shadow', 'active');
          b.classList.remove('bg-white', 'dark:bg-dark-card', 'text-espresso', 'dark:text-dark-text');
        } else {
          b.classList.remove('bg-amber', 'text-white', 'shadow', 'active');
          b.classList.add('bg-white', 'dark:bg-dark-card', 'text-espresso', 'dark:text-dark-text');
        }
      });
      dietBtns.forEach(b => b.classList.remove('ring-2', 'ring-amber', 'font-black'));
      applyFilters();
    });
  }
}

/* ============================================================
   10. Ingredient & Nutrition Inspector Modal
============================================================ */
function initIngredientModal() {
  const modal = document.getElementById('ingredient-modal');
  if (!modal) return;

  const backdrop = document.getElementById('ingredient-modal-backdrop');
  const closeBtn = document.getElementById('close-ingredient-modal');
  const modalTitle = document.getElementById('modal-item-title');
  const modalStory = document.getElementById('modal-item-story');
  const modalOrigin = document.getElementById('modal-item-origin');
  const modalCal = document.getElementById('modal-item-cal');
  const modalAllergens = document.getElementById('modal-item-allergens');
  const modalImg = document.getElementById('modal-item-img');
  const modalAddBtn = document.getElementById('modal-item-add-btn');

  let currentModalItem = null;

  document.addEventListener('click', (e) => {
    const inspectBtn = e.target.closest('.inspect-item-btn');
    if (inspectBtn) {
      const title = inspectBtn.getAttribute('data-title');
      const story = inspectBtn.getAttribute('data-story');
      const origin = inspectBtn.getAttribute('data-origin');
      const cal = inspectBtn.getAttribute('data-cal');
      const allergens = inspectBtn.getAttribute('data-allergens');
      const img = inspectBtn.getAttribute('data-img');
      const price = parseFloat(inspectBtn.getAttribute('data-price') || '0');
      const id = inspectBtn.getAttribute('data-id');

      currentModalItem = { id, name: title, price, img };

      if (modalTitle) modalTitle.textContent = title;
      if (modalStory) modalStory.textContent = story;
      if (modalOrigin) modalOrigin.textContent = origin;
      if (modalCal) modalCal.textContent = `${cal} kcal`;
      if (modalAllergens) modalAllergens.textContent = allergens;
      if (modalImg && img) modalImg.src = img;

      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
      if (window.lenisInstance) window.lenisInstance.stop();
    }
  });

  const closeModal = () => {
    modal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
    if (window.lenisInstance) window.lenisInstance.start();
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  if (modalAddBtn) {
    modalAddBtn.addEventListener('click', () => {
      if (currentModalItem) {
        addToCart(currentModalItem);
        closeModal();
      }
    });
  }
}

/* ============================================================
   11. Interactive Catering Budget Estimator
============================================================ */
function initCateringEstimator() {
  const slider = document.getElementById('guest-slider');
  if (!slider) return;

  const sliderVal = document.getElementById('slider-val');
  const tierRadios = document.querySelectorAll('input[name="catering-tier"]');
  const addonEspresso = document.getElementById('addon-espresso');
  const addonFountain = document.getElementById('addon-fountain');
  const addonGelato = document.getElementById('addon-gelato');

  const estBase = document.getElementById('est-base');
  const estAddons = document.getElementById('est-addons');
  const estService = document.getElementById('est-service');
  const estTotal = document.getElementById('est-total');

  function calculateCatering() {
    const guests = parseInt(slider.value, 10);
    if (sliderVal) sliderVal.textContent = `${guests} Guests`;

    let tierPrice = 26;
    let tierName = 'Live Chef Bar';
    const checkedTier = document.querySelector('input[name="catering-tier"]:checked');
    if (checkedTier) {
      tierPrice = parseFloat(checkedTier.value);
      tierName = checkedTier.closest('label').querySelector('.tier-label')?.textContent || 'Selected Package';
    }

    const baseCost = guests * tierPrice;

    let addonsCost = 0;
    if (addonEspresso && addonEspresso.checked) addonsCost += guests * 5;
    if (addonFountain && addonFountain.checked) addonsCost += guests * 3;
    if (addonGelato && addonGelato.checked) addonsCost += guests * 4;

    const serviceCost = guests >= 100 ? 350 : (guests >= 50 ? 220 : 150);
    const totalCost = baseCost + addonsCost + serviceCost;

    if (estBase) estBase.textContent = `$${baseCost.toLocaleString()}.00`;
    if (estAddons) estAddons.textContent = `$${addonsCost.toLocaleString()}.00`;
    if (estService) estService.textContent = `$${serviceCost.toLocaleString()}.00`;
    if (estTotal) estTotal.textContent = `$${totalCost.toLocaleString()}.00`;

    // Also prefill the inquiry form if present
    const formGuests = document.getElementById('form-guest-count');
    const formPackage = document.getElementById('form-package-select');
    if (formGuests) formGuests.value = guests;
    if (formPackage) formPackage.value = tierName;
  }

  slider.addEventListener('input', calculateCatering);
  tierRadios.forEach(r => r.addEventListener('change', calculateCatering));
  [addonEspresso, addonFountain, addonGelato].forEach(addon => {
    if (addon) addon.addEventListener('change', calculateCatering);
  });

  calculateCatering();
}

/* ============================================================
   12. Recipe Studio (Serving Scaler, Timers & Checklist)
============================================================ */
function initRecipeStudio() {
  const portionBtns = document.querySelectorAll('.portion-btn');
  const timerBtns = document.querySelectorAll('.recipe-timer-btn');
  const checklistItems = document.querySelectorAll('.recipe-check-item');

  if (portionBtns.length > 0) {
    portionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const factor = parseFloat(btn.getAttribute('data-factor') || '1');
        portionBtns.forEach(b => b.classList.remove('bg-amber', 'text-white'));
        btn.classList.add('bg-amber', 'text-white');

        document.querySelectorAll('.ingredient-weight').forEach(el => {
          const base = parseFloat(el.getAttribute('data-base') || '0');
          const unit = el.getAttribute('data-unit') || 'g';
          el.textContent = `${Math.round(base * factor)} ${unit}`;
        });
        showToast(`Adjusted recipe quantities for ${btn.textContent.trim()}! 👩‍🍳`, 'info');
      });
    });
  }

  // Timer Buttons with live countdown
  timerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('timer-running')) return;

      const durationSec = parseInt(btn.getAttribute('data-seconds') || '60', 10);
      const originalText = btn.innerHTML;
      let remaining = durationSec;

      btn.classList.add('timer-running', 'bg-amber', 'text-white');

      const interval = setInterval(() => {
        remaining--;
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        btn.innerHTML = `⏱️ ${mins}:${secs < 10 ? '0' : ''}${secs} Remaining`;

        if (remaining <= 0) {
          clearInterval(interval);
          btn.innerHTML = `🔔 Timer Finished!`;
          btn.classList.remove('timer-running');
          showToast(`Ding! 🔔 ${btn.getAttribute('data-step') || 'Step'} is complete! Ready for next step.`, 'success');
          setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('bg-amber', 'text-white');
          }, 4000);
        }
      }, 1000);
    });
  });

  // Interactive Checklist
  checklistItems.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('line-through');
      item.classList.toggle('opacity-50');
    });
  });
}

/* ============================================================
   13. Interactive Table & Event Reservation
============================================================ */
function initTableReservation() {
  const form = document.getElementById('table-reservation-form');
  const modal = document.getElementById('reservation-confirmation-modal');
  const closeBtn = document.getElementById('close-reservation-modal');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const guests = form.querySelector('[name="party_size"]')?.value || '2 Guests';
    const date = form.querySelector('[name="res_date"]')?.value || 'Today';
    const time = form.querySelector('[name="res_time"]')?.value || '7:00 PM';
    const name = form.querySelector('[name="guest_name"]')?.value || 'Valued Guest';

    const modalSummary = document.getElementById('reservation-summary-text');
    if (modalSummary) {
      modalSummary.innerHTML = `
        <strong>${name}</strong>, your table for <strong>${guests}</strong> on <strong>${date} at ${time}</strong> has been secured!
        A confirmation SMS has been dispatched.
      `;
    }

    if (modal) {
      modal.classList.remove('hidden');
      document.body.classList.add('overflow-hidden');
    }

    showToast(`Table confirmed for ${name}! See you soon 🧇✨`, 'success');
    form.reset();
  });

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
    });
  }
}

/* ============================================================
   14. Live Fresh Hot Batch Countdown
============================================================ */
function initBatchCountdown() {
  const displays = document.querySelectorAll('.batch-timer-display');
  if (displays.length === 0) return;

  let totalSeconds = 14 * 60 + 25; // 14 mins 25 sec

  setInterval(() => {
    totalSeconds--;
    if (totalSeconds <= 0) {
      totalSeconds = 45 * 60; // reset to 45 mins
      showToast('🔥 Fresh Hot Liege Waffles just pulled from cast irons! Warm batch available now.', 'success');
    }

    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const formatted = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;

    displays.forEach(el => {
      el.textContent = `Next hot batch in: ${formatted}`;
    });
  }, 1000);
}

/* ============================================================
   15. Interactive Ingredient Origin Explorer (About Page)
============================================================ */
function initIngredientExplorer() {
  const tabs = document.querySelectorAll('.origin-tab-btn');
  const titleEl = document.getElementById('origin-title');
  const regionEl = document.getElementById('origin-region');
  const descEl = document.getElementById('origin-desc');
  const roleEl = document.getElementById('origin-role');
  const specEl = document.getElementById('origin-spec');
  const imgEl = document.getElementById('origin-img');

  if (!tabs.length || !titleEl) return;

  const data = {
    pearl_sugar: {
      title: 'Tienen Belgian Pearl Sugar (P4 Grade)',
      region: 'Tienen, Flemish Brabant, Belgium',
      desc: 'Formed by high-pressure compaction of pure sugar beet syrup into dense 4-6mm granules. Crucially, it does not dissolve during our 24-hour dough proofing stage.',
      role: 'Creates the signature caramelized crunch pockets that pop in the mouth while keeping the interior brioche soft, buttery, and pillowy.',
      spec: 'Caramelizes precisely at 185°C (365°F) upon contact with heavy cast iron.',
      img: 'img/menu/belgian_berry_waffle.jpg'
    },
    butter: {
      title: 'AOP Isigny Ste Mère Cultured Butter',
      region: 'Isigny-sur-Mer, Normandy, France',
      desc: 'Crafted from pasture-grazing dairy herds on nutrient-dense coastal marshlands. Cultured with slow lactic flora for 18 hours before traditional batch churning.',
      role: 'Imparts golden richness, natural hazelnut aroma, and layered tender flakiness to both sweet crepe batter and brioche waffle dough.',
      spec: '82% butterfat minimum with rich yellow carotenoids and sea-salt trace minerals.',
      img: 'img/menu/nutella_banana_crepe.jpg'
    },
    buckwheat: {
      title: 'IGP Brittany Stone-Ground Buckwheat Flour',
      region: 'Rennes, Brittany, France',
      desc: 'Authentic sarrasin grain milled between traditional granite stones. Naturally 100% gluten-free with deep slate grey flecks and earthy mineral complexity.',
      role: 'Forms the crispy, lace-edged savory galette foundation that pairs effortlessly with runny eggs, melted gruyère, and smoked salmon.',
      spec: '100% Fagopyrum esculentum, cold-aerated hydration for 12 hours.',
      img: 'img/menu/bretonne_galette.jpg'
    },
    cocoa: {
      title: 'Valrhona Guanaja 70% Dark Grand Cru Chocolate',
      region: 'Tain-l’Hermitage, Rhône Valley, France',
      desc: 'A legendary master blend of Criollo and Trinitario beans. Warm floral bitterness with lingering notes of roasted coffee and dark wild cherry.',
      role: 'Melted into velvety warm dipping wells and drizzled as ganache over freshly griddled creations.',
      spec: '70% minimum cocoa solids, tempered precisely to 31.5°C for mirror shine.',
      img: 'img/menu/valrhona_molten_bubble.jpg'
    },
    berries: {
      title: 'Watsonville Organic Heritage Berries',
      region: 'Pajaro Valley, California',
      desc: 'Harvested at peak natural brix sweetness in sunrise coastal mist. We fold whole blackberries and gently macerate Albion strawberries with lavender sugar.',
      role: 'Cuts through the buttery, rich brioche with high malic & citric acidity, balancing sweet decadence.',
      spec: 'Direct farm partnership; delivered fresh to our kitchen 4 mornings a week.',
      img: 'img/menu/brussels_strawberry_waffle.jpg'
    },
    coffee: {
      title: 'Direct-Trade Ethiopian Guji Heirloom Arabica',
      region: 'Oromia Highlands, Guji Zone, Ethiopia (2,100m elevation)',
      desc: 'Sourced directly from smallholder forest farmers. Natural anaerobic processing develops intoxicating aromas of bergamot, candied peach, and jasmine tea blossoms.',
      role: 'Extracted as double ristretto shots to cut through sweet pearl sugar and rich cream with crisp floral acidity.',
      spec: 'Medium-light Nordic roast profile, roasted in small 5kg drum batches twice weekly.',
      img: 'img/menu/cortado.jpg'
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const key = tab.getAttribute('data-origin-key');
      const item = data[key];
      if (!item) return;

      tabs.forEach(t => {
        t.classList.remove('bg-amber', 'text-white', 'shadow');
        t.classList.add('bg-white', 'dark:bg-dark-card', 'text-espresso', 'dark:text-dark-text');
      });
      tab.classList.add('bg-amber', 'text-white', 'shadow');
      tab.classList.remove('bg-white', 'dark:bg-dark-card', 'text-espresso', 'dark:text-dark-text');

      if (titleEl) titleEl.textContent = item.title;
      if (regionEl) regionEl.textContent = item.region;
      if (descEl) descEl.textContent = item.desc;
      if (roleEl) roleEl.textContent = item.role;
      if (specEl) specEl.textContent = item.spec;
      if (imgEl) {
        imgEl.style.opacity = '0.5';
        setTimeout(() => {
          imgEl.src = item.img;
          imgEl.style.opacity = '1';
        }, 150);
      }
    });
  });
}

/* ============================================================
   16. Express Pickup Mode Switcher
============================================================ */
function initPickupMode() {
  const btns = document.querySelectorAll('.pickup-mode-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => {
        b.classList.remove('bg-amber', 'text-white', 'shadow');
        b.classList.add('hover:bg-honey/15', 'text-espresso', 'dark:text-dark-text');
      });
      btn.classList.add('bg-amber', 'text-white', 'shadow');
      btn.classList.remove('hover:bg-honey/15', 'text-espresso', 'dark:text-dark-text');
      const mode = btn.getAttribute('data-mode') || 'Counter Pickup';
      showToast(`Order fulfillment mode set to: ${mode} 🧇`, 'info');
    });
  });
}

/* ============================================================
   17. Blog Flavor Compass Controller
============================================================ */
function updateFlavorCompass(flavorKey) {
  const data = {
    caramel: {
      pastry: 'Belgian Liege Waffle + Pearl Sugar',
      pastryDesc: 'Caramelized P4 beet sugar embedded inside 24-hour slow fermented brioche dough.',
      drink: 'Ethiopian Guji Natural Pour-Over',
      drinkDesc: 'Jasmine florals and ripe blackberry notes that cut through the richness of caramelized butterfat.',
      rationale: '“High-acidity washed coffee clears the palate between crunchy, molasses-rich sugar bites, rejuvenating taste buds with each sip.”'
    },
    citrus: {
      pastry: 'Meyer Lemon Curd & Lavender Silk Crepe',
      pastryDesc: 'Lace-thin Brittany crepe folded with tart organic lemon reduction and crushed lavender sugar.',
      drink: 'Cold-Pressed Sparkling Hibiscus Spritz',
      drinkDesc: 'Egyptian botanical tea with crushed rose petals and bubbles.',
      rationale: '“Citrus essential oils elevate the delicate floral lavender, creating a refreshing palate cleanser that lifts the pastry.”'
    },
    savory: {
      pastry: 'Smoked Salmon & Truffle Ricotta Galette',
      pastryDesc: '100% stone-ground Brittany buckwheat with cold-smoked Norwegian salmon and fresh dill.',
      drink: 'Double-Shot Flat White with Oat Cream',
      drinkDesc: 'Silky micro-foam paired with dense Brazilian chocolate-caramel espresso roast.',
      rationale: '“Nutty buckwheat tannins and truffle earthiness find harmonic balance in the nutty sweetness of textured oat milk.”'
    },
    matcha: {
      pastry: 'Kyoto Matcha & Bronte Pistachio Bubble Waffle',
      pastryDesc: 'Airy egg-puff waffle infused with ceremonial Uji matcha, filled with roasted pistachio gelato.',
      drink: 'Madagascar Vanilla Cold Foam Nitro Brew',
      drinkDesc: 'Slow-steeped 18-hour cold brew topped with velvety sweet vanilla bean foam.',
      rationale: '“The slight vegetal bitterness of stone-ground matcha creates a sublime counterpoint to smooth, sweet bourbon vanilla foam.”'
    }
  };

  const item = data[flavorKey] || data.caramel;
  const card = document.getElementById('flavor-compass-card');
  const pastryTitle = document.getElementById('compass-pastry-title');
  const pastryDesc = document.getElementById('compass-pastry-desc');
  const drinkTitle = document.getElementById('compass-drink-title');
  const drinkDesc = document.getElementById('compass-drink-desc');
  const rationale = document.getElementById('compass-rationale');

  document.querySelectorAll('.compass-btn').forEach(btn => {
    btn.classList.remove('bg-amber', 'text-white', 'shadow');
    btn.classList.add('bg-cream', 'dark:bg-dark-card', 'text-espresso', 'dark:text-dark-text');
  });

  const activeBtn = document.getElementById(`compass-btn-${flavorKey}`);
  if (activeBtn) {
    activeBtn.classList.add('bg-amber', 'text-white', 'shadow');
    activeBtn.classList.remove('bg-cream', 'dark:bg-dark-card', 'text-espresso', 'dark:text-dark-text');
  }

  if (pastryTitle) pastryTitle.textContent = item.pastry;
  if (pastryDesc) pastryDesc.textContent = item.pastryDesc;
  if (drinkTitle) drinkTitle.textContent = item.drink;
  if (drinkDesc) drinkDesc.textContent = item.drinkDesc;
  if (rationale) rationale.textContent = item.rationale;
}
window.updateFlavorCompass = updateFlavorCompass;

/* ============================================================
   18. Catering Occasions & Tier Quick Select
============================================================ */
function initCateringOccasions() {
  // Occasion switcher tabs
  const occasionBtns = document.querySelectorAll('.occasion-tab-btn');
  const occasionPanels = document.querySelectorAll('.occasion-panel');

  occasionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-occasion');
      occasionBtns.forEach(b => {
        b.classList.remove('bg-amber', 'text-white', 'shadow');
        b.classList.add('bg-white', 'dark:bg-dark-card', 'text-espresso', 'dark:text-dark-text');
      });
      btn.classList.add('bg-amber', 'text-white', 'shadow');
      btn.classList.remove('bg-white', 'dark:bg-dark-card', 'text-espresso', 'dark:text-dark-text');

      occasionPanels.forEach(panel => {
        if (panel.getAttribute('data-occasion') === target) {
          panel.classList.remove('hidden');
        } else {
          panel.classList.add('hidden');
        }
      });
    });
  });

  // Package Card "Select in Estimator" buttons
  document.querySelectorAll('.tier-select-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tierVal = btn.getAttribute('data-tier');
      const radio = document.querySelector(`input[name="catering-tier"][value="${tierVal}"]`);
      if (radio) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change'));
      }
      const estimatorEl = document.getElementById('estimator');
      if (estimatorEl) {
        estimatorEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // FAQ Accordions
  document.querySelectorAll('.faq-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      const icon = btn.querySelector('.faq-icon');
      if (!content) return;
      const isHidden = content.classList.contains('hidden');
      if (isHidden) {
        content.classList.remove('hidden');
        if (icon) icon.textContent = '−';
      } else {
        content.classList.add('hidden');
        if (icon) icon.textContent = '+';
      }
    });
  });
}

/* ============================================================
   19. Smooth Scroll-Driven Reveal Animations
============================================================ */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-up, .reveal-fade, .reveal-scale, .reveal-left, .reveal-right');
  if (!revealElements.length) return;

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  // Pre-reveal elements above or near the initial viewport (+120px) to prevent initial scroll lag
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top <= viewportHeight + 100 && rect.bottom >= -50) {
      el.classList.add('is-revealed');
    }
  });

  // Observe remaining elements with proactive positive bottom rootMargin (+60px)
  // so animations start seamlessly just as elements reach the viewport edge
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.02,
    rootMargin: '0px 0px 60px 0px'
  });

  revealElements.forEach(el => {
    if (!el.classList.contains('is-revealed')) {
      observer.observe(el);
    }
  });
}
window.initScrollAnimations = initScrollAnimations;

/* ============================================================
   20. Mobile Bottom App Bar Controller
============================================================ */
function initMobileBottomNav() {
  const items = document.querySelectorAll('.mobile-bottom-nav-item');
  if (!items.length) return;

  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  items.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }

    if (href.startsWith('#')) {
      link.addEventListener('click', (e) => {
        const targetId = href.slice(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  });
}

/* ============================================================
   21. Dynamic Header Scroll Controller
============================================================ */
function initHeaderScroll() {
  const header = document.querySelector('header');
  if (!header) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.pageYOffset > 10) {
          header.classList.add('shadow-md', 'scrolled');
        } else {
          header.classList.remove('shadow-md', 'scrolled');
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ============================================================
   22. Mobile Customizer Bar Intersection Observer
============================================================ */
function initMobileCustomizerBar() {
  const customizer = document.getElementById('waffle-customizer');
  const mobileBar = document.getElementById('customizer-mobile-bar');
  if (!customizer || !mobileBar) return;

  if (!('IntersectionObserver' in window)) {
    mobileBar.classList.add('is-visible');
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        mobileBar.classList.add('is-visible');
      } else {
        mobileBar.classList.remove('is-visible');
      }
    });
  }, {
    threshold: 0.15
  });

  observer.observe(customizer);
}

/* ============================================================
   23. Global Phone Input Restriction (Disallow Alphabets)
============================================================ */
function initPhoneInputs() {
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach(input => {
    // 1. Prevent typing alphabetic characters on keydown
    input.addEventListener('keydown', (e) => {
      // Allow navigation and shortcut keys (Ctrl/Cmd/Alt, Backspace, Arrow keys, Tab, Enter, Delete)
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) return;
      if (/[a-zA-Z]/.test(e.key)) {
        e.preventDefault();
      }
    });

    // 2. Prevent input of alphabets before insertion (covers mobile virtual keyboards & autocomplete)
    input.addEventListener('beforeinput', (e) => {
      if (e.data && /[a-zA-Z]/.test(e.data)) {
        e.preventDefault();
      }
    });

    // 3. Clean up on input (covers paste, autofill, voice typing, drag-and-drop)
    input.addEventListener('input', () => {
      const sanitized = input.value.replace(/[^0-9+\s\-()]/g, '');
      if (input.value !== sanitized) {
        input.value = sanitized;
      }
    });

    // 4. Handle paste cleanly
    input.addEventListener('paste', (e) => {
      const pasteText = (e.clipboardData || window.clipboardData)?.getData('text');
      if (pasteText && /[a-zA-Z]/.test(pasteText)) {
        e.preventDefault();
        const cleaned = pasteText.replace(/[^0-9+\s\-()]/g, '');
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        input.value = input.value.substring(0, start) + cleaned + input.value.substring(end);
        input.setSelectionRange(start + cleaned.length, start + cleaned.length);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });
}

/* ============================================================
   24. Global Name Input Restriction (Disallow Numbers)
============================================================ */
function initNameInputs() {
  const nameInputs = document.querySelectorAll('#catering-name, #contact-name, #reserve-guest-name, input[name*="name"], input[placeholder*="Rostova"], input[placeholder*="Vance"]');
  nameInputs.forEach(input => {
    // 1. Prevent typing numbers on keydown
    input.addEventListener('keydown', (e) => {
      // Allow navigation and system shortcuts (Ctrl/Cmd/Alt, Backspace, Arrow keys, Tab, Enter, Delete)
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length > 1) return;
      if (/[0-9]/.test(e.key)) {
        e.preventDefault();
      }
    });

    // 2. Prevent input of numbers before insertion (covers mobile virtual keyboards & autocomplete)
    input.addEventListener('beforeinput', (e) => {
      if (e.data && /[0-9]/.test(e.data)) {
        e.preventDefault();
      }
    });

    // 3. Clean up on input (covers paste, autofill, voice typing, drag-and-drop)
    input.addEventListener('input', () => {
      const sanitized = input.value.replace(/[0-9]/g, '');
      if (input.value !== sanitized) {
        input.value = sanitized;
      }
    });

    // 4. Handle paste cleanly
    input.addEventListener('paste', (e) => {
      const pasteText = (e.clipboardData || window.clipboardData)?.getData('text');
      if (pasteText && /[0-9]/.test(pasteText)) {
        e.preventDefault();
        const cleaned = pasteText.replace(/[0-9]/g, '');
        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        input.value = input.value.substring(0, start) + cleaned + input.value.substring(end);
        input.setSelectionRange(start + cleaned.length, start + cleaned.length);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });
}

/* ============================================================
   21. Ultra-Fluid Awwwards-Style Animation & Choreography Engine
============================================================ */
function initAwwwardsAnimations() {
  initLenisSmoothScroll();
  initHeroHeadlineReveal();
  initHeroVisualParallax();
  initCurtainReveals();
  init3DCardEntrances();
  initMagneticButtons();
  initPageTransitions();
}

/**
 * 21.1 Lenis Smooth Momentum Scrolling Engine
 */
function initLenisSmoothScroll() {
  if (typeof Lenis === 'undefined') return null;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  try {
    const isMobile = window.innerWidth < 768;
    const lenis = new Lenis({
      duration: isMobile ? 0.9 : 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: isMobile ? 1.0 : 1.4,
      infinite: false
    });

    window.lenisInstance = lenis;

    // Connect Lenis to GSAP ScrollTrigger if available
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    // Intercept in-page smooth anchor scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href && href.length > 1 && !href.startsWith('#!')) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            lenis.scrollTo(target, { offset: -70, duration: 1.2 });
          }
        }
      });
    });

    return lenis;
  } catch (err) {
    console.warn('Lenis momentum scroll init note:', err);
    return null;
  }
}

/**
 * 21.2 Hero Headline Staggered Line-Mask Reveal
 */
function initHeroHeadlineReveal() {
  const headline = document.querySelector('.hero-headline');
  const maskInners = document.querySelectorAll('.headline-mask-inner');

  if (maskInners.length) {
    if (typeof gsap !== 'undefined') {
      gsap.from(maskInners, {
        y: '70%',
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.1,
        clearProps: 'transform,opacity',
        onComplete: () => {
          if (headline) headline.classList.add('is-revealed');
          maskInners.forEach(inner => inner.parentElement?.classList.add('is-revealed'));
        }
      });
    } else {
      if (headline) headline.classList.add('is-revealed');
    }
  }
}

/**
 * 21.3 Hero Floating Visual & Desktop Mouse / Scroll Parallax
 */
function initHeroVisualParallax() {
  const heroShowcase = document.querySelector('.hero-showcase');
  if (!heroShowcase) return;

  // Desktop subtle mouse parallax
  if (window.matchMedia('(min-width: 1024px)').matches) {
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    window.addEventListener('mousemove', (e) => {
      const { innerWidth, innerHeight } = window;
      targetX = ((e.clientX / innerWidth) - 0.5) * 16;
      targetY = ((e.clientY / innerHeight) - 0.5) * 16;
    }, { passive: true });

    const updateParallax = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      heroShowcase.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      requestAnimationFrame(updateParallax);
    };

    requestAnimationFrame(updateParallax);
  }

  // Scroll parallax scrub with ScrollTrigger (desktop/tablet only to avoid mobile layout shifting)
  if (window.innerWidth >= 768 && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.to(heroShowcase, {
      scrollTrigger: {
        trigger: heroShowcase,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.2
      },
      y: 35,
      ease: 'none'
    });
  }
}

/**
 * 21.4 Curtain Clip-Path Reveals on Food Imagery
 */
function initCurtainReveals() {
  const curtains = document.querySelectorAll('.curtain-reveal');
  if (!curtains.length) return;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    curtains.forEach(curtain => {
      ScrollTrigger.create({
        trigger: curtain,
        start: 'top 92%',
        onEnter: () => curtain.classList.add('is-revealed'),
        once: true
      });
    });
  } else if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 60px 0px' });

    curtains.forEach(curtain => observer.observe(curtain));
  } else {
    curtains.forEach(curtain => curtain.classList.add('is-revealed'));
  }
}

/**
 * 21.5 Staggered 3D Card Entrances on Grids
 */
function init3DCardEntrances() {
  const cards = document.querySelectorAll('.card-3d-entrance');
  if (!cards.length) return;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.batch('.card-3d-entrance', {
      start: 'top 88%',
      onEnter: (batch) => {
        gsap.to(batch, {
          opacity: 1,
          rotateX: 0,
          y: 0,
          scale: 1,
          duration: 0.85,
          stagger: 0.12,
          ease: 'power3.out',
          overwrite: 'auto'
        });
        batch.forEach(card => card.classList.add('is-revealed'));
      },
      once: true
    });
  } else if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

    cards.forEach(card => observer.observe(card));
  } else {
    cards.forEach(card => card.classList.add('is-revealed'));
  }
}

/**
 * 21.6 Magnetic CTA Button Hover with Spring Physics
 */
function initMagneticButtons() {
  const magneticButtons = document.querySelectorAll('.btn-magnetic');
  if (!magneticButtons.length) return;

  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.32;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.32;
      btn.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate3d(0, 0, 0)';
    });
  });
}

/* ============================================================
   26. Inner Pages Fluid Animations & Kinetic Typography Engine
   ============================================================ */
function initInnerPagesAnimations() {
  const pathname = window.location.pathname;
  const filename = pathname.substring(pathname.lastIndexOf('/') + 1).toLowerCase();
  const isHomepage = filename === '' || filename === 'index.html' || filename === 'home-express.html';

  // Strictly skip homepages to keep Home 1 & Home 2 hero animations pristine
  if (isHomepage) return;

  initInnerKineticTypography();
  initKineticRollingLinks();
  initInnerNumberCounters();
  initScrollScrubbedText();
  initBlogReadingProgress(filename);
  initFluidFormFields();
  initInnerCurtainImageReveals();
}

/**
 * 26.1 Kinetic Typography: Split Mask & Reveals on Inner Page Headings
 */
function initInnerKineticTypography() {
  function splitElementIntoMaskedWords(el) {
    if (!el || el.dataset.splitDone) return;
    el.dataset.splitDone = 'true';

    const childNodes = Array.from(el.childNodes);
    el.innerHTML = '';

    childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        const tokens = text.split(/(\s+)/);
        tokens.forEach(token => {
          if (!token) return;
          if (/^\s+$/.test(token)) {
            el.appendChild(document.createTextNode(token));
          } else {
            const mask = document.createElement('span');
            mask.className = 'split-line-mask split-word-mask';
            const inner = document.createElement('span');
            inner.className = 'split-word-inner';
            inner.textContent = token;
            mask.appendChild(inner);
            el.appendChild(mask);
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const mask = document.createElement('span');
        mask.className = 'split-line-mask split-word-mask';
        const inner = document.createElement('span');
        inner.className = 'split-word-inner';
        inner.appendChild(node.cloneNode(true));
        mask.appendChild(inner);
        el.appendChild(mask);
      }
    });
  }

  // Hero H1 Split & Reveal
  const heroH1 = document.querySelector('main h1, section h1');
  if (heroH1) {
    splitElementIntoMaskedWords(heroH1);
    const words = heroH1.querySelectorAll('.split-word-inner');

    if (typeof gsap !== 'undefined') {
      gsap.fromTo(words,
        { y: '125%', rotateZ: 2.5, opacity: 0 },
        {
          y: '0%',
          rotateZ: 0,
          opacity: 1,
          duration: 1.05,
          stagger: 0.045,
          ease: 'power4.out',
          delay: 0.15,
          onComplete: () => {
            words.forEach(w => w.classList.add('is-revealed'));
          }
        }
      );
    } else {
      words.forEach((w, i) => {
        setTimeout(() => {
          w.classList.add('is-revealed');
        }, 120 + i * 45);
      });
    }
  }

  // Section H2 Scroll-Triggered Split & Reveal
  const sectionH2s = document.querySelectorAll('main h2');
  sectionH2s.forEach(h2 => {
    if (h2.dataset.splitDone) return;
    splitElementIntoMaskedWords(h2);
    const h2Words = h2.querySelectorAll('.split-word-inner');

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.create({
        trigger: h2,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.fromTo(h2Words,
            { y: '115%', rotateZ: 2, opacity: 0 },
            {
              y: '0%',
              rotateZ: 0,
              opacity: 1,
              duration: 0.9,
              stagger: 0.035,
              ease: 'power3.out',
              onComplete: () => {
                h2Words.forEach(w => w.classList.add('is-revealed'));
              }
            }
          );
        }
      });
    } else if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            h2Words.forEach((w, i) => {
              setTimeout(() => w.classList.add('is-revealed'), i * 35);
            });
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      observer.observe(h2);
    }
  });

  // Blur-to-Crisp entrance for Eyebrows and Badges
  document.querySelectorAll('.editorial-eyebrow, .status-dot-ping').forEach(el => {
    const parent = el.closest('div');
    if (parent && !parent.classList.contains('font-blur-in')) {
      parent.classList.add('font-blur-in');
      setTimeout(() => parent.classList.add('is-revealed'), 80);
    }
  });
}

/**
 * 26.2 Kinetic Rolling Character Typography on Header Links
 */
function initKineticRollingLinks() {
  const navLinks = document.querySelectorAll('header nav a.nav-link');
  navLinks.forEach(link => {
    if (link.dataset.kineticReady) return;
    const text = link.textContent.trim();
    if (text && link.children.length === 0) {
      link.dataset.kineticReady = 'true';
      link.innerHTML = `
        <span class="kinetic-roll-link">
          <span class="kinetic-roll-top">${text}</span>
          <span class="kinetic-roll-bottom">${text}</span>
        </span>
      `;
    }
  });
}

/**
 * 26.3 Smooth Odometer / Counter Animations for Metrics & Stats
 */
function initInnerNumberCounters() {
  const statElements = document.querySelectorAll('.font-display.text-2xl, .font-display.text-3xl');
  statElements.forEach(el => {
    if (el.dataset.counterDone) return;
    const rawText = el.textContent.trim();
    const match = rawText.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
    if (match) {
      el.dataset.counterDone = 'true';
      const prefix = match[1];
      const targetNum = parseFloat(match[2]);
      const suffix = match[3];
      const hasDecimals = match[2].includes('.');
      const decimals = hasDecimals ? match[2].split('.')[1].length : 0;

      const animateCounter = () => {
        let start = null;
        const duration = 1400;
        const step = (now) => {
          if (!start) start = now;
          const progress = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          const current = targetNum * ease;
          el.textContent = `${prefix}${decimals ? current.toFixed(decimals) : Math.round(current)}${suffix}`;
          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            el.textContent = rawText;
          }
        };
        requestAnimationFrame(step);
      };

      if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries, o) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              animateCounter();
              o.unobserve(entry.target);
            }
          });
        }, { threshold: 0.2 });
        obs.observe(el);
      } else {
        animateCounter();
      }
    }
  });
}

/**
 * 26.4 Scroll-Scrubbed Text Reveal / Light-Up for Story Passages
 */
function initScrollScrubbedText() {
  const scrubParagraphs = document.querySelectorAll('.prose > p:nth-of-type(1), .prose > p:nth-of-type(2), #about-story p');
  scrubParagraphs.forEach(p => {
    if (p.dataset.scrubDone) return;
    p.dataset.scrubDone = 'true';
    p.classList.add('scrub-text-block');
    const words = p.textContent.trim().split(/\s+/);
    p.innerHTML = words.map(w => `<span class="scrub-word">${w}</span>`).join(' ');
  });

  const allScrubWords = document.querySelectorAll('.scrub-word');
  if (allScrubWords.length) {
    const handleScrub = () => {
      const vh = window.innerHeight;
      allScrubWords.forEach(sw => {
        const top = sw.getBoundingClientRect().top;
        if (top < vh * 0.82) {
          sw.classList.add('is-active');
        } else {
          sw.classList.remove('is-active');
        }
      });
    };
    window.addEventListener('scroll', handleScrub, { passive: true });
    handleScrub();
  }
}

/**
 * 26.5 Page Transition Progress Bar & Curtain
 */
function initPageTransitions() {
  let curtain = document.getElementById('page-transition-curtain');
  if (!curtain) {
    curtain = document.createElement('div');
    curtain.id = 'page-transition-curtain';
    document.body.appendChild(curtain);
  }

  // Ensure curtain is reset on load and back-forward cache restoration
  curtain.classList.remove('is-active');
  window.addEventListener('pageshow', () => {
    curtain.classList.remove('is-active');
  });

  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
    if (href.endsWith('.html') || (!href.includes('#') && !href.startsWith('http') && href !== '')) {
      a.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || a.getAttribute('target') === '_blank') return;
        curtain.classList.add('is-active');
      });
    }
  });
}

/**
 * 26.6 Blog Reading Progress Bar
 */
function initBlogReadingProgress(filename) {
  if (filename.includes('blog')) {
    let bar = document.getElementById('reading-progress-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'reading-progress-bar';
      document.body.appendChild(bar);
    }
    window.addEventListener('scroll', () => {
      const scroll = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (scroll / max) * 100 : 0;
      bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    }, { passive: true });
  }
}

/**
 * 26.7 Interactive Form Input Focus Underlines
 */
function initFluidFormFields() {
  const inputs = document.querySelectorAll('#contact-form input, #contact-form textarea, #catering-form input, #catering-form textarea, #catering-form select, form input:not([type="checkbox"]):not([type="radio"]), form textarea');
  inputs.forEach(input => {
    const parent = input.parentElement;
    if (parent && !parent.classList.contains('fluid-input-group') && !parent.querySelector('.fluid-input-line')) {
      parent.classList.add('fluid-input-group');
      const line = document.createElement('div');
      line.className = 'fluid-input-line';
      parent.appendChild(line);
    }
  });
}

/**
 * 26.8 Curtain Image Reveals for Inner Page Showcase Imagery
 */
function initInnerCurtainImageReveals() {
  document.querySelectorAll('main img').forEach(img => {
    const parent = img.parentElement;
    if (parent && (parent.classList.contains('aspect-[16/9]') || parent.classList.contains('aspect-[16/10]')) && !parent.classList.contains('curtain-reveal')) {
      parent.classList.add('curtain-reveal');
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.create({
          trigger: parent,
          start: 'top 88%',
          once: true,
          onEnter: () => parent.classList.add('is-revealed')
        });
      } else if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries, o) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              parent.classList.add('is-revealed');
              o.unobserve(entry.target);
            }
          });
        }, { threshold: 0.1 });
        obs.observe(parent);
      } else {
        parent.classList.add('is-revealed');
      }
    }
  });
}

/**
 * 27. Universal Footer Brand Icon Redirect Controller
 * Ensures touching or clicking the website footer icon (waffle/brand)
 * immediately redirects to the home page from any page or touch device.
 */
function initFooterHomeRedirect() {
  const targets = document.querySelectorAll('footer a[href="index.html"], .footer-home-link, [data-home-link]');
  targets.forEach(el => {
    const doRedirect = (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.location.href = 'index.html';
    };
    el.addEventListener('click', doRedirect);
    el.addEventListener('touchend', doRedirect);
  });
}

// Global touch & click delegation on document for complete reliability across all pages
document.addEventListener('touchend', (e) => {
  const link = e.target.closest('footer a[href="index.html"], .footer-home-link, [data-home-link]');
  if (link) {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = 'index.html';
  }
}, { passive: false });

document.addEventListener('click', (e) => {
  const link = e.target.closest('footer a[href="index.html"], .footer-home-link, [data-home-link]');
  if (link) {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = 'index.html';
  }
});
