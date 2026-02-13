const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const state = {
  cart: new Map(), // sku -> { product, qty }
  toastTimer: null,
  confirmTimer: null,
};

const money = (n) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });

const PRODUCTS = {
  kids: [
    { id: "kids-hoodie", name: "Sunburst Hoodie", price: 24, tag: "new", c1: "#ffb347", c2: "#e7385b", note: "Soft fleece" },
    { id: "kids-tee", name: "Mini Stripe Tee", price: 14, tag: "hot", c1: "#74ccff", c2: "#ffb347", note: "Everyday" },
    { id: "kids-jogger", name: "Cloud Joggers", price: 18, tag: "best", c1: "#b7a6ff", c2: "#74ccff", note: "Comfy fit" },
    { id: "kids-jacket", name: "Rain Pop Jacket", price: 29, tag: "new", c1: "#0fe0b6", c2: "#74ccff", note: "Light shell" },
    { id: "kids-dress", name: "Twirl Day Dress", price: 22, tag: "sale", c1: "#ff78c6", c2: "#ffb347", note: "Flowy" },
    { id: "kids-shorts", name: "Sunny Shorts", price: 12, tag: "sale", c1: "#ffe36a", c2: "#74ccff", note: "Breezy" },
    { id: "kids-knit", name: "Cozy Knit Set", price: 26, tag: "best", c1: "#e7385b", c2: "#b7a6ff", note: "Warm" },
    { id: "kids-sneaker", name: "Hop Sneakers", price: 28, tag: "hot", c1: "#74ccff", c2: "#0fe0b6", note: "Lightstep" },
  ],
  men: [
    { id: "men-overshirt", name: "Canvas Overshirt", price: 49, tag: "new", c1: "#24233a", c2: "#ffb347", note: "Layer up" },
    { id: "men-chino", name: "Daily Chinos", price: 38, tag: "best", c1: "#74ccff", c2: "#24233a", note: "Slim taper" },
    { id: "men-tee", name: "Heavyweight Tee", price: 21, tag: "hot", c1: "#e7385b", c2: "#24233a", note: "Clean cut" },
    { id: "men-hoodie", name: "Nightfall Hoodie", price: 42, tag: "new", c1: "#b7a6ff", c2: "#24233a", note: "Brushed" },
    { id: "men-denim", name: "Straight Denim", price: 54, tag: "best", c1: "#74ccff", c2: "#2d2c44", note: "Rigid" },
    { id: "men-bomber", name: "Modern Bomber", price: 69, tag: "hot", c1: "#0fe0b6", c2: "#24233a", note: "Statement" },
    { id: "men-knit", name: "Rib Knit Polo", price: 36, tag: "sale", c1: "#ffb347", c2: "#0fe0b6", note: "Textured" },
    { id: "men-shoe", name: "City Trainers", price: 58, tag: "new", c1: "#e7385b", c2: "#74ccff", note: "All-day" },
  ],
  women: [
    { id: "women-slip", name: "Satin Slip Dress", price: 62, tag: "new", c1: "#ff78c6", c2: "#e7385b", note: "Glossy" },
    { id: "women-blazer", name: "Sharp Blazer", price: 78, tag: "best", c1: "#24233a", c2: "#b7a6ff", note: "Tailored" },
    { id: "women-top", name: "Ruffle Top", price: 34, tag: "hot", c1: "#ffb347", c2: "#ff78c6", note: "Light" },
    { id: "women-pant", name: "Wide Leg Pants", price: 56, tag: "best", c1: "#74ccff", c2: "#24233a", note: "Flow" },
    { id: "women-skirt", name: "Pleat Skirt", price: 44, tag: "sale", c1: "#0fe0b6", c2: "#74ccff", note: "Swing" },
    { id: "women-knit", name: "Soft Knit Cardigan", price: 48, tag: "new", c1: "#b7a6ff", c2: "#ffb347", note: "Cozy" },
    { id: "women-heel", name: "Block Heels", price: 64, tag: "hot", c1: "#e7385b", c2: "#ffb347", note: "Easy" },
    { id: "women-bag", name: "Mini Crescent Bag", price: 52, tag: "best", c1: "#74ccff", c2: "#ff78c6", note: "Iconic" },
  ],
  accessories: [
    { id: "acc-cap", name: "Wave Cap", price: 18, tag: "new", c1: "#24233a", c2: "#74ccff", note: "Adjustable" },
    { id: "acc-socks", name: "Color Pop Socks", price: 9, tag: "sale", c1: "#ffb347", c2: "#0fe0b6", note: "2-pack" },
    { id: "acc-belt", name: "Everyday Belt", price: 22, tag: "best", c1: "#e7385b", c2: "#24233a", note: "Classic" },
    { id: "acc-sunnies", name: "Sunset Sunnies", price: 28, tag: "hot", c1: "#ff78c6", c2: "#ffb347", note: "UV400" },
    { id: "acc-tote", name: "Canvas Tote", price: 26, tag: "best", c1: "#74ccff", c2: "#0fe0b6", note: "Roomy" },
    { id: "acc-watch", name: "Minimal Watch", price: 58, tag: "new", c1: "#b7a6ff", c2: "#24233a", note: "Sleek" },
    { id: "acc-chain", name: "Silver Chain", price: 32, tag: "hot", c1: "#0fe0b6", c2: "#b7a6ff", note: "Shine" },
    { id: "acc-wallet", name: "Fold Wallet", price: 24, tag: "sale", c1: "#ffb347", c2: "#24233a", note: "Compact" },
  ],
};

