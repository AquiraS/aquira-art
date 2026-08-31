(() => {
  const storageKey = "aquira-accessibility-preferences";
  const root = document.documentElement;
  const trigger = document.querySelector("[data-a11y-trigger]");
  const panel = document.querySelector("[data-a11y-panel]");
  const status = document.querySelector("[data-a11y-status]");
  const closeButton = document.querySelector("[data-a11y-close]");
  const controls = [...document.querySelectorAll("[data-a11y-action]")];
  const isEnglish = root.lang === "en";
  const messages = isEnglish
    ? {
      fontSize: (percentage) => `Text size set to ${percentage}%.`,
      contrast: (enabled) => `High-contrast display ${enabled ? "enabled" : "disabled"}.`,
      underline: (enabled) => `Link underlining ${enabled ? "enabled" : "disabled"}.`,
      motion: (enabled) => `Reduced motion ${enabled ? "enabled" : "disabled"}.`,
      reset: "Display settings reset.",
    }
    : {
      fontSize: (percentage) => `文字サイズを${percentage}%にしました。`,
      contrast: (enabled) => enabled ? "高コントラスト表示を有効にしました。" : "高コントラスト表示を解除しました。",
      underline: (enabled) => enabled ? "リンクの下線表示を有効にしました。" : "リンクの下線表示を解除しました。",
      motion: (enabled) => enabled ? "動きを抑える設定を有効にしました。" : "動きを抑える設定を解除しました。",
      reset: "表示設定を初期状態に戻しました。",
    };

  if (!trigger || !panel || !status) return;

  const defaults = {
    fontScale: 1,
    highContrast: false,
    underlineLinks: false,
    reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
  };

  function readPreferences() {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(storageKey) || "{}") };
    } catch {
      return { ...defaults };
    }
  }

  let preferences = readPreferences();

  function savePreferences() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch {
      // ブラウザー側の保存が無効な場合も、現在の閲覧中は設定を反映する。
    }
  }

  function announce(message) {
    status.textContent = "";
    window.requestAnimationFrame(() => {
      status.textContent = message;
    });
  }

  function updateControls() {
    root.style.setProperty("--a11y-font-scale", String(preferences.fontScale));
    root.classList.toggle("a11y-high-contrast", preferences.highContrast);
    root.classList.toggle("a11y-underline-links", preferences.underlineLinks);
    root.classList.toggle("a11y-reduce-motion", preferences.reducedMotion);

    controls.forEach((control) => {
      const action = control.dataset.a11yAction;
      const pressed =
        (action === "contrast" && preferences.highContrast) ||
        (action === "underline" && preferences.underlineLinks) ||
        (action === "motion" && preferences.reducedMotion);
      if (action === "contrast" || action === "underline" || action === "motion") {
        control.setAttribute("aria-pressed", String(pressed));
      }
    });
  }

  function setPanel(isOpen) {
    panel.hidden = !isOpen;
    trigger.setAttribute("aria-expanded", String(isOpen));
    if (isOpen) {
      panel.querySelector("button")?.focus();
    } else {
      trigger.focus();
    }
  }

  trigger.addEventListener("click", () => setPanel(panel.hidden));
  closeButton?.addEventListener("click", () => setPanel(false));

  controls.forEach((control) => {
    control.addEventListener("click", () => {
      switch (control.dataset.a11yAction) {
        case "font-increase":
          preferences.fontScale = Math.min(1.25, Number((preferences.fontScale + 0.1).toFixed(2)));
          announce(messages.fontSize(Math.round(preferences.fontScale * 100)));
          break;
        case "font-decrease":
          preferences.fontScale = Math.max(0.9, Number((preferences.fontScale - 0.1).toFixed(2)));
          announce(messages.fontSize(Math.round(preferences.fontScale * 100)));
          break;
        case "contrast":
          preferences.highContrast = !preferences.highContrast;
          announce(messages.contrast(preferences.highContrast));
          break;
        case "underline":
          preferences.underlineLinks = !preferences.underlineLinks;
          announce(messages.underline(preferences.underlineLinks));
          break;
        case "motion":
          preferences.reducedMotion = !preferences.reducedMotion;
          announce(messages.motion(preferences.reducedMotion));
          break;
        case "reset":
          preferences = { ...defaults };
          announce(messages.reset);
          break;
        default:
          return;
      }
      updateControls();
      savePreferences();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) setPanel(false);
  });

  updateControls();
})();
