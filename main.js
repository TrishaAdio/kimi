const PLANS = [
  {
    name: "Dirt",
    monthly: 3.99,
    ram: "2 GB",
    slots: 10,
    storage: "10 GB",
    featured: false,
    features: [
      "Vanilla, Paper & Purpur",
      "Full FTP and console access",
      "DDoS protection",
      "Daily backups, 7-day history",
      "Free yourname.bh.gg subdomain"
    ]
  },
  {
    name: "Iron",
    monthly: 7.49,
    ram: "4 GB",
    slots: 30,
    storage: "25 GB",
    featured: false,
    features: [
      "Everything in Dirt",
      "One-click modpack installs",
      "Priority CPU threads",
      "3 extra backup slots"
    ]
  },
  {
    name: "Gold",
    monthly: 12.99,
    ram: "8 GB",
    slots: 80,
    storage: "60 GB",
    featured: true,
    features: [
      "Everything in Iron",
      "Dedicated CPU cores",
      "Free dedicated IP",
      "Priority support queue",
      "Plugin install service"
    ]
  },
  {
    name: "Diamond",
    monthly: 24.99,
    ram: "16 GB",
    slots: 200,
    storage: "120 GB",
    featured: false,
    features: [
      "Everything in Gold",
      "NVMe Gen4 storage",
      "Multi-server manager",
      "Free migration from any host",
      "Personal onboarding call"
    ]
  }
];

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const CHECK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';

const pricingGrid = document.getElementById("pricing-grid");
const billingSwitch = document.getElementById("billing-switch");
const billingToggle = document.querySelector(".billing-toggle");

function renderPlans() {
  pricingGrid.innerHTML = PLANS.map(plan => `
    <article class="plan${plan.featured ? " plan-featured" : ""}" data-reveal-child data-plan-card="${plan.name}">
      ${plan.featured ? '<span class="plan-badge">Most Popular</span>' : ""}
      <h3 class="plan-name">${plan.name}</h3>
      <p class="plan-price">
        <span class="plan-currency">$</span><span class="plan-amount"></span><span class="plan-per">/mo</span>
      </p>
      <p class="plan-billing"></p>
      <ul class="plan-specs">
        <li><span class="spec-label">RAM</span><span class="spec-value">${plan.ram}</span></li>
        <li><span class="spec-label">Player slots</span><span class="spec-value">${plan.slots}</span></li>
        <li><span class="spec-label">NVMe storage</span><span class="spec-value">${plan.storage}</span></li>
      </ul>
      <ul class="plan-features">
        ${plan.features.map(feature => `<li>${CHECK_ICON}<span>${feature}</span></li>`).join("")}
      </ul>
      <a class="btn ${plan.featured ? "btn-primary" : "btn-outline"} plan-btn" href="#">Choose ${plan.name}</a>
    </article>
  `).join("");
}

function updatePrices(yearly) {
  PLANS.forEach(plan => {
    const card = pricingGrid.querySelector(`[data-plan-card="${plan.name}"]`);
    const amount = card.querySelector(".plan-amount");
    const billing = card.querySelector(".plan-billing");
    if (yearly) {
      const perMonth = plan.monthly * 0.8;
      const perYear = plan.monthly * 12 * 0.8;
      amount.textContent = perMonth.toFixed(2);
      billing.textContent = `Billed $${perYear.toFixed(2)} once a year`;
    } else {
      amount.textContent = plan.monthly.toFixed(2);
      billing.textContent = "Billed monthly";
    }
  });
}

renderPlans();
updatePrices(false);

billingSwitch.addEventListener("click", () => {
  const yearly = billingSwitch.getAttribute("aria-checked") !== "true";
  billingSwitch.setAttribute("aria-checked", String(yearly));
  billingToggle.setAttribute("aria-pressed", String(yearly));
  updatePrices(yearly);
});

const navbar = document.getElementById("navbar");

function updateNavbar() {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
}

window.addEventListener("scroll", updateNavbar, { passive: true });
updateNavbar();

const menuBtn = document.getElementById("menu-btn");
const navPanel = document.getElementById("nav-panel");

function setMenu(open) {
  navPanel.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
}

menuBtn.addEventListener("click", () => {
  setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
});

navPanel.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") setMenu(false);
});

document.addEventListener("click", event => {
  const placeholder = event.target.closest('a[href="#"]');
  if (placeholder) event.preventDefault();
});

document.querySelectorAll("[data-reveal-group]").forEach(group => {
  Array.from(group.querySelectorAll("[data-reveal-child]")).forEach((child, index) => {
    child.style.transitionDelay = `${index * 80}ms`;
  });
});

const revealTargets = document.querySelectorAll("[data-reveal], [data-reveal-group]");

if (reducedMotion) {
  revealTargets.forEach(target => target.classList.add("reveal-in"));
} else {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-in");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  revealTargets.forEach(target => revealObserver.observe(target));
}

function formatStat(value, decimals) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function countUp(element) {
  const target = parseFloat(element.dataset.count);
  const decimals = parseInt(element.dataset.decimals, 10);
  const suffix = element.dataset.suffix;
  const duration = 1200;
  const start = performance.now();

  function frame(now) {
    const elapsed = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - elapsed, 3);
    element.textContent = formatStat(target * eased, decimals) + suffix;
    if (elapsed < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

const statsSection = document.querySelector(".stats");
const statValues = document.querySelectorAll(".stat-value");

if (!reducedMotion && "IntersectionObserver" in window) {
  const statsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statValues.forEach(countUp);
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  statsObserver.observe(statsSection);
}

const steps = document.getElementById("steps");

if (!reducedMotion && "IntersectionObserver" in window) {
  const stepsObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        steps.classList.add("in");
        stepsObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });
  stepsObserver.observe(steps);
} else {
  steps.classList.add("in");
}

const hero = document.querySelector(".hero");
const hills = document.querySelectorAll(".hill");

if (!reducedMotion) {
  let parallaxQueued = false;
  window.addEventListener("scroll", () => {
    if (parallaxQueued) return;
    parallaxQueued = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y < hero.offsetHeight) {
        hills.forEach(hill => {
          hill.style.transform = `translateY(${(y * parseFloat(hill.dataset.speed)).toFixed(1)}px)`;
        });
      }
      parallaxQueued = false;
    });
  }, { passive: true });
}

const cubeTilt = document.getElementById("cube-tilt");

if (!reducedMotion && window.matchMedia("(pointer: fine)").matches) {
  hero.addEventListener("mousemove", event => {
    const rect = hero.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    const rotateY = Math.max(-12, Math.min(12, relX * 24));
    const rotateX = Math.max(-12, Math.min(12, -relY * 24));
    cubeTilt.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
  });

  hero.addEventListener("mouseleave", () => {
    cubeTilt.style.transform = "";
  });
}

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach(item => {
  item.addEventListener("toggle", () => {
    if (item.open) {
      faqItems.forEach(other => {
        if (other !== item) other.open = false;
      });
    }
  });
});

document.getElementById("footer-year").textContent = new Date().getFullYear();
