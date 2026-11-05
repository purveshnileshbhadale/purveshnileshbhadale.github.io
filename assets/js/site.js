/* ==========================================================================
   site.js — theme, command palette, active section, subtle reveals.
   No dependencies. ~7 KB unminified.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------------------------------------------------------------- theme */

  var themeBtn = document.querySelector("[data-theme-toggle]");

  function currentTheme() {
    return root.dataset.theme === "dark" ? "dark" : "light";
  }

  function setTheme(next, persist) {
    root.dataset.theme = next;
    if (persist) {
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
    }
    if (themeBtn) {
      themeBtn.setAttribute(
        "aria-label",
        next === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
      themeBtn.setAttribute("title", next === "dark" ? "Light mode" : "Dark mode");
    }
  }

  setTheme(currentTheme(), false);

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      setTheme(currentTheme() === "dark" ? "light" : "dark", true);
    });
  }

  /* Respect a system change that happens while the page is open, unless the
     visitor has already made a choice. */
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function (e) {
      if (root.dataset.themeForced === "1") return;
      var saved = null;
      try {
        saved = localStorage.getItem("theme");
      } catch (err) {}
      if (!saved) setTheme(e.matches ? "dark" : "light", false);
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ------------------------------------------------------------- reveals */

  var reveals = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window) || !reveals.length) {
    Array.prototype.forEach.call(reveals, function (el) {
      el.classList.add("is-in");
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    Array.prototype.forEach.call(reveals, function (el) {
      revealObserver.observe(el);
    });
  }

  /* --------------------------------------------------------- active nav */

  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
  var watched = navLinks
    .map(function (a) {
      var id = a.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  function markActive() {
    if (!watched.length) return;
    var offset = window.scrollY + 140;
    var active = null;

    watched.forEach(function (section) {
      if (section.offsetTop <= offset) active = section;
    });

    navLinks.forEach(function (a) {
      var isActive = active && a.getAttribute("href") === "#" + active.id;
      if (isActive) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        markActive();
        ticking = false;
      });
    },
    { passive: true }
  );
  markActive();

  /* -------------------------------------------------- command palette */

  var dialog = document.getElementById("palette");
  var input = document.getElementById("palette-input");
  var list = document.getElementById("palette-list");
  var openers = document.querySelectorAll("[data-palette-open]");

  if (!dialog || !input || !list || typeof dialog.showModal !== "function") {
    Array.prototype.forEach.call(openers, function (btn) {
      btn.hidden = true;
    });
    return;
  }

  var ENTRIES = [
    { group: "Sections", label: "Featured work", hint: "#work", href: "#work", keys: "projects veda scholars vayu lifi" },
    { group: "Sections", label: "About", hint: "#about", href: "#about", keys: "bio me story" },
    { group: "Sections", label: "More builds", hint: "#builds", href: "#builds", keys: "deephelper gamerzhub smartpath deeps" },
    { group: "Sections", label: "Competitions & writing", hint: "#writing", href: "#writing", keys: "birdspiracy papers ijrpr" },
    { group: "Sections", label: "Timeline", hint: "#timeline", href: "#timeline", keys: "dates history" },
    { group: "Sections", label: "Contact", hint: "#contact", href: "#contact", keys: "email reach me" },

    { group: "Repositories", label: "VEDA", hint: "GitHub ↗", href: "https://github.com/purveshnileshbhadale/veda", keys: "research papers ai", external: true },
    { group: "Repositories", label: "SCHOLARS", hint: "GitHub ↗", href: "https://github.com/purveshnileshbhadale/SCHOLARS", keys: "universities shortlist", external: true },
    { group: "Repositories", label: "VAYU", hint: "GitHub ↗", href: "https://github.com/purveshnileshbhadale/VAYU", keys: "assistant desktop python", external: true },
    { group: "Repositories", label: "All repositories", hint: "GitHub ↗", href: "https://github.com/purveshnileshbhadale", keys: "code profile", external: true },

    { group: "Elsewhere", label: "Email", hint: "purveshnileshbhadale@gmail.com", href: "mailto:purveshnileshbhadale@gmail.com", keys: "mail contact" },
    { group: "Elsewhere", label: "LinkedIn", hint: "↗", href: "https://www.linkedin.com/in/purvesh-bhadale-6a30a0400", keys: "work profile", external: true },

    { group: "Actions", label: "Switch theme", hint: "light / dark", action: "theme", keys: "dark mode contrast" }
  ];

  var selected = 0;
  var visible = [];

  function matches(entry, query) {
    if (!query) return true;
    var haystack = (entry.label + " " + entry.group + " " + (entry.keys || "") + " " + entry.hint).toLowerCase();
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
  }

  function render(query) {
    list.innerHTML = "";
    visible = ENTRIES.filter(function (entry) {
      return matches(entry, query);
    });

    if (!visible.length) {
      var empty = document.createElement("li");
      empty.className = "palette__empty";
      empty.textContent = "No match. Try “work”, “veda”, or “email”.";
      list.appendChild(empty);
      return;
    }

    if (selected >= visible.length) selected = 0;

    var lastGroup = null;
    visible.forEach(function (entry, index) {
      if (entry.group !== lastGroup) {
        lastGroup = entry.group;
        var groupEl = document.createElement("li");
        groupEl.className = "palette__group";
        groupEl.setAttribute("role", "presentation");
        groupEl.textContent = entry.group;
        list.appendChild(groupEl);
      }

      var item = document.createElement("li");
      item.className = "palette__item";
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", index === selected ? "true" : "false");
      item.dataset.index = String(index);

      var label = document.createElement("span");
      label.textContent = entry.label;

      var hint = document.createElement("span");
      hint.className = "palette__hint";
      hint.textContent = entry.hint;

      item.appendChild(label);
      item.appendChild(hint);
      list.appendChild(item);
    });

    var active = list.querySelector('[aria-selected="true"]');
    if (active && active.scrollIntoView) active.scrollIntoView({ block: "nearest" });
  }

  function move(delta) {
    if (!visible.length) return;
    selected = (selected + delta + visible.length) % visible.length;
    render(input.value);
  }

  function choose() {
    var entry = visible[selected];
    if (!entry) return;
    close();

    if (entry.action === "theme") {
      setTheme(currentTheme() === "dark" ? "light" : "dark", true);
      return;
    }
    if (entry.external) {
      window.open(entry.href, "_blank", "noopener,noreferrer");
      return;
    }
    window.location.href = entry.href;
  }

  function open() {
    selected = 0;
    input.value = "";
    render("");
    if (!dialog.open) dialog.showModal();
    input.focus();
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  Array.prototype.forEach.call(openers, function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      open();
    });
  });

  input.addEventListener("input", function () {
    selected = 0;
    render(input.value);
  });

  list.addEventListener("click", function (e) {
    var item = e.target.closest(".palette__item");
    if (!item) return;
    selected = Number(item.dataset.index);
    choose();
  });

  list.addEventListener("mousemove", function (e) {
    var item = e.target.closest(".palette__item");
    if (!item) return;
    var index = Number(item.dataset.index);
    if (index === selected) return;
    selected = index;
    Array.prototype.forEach.call(list.querySelectorAll(".palette__item"), function (el, i) {
      el.setAttribute("aria-selected", i === selected ? "true" : "false");
    });
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      move(1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      move(-1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose();
    }
  });

  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) close();
  });

  dialog.addEventListener("close", function () {
    input.blur();
  });

  document.addEventListener("keydown", function (e) {
    var key = e.key ? e.key.toLowerCase() : "";
    var isOpenCombo = (e.metaKey || e.ctrlKey) && key === "k";
    var isSlash = key === "/" && !dialog.open && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);

    if (isOpenCombo || isSlash) {
      e.preventDefault();
      open();
    } else if (key === "escape" && dialog.open) {
      close();
    }
  });
})();
