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

  const introVideos = document.querySelectorAll(".intro-video");
  if (introVideos.length) {
    if (activeSlide.classList.contains("slide--video")) {
      introVideos.forEach((v) => {
        v.currentTime = 0;
        v.play().catch(() => {});
      });
    } else {
      introVideos.forEach((v) => v.pause());
    }
  }
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
// Intro video audio — browsers block autoplay-with-sound unless it
// happens inside a real user gesture. Scroll/wheel/touchstart do NOT
// count as a valid gesture for unmuting audio — only click, mousedown,
// touchend, and keydown reliably do. The video always starts muted so
// it never fails to autoplay, then we unmute the moment a qualifying
// gesture fires — but never for a click inside the age gate itself,
// so pressing "No" can never trigger sound.
// ============================================
(function initIntroVideoAudio() {
  const video = document.getElementById("intro-video");
  const gate = document.getElementById("age-gate");
  if (!video) return;

  let unlocked = false;
  let blocked = false;

  function tryUnmute() {
    if (unlocked || blocked) return;
    video.muted = false;
    video
      .play()
      .then(() => {
        unlocked = true;
      })
      .catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
  }

  // "No" — visitor isn't allowed on the site. Stop the video entirely
  // and permanently block any future unlock attempt.
  document.getElementById("age-no")?.addEventListener("click", () => {
    blocked = true;
    video.muted = true;
    video.pause();
  });

  // "Yes" — that click is a real gesture, so unmuting now is allowed.
  document.getElementById("age-yes")?.addEventListener("click", () => {
    setTimeout(tryUnmute, 50);
  });

  // Age gate already confirmed earlier this session — unlock on the
  // first qualifying gesture anywhere on the page EXCEPT inside the
  // age gate itself (that's handled by the two listeners above).
  const firstInteractionEvents = ["click", "mousedown", "touchend", "keydown"];
  function onFirstInteraction(e) {
    if (gate && !gate.hidden && gate.contains(e.target)) return;
    tryUnmute();
    firstInteractionEvents.forEach((evt) =>
      document.removeEventListener(evt, onFirstInteraction),
    );
  }
  firstInteractionEvents.forEach((evt) =>
    document.addEventListener(evt, onFirstInteraction, { passive: true }),
  );
})();

// ============================================
// Hover-reveal elements: on touch devices there is no hover, so
// auto-reveal them as they scroll into view instead. About-tile
// captions are intentionally excluded from this — they only reveal on
// deliberate tap now, handled separately below.
// ============================================
const isTouch = window.matchMedia("(hover: none)").matches;

if (isTouch) {
  const revealables = document.querySelectorAll(".reveal-word");
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
// About tiles — tap to reveal the hidden caption, tap again to hide.
// Works identically for mouse click and touch tap since these are real
// <button> elements; mirrors the :hover behavior on non-touch devices.
// ============================================
document.querySelectorAll(".about-tile").forEach((tile) => {
  tile.addEventListener("click", () => {
    tile.classList.toggle("is-revealed");
  });
});

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
const CONTACT_ENDPOINT =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3001/api/contact"
    : "https://api.goldenblue.mn/api/contact";

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
    submitBtn.textContent = "Захиалга баталгаажуулах";
  }
});

// ============================================
// Scroll-linked overlay: the TRENDY (bottom) layer stays put while the
// visitor scrolls on this slide. Scrolling/dragging down makes the
// SMOOTH QUARTZ (top) layer rise up from below while fading in, and the
// TRENDY layer dissolves away underneath it. Only once SMOOTH QUARTZ is
// fully in view does the next wheel/swipe move Swiper on to the next
// real slide. A requestAnimationFrame easing loop renders the visual
// state every frame rather than writing styles synchronously on every
// raw touchmove/wheel event — this is what makes it feel smooth even
// when touchmove fires unevenly on phones.
// ============================================
(function bottleTransition() {
  const section = document.getElementById("bottle-transition");
  if (!section) return;
  const topLayer = section.querySelector(".bf-layer--top");
  const bottomLayer = section.querySelector(".bf-layer--bottom");
  let progress = 0;
  const STEP = 0.09;
  const RISE_DISTANCE = 60;

  // rAF only batches the DOM writes to once per frame — it does NOT
  // ease/lag behind the input. Touch drag should feel 1:1 attached to
  // the finger; easing here is what caused the "sketchy" disconnected
  // feel. This is the actual fix for mobile jank (fewer layout writes),
  // not artificial smoothing.
  let scheduled = false;
  function applyStyles() {
    scheduled = false;
    topLayer.style.opacity = progress;
    topLayer.style.transform = `translateY(${(1 - progress) * RISE_DISTANCE}px)`;
    topLayer.classList.toggle("is-active", progress > 0.5);
    bottomLayer.style.opacity = 1 - progress * 0.9;
  }
  function scheduleRender() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(applyStyles);
    }
  }
  function setProgress(p) {
    progress = Math.min(1, Math.max(0, p));
    scheduleRender();
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
        topLayer.classList.remove("is-dragging");
        setProgress(progress + STEP);
      } else if (goingUp && progress > 0) {
        e.preventDefault();
        e.stopPropagation();
        topLayer.classList.remove("is-dragging");
        setProgress(progress - STEP);
      }
    },
    { passive: false },
  );

  // Touch: track total drag distance from touchstart (absolute, not
  // incremental) so there's no drift, and disable the CSS transition
  // while actively dragging so the layer follows the finger exactly.
  let touchStartY = null;
  let touchStartProgress = 0;
  section.addEventListener(
    "touchstart",
    (e) => {
      if (!isActiveSlide()) return;
      touchStartY = e.touches[0].clientY;
      touchStartProgress = progress;
      topLayer.classList.add("is-dragging");
    },
    { passive: true },
  );

  section.addEventListener(
    "touchmove",
    (e) => {
      if (!isActiveSlide() || touchStartY === null) return;
      const deltaY = touchStartY - e.touches[0].clientY;
      const nextProgress = touchStartProgress + deltaY / 250;
      const atLowerEdge = deltaY < 0 && progress <= 0;
      const atUpperEdge = deltaY > 0 && progress >= 1;

      if (!atLowerEdge && !atUpperEdge) {
        e.preventDefault();
        e.stopPropagation();
        setProgress(nextProgress);
      }
    },
    { passive: false },
  );

  section.addEventListener(
    "touchend",
    () => {
      touchStartY = null;
      topLayer.classList.remove("is-dragging");
    },
    { passive: true },
  );
})();