const productIndex = new Map(Object.values(PRODUCTS).flat().map((p) => [p.id, p]));

function cardHTML(p, i) {
  const tag = (p.tag || "").toUpperCase();
  return `
    <article class="card" style="--c1:${p.c1};--c2:${p.c2};--i:${i}" data-sku="${p.id}">
      <div class="card__media" aria-hidden="true">
        <div class="card__badge">${tag}</div>
      </div>
      <div class="card__body">
        <h3 class="card__title">${p.name}</h3>
        <div class="card__meta">
          <span class="price">${money(p.price)}</span>
          <span class="card__note">${p.note}</span>
        </div>
        <div class="card__actions">
          <button class="btn btn--small btn--ghost" data-add-to-cart="${p.id}">Add to Cart</button>
          <button class="btn btn--small btn--primary" data-buy-now="${p.id}">Buy Now</button>
        </div>
      </div>
    </article>
  `;
}

function renderProducts() {
  for (const [cat, items] of Object.entries(PRODUCTS)) {
    const el = document.querySelector(`[data-carousel="${cat}"]`);
    if (!el) continue;
    el.innerHTML = items.map((p, i) => cardHTML(p, i)).join("");
  }
}

function cartTotals() {
  let items = 0;
  let total = 0;
  for (const { product, qty } of state.cart.values()) {
    items += qty;
    total += product.price * qty;
  }
  return { items, total };
}

function updateCartUI() {
  const countEl = $("#cartCount");
  const listEl = $("#cartList");
  const emptyEl = $("#cartEmpty");
  const itemsEl = $("#cartItems");
  const totalEl = $("#cartTotal");

  const { items, total } = cartTotals();
  countEl.textContent = String(items);
  itemsEl.textContent = String(items);
  totalEl.textContent = money(total);

  if (items === 0) {
    listEl.innerHTML = "";
    emptyEl.style.display = "block";
    return;
  }

  emptyEl.style.display = "none";
  listEl.innerHTML = Array.from(state.cart.values())
    .slice(0, 10)
    .map(
      ({ product, qty }) => `
        <li class="cart-item" style="--c1:${product.c1};--c2:${product.c2}">
          <div class="cart-item__swatch" aria-hidden="true"></div>
          <div>
            <div class="cart-item__name">${product.name}</div>
            <div class="cart-item__meta">
              <span>${money(product.price)}</span>
              <span class="muted">×</span>
              <span class="cart-item__qty">${qty}</span>
            </div>
          </div>
          <button class="icon-btn" data-remove-one="${product.id}" aria-label="Remove one">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 7a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V8a1 1 0 0 1 1-1Zm5 0a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V8a1 1 0 0 1 1-1Zm5 0a1 1 0 0 1 1 1v10a1 1 0 1 1-2 0V8a1 1 0 0 1 1-1ZM9 4h6l.7 1H20a1 1 0 1 1 0 2h-1.1l-1 13A2 2 0 0 1 15.9 22H8.1a2 2 0 0 1-2-2L5.1 7H4a1 1 0 1 1 0-2h4.3L9 4Z" fill="currentColor"/>
            </svg>
          </button>
        </li>
      `
    )
    .join("");
}

