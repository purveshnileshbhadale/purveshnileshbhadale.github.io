/* ==========================================================================
   agent.js — "ask about my work".
   Loads nothing and shows nothing unless a live endpoint answers.
   The model key lives server-side; this file never sees it.
   ========================================================================== */

(function () {
  "use strict";

  var panel = document.querySelector("[data-agent-endpoint]");
  if (!panel) return;

  var endpoint = (panel.getAttribute("data-agent-endpoint") || "").trim();
  var log = panel.querySelector(".agent__log");
  var form = panel.querySelector(".agent__form");
  var input = panel.querySelector("#agent-q");
  var statusEl = panel.querySelector("[data-agent-status]");
  var submit = form ? form.querySelector('button[type="submit"]') : null;

  if (!log || !form || !input || !endpoint) return;

  var history = [];
  var busy = false;

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text || "";
  }

  function scrollDown() {
    log.scrollTop = log.scrollHeight;
  }

  function addMessage(text, kind) {
    var p = document.createElement("p");
    p.className = "agent__msg agent__msg--" + kind;
    p.textContent = text;
    log.appendChild(p);
    scrollDown();
    return p;
  }

  function addTyping() {
    var el = document.createElement("div");
    el.className = "agent__typing";
    el.setAttribute("aria-label", "Answering");
    el.innerHTML = "<span></span><span></span><span></span>";
    log.appendChild(el);
    scrollDown();
    return el;
  }

  function begin() {
    busy = true;
    if (submit) submit.disabled = true;
    input.setAttribute("aria-busy", "true");
  }

  function end() {
    busy = false;
    if (submit) submit.disabled = false;
    input.removeAttribute("aria-busy");
  }

  async function ask(question) {
    if (busy) return;
    var text = question.trim().slice(0, 500);
    if (text.length < 2) return;

    addMessage(text, "user");
    history.push({ role: "user", content: text });
    input.value = "";
    setStatus("");
    begin();

    var typing = addTyping();

    try {
      var response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-6) })
      });

      var data = null;
      try {
        data = await response.json();
      } catch (e) {}

      typing.remove();

      if (!response.ok) {
        addMessage(
          data && data.error
            ? data.error
            : "Couldn't reach the notes. Email works better: purveshnileshbhadale@gmail.com",
          "error"
        );
        history.pop();
        return;
      }

      var answer = data && data.answer;
      if (!answer) {
        addMessage("No answer came back. Try rephrasing.", "error");
        history.pop();
        return;
      }

      addMessage(answer, "bot");
      history.push({ role: "assistant", content: answer });
      if (history.length > 8) history = history.slice(-8);
    } catch (error) {
      typing.remove();
      addMessage(
        "Offline — the assistant isn't reachable right now. Email still works: purveshnileshbhadale@gmail.com",
        "error"
      );
      history.pop();
    } finally {
      end();
      input.focus();
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    ask(input.value);
  });

  Array.prototype.forEach.call(panel.querySelectorAll("[data-ask]"), function (btn) {
    btn.addEventListener("click", function () {
      ask(btn.getAttribute("data-ask") || "");
    });
  });

  /* Health check: only reveal the panel if the function is actually deployed.
     A 404 or a failed request leaves the section hidden, so the live site never
     shows a dead widget. */
  fetch(endpoint, { method: "GET", headers: { Accept: "application/json" } })
    .then(function (r) {
      // the handler answers 405 for GET; anything but a network/proxy error means it exists
      if (r.status === 404 || r.status === 0) return null;
      panel.hidden = false;
      setStatus("Answers are generated from a single notes file. It can be wrong — verify anything you rely on.");
      return true;
    })
    .catch(function () {
      /* stay hidden */
    });
})();
