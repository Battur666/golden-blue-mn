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
  reveals.forEach((el) => {
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
// Merch tee color-swap — targets .merch-card wrapper. Click/tap toggles
// on all devices; hover is a bonus on devices that support it.
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
// NOTE: replace YOUR-BACKEND-URL-HERE with your real Render URL once
// the backend is deployed (see backend deployment steps).
const CONTACT_ENDPOINT =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3001/api/contact"
    : "https://golden-blue-mn.onrender.com/api/contact";

const form = document.getElementById("contact-form");
const status = document.getElementById("contact-status");
const submitBtn = document.getElementById("contact-submit");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    orderType: form.orderType.value,
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
    status.textContent = "Баярлалаа бид таны хүсэлтийг хүлээн авлаа.";
    status.classList.add("is-success");
    form.reset();
  } catch (err) {
    status.textContent = "Уучлаарай алдаа гарсан тул түр хүлээгээрэй.";
    status.classList.add("is-error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Таны хүсэлтийг илгээж байна.";
  }
});
// ============================================
// Scroll-linked overlay: TRENDY layer stays fixed while the visitor
// scrolls, until SMOOTH QUARTZ has fully faded in on top of it —
// then, and only then, does the next wheel/swipe move Swiper forward.
// ============================================
(function bottleTransition() {
  const section = document.getElementById("bottle-transition");
  if (!section) return;
  const topLayer = section.querySelector(".bf-layer--top");
  let progress = 0; // 0 = TRENDY fully visible, 1 = SMOOTH QUARTZ fully covers it
  const STEP = 0.15;

  function setProgress(p) {
    progress = Math.min(1, Math.max(0, p));
    topLayer.style.opacity = progress;
    topLayer.classList.toggle("is-active", progress > 0.5);
  }

  function isActiveSlide() {
    return swiper.slides[swiper.activeIndex] === section;
  }

  section.addEventListener(
    "wheel",
    (e) => {
      if (!isActiveSlide()) return;
      const goingDown = e.deltaY > 0;
      const goingUp = e.deltaY < 0;

      if (goingDown && progress < 1) {
        e.preventDefault();
        e.stopPropagation();
        setProgress(progress + STEP);
      } else if (goingUp && progress > 0) {
        e.preventDefault();
        e.stopPropagation();
        setProgress(progress - STEP);
      }
      // else: already at the limit in that direction — let the event
      // through so Swiper advances to the next/previous real slide.
    },
    { passive: false },
  );

  // Touch support — same idea, using drag distance instead of wheel delta.
  let touchStartY = null;
  section.addEventListener(
    "touchstart",
    (e) => {
      if (!isActiveSlide()) return;
      touchStartY = e.touches[0].clientY;
    },
    { passive: true },
  );

  section.addEventListener(
    "touchmove",
    (e) => {
      if (!isActiveSlide() || touchStartY === null) return;
      const deltaY = touchStartY - e.touches[0].clientY;
      const goingDown = deltaY > 10;
      const goingUp = deltaY < -10;

      if ((goingDown && progress < 1) || (goingUp && progress > 0)) {
        e.preventDefault();
        e.stopPropagation();
        setProgress(progress + (goingDown ? STEP : -STEP));
        touchStartY = e.touches[0].clientY;
      }
    },
    { passive: false },
  );
})();
