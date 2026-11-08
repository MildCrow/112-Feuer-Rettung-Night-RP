(function () {
  // Hier den Discord-Einladungslink eintragen, zum Beispiel "https://discord.gg/abcdef"
  var DISCORD_INVITE = "https://discord.gg/5kqAzx7kYK";

  var joinLinks = [document.getElementById("join"), document.getElementById("join2")];
  var hint = document.getElementById("join-hint");
  joinLinks.forEach(function (a) {
    if (DISCORD_INVITE) {
      a.href = DISCORD_INVITE;
      a.target = "_blank";
      a.rel = "noopener";
    } else {
      a.setAttribute("aria-disabled", "true");
      a.textContent = "Einladungslink folgt";
      a.addEventListener("click", function (e) { e.preventDefault(); });
    }
  });
  if (!DISCORD_INVITE && hint) hint.hidden = false;

  var form = document.getElementById("apply-form");
  var err = document.getElementById("f-err");
  var out = document.getElementById("out");
  var outText = document.getElementById("out-text");
  var copyMsg = document.getElementById("copy-msg");

  function val(id) { return document.getElementById(id).value.trim(); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    copyMsg.textContent = "";
    if (!val("f-roblox") || !val("f-discord")) {
      err.textContent = "Bitte trage deinen Roblox-Namen und deinen Discord-Namen ein.";
      out.hidden = true;
      return;
    }
    if (!document.getElementById("f-rules").checked) {
      err.textContent = "Bitte bestätige, dass du die Regeln gelesen hast.";
      out.hidden = true;
      return;
    }
    err.textContent = "";
    var lines = [
      "Bewerbung als " + document.getElementById("f-unit").value,
      "",
      "Roblox-Name: " + val("f-roblox"),
      "Discord-Name: " + val("f-discord"),
      "Erfahrung im Roleplay: " + (val("f-exp") || "keine Angabe"),
      "Online-Zeiten: " + (val("f-time") || "keine Angabe"),
      "Motivation: " + (val("f-why") || "keine Angabe"),
      "Regeln gelesen und akzeptiert: ja"
    ];
    outText.textContent = lines.join("\n");
    out.hidden = false;
  });

  document.getElementById("copy").addEventListener("click", function () {
    var text = outText.textContent;
    function fallback() {
      var range = document.createRange();
      range.selectNodeContents(outText);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      copyMsg.textContent = "Text markiert. Kopiere ihn mit Strg+C oder über das Menü.";
    }
    try {
      navigator.clipboard.writeText(text).then(function () {
        copyMsg.textContent = "Kopiert. Füge den Text jetzt in dein Ticket ein.";
      }, fallback);
    } catch (x) { fallback(); }
  });
})();

