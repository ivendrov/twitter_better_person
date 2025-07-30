// Simplified and more robust replacement logic for Twitter like buttons
// Replaces heart icons with "made me better person" text and hides the like count.

const BUTTON_SELECTOR = '[data-testid="like"], [data-testid="unlike"]';
const COUNT_SELECTOR = '[data-testid="app-text-transition-container"]';

function transformButton(button) {
  if (button.dataset.betterPerson) return; // already processed
  const heart = button.querySelector("svg");
  if (!heart) return;

  // Hide the heart icon instead of removing it to avoid Twitter's internal mutations
  heart.style.display = "none";

  const txt = document.createElement("span");
  txt.className = "better-person-text";
  txt.textContent = "made me a better person";
  heart.before(txt);

  // update accessibility label
  const label = button.getAttribute("aria-label") || "";
  button.setAttribute(
    "aria-label",
    label.replace(/like/gi, "made me a better person")
  );

  // flag so we don't touch it again
  button.dataset.betterPerson = "true";
  button.classList.add("better-person-modified");
}

function hideCount(el) {
  if (el.dataset.betterPerson) return;
  if (!/^\d+$/.test(el.textContent)) return;
  if (!el.closest(BUTTON_SELECTOR)) return;
  el.style.display = "none";
  el.dataset.betterPerson = "true";
}

function scan(root = document) {
  root.querySelectorAll(BUTTON_SELECTOR).forEach(transformButton);
  root.querySelectorAll(COUNT_SELECTOR).forEach(hideCount);
}

// Initial run once DOM is ready
if (document.readyState !== "loading") {
  scan();
} else {
  document.addEventListener("DOMContentLoaded", () => scan());
}

// Observe future changes (infinite scroll, modals, etc.)
new MutationObserver((mutations) => {
  for (const m of mutations) {
    for (const node of m.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        scan(node);
      }
    }
  }
}).observe(document.body, { childList: true, subtree: true });

// No setInterval needed – MutationObserver is sufficient