function animateCartFeedback() {
  const cartBtn = $("#cartButton");
  const countEl = $("#cartCount");

  cartBtn.classList.remove("is-pulsing");
  // restart animation
  void cartBtn.offsetWidth;
  cartBtn.classList.add("is-pulsing");

  countEl.classList.remove("is-bumping");
  void countEl.offsetWidth;
  countEl.classList.add("is-bumping");
}

function showToast(msg) {
  const toast = $("#toast");
  if (!toast) return;

  toast.textContent = msg;
  toast.classList.add("is-visible");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 1400);
}

function showOrderConfirm() {
  const el = $("#orderConfirm");
  if (!el) return;

  el.hidden = false;
  el.setAttribute("aria-hidden", "false");

  el.classList.remove("is-playing");
  void el.offsetWidth;
  el.classList.add("is-playing");

  clearTimeout(state.confirmTimer);
  state.confirmTimer = setTimeout(() => {
    el.classList.remove("is-playing");
    el.hidden = true;
    el.setAttribute("aria-hidden", "true");
  }, 1500);
}

function addToCart(sku) {
  const product = productIndex.get(sku);
  if (!product) return;

  const entry = state.cart.get(sku) || { product, qty: 0 };
  entry.qty += 1;
  state.cart.set(sku, entry);

  updateCartUI();
  animateCartFeedback();
  showToast("Added to cart");
}

function removeOneFromCart(sku) {
  const entry = state.cart.get(sku);
  if (!entry) return;

  entry.qty -= 1;
  if (entry.qty <= 0) state.cart.delete(sku);
  updateCartUI();
}

function clearCart() {
  state.cart.clear();
  updateCartUI();
}

function setScrimVisible(visible) {
  const scrim = $("#scrim");
  if (!scrim) return;
  scrim.hidden = !visible;
  scrim.classList.toggle("is-visible", visible);
}

function setScrollLock(locked) {
  document.documentElement.classList.toggle("scroll-lock", locked);
}

function openCart() {
  const drawer = $("#cartDrawer");
  const cartBtn = $("#cartButton");
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden", "false");
  cartBtn.setAttribute("aria-expanded", "true");
  setScrimVisible(true);
  setScrollLock(true);
  $("#cartClose")?.focus();
}

function closeCart() {
  const drawer = $("#cartDrawer");
  const cartBtn = $("#cartButton");
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden", "true");
  cartBtn.setAttribute("aria-expanded", "false");
  syncOverlays();
}

function openNav() {
  const nav = $("#navbar");
  const toggle = $("#navToggle");
  nav.classList.add("nav--open");
  toggle.setAttribute("aria-expanded", "true");
  setScrimVisible(true);
  setScrollLock(true);
}

function closeNav() {
  const nav = $("#navbar");
  const toggle = $("#navToggle");
  nav.classList.remove("nav--open");
  toggle.setAttribute("aria-expanded", "false");
  syncOverlays();
}

function syncOverlays() {
  const navOpen = $("#navbar")?.classList.contains("nav--open");
  const cartOpen = $("#cartDrawer")?.classList.contains("is-open");
  const anyOpen = Boolean(navOpen || cartOpen);

  setScrimVisible(anyOpen);
  setScrollLock(anyOpen);
}

function wireNavHideOnScroll() {
  const nav = $("#navbar");
  if (!nav) return;
  let lastY = window.scrollY;
  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;

        nav.classList.toggle("nav--scrolled", y > 10);

        const navOpen = nav.classList.contains("nav--open");
        const cartOpen = $("#cartDrawer")?.classList.contains("is-open");

        if (!navOpen && !cartOpen) {
          if (delta > 6 && y > 120) nav.classList.add("nav--hidden");
          if (delta < -6) nav.classList.remove("nav--hidden");
          if (y < 40) nav.classList.remove("nav--hidden");
        }

        lastY = y;
        ticking = false;
      });
    },
    { passive: true }
  );
}

function wireRevealOnScroll() {
  const els = $$(".reveal");
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries, obs) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("is-visible");
        obs.unobserve(e.target);
      }
    },
    { threshold: 0.16 }
  );

  els.forEach((el) => io.observe(el));
}