/* Einsatzmeldung: wechselnde Beispieleinsätze */
(function () {
  var board = document.getElementById("board");
  if (!board || !window.matchMedia) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var incidents = [
    { key: "Brand 2, Wohnungsbrand", loc: "Hafencity, Hamburg",
      fleet: [["f", "Florian Hamburg 1/43-1", "HLF"], ["f", "Florian Hamburg 1/24-1", "DLK"], ["r", "Rettung 4/83-1", "RTW"], ["r", "Notarzt 1/82-1", "NEF"]],
      radio: "Florian 1 an Leitstelle, Einsatzstelle erreicht, Menschenrettung läuft." },
    { key: "Verkehrsunfall, Person eingeklemmt", loc: "Elbbrücken, Hamburg",
      fleet: [["f", "Florian Hamburg 2/43-1", "HLF"], ["f", "Florian Hamburg 2/52-1", "RW"], ["r", "Rettung 2/83-1", "RTW"], ["r", "Rettung 2/83-2", "RTW"], ["r", "Notarzt 2/82-1", "NEF"]],
      radio: "Florian 2 an Leitstelle, zwei Fahrzeuge beteiligt, eine Person eingeklemmt, Rettungsdienst nachfordern." },
    { key: "Reanimation", loc: "Bahnhof Altona, Hamburg",
      fleet: [["r", "Notarzt 3/82-1", "NEF"], ["r", "Rettung 3/83-1", "RTW"], ["f", "Florian Hamburg 3/43-1", "HLF"]],
      radio: "Notarzt 3 an Leitstelle, Patient wird reanimiert, Transport in die Klinik wird vorbereitet." },
    { key: "Brandmeldeanlage, Einkaufszentrum", loc: "Wandsbek, Hamburg",
      fleet: [["f", "Florian Hamburg 4/43-1", "HLF"], ["f", "Florian Hamburg 4/24-1", "DLK"], ["f", "Florian Hamburg 4/11-1", "ELW"], ["r", "Rettung 4/83-2", "RTW"]],
      radio: "Florian 4 an Leitstelle, Erkundung läuft, kein Feuer sichtbar, Anlage wird zurückgesetzt." }
  ];

  var el = {
    key: document.getElementById("b-key"),
    loc: document.getElementById("b-loc"),
    fleet: document.getElementById("b-fleet"),
    status: document.getElementById("b-status"),
    time: document.getElementById("b-time"),
    radio: document.getElementById("b-radio")
  };
  var timers = [], tickId = null, typeId = null, idx = 1;

  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
  function two(n) { return (n < 10 ? "0" : "") + n; }
  function setStatus(txt, cls) { el.status.textContent = txt; el.status.className = "status " + cls; }
  function type(txt) {
    var i = 0;
    clearInterval(typeId);
    typeId = setInterval(function () {
      i++;
      el.radio.textContent = txt.slice(0, i);
      if (i >= txt.length) clearInterval(typeId);
    }, 22);
  }

  function run(inc) {
    timers.forEach(clearTimeout);
    timers = [];
    clearInterval(tickId);
    clearInterval(typeId);
    var secs = 0;
    el.key.textContent = inc.key;
    el.loc.textContent = inc.loc;
    el.fleet.textContent = "";
    el.radio.textContent = "";
    el.time.textContent = "00:00";
    setStatus("Alarmiert", "s-alarm");
    tickId = setInterval(function () {
      secs++;
      el.time.textContent = two(Math.floor(secs / 60)) + ":" + two(secs % 60);
    }, 1000);

    inc.fleet.forEach(function (u, i) {
      later(function () {
        var li = document.createElement("li");
        li.className = u[0] + " in";
        var b = document.createElement("b");
        b.textContent = u[1];
        var em = document.createElement("em");
        em.textContent = u[2];
        li.appendChild(b);
        li.appendChild(em);
        el.fleet.appendChild(li);
      }, 500 + i * 650);
    });

    var t = 500 + inc.fleet.length * 650;
    later(function () { setStatus("Ausgerückt", "s-out"); }, t + 600);
    later(function () { setStatus("Einsatzstelle erreicht", "s-on"); type(inc.radio); }, t + 2600);
    later(function () {
      idx = (idx + 1) % incidents.length;
      run(incidents[idx]);
    }, t + 2600 + inc.radio.length * 22 + 4500);
  }

  // Die Seite zeigt zuerst die fertige Meldung, danach wechseln die Einsätze.
  setTimeout(function () { run(incidents[idx]); }, 6000);
})();

/* Scroll: Fortschrittsbalken, aktive Navigation, sanftes Einblenden */
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var prog = document.getElementById("prog");
  if (prog && !reduce) {
    var onScroll = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var y = window.pageYOffset || h.scrollTop || 0;
      prog.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  if (!("IntersectionObserver" in window)) return;

  var links = {};
  document.querySelectorAll("nav a").forEach(function (a) {
    links[a.getAttribute("href").slice(1)] = a;
  });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      Object.keys(links).forEach(function (k) { links[k].classList.toggle("on", k === en.target.id); });
    });
  }, { rootMargin: "-35% 0px -60% 0px" });
  document.querySelectorAll("main section").forEach(function (s) { spy.observe(s); });

  if (reduce) return;

  var sel = "section h2, section .lead, .unit, .rank-title, .ladder li, details, .sanctions, .apply form";
  var items = Array.prototype.slice.call(document.querySelectorAll(sel));
  var vh = window.innerHeight || 800;
  var reveal = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) show(en.target); });
  }, { threshold: 0.12 });

  function show(t) {
    if (!t.classList.contains("rv")) return;
    reveal.unobserve(t);
    t.classList.add("show");
    setTimeout(function () {
      t.classList.remove("rv", "show");
      t.style.removeProperty("--i");
    }, 1100);
  }

  items.forEach(function (t) {
    if (t.getBoundingClientRect().top < vh) return;
    var pos = t.parentElement ? Array.prototype.indexOf.call(t.parentElement.children, t) : 0;
    t.style.setProperty("--i", Math.min(pos, 6));
    t.classList.add("rv");
    reveal.observe(t);
  });
  setTimeout(function () { items.forEach(show); }, 8000);
})();
