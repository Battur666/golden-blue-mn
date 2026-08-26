// ============================================
// Age gate (must run before Swiper initializes, so scroll/swipe
// is blocked until the visitor confirms their age)
// ============================================
(function ageGate() {
  const gate = document.getElementById("age-gate");
  const blocked = document.getElementById("age-blocked");
  const card = gate.querySelector(".age-gate__card");
  const yesBtn = document.getElementById("age-yes");
  const noBtn = document.getElementById("age-no");

  function hasVerified() {
    try {
      return sessionStorage.getItem("gbq_age_ok") === "1";
    } catch (e) {
      return false;
    }
  }
  function setVerified() {
    try {
      sessionStorage.setItem("gbq_age_ok", "1");
    } catch (e) {
      /* ignore */
    }
  }

  if (hasVerified()) {
    gate.hidden = true;
    document.body.classList.remove("gate-locked");
  } else {
    gate.hidden = false;
    card.hidden = false;
    blocked.hidden = true;
    document.body.classList.add("gate-locked");
  }

  yesBtn.addEventListener("click", () => {
    setVerified();
    gate.hidden = true;
    document.body.classList.remove("gate-locked");
  });
  noBtn.addEventListener("click", () => {
    card.hidden = true;
    blocked.hidden = false;
  });
})();

// ============================================
// Fullpage swiper (vertical, touch + mousewheel + wheel)
// Replaces a traditional header/nav — the whole page IS the navigation.
// ============================================
const swiper = new Swiper("#quartz-swiper", {
  direction: "vertical",
  slidesPerView: 1,
  speed: 650,
  mousewheel: true,
  touchReleaseOnEdges: true,
  pagination: { el: ".swiper-pagination", clickable: true },
  touchStartPreventDefault: false,
});

swiper.on("slideChangeTransitionEnd", () => {
  const activeSlide = swiper.slides[swiper.activeIndex];
  const reveals = activeSlide.querySelectorAll(
    ".statement-desc, .bf-circle, .bf-label, .bf-caption",
  );
  reveals.forEach((el, i) => {
    setTimeout(() => el.classList.add("is-visible"), 150);
  });
});

// Reveal slide 1's elements immediately too, since the swiper starts
// there and "slideChangeTransitionEnd" only fires on actual transitions.
window.addEventListener("load", () => {
  const firstSlide = swiper.slides[swiper.activeIndex];
  firstSlide
    .querySelectorAll(".statement-desc, .bf-circle, .bf-label, .bf-caption")
    .forEach((el) => el.classList.add("is-visible"));
});
document.querySelectorAll(".bf-top").forEach((btn) => {
  btn.addEventListener("click", () => swiper.slideTo(0));
});
// ============================================
// Hover-reveal elements: on touch devices there is no hover, so
// auto-reveal them as they scroll into view instead.
// ============================================
const isTouch = window.matchMedia("(hover: none)").matches;

if (isTouch) {
  const revealables = document.querySelectorAll(
    ".reveal-word, .about-tile, .merch-card--reveal",
  );
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle("is-revealed", entry.isIntersecting);
      });
    },
    { threshold: 0.6 },
  );
  revealables.forEach((el) => observer.observe(el));
}

// ============================================
// Merch tee color-swap — now targets .merch-card instead of the old
// .gbq-product wrapper. Click/tap toggles on all devices; hover is a
// bonus on devices that support it.
// ============================================
(function initializeQuartzHover() {
  document.querySelectorAll("[data-quartz-hover]").forEach((product) => {
    const button = product.querySelector(".gbq-image-button");
    const hint = product.querySelector(".gbq-hint");
    if (!button) return;

    function showColor(isBlue) {
      product.classList.toggle("is-blue", isBlue);
      if (hint) hint.textContent = isBlue ? "QUARTZ BLUE" : "TAP TO DISCOVER";
      button.setAttribute(
        "aria-label",
        isBlue ? "Switch tee color to white" : "Switch tee color to blue",
      );
    }

    if (!isTouch) {
      button.addEventListener("mouseenter", () => showColor(true));
      button.addEventListener("mouseleave", () => showColor(false));
    }
    button.addEventListener("click", () => {
      showColor(!product.classList.contains("is-blue"));
    });
  });
})();

// ============================================
// Contact / order form
// ============================================
const CONTACT_ENDPOINT = "/api/contact";
const form = document.getElementById("contact-form");
const status = document.getElementById("contact-status");
const submitBtn = document.getElementById("contact-submit");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    name: form.name.value.trim(),
    phone: form.phone.value.trim(),
    quantity: form.quantity.value.trim(),
    email: form.email.value.trim(),
    message: form.message.value.trim(),
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";
  status.textContent = "";
  status.className = "contact__status";

  try {
    const res = await fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Request failed");
    status.textContent = "Sent — we'll be in touch.";
    status.classList.add("is-success");
    form.reset();
  } catch (err) {
    status.textContent = "Something went wrong. Please try again.";
    status.classList.add("is-error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send order request";
  }
});