function wireActiveNavLinks() {
  const links = $$(".nav__link");
  const byId = new Map(links.map((a) => [a.getAttribute("href")?.replace("#", ""), a]));
  const sections = $$("#kids, #men, #women, #accessories");

  if (!sections.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;

      for (const a of links) a.classList.remove("is-active");
      byId.get(visible.target.id)?.classList.add("is-active");
    },
    { rootMargin: "-30% 0px -60% 0px", threshold: [0.1, 0.2, 0.35] }
  );

  sections.forEach((s) => io.observe(s));
}

function wireCarousels() {
  $$(".carousel-wrap").forEach((wrap) => {
    const carousel = $(".carousel", wrap);
    if (!carousel) return;

    const prev = $("[data-carousel-prev]", wrap);
    const next = $("[data-carousel-next]", wrap);

    const scrollByPage = (dir) => {
      const amt = Math.max(280, carousel.clientWidth * 0.88);
      carousel.scrollBy({ left: amt * dir, behavior: "smooth" });
    };

    prev?.addEventListener("click", () => scrollByPage(-1));
    next?.addEventListener("click", () => scrollByPage(1));

    // Desktop drag-to-scroll (mobile gets swipe for free).
    let isDown = false;
    let startX = 0;
    let startLeft = 0;

    carousel.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      isDown = true;
      startX = e.clientX;
      startLeft = carousel.scrollLeft;
      carousel.classList.add("is-dragging");
      carousel.setPointerCapture(e.pointerId);
    });

    carousel.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      carousel.scrollLeft = startLeft - dx;
    });

    const end = () => {
      if (!isDown) return;
      isDown = false;
      carousel.classList.remove("is-dragging");
    };

    carousel.addEventListener("pointerup", end);
    carousel.addEventListener("pointercancel", end);
    carousel.addEventListener("pointerleave", end);
  });
}

function wireEvents() {
  $("#year").textContent = String(new Date().getFullYear());

  // Welcome popup for 2 seconds (fade in/out).
  const welcome = $("#welcome");
  if (welcome) {
    welcome.hidden = false;
    welcome.classList.remove("is-visible");
    requestAnimationFrame(() => welcome.classList.add("is-visible"));
    setTimeout(() => {
      welcome.hidden = true;
      welcome.classList.remove("is-visible");
    }, 2050);
  }

  $("#navToggle")?.addEventListener("click", () => {
    const open = $("#navbar")?.classList.contains("nav--open");
    if (open) closeNav();
    else openNav();
  });

  // Smooth scroll + close mobile nav on link click.
  $$(".nav__link").forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      closeNav();
    });
  });

  $("#cartButton")?.addEventListener("click", () => {
    const open = $("#cartDrawer")?.classList.contains("is-open");
    if (open) closeCart();
    else openCart();
  });

  $("#cartClose")?.addEventListener("click", closeCart);

  $("#scrim")?.addEventListener("click", () => {
    closeNav();
    closeCart();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeNav();
    closeCart();
  });

  // Event delegation for product buttons + cart remove buttons.
  document.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add-to-cart]");
    if (addBtn) {
      addToCart(addBtn.getAttribute("data-add-to-cart"));
      return;
    }

    const buyBtn = e.target.closest("[data-buy-now]");
    if (buyBtn) {
      const sku = buyBtn.getAttribute("data-buy-now");
      addToCart(sku);
      showOrderConfirm();
      clearCart();
      closeCart();
      showToast("Order placed");
      return;
    }

    const rmBtn = e.target.closest("[data-remove-one]");
    if (rmBtn) {
      removeOneFromCart(rmBtn.getAttribute("data-remove-one"));
    }
  });

  $("#placeOrder")?.addEventListener("click", () => {
    const { items } = cartTotals();
    if (items === 0) {
      showToast("Your cart is empty");
      return;
    }
    showOrderConfirm();
    clearCart();
    closeCart();
    showToast("Order placed");
  });

  $("#newsletterForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    showToast("You’re on the list");
    e.target.reset();
  });
}

function main() {
  renderProducts();
  updateCartUI();
  wireCarousels();
  wireRevealOnScroll();
  wireNavHideOnScroll();
  wireActiveNavLinks();
  wireEvents();
}

document.addEventListener("DOMContentLoaded", main);
